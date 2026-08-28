import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Bottom-sheet para elegir "Todos los servicios" o uno puntual del catálogo,
// para filtrar el Historial de Clientes. Mismo patrón que FiltroEmpleadoModal.js.
export default function FiltroServicioModal({ visible, servicios, servicioSeleccionadoId, onElegir, onCerrar }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <TouchableOpacity style={styles.fondoToque} activeOpacity={1} onPress={onCerrar} />

        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Filtrar por servicio</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.opcion, servicioSeleccionadoId === null && styles.opcionSeleccionada]}
              onPress={() => onElegir(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.opcionTexto, servicioSeleccionadoId === null && styles.opcionTextoSeleccionado]}
              >
                Todos los servicios
              </Text>
              {servicioSeleccionadoId === null && (
                <Ionicons name="checkmark" size={18} color={colors.accentLight} />
              )}
            </TouchableOpacity>

            {servicios.length === 0 ? (
              <Text style={styles.vacio}>Todavía no hay servicios cargados.</Text>
            ) : (
              servicios.map((servicio) => {
                const seleccionado = servicioSeleccionadoId === servicio.id;
                return (
                  <TouchableOpacity
                    key={servicio.id}
                    style={[styles.opcion, seleccionado && styles.opcionSeleccionada]}
                    onPress={() => onElegir(servicio.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.opcionTexto, seleccionado && styles.opcionTextoSeleccionado]}
                      numberOfLines={1}
                    >
                      {servicio.nombre}
                    </Text>
                    {seleccionado && <Ionicons name="checkmark" size={18} color={colors.accentLight} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
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
    maxHeight: "70%",
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
    flex: 1,
    marginRight: 8,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  opcionTextoSeleccionado: {
    color: colors.accentLight,
  },
  vacio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 14,
    textAlign: "center",
  },
});
