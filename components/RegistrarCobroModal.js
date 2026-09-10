import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import WizardHeader from "./wizard/WizardHeader";
import SelectorFechaModal from "./wizard/SelectorFechaModal";
import Input from "./Input";
import Button from "./Button";
import ChipGroup from "./ChipGroup";
import { useFinanzas } from "../data/FinanzasContext";
import { useTaller } from "../data/TallerContext";
import { ORDEN_FORMAS_PAGO, FORMAS_PAGO } from "../data/mockFinanzas";
import { formatearFechaDDMMAAAA, parsearFechaDDMMAAAA } from "../utils/fecha";
import { formatearPesos } from "../utils/formato";
import { useScrollAlHabilitar } from "../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Registra el cobro de un turno ya Finalizado/Entregado (ver
// TrabajoDetalleModal.js), o una SEÑA de un turno todavía Pendiente/En
// proceso (`esSena` — ver TrabajoDetalleModal.js y
// SeleccionarTrabajoSenaModal.js, mismo mecanismo de cobro parcial, solo
// que tomado antes). Ahora admite pagos parciales (Cuentas por Cobrar):
// `saldoPendiente`/`montoYaCobrado` son opcionales (undefined cuando se abre
// desde un lugar que todavía no los calcula) — cuando vienen, prefillean el
// monto con lo que falta en vez del precio completo del turno y avisan
// cuánto ya se cobró, sin bloquear un pago distinto a mano.
export default function RegistrarCobroModal({ visible, turno, esSena = false, saldoPendiente, montoYaCobrado, onClose }) {
  const { registrarCobro } = useFinanzas();
  const { comisionTarjetaPorcentaje } = useTaller();
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [formaPago, setFormaPago] = useState(null);
  const [facturado, setFacturado] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMonto(saldoPendiente != null ? String(saldoPendiente) : turno?.precio != null ? String(turno.precio) : "");
      setFecha(formatearFechaDDMMAAAA(new Date()));
      setFormaPago(null);
      setFacturado(false);
      setError(null);
    }
  }, [visible, turno]);

  const montoNumerico = Number(monto.replace(",", "."));
  const esValido = monto.trim() !== "" && !Number.isNaN(montoNumerico) && montoNumerico > 0 && fecha.trim() !== "";
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, esValido);

  // Comisión a fotografiar en este cobro (ver alter_cobros_comision_porcentaje.sql):
  // solo cuando la forma de pago es "tarjeta" y hay un % > 0 configurado en
  // ese momento — Efectivo/Transferencia/Otro nunca tienen comisión.
  const aplicaComision = formaPago === "tarjeta" && comisionTarjetaPorcentaje > 0;
  const montoComisionEstimado =
    aplicaComision && !Number.isNaN(montoNumerico) ? (montoNumerico * comisionTarjetaPorcentaje) / 100 : 0;

  function obtenerFechaInicialPicker() {
    return parsearFechaDDMMAAAA(fecha) || new Date();
  }

  async function handleGuardar() {
    if (!esValido || !turno) return;
    setCargando(true);
    setError(null);
    try {
      await registrarCobro({
        turnoId: turno.id,
        monto: montoNumerico,
        fecha,
        formaPago,
        facturado,
        esSena,
        comisionPorcentaje: aplicaComision ? comisionTarjetaPorcentaje : null,
      });
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
            <WizardHeader titulo={esSena ? "Registrar Seña" : "Registrar Cobro"} paso={1} totalPasos={1} onAtras={onClose} />

            <ScrollView ref={scrollRef} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
              {montoYaCobrado > 0 && (
                <Text style={styles.avisoParcial}>
                  Ya cobraste {formatearPesos(montoYaCobrado)} de este trabajo. Este pago se suma como un abono más.
                </Text>
              )}

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
              <ChipGroup
                style={styles.chips}
                options={ORDEN_FORMAS_PAGO.map((clave) => ({
                  value: clave,
                  label: FORMAS_PAGO[clave].etiqueta,
                  selected: formaPago === clave,
                }))}
                onPress={setFormaPago}
              />

              <Text style={styles.label}>¿Facturado?</Text>
              <ChipGroup
                style={styles.chips}
                options={[
                  { value: true, label: "Sí", selected: facturado === true },
                  { value: false, label: "No", selected: facturado === false },
                ]}
                onPress={setFacturado}
              />

              {aplicaComision && (
                <Text style={styles.avisoComision}>
                  Se va a descontar ~{comisionTarjetaPorcentaje}% de comisión de tarjeta (
                  {formatearPesos(montoComisionEstimado)}) al calcular tu ganancia neta.
                </Text>
              )}

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
  avisoParcial: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.accentLight,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
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
    marginBottom: 16,
  },
  avisoComision: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.amber,
    backgroundColor: colors.amberTint,
    borderRadius: radii.button,
    ...continuousCorner,
    padding: 10,
    marginBottom: 12,
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
