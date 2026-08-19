import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const SERVICIOS = [
  "Lavado exterior",
  "Lavado completo",
  "Pulido",
  "Ceramic coating",
  "Detailing interior",
];

export default function DatosServicioStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const [errores, setErrores] = useState({});

  function validar() {
    const nuevosErrores = {};
    if (!datos.tipo) nuevosErrores.tipo = "Elegí un servicio";
    if (!datos.fecha.trim()) nuevosErrores.fecha = "Ingresá la fecha";
    if (!datos.hora.trim()) nuevosErrores.hora = "Ingresá la hora";
    if (!datos.tiempoEstimado.trim()) nuevosErrores.tiempoEstimado = "Ingresá el tiempo estimado";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleContinuar() {
    if (validar()) onContinuar();
  }

  const esValido =
    !!datos.tipo &&
    datos.fecha.trim() !== "" &&
    datos.hora.trim() !== "" &&
    datos.tiempoEstimado.trim() !== "";

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Datos del Servicio" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Servicio</Text>
        <View style={styles.chips}>
          {SERVICIOS.map((s) => {
            const activo = datos.tipo === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, activo && styles.chipSeleccionado]}
                onPress={() => onCambiar({ tipo: s })}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errores.tipo && <Text style={styles.error}>{errores.tipo}</Text>}

        <Input
          label="Fecha"
          value={datos.fecha}
          onChangeText={(v) => onCambiar({ fecha: v })}
          placeholder="Ej: 18/08/2026"
          error={errores.fecha}
        />
        <Input
          label="Hora"
          value={datos.hora}
          onChangeText={(v) => onCambiar({ hora: v })}
          placeholder="Ej: 14:30"
          error={errores.hora}
        />
        <Input
          label="Tiempo estimado de trabajo"
          value={datos.tiempoEstimado}
          onChangeText={(v) => onCambiar({ tiempoEstimado: v })}
          placeholder="Ej: 2 horas"
          error={errores.tiempoEstimado}
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
          <Button title="Continuar a Inspección" onPress={handleContinuar} disabled={!esValido} />
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
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
  boton: {
    marginTop: 12,
  },
});
