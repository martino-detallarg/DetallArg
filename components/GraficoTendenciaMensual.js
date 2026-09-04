import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import { colors, fonts } from "../theme";

const ALTO = 130;
const ESPACIO = 8;
const RADIO_BARRA = 4;
const ALTURA_MINIMA = 2;

// Gráfico de "Tendencia de 6 meses" (FinanzasScreen.js): una barra por mes,
// altura = ganancia neta de ese mes — mismo criterio visual que
// GraficoTrabajosDelMes.js (positivo en colors.accent, negativo en
// colors.error, escala 15% más alta que el máximo para que la barra más alta
// no toque el borde), pero sin selección por tap: acá interesa la tendencia
// general, no el detalle de un mes puntual, y cada barra ya lleva su
// etiqueta de mes debajo.
export default function GraficoTendenciaMensual({ datos, ancho }) {
  const valores = datos.map((d) => d.valor);
  const maximo = Math.max(...valores, 0);
  const minimo = Math.min(...valores, 0);
  // El "|| 1" evita dividir por cero si todos los meses dieran exactamente 0.
  const escala = (maximo - minimo) * 1.15 || 1;
  const yBase = (maximo / escala) * ALTO;

  const anchoGrupo = (ancho - ESPACIO * (datos.length - 1)) / datos.length;

  return (
    <View>
      <Svg width={ancho} height={ALTO}>
        <Line x1={0} y1={yBase} x2={ancho} y2={yBase} stroke={colors.borderSubtle} strokeWidth={1} />

        {datos.map((item, indice) => {
          const x = indice * (anchoGrupo + ESPACIO);
          const altura = Math.max((Math.abs(item.valor) / escala) * ALTO, ALTURA_MINIMA);
          const y = item.valor >= 0 ? yBase - altura : yBase;
          return (
            <Rect
              key={indice}
              x={x}
              y={y}
              width={anchoGrupo}
              height={altura}
              rx={RADIO_BARRA}
              fill={item.valor >= 0 ? colors.accent : colors.error}
            />
          );
        })}
      </Svg>

      <View style={[styles.etiquetas, { width: ancho, gap: ESPACIO }]}>
        {datos.map((item, indice) => (
          <Text key={indice} style={[styles.etiqueta, { width: anchoGrupo }]} numberOfLines={1}>
            {item.etiqueta}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  etiquetas: {
    flexDirection: "row",
    marginTop: 6,
  },
  etiqueta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
});
