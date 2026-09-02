import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { formatearPesos } from "../utils/formato";
import { colors, fonts } from "../theme";

const RADIO_EXTERNO = 78;
const RADIO_INTERNO = 54;
const TAMANO = RADIO_EXTERNO * 2 + 4;
const CENTRO = TAMANO / 2;

function puntoPolar(angulo, radio) {
  return {
    x: CENTRO + radio * Math.cos(angulo),
    y: CENTRO + radio * Math.sin(angulo),
  };
}

// Arma el path de una porción de dona (sector de anillo) entre dos ángulos,
// en vez de un Circle con strokeDasharray: así cada porción tiene su propia
// geometría de relleno y el touch de onPress cae solo sobre esa porción, no
// sobre el círculo completo.
function pathPorcion(anguloInicio, anguloFin) {
  const arcoGrande = anguloFin - anguloInicio > Math.PI ? 1 : 0;
  const inicioExt = puntoPolar(anguloInicio, RADIO_EXTERNO);
  const finExt = puntoPolar(anguloFin, RADIO_EXTERNO);
  const finInt = puntoPolar(anguloFin, RADIO_INTERNO);
  const inicioInt = puntoPolar(anguloInicio, RADIO_INTERNO);

  return [
    `M ${inicioExt.x} ${inicioExt.y}`,
    `A ${RADIO_EXTERNO} ${RADIO_EXTERNO} 0 ${arcoGrande} 1 ${finExt.x} ${finExt.y}`,
    `L ${finInt.x} ${finInt.y}`,
    `A ${RADIO_INTERNO} ${RADIO_INTERNO} 0 ${arcoGrande} 0 ${inicioInt.x} ${inicioInt.y}`,
    "Z",
  ].join(" ");
}

// Gráfico de dona hecho con react-native-svg (mismo enfoque que GraficoBarras
// y FuelGauge, sin sumar una librería de gráficos nueva). Cada porción es un
// Path independiente para que el touch sea preciso por porción.
export default function GraficoDonut({ segmentos, onPressSegmento }) {
  const total = segmentos.reduce((suma, s) => suma + s.valor, 0);
  // Arranca en la parte de arriba del círculo (-90°) y avanza en sentido
  // horario, como cualquier gráfico de torta/dona convencional.
  let anguloActual = -Math.PI / 2;

  return (
    <View style={styles.contenedor}>
      <Svg width={TAMANO} height={TAMANO}>
        <Circle cx={CENTRO} cy={CENTRO} r={(RADIO_EXTERNO + RADIO_INTERNO) / 2} stroke={colors.surface2} strokeWidth={RADIO_EXTERNO - RADIO_INTERNO} fill="none" />
        {total > 0 &&
          segmentos.map((segmento) => {
            if (segmento.valor <= 0) return null;
            const anguloInicio = anguloActual;
            // Se recorta un pelo el barrido máximo para nunca dibujar una
            // vuelta completa de 360°: un arco SVG con el mismo punto de
            // inicio y fin no se puede describir con un solo comando A.
            const barrido = Math.min((segmento.valor / total) * Math.PI * 2, Math.PI * 2 - 0.001);
            const anguloFin = anguloInicio + barrido;
            anguloActual = anguloFin;
            return (
              <Path
                key={segmento.clave}
                d={pathPorcion(anguloInicio, anguloFin)}
                fill={segmento.color}
                onPress={() => onPressSegmento?.(segmento.clave)}
              />
            );
          })}
      </Svg>

      <View style={styles.centro} pointerEvents="none">
        <Text style={styles.centroMonto} numberOfLines={1} adjustsFontSizeToFit>
          {formatearPesos(total)}
        </Text>
        <Text style={styles.centroLabel}>Total mensual</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: TAMANO,
    height: TAMANO,
    alignSelf: "center",
  },
  centro: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  centroMonto: {
    fontFamily: fonts.headingBlack,
    fontSize: 19,
    color: colors.textPrimary,
  },
  centroLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
});
