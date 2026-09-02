import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

const TAMANO_ICONO = 24;

export default function WizardHeader({ titulo, paso, totalPasos = 3, onAtras }) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.fila}>
        <TouchableOpacity
          onPress={onAtras}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={TAMANO_ICONO} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.titulo} numberOfLines={1}>
          {titulo} <Text style={styles.paso}>{paso}/{totalPasos}</Text>
        </Text>

        <View style={styles.spacer} />
      </View>

      <View style={styles.progresoFondo}>
        <View style={[styles.progresoRelleno, { width: `${(paso / totalPasos) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titulo: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  paso: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  spacer: {
    width: TAMANO_ICONO,
  },
  progresoFondo: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSubtle,
    marginTop: 14,
    overflow: "hidden",
  },
  progresoRelleno: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
