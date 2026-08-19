import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

function Opcion({ icono, titulo, descripcion, onPress }) {
  return (
    <TouchableOpacity style={styles.opcion} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.opcionIcono}>
        <Ionicons name={icono} size={22} color={colors.accentLight} />
      </View>
      <View style={styles.opcionTexto}>
        <Text style={styles.opcionTitulo}>{titulo}</Text>
        <Text style={styles.opcionDescripcion}>{descripcion}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function OpcionesNuevoModal({ visible, onClose, onClienteNuevo, onTrabajoNuevo }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>¿Qué querés hacer?</Text>
          <Text style={styles.subtitulo}>Elegí una opción para continuar</Text>

          <Opcion
            icono="person-add-outline"
            titulo="Cliente nuevo"
            descripcion="Cargar un cliente nuevo o sumarle un vehículo a uno existente"
            onPress={onClienteNuevo}
          />
          <Opcion
            icono="briefcase-outline"
            titulo="Trabajo nuevo"
            descripcion="Agendar un servicio para un cliente que ya tenés cargado"
            onPress={onTrabajoNuevo}
          />

          <Button title="Cancelar" variant="secondary" onPress={onClose} />
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
    gap: 12,
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
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 12,
  },
  opcionIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionTexto: {
    flex: 1,
  },
  opcionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  opcionDescripcion: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
