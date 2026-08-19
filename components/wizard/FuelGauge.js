import { useRef } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors, fonts } from "../../theme";

const ANCHO = 240;
const ALTO = 140;
const RADIO = 100;
const GROSOR = 16;
const CENTRO_X = ANCHO / 2;
const CENTRO_Y = ALTO - 10;

function puntoEnAngulo(grados) {
  const rad = (grados * Math.PI) / 180;
  return {
    x: CENTRO_X - RADIO * Math.cos(rad),
    y: CENTRO_Y - RADIO * Math.sin(rad),
  };
}

function arcoPath(gradoInicio, gradoFin) {
  const inicio = puntoEnAngulo(gradoInicio);
  const fin = puntoEnAngulo(gradoFin);
  const arcoGrande = gradoFin - gradoInicio > 180 ? 1 : 0;
  return `M ${inicio.x} ${inicio.y} A ${RADIO} ${RADIO} 0 ${arcoGrande} 1 ${fin.x} ${fin.y}`;
}

export default function FuelGauge({ nivel, onCambiar }) {
  const contenedorRef = useRef(null);
  const origenPantalla = useRef({ x: 0, y: 0 });

  function medirOrigen() {
    contenedorRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      origenPantalla.current = { x: pageX, y: pageY };
    });
  }

  const responder = useRef(
    PanResponder.create({
      // onStart/onMoveShouldSetPanResponderCapture (true) hace que este
      // componente capture el toque ANTES de que el ScrollView padre lo
      // interprete como un gesto de scroll, y onPanResponderTerminationRequest
      // (false) evita que el ScrollView se lo robe a mitad del arrastre.
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: manejarToque,
      onPanResponderMove: manejarToque,
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  function manejarToque(_evt, gestureState) {
    const touchX = gestureState.moveX || gestureState.x0;
    const touchY = gestureState.moveY || gestureState.y0;
    const dx = touchX - origenPantalla.current.x - CENTRO_X;
    const dy = CENTRO_Y - (touchY - origenPantalla.current.y);

    let grados;
    if (dy < 0) {
      grados = dx < 0 ? 0 : 180;
    } else {
      grados = (Math.atan2(dy, -dx) * 180) / Math.PI;
      grados = Math.max(0, Math.min(180, grados));
    }

    const nuevoPorcentaje = Math.max(0, Math.min(100, Math.round((grados / 180) * 100)));
    onCambiar(nuevoPorcentaje);
  }

  const anguloActual = (nivel / 100) * 180;
  const indicador = puntoEnAngulo(anguloActual);

  return (
    <View style={styles.contenedor}>
      <View
        ref={contenedorRef}
        onLayout={medirOrigen}
        style={{ width: ANCHO, height: ALTO }}
        {...responder.panHandlers}
      >
        <Svg width={ANCHO} height={ALTO}>
          <Path
            d={arcoPath(0, 180)}
            stroke={colors.surface2}
            strokeWidth={GROSOR}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={arcoPath(0, anguloActual)}
            stroke={colors.accent}
            strokeWidth={GROSOR}
            strokeLinecap="round"
            fill="none"
          />
          <Circle
            cx={indicador.x}
            cy={indicador.y}
            r={12}
            fill={colors.accentLight}
            stroke={colors.bg}
            strokeWidth={3}
          />
        </Svg>
      </View>

      <Text style={styles.valorActual}>{nivel}%</Text>

      <View style={styles.etiquetas}>
        <Text style={styles.etiqueta}>Vacío</Text>
        <Text style={styles.etiqueta}>Lleno</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  valorActual: {
    fontFamily: fonts.monoMedium,
    fontSize: 20,
    color: colors.accentLight,
    marginTop: 4,
  },
  etiquetas: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: ANCHO,
    marginTop: 6,
  },
  etiqueta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
});
