import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { InteractionManager } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const TourTargetContext = createContext(null);

// Registro simple de "elementos resaltables" del tutorial relacional (ver
// data/TourManager.js y components/TourOverlay.js). Cada pantalla marca su
// elemento con useTourTarget(id) y le pasa `ref` + `onLayout`; el overlay
// espera a que el target esté listo (esperarTargetListo) y recién ahí lo
// mide con measureInWindow.
//
// Un target solo está registrado MIENTRAS SU PANTALLA TIENE FOCO (no
// mientras está montada): las pantallas de tabs no se desmontan al salir
// de ellas (y `unmountOnBlur` se ignora en bottom-tabs v7), así que una
// pantalla visitada antes queda montada pero oculta/desenganchada de la
// ventana — medir su elemento ahí da una posición vieja o corrida. Ese era
// el bug de "el coachmark de Clientes aparece corrido al abrir el tour
// desde Configuración": el FAB de Clientes de una visita anterior seguía
// registrado y se medía antes de que la pantalla volviera a estar visible.
//
// Las entradas viven en un Map dentro de un useRef, NO en estado:
// registrar o re-medir un target no re-renderiza nada. Los cambios se
// avisan por suscripción (suscribir/notificar), que solo escucha el overlay.
export function TourTargetProvider({ children }) {
  const entradasRef = useRef(new Map());
  const listenersRef = useRef(new Set());

  const notificar = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const suscribir = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const registrar = useCallback(
    (id, entrada) => {
      entradasRef.current.set(id, entrada);
      notificar();
    },
    [notificar]
  );

  // Solo borra si la entrada registrada sigue siendo la misma: si otra
  // pantalla con el mismo id tomó foco, su registro puede llegar antes que
  // el cleanup de la anterior, y no hay que pisarlo.
  const desregistrar = useCallback(
    (id, entrada) => {
      if (entradasRef.current.get(id) === entrada) {
        entradasRef.current.delete(id);
        notificar();
      }
    },
    [notificar]
  );

  // Nodo medible del target, o null si no está listo: registrado (pantalla
  // con foco), con el elemento montado, y "fresco" — con un layout o una
  // medición válida ocurridos DESPUÉS del foco actual (ver useTourTarget),
  // nunca heredados de una visita anterior.
  const obtenerTarget = useCallback((id) => {
    const entrada = entradasRef.current.get(id);
    if (!entrada || !entrada.layouteado) return null;
    return entrada.ref.current ?? null;
  }, []);

  // Momento (Date.now()) en que la pantalla del target ganó el foco actual,
  // o null si no está registrado. Lo usa el overlay para no medir durante
  // la transición del tab.
  const obtenerFocoDesde = useCallback((id) => entradasRef.current.get(id)?.focoDesde ?? null, []);

  // Promesa que resuelve con el nodo apenas el target está listo (ver
  // obtenerTarget), o con null si no llega a estarlo en `timeoutMs` (ej. el
  // FAB de Clientes no existe mientras la lista carga o si falló la carga)
  // — el overlay cae entonces al modo centrado en vez de quedar trabado.
  // `cancelar` corta la espera sin resolver (paso cambiado / tour cerrado).
  const esperarTargetListo = useCallback(
    (id, timeoutMs) => {
      let desuscribir = () => {};
      let timer = null;
      let terminado = false;

      const promesa = new Promise((resolver) => {
        function terminar(nodo) {
          if (terminado) return;
          terminado = true;
          desuscribir();
          clearTimeout(timer);
          resolver(nodo);
        }
        function revisar() {
          const nodo = obtenerTarget(id);
          if (nodo) terminar(nodo);
        }
        desuscribir = suscribir(revisar);
        timer = setTimeout(() => terminar(null), timeoutMs);
        revisar();
      });

      function cancelar() {
        terminado = true;
        desuscribir();
        clearTimeout(timer);
      }

      return { promesa, cancelar };
    },
    [obtenerTarget, suscribir]
  );

  const value = useMemo(
    () => ({ registrar, desregistrar, notificar, suscribir, obtenerTarget, obtenerFocoDesde, esperarTargetListo }),
    [registrar, desregistrar, notificar, suscribir, obtenerTarget, obtenerFocoDesde, esperarTargetListo]
  );

  return <TourTargetContext.Provider value={value}>{children}</TourTargetContext.Provider>;
}

