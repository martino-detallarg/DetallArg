import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme";

// Anillo de progreso reutilizable (mismo enfoque que GraficoDonut: SVG a
// mano, sin sumar una librería de gráficos). A diferencia de GraficoDonut
// (que reparte varios segmentos), este es para un único valor 0-1 contra un
// fondo neutro, estilo "ring" de apps de fitness/salud (ej. Cal AI).
// `children` se centra encima del anillo (para el número/ícono del medio).
export default function CircularProgress({
  progreso = 0,
  tamano = 72,
  grosor = 7,
  color = colors.accent,
  colorFondo = colors.surface2,
  children,
}) {
  const radio = (tamano - grosor) / 2;
  const centro = tamano / 2;
  const circunferencia = 2 * Math.PI * radio;
  const progresoAcotado = Math.max(0, Math.min(1, progreso));
  const offset = circunferencia * (1 - progresoAcotado);

  return (
    <View style={{ width: tamano, height: tamano }}>
      <Svg width={tamano} height={tamano}>
        <Circle cx={centro} cy={centro} r={radio} stroke={colorFondo} strokeWidth={grosor} fill="none" />
        {progresoAcotado > 0 && (
          <Circle
            cx={centro}
            cy={centro}
            r={radio}
            stroke={color}
            strokeWidth={grosor}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circunferencia} ${circunferencia}`}
            strokeDashoffset={offset}
            rotation="-90"
            origin={`${centro}, ${centro}`}
          />
        )}
      </Svg>

      {children && (
        <View style={styles.centro} pointerEvents="none">
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
