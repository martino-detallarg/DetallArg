import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAutosByClienteId } from "../data/mockData";

export default function DetalleTurnoModal({ visible, turno, cliente, auto, onClose }) {
  if (!turno || !cliente) return null;

  const autosDelCliente = getAutosByClienteId(cliente.id);

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
              <Text style={styles.filaLabel}>Autos</Text>
              {autosDelCliente.map((a) => (
                <Text key={a.id} style={styles.filaValor}>
                  · {a.marca} {a.modelo} ({a.patente})
                </Text>
              ))}
            </View>

            <Text style={styles.seccion}>Ficha del auto de este turno</Text>
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
          </ScrollView>

          <TouchableOpacity style={styles.cerrar} onPress={onClose}>
            <Text style={styles.cerrarTexto}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  servicio: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 16,
  },
  seccion: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginTop: 8,
  },
  tarjeta: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  filaLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
  },
  filaValor: {
    fontSize: 15,
    color: "#111827",
  },
  cerrar: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cerrarTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
