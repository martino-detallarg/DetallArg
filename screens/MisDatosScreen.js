import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import WizardHeader from "../components/wizard/WizardHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import ChipGroup from "../components/ChipGroup";
import EstadoCarga from "../components/EstadoCarga";
import { useTaller } from "../data/TallerContext";
import { SITUACIONES_FISCALES } from "../data/mockTaller";
import { colors, fonts } from "../theme";

export default function MisDatosScreen({ navigation }) {
  const { misDatos, actualizarMisDatos, cargandoTaller, errorCargaTaller, recargarTaller } = useTaller();
  const [datos, setDatos] = useState(misDatos);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const webRef = useRef(null);
  const correoRef = useRef(null);
  const telefonoRef = useRef(null);
  const ubicacionRef = useRef(null);

  // `misDatos` llega vacío al montar y se llena recién cuando termina el
  // fetch inicial de TallerContext (asíncrono) — sin este efecto, si el
  // usuario entra a esta pantalla antes de que eso termine, `datos` queda
  // pegado al valor vacío del `useState(misDatos)` de arriba para siempre
  // (el initializer de useState solo corre una vez, al montar).
  useEffect(() => {
    if (!cargandoTaller) setDatos(misDatos);
  }, [cargandoTaller]);

  function cambiar(campo, valor) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
  }

  function elegirSituacionFiscal(opcion) {
    setDatos((actuales) => ({
      ...actuales,
      situacionFiscal: actuales.situacionFiscal === opcion ? null : opcion,
    }));
  }

  async function handleGuardar() {
    setCargando(true);
    setError(null);
    try {
      await actualizarMisDatos({
        nombrePersonal: datos.nombrePersonal.trim(),
        web: datos.web.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono.trim(),
        ubicacion: datos.ubicacion.trim(),
        situacionFiscal: datos.situacionFiscal,
      });
      navigation.navigate("MiTaller");
    } catch (err) {
      setError("No se pudieron guardar los cambios. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <WizardHeader titulo="Mis Datos" paso={1} totalPasos={1} onAtras={() => navigation.navigate("MiTaller")} />

        <EstadoCarga cargando={cargandoTaller} error={errorCargaTaller} onReintentar={recargarTaller}>
          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Input
              label="Nombre personal"
              value={datos.nombrePersonal}
              onChangeText={(v) => cambiar("nombrePersonal", v)}
              placeholder="Ej: Martino Fernández"
              returnKeyType="next"
              onSubmitEditing={() => webRef.current?.focus()}
            />
            <Input
              ref={webRef}
              label="Link de página web"
              value={datos.web}
              onChangeText={(v) => cambiar("web", v)}
              placeholder="Ej: www.mitaller.com"
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="next"
              onSubmitEditing={() => correoRef.current?.focus()}
            />
            <Input
              ref={correoRef}
              label="Correo"
              value={datos.correo}
              onChangeText={(v) => cambiar("correo", v)}
              placeholder="Ej: contacto@mitaller.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => telefonoRef.current?.focus()}
            />
            <Input
              ref={telefonoRef}
              label="Teléfono"
              value={datos.telefono}
              onChangeText={(v) => cambiar("telefono", v)}
              placeholder="Ej: 11 5555-5555"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => ubicacionRef.current?.focus()}
            />
            <Input
              ref={ubicacionRef}
              label="Ubicación"
              value={datos.ubicacion}
              onChangeText={(v) => cambiar("ubicacion", v)}
              placeholder="Ej: Palermo, CABA"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            <Text style={styles.label}>Situación fiscal (opcional)</Text>
            <ChipGroup
              options={SITUACIONES_FISCALES.map((opcion) => ({
                value: opcion,
                label: opcion,
                selected: datos.situacionFiscal === opcion,
              }))}
              onPress={elegirSituacionFiscal}
              style={styles.chips}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.boton}>
              <Button title="Guardar cambios" onPress={handleGuardar} loading={cargando} />
            </View>
          </ScrollView>
        </EstadoCarga>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flexContainer: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    marginBottom: 16,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 4,
  },
  boton: {
    marginTop: 12,
  },
});
