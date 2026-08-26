import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) {
  const esPrimario = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.base,
        esPrimario ? styles.primario : styles.secundario,
        disabled || loading ? styles.deshabilitado : null,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={esPrimario ? colors.bg : colors.textSecondary} />
      ) : (
        <Text style={esPrimario ? styles.textoPrimario : styles.textoSecundario}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radii.button,
    ...continuousCorner,
    alignItems: "center",
    justifyContent: "center",
  },
  primario: {
    backgroundColor: colors.accent,
  },
  secundario: {
    backgroundColor: colors.surface2,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  textoPrimario: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.bg,
  },
  textoSecundario: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
