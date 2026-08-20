import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

export default function DetalleTurnoModal({ visible, turno, cliente, auto, onClose }) {
  if (!turno || !cliente) return null;

  const autosDelCliente = cliente.vehiculos;

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
    maxHeight: "80%",
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
  botonCerrar: {
    marginTop: 16,
  },
});
