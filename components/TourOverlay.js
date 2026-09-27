import { useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import { CANTIDAD_PASOS_NUMERADOS, useTourManager } from "../data/TourManager";
import { useTourTargetRegistro } from "../data/TourTargetContext";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Diagnóstico TEMPORAL del posicionamiento de coachmarks: loguea cada
// lectura de measureInWindow con prefijo "[TOUR]" (filtrable en la salida de
// Metro). Dejar en true hasta confirmar en dispositivo que el paso de
// Clientes (y Agenda/Notificaciones) quedan bien al abrir el tour desde
// Configuración; después pasar a false o sacar los logs.
const TOUR_DEBUG = true;

function logTour(...args) {
  if (TOUR_DEBUG) console.log("[TOUR]", ...args);
}

const PADDING_RESALTADO = 8;
const MARGEN_TARJETA = 16;
// Tiempo máximo desde que arranca un paso hasta mostrar el coachmark. Si
// para entonces no hay una medida confiable (target sin foco/fresco, o
// lecturas que no se estabilizan), el paso se muestra centrado, sin
// recorte, en vez de quedar trabado.
const TIMEOUT_PASO_MS = 3000;
// Espera mínima desde que la pantalla del target ganó el foco antes de la
// primera lectura: cubre la transición del tab (la pantalla recién
// enfocada puede tardar en re-engancharse a la ventana).
const ESPERA_MINIMA_DESDE_FOCO_MS = 350;
const INTERVALO_MEDICION_MS = 100;
// Lecturas consecutivas idénticas (tolerancia < 1px) para aceptar una
// medida: con 2, una pantalla recién re-enfocada podía devolver dos veces
// seguidas la misma posición vieja.
const LECTURAS_ESTABLES_REQUERIDAS = 3;
// Re-verificaciones con el coachmark ya mostrado, por si algo se acomodó
// tarde. Solo se aplican si la diferencia supera UMBRAL_REVERIFICACION_PX,
// para no hacer "saltar" el recorte por diferencias de redondeo.
const REVERIFICACIONES_MS = [250, 700, 1500];
const UMBRAL_REVERIFICACION_PX = 2;
const COLOR_FONDO = "rgba(4, 3, 3, 0.82)";

function mismasMedidas(a, b, tolerancia = 1) {
  return (
    Math.abs(a.x - b.x) < tolerancia &&
    Math.abs(a.y - b.y) < tolerancia &&
    Math.abs(a.width - b.width) < tolerancia &&
    Math.abs(a.height - b.height) < tolerancia
  );
}

function redondear(n) {
  return Math.round(n * 10) / 10;
}

// Overlay global del tutorial relacional (ver data/TourManager.js). Se monta
// una sola vez en App.js, POR ENCIMA del NavigationContainer (hermano, no
// hijo), así que tapa cualquier pantalla del Dashboard.
//
// Lecciones del tour anterior (sacado el 2026-09-24 por bugs de
// timing/anclaje, ver ESTADO_PROYECTO.md) aplicadas acá a propósito:
//   1. Bloquea TODOS los toques mientras está activo — el único camino es
//      "Siguiente"/"Saltar tutorial". El tour viejo dejaba el control real
//      tocable y eso lo desincronizaba (navegaba a otro lado y el globito
//      quedaba apuntando a la nada).
//   2. Nunca mide "a ciegas" después de navegar: TourManager navega a la
//      pantalla del paso y acá se ESPERA (esperarTargetListo) a que el
//      target esté "fresco": su pantalla tiene foco y hubo un onLayout o
//      una medición válida DESPUÉS de ese foco (nunca heredado de una
//      visita anterior; ver useTourTarget en data/TourTargetContext.js).
//      Además se espera a que pasen ESPERA_MINIMA_DESDE_FOCO_MS desde el
//      foco, y se mide hasta tener LECTURAS_ESTABLES_REQUERIDAS lecturas
//      seguidas idénticas dentro del overlay. Mientras tanto solo se ve el
//      fondo oscuro. Con el coachmark ya mostrado se re-verifica un par de
//      veces más (y ante cada onLayout), aplicando solo cambios de más de
//      UMBRAL_REVERIFICACION_PX para que no se vea un salto.
//   3. Nunca se traba: si el target no aparece a tiempo (ej. el FAB de
//      Clientes, que no existe mientras la lista carga o si falló la carga),
//      el paso se muestra igual, con la tarjeta centrada y sin recorte.
//   4. Coordenadas relativas al propio overlay (se mide también a sí mismo
//      con measureInWindow y se resta), así no depende de si la ventana
//      incluye o no la status bar en cada plataforma.
export default function TourOverlay() {
  const { tourActivo, pasoActual, indicePaso, avanzarTour, saltarTour, terminarTour } = useTourManager();
  const { obtenerTarget, obtenerFocoDesde, esperarTargetListo, suscribir } = useTourTargetRegistro();
  const insets = useSafeAreaInsets();
  const overlayRef = useRef(null);
  const [tamanoOverlay, setTamanoOverlay] = useState(null);
  const tamanoOverlayRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [sinSpotlight, setSinSpotlight] = useState(false);
  // Alto real de la tarjeta posicionada (onLayout), para decidir de qué lado
  // del recorte entra sin pegarse a los bordes. null hasta medirla.
  const [altoTarjeta, setAltoTarjeta] = useState(null);

  useEffect(() => {
    setRect(null);
    setSinSpotlight(false);
    setAltoTarjeta(null);
    if (!pasoActual || pasoActual.tipo !== "pantalla") return;

    const { target, id: idPaso } = pasoActual;
    let cancelado = false;
    let desuscribir = () => {};
    const timers = [];
    let rectMostrado = null;

    function programar(fn, ms) {
      if (!cancelado) timers.push(setTimeout(fn, ms));
    }

    function msDesdeFoco() {
      const focoDesde = obtenerFocoDesde(target);
      return focoDesde === null ? null : Date.now() - focoDesde;
    }

    // Una lectura: callback(medida, motivoDescarte). `medida` es el rect
    // relativo al overlay, o null si hay que descartarla (motivo en texto,
    // para los logs de diagnóstico).
    function medirUnaVez(callback) {
      const nodo = obtenerTarget(target);
      const overlay = overlayRef.current;
      const tamano = tamanoOverlayRef.current;
      if (!nodo || !overlay || !tamano) {
        callback(null, !nodo ? "target no listo (sin foco o no fresco)" : "overlay sin layout", null);
        return;
      }
      overlay.measureInWindow((ox, oy) => {
        nodo.measureInWindow((x, y, width, height) => {
          if (cancelado) return;
          const medida = { x: x - ox, y: y - oy, width, height };
          let motivo = null;
          if (!(width > 0 && height > 0)) motivo = "tamaño 0";
          else if (
            medida.x < 0 ||
            medida.y < 0 ||
            medida.x + width > tamano.width + 1 ||
            medida.y + height > tamano.height + 1
          ) {
            motivo = "fuera del overlay";
          }
          callback(motivo ? null : medida, motivo, { medida, tamano, ventana: { x, y }, overlay: { x: ox, y: oy } });
        });
      });
    }

    function logLectura(fase, info, resultado) {
      if (!TOUR_DEBUG) return;
      const m = info?.medida;
      logTour(
        `paso=${idPaso} target=${target} fase=${fase} t+foco=${msDesdeFoco() ?? "-"}ms`,
        m ? `rel=(${redondear(m.x)}, ${redondear(m.y)}) ${redondear(m.width)}x${redondear(m.height)}` : "sin medida",
        info ? `ventana=(${redondear(info.ventana.x)}, ${redondear(info.ventana.y)}) origenOverlay=(${redondear(info.overlay.x)}, ${redondear(info.overlay.y)})` : "",
        info ? `overlay=${redondear(info.tamano.width)}x${redondear(info.tamano.height)}` : "",
        `-> ${resultado}`
      );
    }

    function mostrar(medida) {
      rectMostrado = medida;
      setRect(medida);
    }

    // Con el coachmark ya mostrado: solo se aplica un cambio mayor a
    // UMBRAL_REVERIFICACION_PX (evita saltos por redondeo).
    function reverificar() {
      medirUnaVez((medida, motivo, info) => {
        if (!medida) {
          logLectura("reverificacion", info, `descartada (${motivo}), se mantiene el rect`);
          return;
        }
        if (mismasMedidas(medida, rectMostrado, UMBRAL_REVERIFICACION_PX)) {
          logLectura("reverificacion", info, `sin cambios (<= ${UMBRAL_REVERIFICACION_PX}px)`);
          return;
        }
        logLectura("reverificacion", info, "CAMBIÓ -> rect actualizado");
        mostrar(medida);
      });
    }

    let anterior = null;
    let lecturasIguales = 0;
    function medirHastaEstable() {
      if (cancelado || rectMostrado) return;
      medirUnaVez((medida, motivo, info) => {
        if (cancelado || rectMostrado) return;
        if (!medida) {
          anterior = null;
          lecturasIguales = 0;
          logLectura("inicial", info, `descartada (${motivo})`);
        } else if (anterior && mismasMedidas(anterior, medida)) {
          lecturasIguales += 1;
          if (lecturasIguales >= LECTURAS_ESTABLES_REQUERIDAS) {
            logLectura("inicial", info, `ACEPTADA (${lecturasIguales}/${LECTURAS_ESTABLES_REQUERIDAS} iguales)`);
            mostrar(medida);
            REVERIFICACIONES_MS.forEach((ms) => programar(reverificar, ms));
            desuscribir = suscribir(() => programar(reverificar, 50));
            return;
          }
          logLectura("inicial", info, `igual a la anterior (${lecturasIguales}/${LECTURAS_ESTABLES_REQUERIDAS}), sigue midiendo`);
        } else {
          lecturasIguales = 1;
          logLectura(
            "inicial",
            info,
            `${anterior ? "distinta a la anterior" : "primera válida"} (1/${LECTURAS_ESTABLES_REQUERIDAS}), sigue midiendo`
          );
        }
        anterior = medida;
        programar(medirHastaEstable, INTERVALO_MEDICION_MS);
      });
    }

    // Deadline global del paso: sin medida confiable a tiempo -> centrado.
    programar(() => {
      if (rectMostrado) return;
      logTour(`paso=${idPaso} target=${target} TIMEOUT ${TIMEOUT_PASO_MS}ms -> fallback centrado sin recorte`);
      cancelado = true;
      setSinSpotlight(true);
    }, TIMEOUT_PASO_MS);

    logTour(`paso=${idPaso} target=${target} esperando target fresco...`);
    const espera = esperarTargetListo(target, TIMEOUT_PASO_MS);
    espera.promesa.then((nodo) => {
      if (cancelado) return;
      if (!nodo) return; // el deadline global se encarga del fallback
      const desdeFoco = msDesdeFoco() ?? 0;
      const demora = Math.max(0, ESPERA_MINIMA_DESDE_FOCO_MS - desdeFoco);
      logTour(`paso=${idPaso} target=${target} fresco a t+foco=${desdeFoco}ms, primera lectura en ${demora}ms`);
      programar(medirHastaEstable, demora);
    });

    return () => {
      cancelado = true;
      espera.cancelar();
      timers.forEach(clearTimeout);
      desuscribir();
    };
  }, [pasoActual, obtenerTarget, obtenerFocoDesde, esperarTargetListo, suscribir]);

  // Android: el botón "atrás" físico cierra el tutorial (mismo efecto que
  // "Saltar tutorial") en vez de navegar por debajo del overlay.
  useEffect(() => {
    if (!tourActivo) return;
    const suscripcion = BackHandler.addEventListener("hardwareBackPress", () => {
      saltarTour();
      return true;
    });
    return () => suscripcion.remove();
  }, [tourActivo, saltarTour]);

  if (!tourActivo || !pasoActual) return null;

  const esCierre = pasoActual.tipo === "cierre";
  const esPantalla = pasoActual.tipo === "pantalla";
  const buscandoTarget = esPantalla && !rect && !sinSpotlight;

  const tarjetaTexto = (
    <TarjetaPaso
      paso={pasoActual}
      indicePaso={indicePaso}
      onSiguiente={avanzarTour}
      onSaltar={saltarTour}
      onTerminar={terminarTour}
    />
  );

  let contenido;
  if (esPantalla && rect && tamanoOverlay) {
    // Ajustes opcionales por paso (ver PASOS_TOUR_RELACIONAL):
    // `paddingResaltado` reemplaza el margen default alrededor del
    // elemento, y `expandirResaltado.top` suma lugar arriba para lo que
    // sobresale del elemento medido (el "+" central sobre la tab bar).
    const padding = pasoActual.paddingResaltado ?? PADDING_RESALTADO;
    const extraArriba = pasoActual.expandirResaltado?.top ?? 0;
    const top = Math.max(0, rect.y - padding - extraArriba);
    const left = Math.max(0, rect.x - padding);
    // Recortado a los bordes del overlay: un elemento pegado al borde (ej.
    // la tab bar, de lado a lado) no puede dejar rectángulos de fondo con
    // ancho/alto negativo.
    const area = {
      left,
      top,
      width: Math.min(rect.x + rect.width + padding, tamanoOverlay.width) - left,
      height: Math.min(rect.y + rect.height + padding, tamanoOverlay.height) - top,
    };
    const areaAbajo = area.top + area.height;

    // La tarjeta va, por default, del lado con más lugar libre (según en qué
    // mitad cae el centro del recorte), para no taparse nunca con lo que se
    // está señalando. Con el alto real de la tarjeta ya medido, además:
    // nunca queda a menos de MARGEN_TARJETA del safe-area de arriba o de
    // abajo — si en el lado elegido no entra con ese aire y en el otro sí,
    // se pasa al otro; si no entra en ninguno, se ajusta al margen mínimo
    // (puede pisar un poco el recorte, pero nunca el header/status bar).
    const topMinimo = insets.top + MARGEN_TARJETA;
    const bottomMaximo = tamanoOverlay.height - insets.bottom - MARGEN_TARJETA;
    let tarjetaVaArriba = area.top + area.height / 2 >= tamanoOverlay.height / 2;
    let estiloTarjeta;
    if (altoTarjeta === null) {
      // Primer frame: se mide invisible y en su posición default.
      estiloTarjeta = tarjetaVaArriba
        ? { bottom: tamanoOverlay.height - area.top + MARGEN_TARJETA, opacity: 0 }
        : { top: areaAbajo + MARGEN_TARJETA, opacity: 0 };
    } else {
      const topSiVaArriba = area.top - MARGEN_TARJETA - altoTarjeta;
      const topSiVaAbajo = areaAbajo + MARGEN_TARJETA;
      const entraArriba = topSiVaArriba >= topMinimo;
      const entraAbajo = topSiVaAbajo + altoTarjeta <= bottomMaximo;
      if (tarjetaVaArriba && !entraArriba && entraAbajo) tarjetaVaArriba = false;
      else if (!tarjetaVaArriba && !entraAbajo && entraArriba) tarjetaVaArriba = true;
      const topDeseado = tarjetaVaArriba ? topSiVaArriba : topSiVaAbajo;
      estiloTarjeta = {
        top: Math.max(topMinimo, Math.min(topDeseado, bottomMaximo - altoTarjeta)),
      };
    }

    contenido = (
      <>
        <View style={[styles.fondo, { top: 0, left: 0, right: 0, height: area.top }]} />
        <View style={[styles.fondo, { top: area.top + area.height, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.fondo, { top: area.top, height: area.height, left: 0, width: area.left }]} />
        <View
          style={[styles.fondo, { top: area.top, height: area.height, left: area.left + area.width, right: 0 }]}
        />
        <View
          pointerEvents="none"
          style={[styles.marco, { left: area.left, top: area.top, width: area.width, height: area.height }]}
        />
        <View
          style={[styles.tarjetaPosicionada, estiloTarjeta]}
          onLayout={(evento) => {
            const alto = evento.nativeEvent.layout.height;
            if (altoTarjeta === null || Math.abs(alto - altoTarjeta) >= 1) setAltoTarjeta(alto);
          }}
        >
          {tarjetaTexto}
        </View>
      </>
    );
  } else {
    // Pasos ilustrativos, cierre, y el fallback de un paso de pantalla cuyo
    // target no apareció: fondo completo + contenido centrado. Mientras se
    // está buscando el target (normalmente unos pocos cientos de ms) solo
    // se muestra el fondo, para no hacer "saltar" la tarjeta de posición.
    contenido = (
      <>
        <View style={[styles.fondo, StyleSheet.absoluteFill]} />
        {!buscandoTarget && (
          <View
            style={[
              styles.centrado,
              { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
            ]}
          >
            {pasoActual.ilustracion === "trabajo" && <MockupTrabajoNuevo />}
            {pasoActual.ilustracion === "cobro" && <MockupRegistrarCobro />}
            {esCierre && <IconoCierre />}
            {tarjetaTexto}
          </View>
        )}
      </>
    );
  }

  return (
    <View
      ref={overlayRef}
      style={StyleSheet.absoluteFill}
      // Se traga cualquier toque que no caiga en un botón de la tarjeta,
      // incluido el del área recortada: el control real no es tocable
      // durante el tutorial (ver punto 1 del comentario de arriba).
      onStartShouldSetResponder={() => true}
      onLayout={(evento) => {
        const { width, height } = evento.nativeEvent.layout;
        tamanoOverlayRef.current = { width, height };
        setTamanoOverlay({ width, height });
      }}
    >
      {contenido}
    </View>
  );
}

function TarjetaPaso({ paso, indicePaso, onSiguiente, onSaltar, onTerminar }) {
  const esCierre = paso.tipo === "cierre";

  return (
    <View style={styles.tarjeta}>
      {!esCierre && (
        <Text style={styles.progreso}>
          Paso {indicePaso + 1} de {CANTIDAD_PASOS_NUMERADOS}
        </Text>
      )}
      <Text style={[styles.titulo, esCierre && styles.tituloCierre]}>{paso.titulo}</Text>
      <Text style={[styles.texto, esCierre && styles.textoCierre]}>{paso.texto}</Text>

      {esCierre ? (
        <Button title="Terminar" onPress={onTerminar} />
      ) : (
        <View style={styles.botones}>
          <TouchableOpacity onPress={onSaltar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.saltarTexto}>Saltar tutorial</Text>
          </TouchableOpacity>
          <View style={styles.botonSiguiente}>
            <Button title="Siguiente" onPress={onSiguiente} />
          </View>
        </View>
      )}
    </View>
  );
}

function IconoCierre() {
  return (
    <View style={styles.iconoCierre}>
      <Ionicons name="checkmark" size={34} color={colors.bg} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Mockups ilustrativos: SOLO dibujo, sin ningún Context de negocio ni
// onPress. Datos inventados a propósito (y marcados como "Ejemplo") para que
// no se confundan con datos reales del taller.
// ---------------------------------------------------------------------------

function EtiquetaEjemplo() {
  return (
    <View style={styles.etiquetaEjemplo}>
      <Text style={styles.etiquetaEjemploTexto}>Ejemplo</Text>
    </View>
  );
}

function FilaMockup({ icono, label, valor }) {
  return (
    <View style={styles.mockFila}>
      <Ionicons name={icono} size={18} color={colors.accentLight} />
      <View style={styles.mockFilaTexto}>
        <Text style={styles.mockLabel}>{label}</Text>
        <Text style={styles.mockValor}>{valor}</Text>
      </View>
    </View>
  );
}

function MockupTrabajoNuevo() {
  return (
    <View style={styles.mockup} pointerEvents="none">
      <View style={styles.mockEncabezado}>
        <Text style={styles.mockTitulo}>Trabajo nuevo</Text>
        <EtiquetaEjemplo />
      </View>

      <View style={styles.mockGrupo}>
        <Text style={styles.mockGrupoLabel}>Cliente + Vehículo</Text>
        <FilaMockup icono="person-outline" label="Cliente" valor="Juan Pérez" />
        <FilaMockup icono="car-sport-outline" label="Vehículo" valor="Toyota Corolla · AB 123 CD" />
      </View>

      <FilaMockup icono="sparkles-outline" label="Servicio" valor="Lavado premium" />
      <FilaMockup icono="calendar-outline" label="Fecha y hora" valor="Viernes 3 · 10:00 hs" />
    </View>
  );
}

function MockupRegistrarCobro() {
  return (
    <View style={styles.mockup} pointerEvents="none">
      <View style={styles.mockEncabezado}>
        <Text style={styles.mockTitulo}>Registrar cobro</Text>
        <EtiquetaEjemplo />
      </View>
      <Text style={styles.mockSubtitulo}>Lavado premium · Juan Pérez</Text>

      <View style={styles.mockTotalFila}>
        <Text style={styles.mockLabel}>Total del trabajo</Text>
        <Text style={styles.mockValor}>{formatearPesos(45000)}</Text>
      </View>

      <View style={styles.mockChips}>
        <View style={styles.mockChip}>
          <Text style={styles.mockChipTexto}>Pago total</Text>
        </View>
        <View style={[styles.mockChip, styles.mockChipActivo]}>
          <Text style={[styles.mockChipTexto, styles.mockChipTextoActivo]}>Seña</Text>
        </View>
      </View>

      <FilaMockup icono="cash-outline" label="Monto de la seña" valor={formatearPesos(15000)} />

      <View style={styles.mockBoton}>
        <Text style={styles.mockBotonTexto}>Registrar cobro</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    position: "absolute",
    backgroundColor: COLOR_FONDO,
  },
  marco: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radii.button,
  },
  tarjetaPosicionada: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 18,
    gap: 10,
    ...shadow,
  },
  progreso: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.accentLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  tituloCierre: {
    fontSize: 22,
    textAlign: "center",
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  textoCierre: {
    textAlign: "center",
    marginBottom: 6,
  },
  botones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  saltarTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: "underline",
  },
  botonSiguiente: {
    minWidth: 140,
  },
  iconoCierre: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  etiquetaEjemplo: {
    backgroundColor: colors.amberTint,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  etiquetaEjemploTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.amber,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mockup: {
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 12,
  },
  mockEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockTitulo: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  mockSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -6,
  },
  mockGrupo: {
    borderWidth: 1,
    borderColor: colors.borderAccent,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentTint,
    padding: 12,
    gap: 10,
  },
  mockGrupoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.accentLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mockFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mockFilaTexto: {
    flex: 1,
  },
  mockLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  mockValor: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  mockTotalFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockChips: {
    flexDirection: "row",
    gap: 8,
  },
  mockChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  mockChipActivo: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  mockChipTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  mockChipTextoActivo: {
    color: colors.bg,
  },
  mockBoton: {
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  mockBotonTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.bg,
  },
});
