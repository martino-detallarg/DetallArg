import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { colors, fonts } from "../../theme";

function formatearPatente(texto) {
  const limpio = texto.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  const letras1 = limpio.slice(0, 2);
  const numeros = limpio.slice(2, 5);
  const letras2 = limpio.slice(5, 7);
  return [letras1, numeros, letras2].filter(Boolean).join(" ");
}

export default function DatosVehiculoStep({
  datos,
  paso = 2,
  totalPasos = 2,
  onCambiar,
  onAtras,
  onContinuar,
  cargando = false,
  error = null,
}) {
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

      <SwipeVolver onAtras={onAtras}>
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
            label="Año (opcional)"
            value={datos.anio}
            onChangeText={(v) => onCambiar({ anio: v })}
            placeholder="2020"
            keyboardType="numeric"
          />
          <Input
            label="Color"
            value={datos.color}
            onChangeText={(v) => onCambiar({ color: v })}
            placeholder="Gris"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.boton}>
            <Button title="Continuar" onPress={handleContinuar} disabled={!esValido} loading={cargando} />
          </View>
        </ScrollView>
      </SwipeVolver>
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
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginTop: 8,
  },
  boton: {
    marginTop: 12,
  },
});
