import { StyleSheet, Text, View } from "react-native";
import CircularProgress from "./CircularProgress";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// `progreso` es opcional (0-1): cuando viene, el valor se muestra adentro de
// un anillo de progreso (CircularProgress) en vez de como texto suelto —
// para stats donde tiene sentido mostrar "cuánto se completó" (ej. turnos
// de hoy ya finalizados sobre el total). Si no viene, se mantiene el
// número simple de siempre.
export default function StatCard({ label, valor, progreso }) {
  const tieneProgreso = typeof progreso === "number";

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>

      {tieneProgreso ? (
        <View style={styles.anilloWrap}>
          <CircularProgress progreso={progreso} tamano={76} grosor={7}>
            <Text
              style={styles.valorAnillo}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {valor}
            </Text>
          </CircularProgress>
        </View>
      ) : (
        <Text
          style={styles.valor}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {valor}
        </Text>
      )}
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
  anilloWrap: {
    alignItems: "center",
    marginTop: 12,
  },
  valorAnillo: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textPrimary,
  },
});
