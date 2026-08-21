import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../components/Button";
import { colors, fonts } from "../../theme";

export default function PreguntaTrabajoStep({ nombreCliente, onSi, onNo }) {
  return (
    <View style={styles.pantalla}>
      <View style={styles.icono}>
        <Ionicons name="checkmark" size={36} color={colors.bg} />
      </View>
      <Text style={styles.titulo}>
        {nombreCliente ? `${nombreCliente} guardado` : "¡Guardado!"}
      </Text>
      <Text style={styles.pregunta}>¿Querés cargar un trabajo ahora?</Text>

      <View style={styles.botones}>
        <Button title="Sí, cargar trabajo" onPress={onSi} />
        <View style={styles.espacio} />
        <Button title="No, por ahora no" variant="secondary" onPress={onNo} />
      </View>
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
  pregunta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    marginBottom: 28,
  },
  botones: {
    width: "100%",
  },
  espacio: {
    height: 12,
  },
});
