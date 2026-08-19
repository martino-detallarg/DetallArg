import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

const DURACION_MS = 1800;

export default function ConfirmacionTrabajoStep({ cliente, servicio, onTerminar }) {
  useEffect(() => {
    const timer = setTimeout(onTerminar, DURACION_MS);
    return () => clearTimeout(timer);
  }, [onTerminar]);

  return (
    <View style={styles.pantalla}>
      <View style={styles.icono}>
        <Ionicons name="checkmark" size={36} color={colors.bg} />
      </View>
      <Text style={styles.titulo}>¡Trabajo guardado!</Text>
      <Text style={styles.texto}>
        {servicio.tipo || "Servicio"} para {cliente.nombre}
        {servicio.fecha ? ` el ${servicio.fecha}` : ""}
        {servicio.hora ? ` a las ${servicio.hora}` : ""}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  icono: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: "center",
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
});
