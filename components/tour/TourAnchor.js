import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { PASOS_TOUR } from "../../data/tourSteps";
import { useTour } from "../../data/TourContext";
import TourSpotlight from "./TourSpotlight";

// Envuelve CUALQUIER elemento real (botón, fila, ícono) sin agregar ningún
// nodo nuevo al árbol -- clona el hijo para pisarle `ref`/`onLayout` en vez
// de meterlo adentro de un <View> propio, que rompería layouts que dependen
// de la posición exacta del hijo (ej. el FAB de Home, con position:
// "absolute" relativo a SU padre real). El hijo tiene que ser un componente
// que exponga measureInWindow por su ref (View, TouchableOpacity, o un
// componente propio envuelto en forwardRef, ver Opcion en
// OpcionesNuevoModal.js) -- si el hijo ya usa su propio ref para otra cosa
// (ej. SignatureCanvas), envolvé el <View> contenedor en vez del componente
// con ref propio.
//
// Cuando `pasoActualId` (TourContext) coincide con `id`, mide la posición en
// pantalla del hijo y muestra el overlay (TourSpotlight) encima de todo. La
// medición se dispara tanto en un efecto (por si el hijo ya estaba montado y
// con layout resuelto cuando el paso se activó) como en onLayout (por si el
// hijo recién se está montando, ej. un paso de wizard que abre ya estando en
// ese punto del tour).
export default function TourAnchor({ id, children }) {
  const { pasoActualId, avanzarTour } = useTour();
  const esActivo = pasoActualId === id;
  const ref = useRef(null);
  const [rect, setRect] = useState(null);

  const medir = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      setRect({ x, y, width, height });
    });
  }, []);

  useEffect(() => {
    if (!esActivo) {
      setRect(null);
      return;
    }
    const frame = requestAnimationFrame(medir);
    // Varios de los puntos de interés viven adentro de un <Modal
    // animationType="slide"|"fade"> (ej. OpcionesNuevoModal,
    // TrabajoDetalleModal) que todavía se está deslizando/apareciendo en el
    // momento en que este paso se activa -- una sola medición inmediata
    // capturaría la posición a mitad de esa animación. Esta segunda medición,
    // ya asentada la transición nativa (~300ms en RN), corrige el rect final.
    const timeout = setTimeout(medir, 350);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [esActivo, medir]);

  const onLayoutOriginal = children.props.onLayout;
  const onPressOriginal = children.props.onPress;
  const paso = PASOS_TOUR.find((p) => p.id === id);

  // El control real queda tocable a propósito (ver TourSpotlight.js) porque el
  // texto de varios pasos invita a tocarlo. Si tiene onPress, lo enganchamos
  // para que tocarlo de verdad TAMBIÉN avance el tour -- si no, pasoActualId
  // nunca cambia (solo avanza el botón "Siguiente" del globito) y el tour
  // queda trabado apuntando a un control que ya hizo lo suyo (navegó, abrió
  // otro modal) mientras el spotlight sigue montado encima. Los pasos que
  // envuelven un contenedor sin onPress propio (inspección de daños, firma,
  // etc.) no se tocan: ahí el control real no navega a otro lado, así que no
  // corren este riesgo.
  return (
    <>
      {cloneElement(children, {
        ref,
        onLayout: (evento) => {
          onLayoutOriginal?.(evento);
          if (esActivo) medir();
        },
        ...(esActivo && onPressOriginal
          ? {
              onPress: (...args) => {
                onPressOriginal(...args);
                avanzarTour();
              },
            }
          : null),
      })}
      {esActivo && rect && paso && <TourSpotlight rect={rect} paso={paso} />}
    </>
  );
}
