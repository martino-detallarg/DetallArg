import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { colors } from "../../theme";

function formatearPatente(texto) {
  const limpio = texto.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  const letras1 = limpio.slice(0, 2);
  const numeros = limpio.slice(2, 5);
  const letras2 = limpio.slice(5, 7);
  return [letras1, numeros, letras2].filter(Boolean).join(" ");
}

export default function DatosVehiculoStep({ datos, paso = 2, totalPasos = 2, onCambiar, onAtras, onContinuar }) {
  const [errores, setErrores] = useState({});

  function validar() {
    const nuevosErrores = {};
    if (!datos.patente.trim()) nuevosErrores.patente = "Ingresá la patente";
    if (!datos.marcaModelo.trim()) nuevosErrores.marcaModelo = "Ingresá marca y modelo";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleContinuar() {
    if (validar()) onContinuar();
  }

  const esValido = datos.patente.trim() !== "" && datos.marcaModelo.trim() !== "";

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Datos del Vehículo" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Input
          label="Patente"
          value={datos.patente}
          onChangeText={(v) => onCambiar({ patente: formatearPatente(v) })}
          placeholder="AB 123 CD"
          autoCapitalize="characters"
          error={errores.patente}
        />
        <Input
          label="Marca y modelo"
          value={datos.marcaModelo}
          onChangeText={(v) => onCambiar({ marcaModelo: v })}
          placeholder="Volkswagen Golf"
          error={errores.marcaModelo}
        />
        <Input
          label="Color"
          value={datos.color}
          onChangeText={(v) => onCambiar({ color: v })}
          placeholder="Gris"
        />
        <Input
          label="Kilómetros"
          value={datos.kilometros}
          onChangeText={(v) => onCambiar({ kilometros: v })}
          placeholder="45000"
          keyboardType="numeric"
        />
        <Input
          label="Observaciones (opcional)"
          value={datos.observaciones}
          onChangeText={(v) => onCambiar({ observaciones: v })}
          placeholder="Detalles a tener en cuenta..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.boton}>
          <Button title="Continuar" onPress={handleContinuar} disabled={!esValido} />
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
  boton: {
    marginTop: 12,
  },
});
