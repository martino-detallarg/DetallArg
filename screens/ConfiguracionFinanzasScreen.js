import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../components/wizard/WizardHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import EstadoCarga from "../components/EstadoCarga";
import PlanCuotasModal from "../components/PlanCuotasModal";
import { useTaller } from "../data/TallerContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Ajustes de Finanzas: umbral del semáforo de Ganancia Neta (Fase 3 del
// prompt "nuevo home de Finanzas") y planes de comisión de tarjeta por
// cantidad de cuotas (Fase 4 del prompt "Comisión de tarjeta por cantidad
// de cuotas" — reemplaza el viejo % único) — accedida desde Mi Taller.
export default function ConfiguracionFinanzasScreen({ navigation }) {
  const {
    umbralGananciaVerdePorcentaje,
    actualizarConfiguracionFinanzas,
    planesCuotasTarjeta,
    cargandoPlanesCuotas,
    errorCargaPlanesCuotas,
    recargarPlanesCuotas,
    eliminarPlanCuotas,
    cargandoTaller,
    errorCargaTaller,
    recargarTaller,
  } = useTaller();
  const [umbral, setUmbral] = useState(String(umbralGananciaVerdePorcentaje));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [modalPlanVisible, setModalPlanVisible] = useState(false);
  const [planEditando, setPlanEditando] = useState(null);

  // Mismo criterio que MisDatosScreen.js: el valor llega con su default
  // hasta que termina el fetch inicial de TallerContext — hay que
  // resincronizar el campo recién ahí.
  useEffect(() => {
    if (!cargandoTaller) setUmbral(String(umbralGananciaVerdePorcentaje));
  }, [cargandoTaller]);

  const umbralNumerico = Number(umbral.replace(",", "."));
  const esValido = umbral.trim() !== "" && !Number.isNaN(umbralNumerico) && umbralNumerico >= 0;

  async function handleGuardar() {
    if (!esValido) return;
    setCargando(true);
    setError(null);
    try {
      await actualizarConfiguracionFinanzas({ umbralGananciaVerdePorcentaje: umbralNumerico });
      navigation.navigate("MiTaller");
    } catch (err) {
      setError("No se pudieron guardar los cambios. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function abrirAgregarPlan() {
    setPlanEditando(null);
    setModalPlanVisible(true);
  }

  function abrirEditarPlan(plan) {
    setPlanEditando(plan);
    setModalPlanVisible(true);
  }

  async function handleEliminarPlan(id) {
    try {
      await eliminarPlanCuotas(id);
    } catch (err) {
      Alert.alert("No se pudo eliminar", "No se pudo eliminar el plan. Probá de nuevo.");
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

        <EstadoCarga
        cargando={cargandoTaller || cargandoPlanesCuotas}
        error={errorCargaTaller || errorCargaPlanesCuotas}
        onReintentar={() => {
          recargarTaller();
          recargarPlanesCuotas();
        }}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text style={styles.seccionLabel}>Semáforo de Ganancia Neta</Text>
          <Text style={styles.ayuda}>
            En Finanzas, el monto de "Ganancia neta del mes" se pinta verde cuando facturaste este porcentaje o más
            por encima de tu punto de equilibrio. Por debajo del equilibrio se pinta rojo; entre medio, ámbar.
          </Text>
          <Input
            label="% extra sobre el punto de equilibrio"
            value={umbral}
            onChangeText={setUmbral}
            placeholder="Ej: 30"
            keyboardType="numeric"
            sufijo="%"
            returnKeyType="done"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button title="Guardar cambios" onPress={handleGuardar} disabled={!esValido} loading={cargando} />

          <Text style={[styles.seccionLabel, styles.seccionConMargen]}>Comisión de tarjeta por cuotas</Text>
          <Text style={styles.ayuda}>
            Cargá acá cada plan de cuotas que ofrecés, con la comisión real que te cobra el medio de pago en cada
            uno. Se aplica solo a cobros con forma de pago Tarjeta.
          </Text>

          {planesCuotasTarjeta.length > 0 && (
            <View style={styles.planesLista}>
              {planesCuotasTarjeta.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.planFila}
                  onPress={() => abrirEditarPlan(plan)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.planTexto}>
                    {plan.cuotas === 1 ? "1 pago" : `${plan.cuotas} cuotas`} · {plan.comisionPorcentaje}%
                  </Text>
                  <TouchableOpacity
                    style={styles.planQuitarBoton}
                    onPress={() => handleEliminarPlan(plan.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.agregarPlanBoton} onPress={abrirAgregarPlan} activeOpacity={0.85}>
            <Ionicons name="add" size={16} color={colors.accentLight} />
            <Text style={styles.agregarPlanTexto}>Agregar plan</Text>
          </TouchableOpacity>
        </ScrollView>
        </EstadoCarga>
      </KeyboardAvoidingView>

      <PlanCuotasModal visible={modalPlanVisible} item={planEditando} onClose={() => setModalPlanVisible(false)} />
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
  seccionConMargen: {
    marginTop: 28,
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
  planesLista: {
    gap: 8,
    marginBottom: 12,
  },
  planFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  planTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  planQuitarBoton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  agregarPlanBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  agregarPlanTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accentLight,
  },
});
