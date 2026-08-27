import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { colors } from "../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Anillo de progreso reutilizable (mismo enfoque que GraficoDonut: SVG a
// mano, sin sumar una librería de gráficos). A diferencia de GraficoDonut
// (que reparte varios segmentos), este es para un único valor 0-1 contra un
// fondo neutro, estilo "ring" de apps de fitness/salud (ej. Cal AI).
// `children` se centra encima del anillo (para el número/ícono del medio).
//
// El trazo se anima desde 0 hasta `progreso` cada vez que el componente se
// monta (no solo la primera vez): quien lo use y quiera que se repita en
// cada visita a una pantalla tiene que forzar el remount (ej. con `key`
// atado al foco de navegación), no es algo que este componente decida solo.
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

  const progresoAnimado = useSharedValue(0);

  useEffect(() => {
    progresoAnimado.value = withTiming(progresoAcotado, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    // Se anima una sola vez al montar (y si `progreso` cambia después),
    // arrancando siempre desde el 0 inicial del useSharedValue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progresoAcotado]);

  const propsAnimados = useAnimatedProps(() => ({
    strokeDashoffset: circunferencia * (1 - progresoAnimado.value),
  }));

  return (
    <View style={{ width: tamano, height: tamano }}>
      <Svg width={tamano} height={tamano}>
        <Circle cx={centro} cy={centro} r={radio} stroke={colorFondo} strokeWidth={grosor} fill="none" />
        <AnimatedCircle
          cx={centro}
          cy={centro}
          r={radio}
          stroke={color}
          strokeWidth={grosor}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          animatedProps={propsAnimados}
          rotation="-90"
          origin={`${centro}, ${centro}`}
        />
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
