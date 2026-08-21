import { Modal, StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Aparece justo después de guardar un cliente (con su vehículo) desde Home,
// para preguntar si ese alta también implica cargarle un trabajo ahora
// mismo o si el cliente queda cargado solo, sin trabajo asociado.
export default function ConfirmarTrabajoModal({ visible, onSi, onNo }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onNo}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Cliente guardado</Text>
          <Text style={styles.subtitulo}>¿Desea cargar un trabajo nuevo para este cliente?</Text>

          <View style={styles.opciones}>
            <View style={styles.opcion}>
              <Button title="No" variant="secondary" onPress={onNo} />
            </View>
            <View style={styles.opcion}>
              <Button title="Sí" onPress={onSi} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  opciones: {
    flexDirection: "row",
    gap: 12,
  },
  opcion: {
    flex: 1,
  },
});
