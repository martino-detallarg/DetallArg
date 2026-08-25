import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { esPatenteValida, normalizarPatente } from "../../utils/patente";
import { colors, fonts } from "../../theme";

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
  const sinPatente = !!datos.sinPatente;

  function validar() {
    const nuevosErrores = {};
    if (!sinPatente && !esPatenteValida(datos.patente)) {
      nuevosErrores.patente = "Patente inválida. Usá el formato viejo (ABC123) o Mercosur (AB123CD)";
    }
    if (!datos.marcaModelo.trim()) nuevosErrores.marcaModelo = "Ingresá marca y modelo";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleContinuar() {
    if (validar()) onContinuar();
  }

  const esValido =
    (sinPatente || esPatenteValida(datos.patente)) && datos.marcaModelo.trim() !== "";

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Datos del Vehículo" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          {!sinPatente && (
            <Input
              label="Patente"
              value={datos.patente}
              onChangeText={(v) => onCambiar({ patente: normalizarPatente(v) })}
              placeholder="ABC123 o AB123CD"
              autoCapitalize="characters"
              error={errores.patente}
            />
          )}
          <View style={styles.switchFila}>
            <Text style={styles.switchTexto}>Todavía no tiene patente</Text>
            <Switch
              value={sinPatente}
              onValueChange={(valor) =>
                onCambiar({ sinPatente: valor, patente: valor ? "" : datos.patente })
              }
              trackColor={{ false: colors.surface2, true: colors.accentDark }}
            />
          </View>
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
  switchFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  boton: {
    marginTop: 12,
  },
});
