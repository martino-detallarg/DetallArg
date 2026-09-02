import { useEffect, useRef } from "react";

// Hace scroll automático hasta un botón (típicamente "Continuar"/"Guardar" de
// un formulario por pasos) apenas pasa de deshabilitado a habilitado — así el
// usuario no tiene que buscarlo a mano si quedó tapado por el teclado o
// scrolleado fuera de vista. Dispara solo en la transición false -> true,
// nunca en cada render con habilitado=true, para no interrumpir al usuario
// mientras sigue editando un formulario que ya es válido.
//
// Uso: const onLayoutBoton = useScrollAlHabilitar(scrollRef, esValido);
// y en el JSX: <View onLayout={onLayoutBoton}><Button .../></View>
// dentro del <ScrollView ref={scrollRef}>.
export function useScrollAlHabilitar(scrollRef, habilitado) {
  const yBotonRef = useRef(0);
  const habilitadoAnteriorRef = useRef(habilitado);

  useEffect(() => {
    if (habilitado && !habilitadoAnteriorRef.current) {
      scrollRef.current?.scrollTo({ y: Math.max(yBotonRef.current - 40, 0), animated: true });
    }
    habilitadoAnteriorRef.current = habilitado;
  }, [habilitado]);

  function onLayoutBoton(evento) {
    yBotonRef.current = evento.nativeEvent.layout.y;
  }

  return onLayoutBoton;
}
