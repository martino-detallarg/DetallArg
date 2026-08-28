import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import { colors, fonts } from "../theme";

const ALTO = 170;
const ESPACIO = 14;
const ESPACIO_INTERNO = 4;
const RADIO_BARRA = 6;
const LINEAS_GRILLA = [0.25, 0.5, 0.75, 1];

// Gráfico de columnas simple hecho con react-native-svg (mismo enfoque que
// FuelGauge) para no sumar una librería de gráficos nueva. Es ilustrativo:
// pensado para mostrarse prolijo con los tokens del theme, no para ser un
// componente de gráficos genérico.
//
// Si algún item de `datos` trae `valorSecundario`, dibuja dos barras más
// angostas por grupo (ej. ingresos vs. egresos, ver FinanzasScreen.js) en
// vez de una sola columna — sin ese campo se comporta exactamente igual que
// antes (una barra por item, con su valorTexto arriba).
export default function GraficoBarras({ datos, ancho, colorSecundario = colors.error }) {
  const tieneSecundario = datos.some((d) => d.valorSecundario !== undefined);
  // El `|| 1` evita dividir por cero cuando todavía no hay ningún cobro/gasto
  // cargado (todos los valores en 0) — sin esto, `alturaBarra` da NaN.
  const maximo = Math.max(...datos.flatMap((d) => [d.valor, d.valorSecundario ?? 0]), 0) * 1.15 || 1;
  const anchoGrupo = (ancho - ESPACIO * (datos.length - 1)) / datos.length;
  const anchoBarra = tieneSecundario ? (anchoGrupo - ESPACIO_INTERNO) / 2 : anchoGrupo;

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
          const xGrupo = indice * (anchoGrupo + ESPACIO);
          const alturaPrimaria = (item.valor / maximo) * ALTO;
          return (
            <Rect
              key={`${item.etiqueta}-primaria`}
              x={xGrupo}
              y={ALTO - alturaPrimaria}
              width={anchoBarra}
              height={alturaPrimaria}
              rx={RADIO_BARRA}
              fill={colors.accent}
            />
          );
        })}
        {tieneSecundario &&
          datos.map((item, indice) => {
            const xGrupo = indice * (anchoGrupo + ESPACIO);
            const alturaSecundaria = ((item.valorSecundario ?? 0) / maximo) * ALTO;
            return (
              <Rect
                key={`${item.etiqueta}-secundaria`}
                x={xGrupo + anchoBarra + ESPACIO_INTERNO}
                y={ALTO - alturaSecundaria}
                width={anchoBarra}
                height={alturaSecundaria}
                rx={RADIO_BARRA}
                fill={colorSecundario}
              />
            );
          })}
      </Svg>

      <View style={[styles.filaEtiquetas, { width: ancho }]}>
        {datos.map((item) => (
          <View key={item.etiqueta} style={{ width: anchoGrupo, alignItems: "center" }}>
            {!tieneSecundario && (
              <Text style={styles.valor} numberOfLines={1}>
                {item.valorTexto}
              </Text>
            )}
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
