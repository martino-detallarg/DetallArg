import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const ANCHO_BORDE = 24;
const DISTANCIA_MINIMA = 60;
const VELOCIDAD_MINIMA = 800;

// Los wizards (NuevoClienteWizard, TrabajoNuevoWizard) son <Modal> con pasos
// manejados por estado local, no por React Navigation — no tienen el gesto
// nativo de "volver" que sí ganaron las pantallas del Drawer al pasar a
// native-stack. Esto lo aproxima a mano: deslizar desde el borde izquierdo
// dispara el mismo `onAtras` que ya usa el botón de WizardHeader (que en el
// primer paso de cada wizard cierra el modal, y en los siguientes retrocede
// un paso — el mismo criterio que ya tenía el botón).
//
// Envuelve el CONTENIDO de cada paso (todo lo que va debajo de WizardHeader),
// no la pantalla completa: si cubriera también el header, la franja del
// gesto se superpondría con el hitSlop del botón de volver y podría
// robarle el toque.
export default function SwipeVolver({ onAtras, children }) {
  const gesto = Gesture.Pan()
    .activeOffsetX(15)
    .failOffsetY([-15, 15])
    .onEnd((evento) => {
      if (evento.translationX > DISTANCIA_MINIMA || evento.velocityX > VELOCIDAD_MINIMA) {
        runOnJS(onAtras)();
      }
    });

  return (
    <View style={styles.contenedor}>
      {children}
      <GestureDetector gesture={gesto}>
        <View style={styles.bordeSwipe} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  bordeSwipe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: ANCHO_BORDE,
  },
});
