import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "./Button";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Análogo a components/wizard/SelectorFechaModal.js pero en mode="time":
// solo se usa en iOS (en Android el time picker nativo es un diálogo
// imperativo que se autocierra solo).
export default function SelectorHoraModal({ visible, horaInicial, onConfirmar, onCancelar }) {
  const [horaTemp, setHoraTemp] = useState(horaInicial);

  useEffect(() => {
    if (visible) setHoraTemp(horaInicial);
  }, [visible, horaInicial]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancelar}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Elegir hora</Text>
          <DateTimePicker
            value={horaTemp}
            mode="time"
            display="spinner"
            themeVariant="dark"
            is24Hour
            onChange={(event, hora) => hora && setHoraTemp(hora)}
          />
          <View style={styles.botones}>
            <View style={styles.boton}>
              <Button title="Cancelar" variant="secondary" onPress={onCancelar} />
            </View>
            <View style={styles.boton}>
              <Button title="Listo" onPress={() => onConfirmar(horaTemp)} />
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
