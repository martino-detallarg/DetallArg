import { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import WizardHeader from "../components/wizard/WizardHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import EstadoCarga from "../components/EstadoCarga";
import { useTaller } from "../data/TallerContext";
import { colors, fonts } from "../theme";

// Ajustes de Finanzas: umbral del semáforo de Ganancia Neta (Fase 3) y % de
// comisión de tarjeta que se fotografía en cada cobro nuevo (Fase 4) del
// prompt "nuevo home de Finanzas" — accedida desde Mi Taller, mismo patrón
// de formulario que MisDatosScreen.js.
export default function ConfiguracionFinanzasScreen({ navigation }) {
  const {
    umbralGananciaVerdePorcentaje,
    comisionTarjetaPorcentaje,
    actualizarConfiguracionFinanzas,
    cargandoTaller,
    errorCargaTaller,
    recargarTaller,
  } = useTaller();
  const [umbral, setUmbral] = useState(String(umbralGananciaVerdePorcentaje));
  const [comision, setComision] = useState(String(comisionTarjetaPorcentaje));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Mismo criterio que MisDatosScreen.js: los valores llegan con su default
  // hasta que termina el fetch inicial de TallerContext — hay que
  // resincronizar los campos recién ahí.
  useEffect(() => {
    if (!cargandoTaller) {
      setUmbral(String(umbralGananciaVerdePorcentaje));
      setComision(String(comisionTarjetaPorcentaje));
    }
  }, [cargandoTaller]);

  const umbralNumerico = Number(umbral.replace(",", "."));
  const umbralValido = umbral.trim() !== "" && !Number.isNaN(umbralNumerico) && umbralNumerico >= 0;

  const comisionNumerico = Number(comision.replace(",", "."));
  const comisionValida =
    comision.trim() !== "" && !Number.isNaN(comisionNumerico) && comisionNumerico >= 0 && comisionNumerico <= 100;

  const esValido = umbralValido && comisionValida;

  async function handleGuardar() {
    if (!esValido) return;
    setCargando(true);
    setError(null);
    try {
      await actualizarConfiguracionFinanzas({
        umbralGananciaVerdePorcentaje: umbralNumerico,
        comisionTarjetaPorcentaje: comisionNumerico,
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
      <KeyboardAvoidingView style={styles.flexContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <WizardHeader
          titulo="Configuración de Finanzas"
          paso={1}
          totalPasos={1}
          onAtras={() => navigation.navigate("MiTaller")}
        />

        <EstadoCarga cargando={cargandoTaller} error={errorCargaTaller} onReintentar={recargarTaller}>
          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Text style={styles.seccionLabel}>Semáforo de Ganancia Neta</Text>
            <Text style={styles.ayuda}>
              En Finanzas, el monto de "Ganancia neta del mes" se pinta verde cuando facturaste este porcentaje o
              más por encima de tu punto de equilibrio. Por debajo del equilibrio se pinta rojo; entre medio, ámbar.
            </Text>
            <Input
              label="% extra sobre el punto de equilibrio"
              value={umbral}
              onChangeText={setUmbral}
              placeholder="Ej: 30"
              keyboardType="numeric"
              sufijo="%"
              returnKeyType="next"
            />

            <Text style={styles.seccionLabel}>Comisión de tarjeta</Text>
            <Text style={styles.ayuda}>
              Cuando registrás un cobro con forma de pago "Tarjeta", este porcentaje se descuenta de tu Ganancia
              Neta. Efectivo, transferencia y otros medios no tienen comisión. Si después cambiás este valor, los
              cobros ya registrados siguen mostrando la comisión con la que se cobraron.
            </Text>
            <Input
              label="% de comisión en Tarjeta"
              value={comision}
              onChangeText={setComision}
              placeholder="Ej: 6"
              keyboardType="numeric"
              sufijo="%"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button title="Guardar cambios" onPress={handleGuardar} disabled={!esValido} loading={cargando} />
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
  seccionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginBottom: 16,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
});
