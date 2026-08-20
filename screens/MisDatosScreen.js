import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WizardHeader from "../components/wizard/WizardHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import { useTaller } from "../data/TallerContext";
import { SITUACIONES_FISCALES } from "../data/mockTaller";
import { colors, fonts } from "../theme";

export default function MisDatosScreen({ navigation }) {
  const { misDatos, actualizarMisDatos } = useTaller();
  const [datos, setDatos] = useState(misDatos);

  function cambiar(campo, valor) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
  }

  function elegirSituacionFiscal(opcion) {
    setDatos((actuales) => ({
      ...actuales,
      situacionFiscal: actuales.situacionFiscal === opcion ? null : opcion,
    }));
  }

  function handleGuardar() {
    actualizarMisDatos({
      nombrePersonal: datos.nombrePersonal.trim(),
      web: datos.web.trim(),
      correo: datos.correo.trim(),
      telefono: datos.telefono.trim(),
      ubicacion: datos.ubicacion.trim(),
      situacionFiscal: datos.situacionFiscal,
    });
    navigation.navigate("MiTaller");
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Mis Datos" paso={1} totalPasos={1} onAtras={() => navigation.navigate("MiTaller")} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Input
          label="Nombre personal"
          value={datos.nombrePersonal}
          onChangeText={(v) => cambiar("nombrePersonal", v)}
          placeholder="Ej: Martino Fernández"
        />
        <Input
          label="Link de página web"
          value={datos.web}
          onChangeText={(v) => cambiar("web", v)}
          placeholder="Ej: www.mitaller.com"
          autoCapitalize="none"
          keyboardType="url"
        />
        <Input
          label="Correo"
          value={datos.correo}
          onChangeText={(v) => cambiar("correo", v)}
          placeholder="Ej: contacto@mitaller.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Teléfono"
          value={datos.telefono}
          onChangeText={(v) => cambiar("telefono", v)}
          placeholder="Ej: 11 5555-5555"
          keyboardType="phone-pad"
        />
        <Input
          label="Ubicación"
          value={datos.ubicacion}
          onChangeText={(v) => cambiar("ubicacion", v)}
          placeholder="Ej: Palermo, CABA"
        />

        <Text style={styles.label}>Situación fiscal (opcional)</Text>
        <View style={styles.chips}>
          {SITUACIONES_FISCALES.map((opcion) => {
            const activo = datos.situacionFiscal === opcion;
            return (
              <TouchableOpacity
                key={opcion}
                style={[styles.chip, activo && styles.chipSeleccionado]}
                onPress={() => elegirSituacionFiscal(opcion)}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>{opcion}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.boton}>
          <Button title="Guardar cambios" onPress={handleGuardar} />
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
    marginBottom: 16,
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
  boton: {
    marginTop: 12,
  },
});
