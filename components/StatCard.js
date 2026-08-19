import { StyleSheet, Text, View } from "react-native";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

export default function StatCard({ label, valor }) {
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
    paddingVertical: 16,
    paddingHorizontal: 14,
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
    fontFamily: fonts.monoMedium,
    fontSize: 24,
    color: colors.accentLight,
    marginTop: 8,
  },
});
