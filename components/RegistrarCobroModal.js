import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import WizardHeader from "./wizard/WizardHeader";
import SelectorFechaModal from "./wizard/SelectorFechaModal";
import Input from "./Input";
import Button from "./Button";
import { useFinanzas } from "../data/FinanzasContext";
import { ORDEN_FORMAS_PAGO, FORMAS_PAGO } from "../data/mockFinanzas";
import { formatearFechaDDMMAAAA, parsearFechaDDMMAAAA } from "../utils/fecha";
import { useScrollAlHabilitar } from "../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Registra el cobro de un turno ya Finalizado/Entregado (ver
// TrabajoDetalleModal.js). Un turno = un cobro en v1: este modal solo se
// abre cuando el turno todavía no tiene ninguno.
export default function RegistrarCobroModal({ visible, turno, onClose }) {
  const { registrarCobro } = useFinanzas();
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [formaPago, setFormaPago] = useState(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMonto(turno?.precio != null ? String(turno.precio) : "");
      setFecha(formatearFechaDDMMAAAA(new Date()));
      setFormaPago(null);
      setError(null);
    }
  }, [visible, turno]);

  const montoNumerico = Number(monto.replace(",", "."));
  const esValido = monto.trim() !== "" && !Number.isNaN(montoNumerico) && montoNumerico > 0 && fecha.trim() !== "";
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, esValido);

  function obtenerFechaInicialPicker() {
    return parsearFechaDDMMAAAA(fecha) || new Date();
  }

  async function handleGuardar() {
    if (!esValido || !turno) return;
    setCargando(true);
    setError(null);
    try {
      await registrarCobro({ turnoId: turno.id, monto: montoNumerico, fecha, formaPago });
      onClose();
    } catch (err) {
      setError("No se pudo registrar el cobro. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <WizardHeader titulo="Registrar Cobro" paso={1} totalPasos={1} onAtras={onClose} />

            <ScrollView ref={scrollRef} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
              <Input
                label="Monto cobrado"
                value={monto}
                onChangeText={setMonto}
                placeholder="Ej: 15000"
                keyboardType="numeric"
              />

              <View style={styles.fechaContenedor}>
                <Text style={styles.label}>Fecha</Text>
                <TouchableOpacity style={styles.fechaWrapper} onPress={() => setMostrarPicker(true)} activeOpacity={0.8}>
                  <Text style={fecha ? styles.fechaTexto : styles.fechaPlaceholder}>{fecha || "Elegí una fecha"}</Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {Platform.OS === "android" && mostrarPicker && (
                <DateTimePicker
                  value={obtenerFechaInicialPicker()}
                  mode="date"
                  display="default"
                  onChange={(event, fechaElegida) => {
                    setMostrarPicker(false);
                    if (event.type === "set" && fechaElegida) {
                      setFecha(formatearFechaDDMMAAAA(fechaElegida));
                    }
                  }}
                />
              )}

              {Platform.OS === "ios" && (
                <SelectorFechaModal
                  visible={mostrarPicker}
                  fechaInicial={obtenerFechaInicialPicker()}
                  onConfirmar={(fechaElegida) => {
                    setFecha(formatearFechaDDMMAAAA(fechaElegida));
                    setMostrarPicker(false);
                  }}
                  onCancelar={() => setMostrarPicker(false)}
                />
              )}

              <Text style={styles.label}>Forma de pago</Text>
              <View style={styles.chips}>
                {ORDEN_FORMAS_PAGO.map((clave) => {
                  const activo = formaPago === clave;
                  return (
                    <TouchableOpacity
                      key={clave}
                      style={[styles.chip, activo && styles.chipSeleccionado]}
                      onPress={() => setFormaPago(clave)}
                    >
                      <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                        {FORMAS_PAGO[clave].etiqueta}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.boton} onLayout={onLayoutBoton}>
                <Button title="Guardar" onPress={handleGuardar} disabled={!esValido} loading={cargando} />
              </View>
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
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fechaContenedor: {
    marginBottom: 16,
  },
  fechaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 50,
  },
  fechaTexto: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  fechaPlaceholder: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
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
  botonCancelar: {
    marginTop: 10,
  },
});
