import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Logo from "./Logo";
import { colors } from "../theme";

const TAMANO_ICONO = 26;

// Si se pasa onVolver, el header muestra una flecha de volver (mismo ícono
// que WizardHeader) en vez del ícono de menú — para pantallas a las que solo
// se llega navegando desde otra pantalla, no directamente desde el drawer.
export default function ScreenHeader({ onAbrirMenu, onVolver }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onVolver ?? onAbrirMenu}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={onVolver ? "chevron-back" : "menu-outline"}
          size={TAMANO_ICONO}
          color={colors.textPrimary}
        />
      </TouchableOpacity>

      <Logo size={26} />

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  spacer: {
    width: TAMANO_ICONO,
  },
});