function useTourTargetContext() {
  const contexto = useContext(TourTargetContext);
  if (!contexto) {
    throw new Error("useTourTarget debe usarse dentro de <TourTargetProvider>");
  }
  return contexto;
}

// Lado "lector" del registro: lo usa solo components/TourOverlay.js.
export function useTourTargetRegistro() {
  const { obtenerTarget, obtenerFocoDesde, esperarTargetListo, suscribir } = useTourTargetContext();
  return useMemo(
    () => ({ obtenerTarget, obtenerFocoDesde, esperarTargetListo, suscribir }),
    [obtenerTarget, obtenerFocoDesde, esperarTargetListo, suscribir]
  );
}

// Uso en una pantalla:
//   const tourNuevoCliente = useTourTarget("clientes.nuevo");
//   <TouchableOpacity ref={tourNuevoCliente.ref} onLayout={tourNuevoCliente.onLayout} ... />
// El elemento tiene que exponer measureInWindow por su ref (View,
// TouchableOpacity, etc.) y el hook tiene que llamarse desde un componente
// que viva dentro de una pantalla de React Navigation (usa
// useFocusEffect). `ref`/`onLayout` son estables entre renders, así que no
// le agregan re-renders a la pantalla.
export function useTourTarget(id) {
  const { registrar, desregistrar, notificar } = useTourTargetContext();
  const ref = useRef(null);
  const entradaRef = useRef(null);
  if (entradaRef.current === null) {
    // `layouteado` = "fresco": hubo un onLayout o una medición válida
    // DESPUÉS del foco actual. `sesionFoco` invalida callbacks async de un
    // foco anterior (ej. una medición que termina después de perder foco).
    entradaRef.current = { ref, layouteado: false, enFoco: false, focoDesde: null, sesionFoco: 0 };
  }

  // Registrar al ganar foco, desregistrar al perderlo o al desmontar la
  // pantalla (el cleanup de useFocusEffect corre en los dos casos).
  //
  // La frescura se resetea en CADA foco: las pantallas de tabs quedan
  // montadas al perder foco, y un `layouteado` heredado de la visita
  // anterior hacía que el overlay midiera enseguida, con la pantalla
  // todavía sin re-enganchar a la ventana (bug del coachmark de Clientes
  // corrido al abrir el tour desde Configuración). Como al volver a un tab
  // ya montado el elemento puede NO disparar onLayout de nuevo (no cambió
  // su layout), hay una segunda vía para marcarlo fresco: esperar a que
  // terminen las interacciones/animaciones en curso + 2 frames y medirlo;
  // si da un tamaño válido, cuenta.
  useFocusEffect(
    useCallback(() => {
      const entrada = entradaRef.current;
      entrada.sesionFoco += 1;
      const sesion = entrada.sesionFoco;
      entrada.enFoco = true;
      entrada.layouteado = false;
      entrada.focoDesde = Date.now();
      registrar(id, entrada);

      let raf1 = null;
      let raf2 = null;
      const interaccion = InteractionManager.runAfterInteractions(() => {
        raf1 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => {
            const nodo = entrada.ref.current;
            if (!nodo || entrada.sesionFoco !== sesion) return;
            nodo.measureInWindow((x, y, width, height) => {
              if (entrada.sesionFoco !== sesion || !entrada.enFoco) return;
              if (width > 0 && height > 0 && !entrada.layouteado) {
                entrada.layouteado = true;
                notificar();
              }
            });
          });
        });
      });

      return () => {
        interaccion.cancel();
        if (raf1 !== null) cancelAnimationFrame(raf1);
        if (raf2 !== null) cancelAnimationFrame(raf2);
        entrada.sesionFoco += 1;
        entrada.enFoco = false;
        entrada.layouteado = false;
        entrada.focoDesde = null;
        desregistrar(id, entrada);
      };
    }, [id, registrar, desregistrar, notificar])
  );

  // Primera vía de frescura: un onLayout con la pantalla CON foco (un
  // onLayout de una pantalla oculta no cuenta). También sirve para el
  // elemento que se monta tarde (ej. el FAB de Clientes, que no existe
  // mientras la lista carga) y, con el coachmark ya mostrado, para que el
  // overlay re-mida si el elemento se mueve.
  const onLayout = useCallback(() => {
    const entrada = entradaRef.current;
    if (!entrada.enFoco) return;
    entrada.layouteado = true;
    notificar();
  }, [notificar]);

  return useMemo(() => ({ ref, onLayout }), [onLayout]);
}
