import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "./Button";
import { ESTADOS_TRABAJO } from "../data/mockData";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Detalle de solo lectura de un trabajo ya cargado (cliente, vehículo y
// datos del servicio), con un selector de estado debajo para ir avanzando
// (o volviendo) por las etapas del trabajo.
export default function TrabajoDetalleModal({ visible, turno, cliente, auto, onCambiarEstado, onClose }) {
  if (!turno || !cliente) return null;

  const vehiculosDelCliente = cliente.vehiculos;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.titulo}>Turno de las {turno.hora}</Text>
            <Text style={styles.servicio}>{turno.servicio}</Text>

            <Text style={styles.seccion}>Ficha del cliente</Text>
            <View style={styles.tarjeta}>
              <Text style={styles.filaLabel}>Nombre</Text>
              <Text style={styles.filaValor}>{cliente.nombre}</Text>
              <Text style={styles.filaLabel}>Teléfono</Text>
              <Text style={styles.filaValor}>{cliente.telefono}</Text>
              <Text style={styles.filaLabel}>Vehículos</Text>
              {vehiculosDelCliente.map((v) => (
                <Text key={v.id} style={styles.filaValor}>
                  · {v.marca} {v.modelo} ({v.patente})
                </Text>
              ))}
            </View>

            <Text style={styles.seccion}>Ficha del vehículo de este turno</Text>
            <View style={styles.tarjeta}>
              <Text style={styles.filaLabel}>Marca y modelo</Text>
              <Text style={styles.filaValor}>
                {auto ? `${auto.marca} ${auto.modelo}` : "-"}
              </Text>
              <Text style={styles.filaLabel}>Patente</Text>
              <Text style={styles.filaValor}>{auto?.patente ?? "-"}</Text>
              <Text style={styles.filaLabel}>Color</Text>
              <Text style={styles.filaValor}>{auto?.color ?? "-"}</Text>
              <Text style={styles.filaLabel}>Dueño</Text>
              <Text style={styles.filaValor}>{cliente.nombre}</Text>
            </View>

            <Text style={styles.seccion}>Datos del servicio</Text>
            <View style={styles.tarjeta}>
              <Text style={styles.filaLabel}>Fecha</Text>
              <Text style={styles.filaValor}>{turno.fecha || "-"}</Text>
              <Text style={styles.filaLabel}>Hora</Text>
              <Text style={styles.filaValor}>{turno.hora || "-"}</Text>
              <Text style={styles.filaLabel}>Tiempo estimado</Text>
              <Text style={styles.filaValor}>{turno.tiempoEstimado || "-"}</Text>
              <Text style={styles.filaLabel}>Observaciones</Text>
              <Text style={styles.filaValor}>{turno.observaciones || "Sin observaciones"}</Text>
            </View>

            <Text style={styles.seccion}>Estado del trabajo</Text>
            <View style={styles.chips}>
              {ESTADOS_TRABAJO.map((estado) => {
                const activo = turno.estado === estado;
                return (
                  <TouchableOpacity
                    key={estado}
                    style={[styles.chip, activo && styles.chipSeleccionado]}
                    onPress={() => onCambiarEstado(estado)}
                    disabled={activo}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                      {estado}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.botonCerrar}>
            <Button title="Cerrar" variant="secondary" onPress={onClose} />
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
    maxHeight: "85%",
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  servicio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  seccion: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 10,
  },
  tarjeta: {
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
  },
  filaLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  filaValor: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSeleccionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  botonCerrar: {
    marginTop: 16,
  },
});
