import { useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import WizardHeader from "./wizard/WizardHeader";
import SelectorFechaModal from "./wizard/SelectorFechaModal";
import Input from "./Input";
import Button from "./Button";
import { useFinanzas } from "../data/FinanzasContext";
import { useAuth } from "../data/AuthContext";
import { supabase } from "../lib/supabase";
import { CATEGORIAS_GASTOS_VARIABLES, ORDEN_CATEGORIAS_GASTOS_VARIABLES } from "../data/mockFinanzas";
import { formatearFechaDDMMAAAA, parsearFechaDDMMAAAA } from "../utils/fecha";
import { useScrollAlHabilitar } from "../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Carga de un gasto variable (comisiones, imprevistos — nada de equipamiento
// ni insumos, eso se carga desde Mis Insumos/Costos Fijos). Solo alta: no
// hay edición de un gasto ya cargado en v1, se borra y se vuelve a cargar.
export default function GastoVariableModal({ visible, onClose }) {
  const { agregarGastoVariable } = useFinanzas();
  const { user } = useAuth();
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [facturado, setFacturado] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMonto("");
      setCategoria(null);
      setFecha(formatearFechaDDMMAAAA(new Date()));
      setDescripcion("");
      setFacturado(false);
      setComprobante(null);
      setError(null);
    }
  }, [visible]);

  const montoNumerico = Number(monto.replace(",", "."));
  const esValido =
    monto.trim() !== "" && !Number.isNaN(montoNumerico) && montoNumerico > 0 && categoria !== null && fecha.trim() !== "";
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, esValido);

  function obtenerFechaInicialPicker() {
    return parsearFechaDDMMAAAA(fecha) || new Date();
  }

  async function handleElegirComprobante() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (resultado.canceled) return;
    setComprobante(resultado.assets[0].uri);
  }

  async function handleGuardar() {
    if (!esValido) return;
    setCargando(true);
    setError(null);
    try {
      // La foto recién se sube acá (no al elegirla): si el usuario cierra el
      // modal sin guardar, no queda ningún archivo huérfano en el bucket.
      let comprobantePath = null;
      if (comprobante) {
        const ruta = `${user.id}/${Date.now()}.jpg`;
        const respuesta = await fetch(comprobante);
        const arrayBuffer = await respuesta.arrayBuffer();
        const { error: errorSubida } = await supabase.storage
          .from("comprobantes-gastos")
          .upload(ruta, arrayBuffer, { contentType: "image/jpeg" });
        if (errorSubida) throw errorSubida;
        comprobantePath = ruta;
      }

      await agregarGastoVariable({
        monto: montoNumerico,
        categoria,
        fecha,
        descripcion: descripcion.trim(),
        facturado,
        comprobantePath,
      });
      onClose();
    } catch (err) {
      setError("No se pudo cargar el gasto. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <WizardHeader titulo="Cargar Gasto" paso={1} totalPasos={1} onAtras={onClose} />

            <ScrollView ref={scrollRef} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
              <Input
                label="Monto"
                value={monto}
                onChangeText={setMonto}
                placeholder="Ej: 20000"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Categoría</Text>
              <View style={styles.chips}>
                {ORDEN_CATEGORIAS_GASTOS_VARIABLES.map((clave) => {
                  const activo = categoria === clave;
                  return (
                    <TouchableOpacity
                      key={clave}
                      style={[styles.chip, activo && styles.chipSeleccionado]}
                      onPress={() => setCategoria(clave)}
                    >
                      <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                        {CATEGORIAS_GASTOS_VARIABLES[clave].etiqueta}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

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

              <Input
                label="Descripción (opcional)"
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Ej: Comisión de Martín por el mes"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>¿Facturado?</Text>
              <View style={styles.chips}>
                {[
                  { valor: true, etiqueta: "Sí" },
                  { valor: false, etiqueta: "No" },
                ].map(({ valor, etiqueta }) => {
                  const activo = facturado === valor;
                  return (
                    <TouchableOpacity
                      key={etiqueta}
                      style={[styles.chip, activo && styles.chipSeleccionado]}
                      onPress={() => setFacturado(valor)}
                    >
                      <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>{etiqueta}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Comprobante (opcional)</Text>
              {comprobante ? (
                <View style={styles.comprobanteFila}>
                  <Image source={{ uri: comprobante }} style={styles.comprobanteMiniatura} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.comprobanteQuitar}
                    onPress={() => setComprobante(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.comprobanteBoton} onPress={handleElegirComprobante} activeOpacity={0.85}>
                  <Ionicons name="camera-outline" size={16} color={colors.textPrimary} />
                  <Text style={styles.comprobanteBotonTexto}>Agregar foto de comprobante (opcional)</Text>
                </TouchableOpacity>
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
  comprobanteBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    marginBottom: 16,
  },
  comprobanteBotonTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  comprobanteFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  comprobanteMiniatura: {
    width: 56,
    height: 56,
    borderRadius: radii.button,
    ...continuousCorner,
  },
  comprobanteQuitar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
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
