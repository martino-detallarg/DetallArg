import Svg, { Line, Rect } from "react-native-svg";
import { colors } from "../theme";

const ALTO = 170;
const ESPACIO = 6;
const RADIO_BARRA = 4;
const ALTURA_MINIMA = 2;

// Gráfico de barras de "Trabajos del mes" (FinanzasScreen.js): una barra por
// cobro del mes, altura = margen bruto de ese trabajo, dibujada hacia abajo
// de la línea de base si el margen da negativo. Cada barra es tocable para
// mostrar el detalle del trabajo debajo del gráfico.
//
// Componente aparte de GraficoBarras.js (que no soporta valores negativos ni
// tap por barra, y está pensado para comparar dos series) para no mezclarle
// esa responsabilidad a un componente genérico — que además, después de este
// cambio, ya no tiene ningún otro uso en la app.
export default function GraficoTrabajosDelMes({ datos, ancho, indiceSeleccionado, onPressBarra }) {
  const valores = datos.map((d) => d.valor);
  const maximo = Math.max(...valores, 0);
  const minimo = Math.min(...valores, 0);
  // El "|| 1" evita dividir por cero si todos los márgenes dieran
  // exactamente 0 (monto cobrado == costo de insumos, caso de borde raro
  // pero posible).
  const escala = (maximo - minimo) * 1.15 || 1;
  const yBase = (maximo / escala) * ALTO;

  const anchoGrupo = (ancho - ESPACIO * (datos.length - 1)) / datos.length;

  return (
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

      {datos.map((item, indice) => {
        const x = indice * (anchoGrupo + ESPACIO);
        const altura = Math.max((Math.abs(item.valor) / escala) * ALTO, ALTURA_MINIMA);
        const y = item.valor >= 0 ? yBase - altura : yBase;
        const seleccionada = indice === indiceSeleccionado;
        return (
          <Rect
            key={indice}
            x={x}
            y={y}
            width={anchoGrupo}
            height={altura}
            rx={RADIO_BARRA}
            fill={seleccionada ? colors.accentLight : item.valor >= 0 ? colors.accent : colors.error}
            onPress={() => onPressBarra?.(indice)}
          />
        );
      })}
    </Svg>
  );
}
