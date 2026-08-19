import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { colors, fonts } from "../../theme";

export default function DatosClienteStep({ datos, paso = 1, totalPasos = 2, onCambiar, onAtras, onContinuar }) {
  const [errores, setErrores] = useState({});

  function validar() {
    const nuevosErrores = {};
    if (!datos.nombre.trim()) nuevosErrores.nombre = "Ingresá el nombre del cliente";
    if (!datos.telefono.trim()) nuevosErrores.telefono = "Ingresá un teléfono de contacto";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleContinuar() {
    if (validar()) onContinuar();
  }

  const esValido = datos.nombre.trim() !== "" && datos.telefono.trim() !== "";

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Datos del Cliente" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Input
          label="Nombre y apellido"
          value={datos.nombre}
          onChangeText={(v) => onCambiar({ nombre: v })}
          placeholder="Juan Pérez"
          error={errores.nombre}
        />
        <Input
          label="Teléfono / Celular"
          value={datos.telefono}
          onChangeText={(v) => onCambiar({ telefono: v })}
          placeholder="11 2345-6789"
          keyboardType="phone-pad"
          error={errores.telefono}
        />
        <Input
          label="Dirección (opcional)"
          value={datos.direccion}
          onChangeText={(v) => onCambiar({ direccion: v })}
          placeholder="Calle 123, Ciudad"
        />
        <Text style={styles.nota}>Para entrega a domicilio</Text>

        <View style={styles.boton}>
          <Button title="Continuar a Vehículo" onPress={handleContinuar} disabled={!esValido} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nota: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -10,
    marginBottom: 16,
  },
  boton: {
    marginTop: 12,
  },
});
