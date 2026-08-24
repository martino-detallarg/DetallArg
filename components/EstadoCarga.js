import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Wrapper para el cuerpo de una pantalla que depende de un fetch inicial a
// Supabase (Taller, Horarios, Clientes, Equipo): mientras `cargando`,
// spinner centrado; si `error`, ícono + mensaje + botón "Reintentar"; si no,
// `children` (el contenido real de la pantalla, con su propio estado de
// "vacío" si corresponde). El header/título de cada pantalla queda afuera
// de este componente a propósito, para que no desaparezca durante la carga.
export default function EstadoCarga({ cargando, error, onReintentar, children }) {
  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <View style={styles.icono}>
          <Ionicons name="cloud-offline-outline" size={28} color={colors.accentLight} />
        </View>
        <Text style={styles.errorTexto}>{error}</Text>
        <TouchableOpacity style={styles.reintentarBoton} onPress={onReintentar} activeOpacity={0.85}>
          <Text style={styles.reintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  icono: {
    width: 56,
    height: 56,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  reintentarBoton: {
    borderWidth: 1,
    borderColor: colors.borderAccent,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  reintentarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
