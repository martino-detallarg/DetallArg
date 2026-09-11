import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useTaller } from "../data/TallerContext";
import { useScrollAlHabilitar } from "../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Alta/edición/borrado de un plan de comisión de tarjeta por cuotas (ver
// ConfiguracionFinanzasScreen.js) — calcado de CostoFijoModal.js, mismo
// patrón exacto (editando = item !== null, botón "Eliminar" solo en modo
// edición). `item` es { id, cuotas, comisionPorcentaje } o null (alta).
export default function PlanCuotasModal({ visible, item, onClose }) {
  const { agregarPlanCuotas, editarPlanCuotas, eliminarPlanCuotas } = useTaller();
  const [cuotas, setCuotas] = useState("");
  const [comision, setComision] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const editando = item !== null;
  const scrollRef = useRef(null);
  const comisionRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCuotas(item ? String(item.cuotas) : "");
      setComision(item ? String(item.comisionPorcentaje) : "");
      setError(null);
    }
  }, [visible, item]);

  const cuotasNumero = Number(cuotas.trim());
  const cuotasValidas = cuotas.trim() !== "" && Number.isInteger(cuotasNumero) && cuotasNumero > 0;

  const comisionNumero = Number(comision.replace(",", "."));
  const comisionValida =
    comision.trim() !== "" && !Number.isNaN(comisionNumero) && comisionNumero >= 0 && comisionNumero <= 100;

  const esValido = cuotasValidas && comisionValida;
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, esValido);

  async function handleGuardar() {
    if (!esValido) return;
    setCargando(true);
    setError(null);
    try {
      if (editando) {
        await editarPlanCuotas(item.id, { cuotas: cuotasNumero, comisionPorcentaje: comisionNumero });
      } else {
        await agregarPlanCuotas({ cuotas: cuotasNumero, comisionPorcentaje: comisionNumero });
      }
      onClose();
    } catch (err) {
      // Mismo mensaje genérico ante cualquier error de Supabase, incluido
      // un choque contra el `unique (taller_id, cuotas)` si ya existe un
      // plan con esa misma cantidad de cuotas — no hace falta distinguir
      // ese caso con un mensaje especial (ver el prompt original).
      setError("No se pudo guardar el plan. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function handleEliminar() {
    setCargando(true);
    setError(null);
    try {
      await eliminarPlanCuotas(item.id);
      onClose();
    } catch (err) {
      setError("No se pudo eliminar el plan. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <WizardHeader
            titulo={editando ? "Editar Plan de Cuotas" : "Agregar Plan de Cuotas"}
            paso={1}
            totalPasos={1}
            onAtras={onClose}
          />

          <ScrollView ref={scrollRef} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Input
              label="Cantidad de cuotas"
              value={cuotas}
              onChangeText={setCuotas}
              placeholder="Ej: 3 (1 = pago en un solo pago)"
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => comisionRef.current?.focus()}
            />

            <Input
              ref={comisionRef}
              label="% de comisión"
              value={comision}
              onChangeText={setComision}
              placeholder="Ej: 8"
              keyboardType="numeric"
              sufijo="%"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.boton} onLayout={onLayoutBoton}>
              <Button title="Guardar" onPress={handleGuardar} disabled={!esValido} loading={cargando} />
            </View>

            {editando && (
              <TouchableOpacity
                style={styles.eliminarBoton}
                onPress={handleEliminar}
                disabled={cargando}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={styles.eliminarBotonTexto}>Eliminar plan</Text>
              </TouchableOpacity>
            )}

            <View style={styles.botonCancelar}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} disabled={cargando} />
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flexUno: {
    flex: 1,
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
    marginBottom: 4,
  },
  boton: {
    marginTop: 12,
  },
  eliminarBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: 10,
  },
  eliminarBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.error,
  },
  botonCancelar: {
    marginTop: 10,
  },
});
