import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import { colors, fonts } from "../theme";

const ALTO = 170;
const ESPACIO = 14;
const RADIO_BARRA = 6;
const LINEAS_GRILLA = [0.25, 0.5, 0.75, 1];

// Gráfico de columnas simple hecho con react-native-svg (mismo enfoque que
// FuelGauge) para no sumar una librería de gráficos nueva. Es ilustrativo:
// pensado para mostrarse prolijo con los tokens del theme, no para ser un
// componente de gráficos genérico.
export default function GraficoBarras({ datos, ancho }) {
  const maximo = Math.max(...datos.map((d) => d.valor)) * 1.15;
  const anchoBarra = (ancho - ESPACIO * (datos.length - 1)) / datos.length;

  return (
    <View>
      <Svg width={ancho} height={ALTO}>
        {LINEAS_GRILLA.map((frac) => (
          <Line
            key={frac}
            x1={0}
            y1={ALTO * (1 - frac)}
            x2={ancho}
            y2={ALTO * (1 - frac)}
            stroke={colors.borderSubtle}
            strokeWidth={1}
          />
        ))}
        {datos.map((item, indice) => {
          const alturaBarra = (item.valor / maximo) * ALTO;
          const x = indice * (anchoBarra + ESPACIO);
          const y = ALTO - alturaBarra;
          return (
            <Rect
              key={item.etiqueta}
              x={x}
              y={y}
              width={anchoBarra}
              height={alturaBarra}
              rx={RADIO_BARRA}
              fill={colors.accent}
            />
          );
        })}
      </Svg>

      <View style={[styles.filaEtiquetas, { width: ancho }]}>
        {datos.map((item) => (
          <View key={item.etiqueta} style={{ width: anchoBarra, alignItems: "center" }}>
            <Text style={styles.valor} numberOfLines={1}>
              {item.valorTexto}
            </Text>
            <Text style={styles.etiqueta}>{item.etiqueta}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filaEtiquetas: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  valor: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  etiqueta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
