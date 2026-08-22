import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "../Button";
import { colors, continuousCorner, fonts, radii, shadow } from "../../theme";

// Solo se usa en iOS (ver DatosServicioStep.js): en Android el date picker
// nativo es un diálogo imperativo que se autocierra, no necesita este
// wrapper. Acá el spinner queda montado dentro de un bottom-sheet propio
// porque iOS no tiene un modo "diálogo" equivalente para mode="date".
export default function SelectorFechaModal({ visible, fechaInicial, onConfirmar, onCancelar }) {
  const [fechaTemp, setFechaTemp] = useState(fechaInicial);

  // Cada apertura arranca desde la fecha vigente del campo (o "hoy" si
  // todavía no hay ninguna cargada), no desde la última selección de una
  // apertura anterior que el usuario haya cancelado.
  useEffect(() => {
    if (visible) setFechaTemp(fechaInicial);
  }, [visible, fechaInicial]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancelar}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Elegir fecha</Text>
          <DateTimePicker
            value={fechaTemp}
            mode="date"
            display="spinner"
            themeVariant="dark"
            onChange={(event, fecha) => fecha && setFechaTemp(fecha)}
          />
          <View style={styles.botones}>
            <View style={styles.boton}>
              <Button title="Cancelar" variant="secondary" onPress={onCancelar} />
            </View>
            <View style={styles.boton}>
              <Button title="Listo" onPress={() => onConfirmar(fechaTemp)} />
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
    marginBottom: 8,
  },
  botones: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  boton: {
    flex: 1,
  },
});
