import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Bottom-sheet simple para elegir "Todos los empleados" o uno puntual, para
// filtrar los turnos de la Agenda por empleado asignado. Mismo patrón que
// SelectorSiluetaModal.js (incluida la zona "tocar afuera para cerrar" como
// sibling de la tarjeta, no como wrapper de ella).
export default function FiltroEmpleadoModal({ visible, empleados, empleadoSeleccionadoId, onElegir, onCerrar }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <TouchableOpacity style={styles.fondoToque} activeOpacity={1} onPress={onCerrar} />

        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Filtrar por empleado</Text>

          <TouchableOpacity
            style={[styles.opcion, empleadoSeleccionadoId === null && styles.opcionSeleccionada]}
            onPress={() => onElegir(null)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.opcionTexto, empleadoSeleccionadoId === null && styles.opcionTextoSeleccionado]}
            >
              Todos los empleados
            </Text>
            {empleadoSeleccionadoId === null && (
              <Ionicons name="checkmark" size={18} color={colors.accentLight} />
            )}
          </TouchableOpacity>

          {empleados.map((empleado) => {
            const seleccionado = empleadoSeleccionadoId === empleado.id;
            return (
              <TouchableOpacity
                key={empleado.id}
                style={[styles.opcion, seleccionado && styles.opcionSeleccionada]}
                onPress={() => onElegir(empleado.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.opcionTexto, seleccionado && styles.opcionTextoSeleccionado]}>
                  {empleado.nombre}
                </Text>
                {seleccionado && <Ionicons name="checkmark" size={18} color={colors.accentLight} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
  },
  fondoToque: {
    flex: 1,
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    paddingBottom: 32,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 10,
  },
  opcionSeleccionada: {
    borderColor: colors.accent,
  },
  opcionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  opcionTextoSeleccionado: {
    color: colors.accentLight,
  },
});
