import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CircularProgress from "./CircularProgress";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// `progreso` es opcional (0-1): cuando viene, el valor se muestra adentro de
// un anillo de progreso (CircularProgress) en vez de como texto suelto —
// para stats donde tiene sentido mostrar "cuánto se completó" (ej. turnos
// de hoy ya finalizados sobre el total). Si no viene, se mantiene el
// número simple de siempre. `onPress` es opcional y solo se usa en el modo
// con anillo (ej. Home lo usa para navegar a Agenda al tocar el anillo).
export default function StatCard({ label, valor, progreso, onPress, tamano = 130 }) {
  const tieneProgreso = typeof progreso === "number";

  if (tieneProgreso) {
    return (
      <TouchableOpacity style={styles.contenedorAnillo} onPress={onPress} activeOpacity={0.7}>
        <CircularProgress progreso={progreso} tamano={tamano} grosor={6}>
          <Text
            style={styles.valorAnillo}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {valor}
          </Text>
          <Text style={styles.labelAnillo} numberOfLines={1}>{label}</Text>
        </CircularProgress>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text
        style={styles.valor}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 20,
    paddingHorizontal: 18,
    ...shadow,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valor: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.accentLight,
    marginTop: 10,
  },
  contenedorAnillo: {
    alignItems: "center",
    justifyContent: "center",
  },
  valorAnillo: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.textPrimary,
  },
  labelAnillo: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
