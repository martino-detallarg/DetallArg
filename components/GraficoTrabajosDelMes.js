import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Path, Rect } from "react-native-svg";
import { colors, fonts } from "../theme";

const ALTO = 170;
const ESPACIO = 6;
const RADIO_BARRA = 4;
const ALTURA_MINIMA = 2;
const GAP_SEGMENTOS = 2;

// Rectángulo con solo las esquinas de arriba (o solo las de abajo)
// redondeadas: cada segmento de una barra apilada es media "pastilla". El
// radio se achica si el segmento es más bajo o más angosto que RADIO_BARRA,
// para que el arco nunca se salga del rect.
function pathSegmento(x, y, ancho, alto, esquinas) {
  const r = Math.max(0, Math.min(RADIO_BARRA, alto, ancho / 2));
  if (esquinas === "arriba") {
    return [
      `M ${x} ${y + alto}`,
      `L ${x} ${y + r}`,
      `Q ${x} ${y} ${x + r} ${y}`,
      `L ${x + ancho - r} ${y}`,
      `Q ${x + ancho} ${y} ${x + ancho} ${y + r}`,
      `L ${x + ancho} ${y + alto}`,
      "Z",
    ].join(" ");
  }
  return [
    `M ${x} ${y}`,
    `L ${x + ancho} ${y}`,
    `L ${x + ancho} ${y + alto - r}`,
    `Q ${x + ancho} ${y + alto} ${x + ancho - r} ${y + alto}`,
    `L ${x + r} ${y + alto}`,
    `Q ${x} ${y + alto} ${x} ${y + alto - r}`,
    "Z",
  ].join(" ");
}

// Gráfico de barras de "Trabajos del mes" (FinanzasRendimientoScreen.js): una
// barra por cobro del mes. Si el trabajo dio ganancia (margen ≥ 0), la barra
// mide el monto cobrado y va apilada: abajo el costo de insumos (monto -
// margen), arriba la ganancia bruta — la línea de corte muestra qué parte de
// lo cobrado se fue en insumos. Si dio pérdida (margen < 0), es una sola
// barra roja hacia abajo de la línea de base, de alto = la pérdida. Cada
// barra es tocable para mostrar el detalle del trabajo debajo del gráfico.
//
// Componente aparte de GraficoBarras.js (que no soporta valores negativos ni
// tap por barra, y está pensado para comparar dos series) para no mezclarle
// esa responsabilidad a un componente genérico — que además, después de este
// cambio, ya no tiene ningún otro uso en la app.
export default function GraficoTrabajosDelMes({ datos, ancho, indiceSeleccionado, onPressBarra }) {
  // Referencia de altura: lo cobrado para los trabajos con ganancia (la
  // barra apilada entera), la pérdida para los negativos.
  const valores = datos.map((d) => (d.margen >= 0 ? d.monto : d.margen));
  const maximo = Math.max(...valores, 0);
  const minimo = Math.min(...valores, 0);
  // El "|| 1" evita dividir por cero si todos los valores dieran
  // exactamente 0 (cobros de $0, caso de borde raro pero posible).
  const escala = (maximo - minimo) * 1.15 || 1;
  const yBase = (maximo / escala) * ALTO;

  const anchoGrupo = (ancho - ESPACIO * (datos.length - 1)) / datos.length;

  function renderBarra(item, indice) {
    const x = indice * (anchoGrupo + ESPACIO);
    const seleccionada = indice === indiceSeleccionado;
    const onPress = () => onPressBarra?.(indice);

    if (item.margen < 0) {
      const altura = Math.max((Math.abs(item.margen) / escala) * ALTO, ALTURA_MINIMA);
      return (
        <Rect
          key={indice}
          x={x}
          y={yBase}
          width={anchoGrupo}
          height={altura}
          rx={RADIO_BARRA}
          fill={seleccionada ? colors.errorLight : colors.error}
          onPress={onPress}
        />
      );
    }

    const colorGanancia = seleccionada ? colors.accentLight : colors.accent;
    const colorCosto = seleccionada ? colors.textSecondary : colors.textMuted;
    const costo = Math.max(item.monto - item.margen, 0);
    const alturaTotal = Math.max((item.monto / escala) * ALTO, ALTURA_MINIMA);

    // Un solo segmento (pastilla entera) si una de las dos partes es 0: no
    // hay corte que mostrar.
    if (costo <= 0 || item.margen <= 0) {
      return (
        <Rect
          key={indice}
          x={x}
          y={yBase - alturaTotal}
          width={anchoGrupo}
          height={alturaTotal}
          rx={RADIO_BARRA}
          fill={costo <= 0 ? colorGanancia : colorCosto}
          onPress={onPress}
        />
      );
    }

    // El gap sale de adentro de la barra (no la estira), así la altura total
    // sigue representando exactamente lo cobrado. Cada segmento conserva al
    // menos ALTURA_MINIMA para que no desaparezca si es muy chico.
    const alturaUtil = Math.max(alturaTotal - GAP_SEGMENTOS, ALTURA_MINIMA * 2);
    const alturaCosto = Math.min(
      Math.max((costo / item.monto) * alturaUtil, ALTURA_MINIMA),
      alturaUtil - ALTURA_MINIMA
    );
    const alturaGanancia = alturaUtil - alturaCosto;
    const yCosto = yBase - alturaCosto;
    const yGanancia = yCosto - GAP_SEGMENTOS - alturaGanancia;

    return (
      <G key={indice}>
        <Path d={pathSegmento(x, yCosto, anchoGrupo, alturaCosto, "abajo")} fill={colorCosto} onPress={onPress} />
        <Path
          d={pathSegmento(x, yGanancia, anchoGrupo, alturaGanancia, "arriba")}
          fill={colorGanancia}
          onPress={onPress}
        />
      </G>
    );
  }

  return (
    <View>
      <View style={styles.leyenda}>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaPunto, { backgroundColor: colors.accent }]} />
          <Text style={styles.leyendaTexto}>Ganancia bruta</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaPunto, { backgroundColor: colors.textMuted }]} />
          <Text style={styles.leyendaTexto}>Costo de insumos</Text>
        </View>
      </View>

      <Svg width={ancho} height={ALTO}>
        <Line x1={0} y1={yBase} x2={ancho} y2={yBase} stroke={colors.borderSubtle} strokeWidth={1} />

        {/* Columna invisible de ancho completo por barra: sin esto, un margen
            casi nulo dibuja una barra de 2px que es casi imposible de tocar. */}
        {datos.map((_, indice) => (
          <Rect
            key={`hit-${indice}`}
            x={indice * (anchoGrupo + ESPACIO)}
            y={0}
            width={anchoGrupo}
            height={ALTO}
            fill="transparent"
            onPress={() => onPressBarra?.(indice)}
          />
        ))}

        {datos.map(renderBarra)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  leyenda: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leyendaPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leyendaTexto: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
});
