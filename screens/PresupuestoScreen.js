import { useState } from "react";
import { StatusBar } from "expo-status-bar";
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
import ScreenHeader from "../components/ScreenHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import ChipGroup from "../components/ChipGroup";
import EstadoCarga from "../components/EstadoCarga";
import { useServicios } from "../data/ServicioContext";
import { useData } from "../data/DataContext";
import { useTaller } from "../data/TallerContext";
import { costoInsumosServicio } from "../utils/calculosFinanzas";
import { construirHtmlPresupuesto, generarYCompartirPdf } from "../utils/presupuestoPdf";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../theme";

const OPCIONES_TIPO_DESCUENTO = [
  { value: "monto", label: "$" },
  { value: "porcentaje", label: "%" },
];

// Herramienta de cálculo puntual (sin historial, ver el pedido original):
// cotiza un precio a un cliente potencial ANTES de que exista un Cliente,
// Vehículo o Turno real cargado — el "cliente/vehículo" de acá es solo
// texto libre para el PDF, nunca toca ClienteContext/TurnoContext. El
// costeo real (insumos por receta, mismo criterio que Finanzas) se calcula
// en vivo contra los servicios elegidos, así el taller ve el margen ANTES
// de decidir el descuento, no después de ya haberlo ofrecido.
export default function PresupuestoScreen({ navigation }) {
  const { servicios, cargandoServicios, errorCargaServicios, recargarServicios } = useServicios();
  const { getInsumoById } = useData();
  const { nombreTaller, logoTaller, misDatos } = useTaller();

  const [seleccionados, setSeleccionados] = useState([]);
  const [descripcionCliente, setDescripcionCliente] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState("monto");
  const [valorDescuentoTexto, setValorDescuentoTexto] = useState("");
  const [valorRecargoTexto, setValorRecargoTexto] = useState("");
  const [generandoPdf, setGenerandoPdf] = useState(false);

  function toggleServicio(id) {
    setSeleccionados((actuales) => (actuales.includes(id) ? actuales.filter((s) => s !== id) : [...actuales, id]));
  }

  const serviciosElegidos = servicios.filter((s) => seleccionados.includes(s.id));
  const totalServicios = serviciosElegidos.reduce((suma, s) => suma + (s.precio ?? 0), 0);

  // Clamps: un descuento en % nunca pasa de 100 (dejaría precio negativo),
  // y uno en $ nunca pasa del subtotal — el precio final nunca es negativo.
  const valorDescuento = Number(String(valorDescuentoTexto).replace(",", ".")) || 0;
  const montoDescuento =
    valorDescuento <= 0
      ? 0
      : tipoDescuento === "porcentaje"
        ? totalServicios * (Math.min(valorDescuento, 100) / 100)
        : Math.min(valorDescuento, totalServicios);

  // Recargo: mismo criterio que el descuento en %, pero sumando en vez de
  // restando — sin tope superior (a diferencia del descuento, un recargo no
  // tiene un máximo natural que respetar).
  const valorRecargo = Math.max(0, Number(String(valorRecargoTexto).replace(",", ".")) || 0);
  const montoRecargo = valorRecargo > 0 ? totalServicios * (valorRecargo / 100) : 0;

  const precioFinal = Math.max(0, totalServicios + montoRecargo - montoDescuento);

  const costoInsumosTotal = serviciosElegidos.reduce((suma, s) => suma + costoInsumosServicio(s, getInsumoById), 0);
  const margenAbsoluto = precioFinal - costoInsumosTotal;
  const margenPorcentaje = precioFinal > 0 ? (margenAbsoluto / precioFinal) * 100 : null;

  async function handleExportar() {
    setGenerandoPdf(true);
    try {
      const descripcion = descripcionCliente.trim();
      const html = construirHtmlPresupuesto({
        taller: { nombreTaller, logoTaller, misDatos },
        descripcionCliente: descripcion,
        servicios: serviciosElegidos,
        totalServicios,
        recargo: montoRecargo > 0 ? { valor: valorRecargo, monto: montoRecargo } : null,
        descuento: montoDescuento > 0 ? { tipo: tipoDescuento, valor: valorDescuento, monto: montoDescuento } : null,
        precioFinal,
      });
      await generarYCompartirPdf(html, `Presupuesto${descripcion ? ` - ${descripcion}` : ""}.pdf`);
    } catch (err) {
      Alert.alert("No se pudo generar el PDF", "Probá de nuevo en unos segundos.");
    } finally {
      setGenerandoPdf(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <EstadoCarga cargando={cargandoServicios} error={errorCargaServicios} onReintentar={recargarServicios}>
        <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.titulo}>Calculadora de Presupuesto</Text>
            <Text style={styles.ayuda}>
              Cotizale un precio a un cliente potencial, sin cargar todavía un trabajo.
            </Text>

            <Text style={styles.seccionTitulo}>Servicios</Text>
            {servicios.length === 0 ? (
              <Text style={styles.vacio}>Todavía no cargaste servicios en Mis Servicios.</Text>
            ) : (
              <View style={styles.listaServicios}>
                {servicios.map((servicio) => {
                  const marcado = seleccionados.includes(servicio.id);
                  return (
                    <TouchableOpacity
                      key={servicio.id}
                      style={styles.filaServicio}
                      onPress={() => toggleServicio(servicio.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, marcado && styles.checkboxActivo]}>
                        {marcado && <Ionicons name="checkmark" size={14} color={colors.bg} />}
                      </View>
                      <Text style={styles.filaServicioNombre} numberOfLines={1}>
                        {servicio.nombre}
                      </Text>
                      <Text style={styles.filaServicioPrecio}>{formatearPesos(servicio.precio)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Input
              label="Cliente / vehículo (opcional)"
              value={descripcionCliente}
              onChangeText={setDescripcionCliente}
              placeholder="Ej: Juan Pérez - Toyota Corolla blanco"
            />

            <Text style={styles.seccionTitulo}>Descuento (opcional)</Text>
            <View style={styles.descuentoFila}>
              <ChipGroup
                options={OPCIONES_TIPO_DESCUENTO.map((o) => ({ ...o, selected: tipoDescuento === o.value }))}
                onPress={setTipoDescuento}
              />
              <View style={styles.descuentoInputWrap}>
                <Input
                  value={valorDescuentoTexto}
                  onChangeText={setValorDescuentoTexto}
                  placeholder={tipoDescuento === "porcentaje" ? "0%" : "$ 0"}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.seccionTitulo}>Recargo (opcional)</Text>
            <Text style={styles.recargoAyuda}>Por mayor tamaño, suciedad o complejidad del trabajo</Text>
            <Input
              value={valorRecargoTexto}
              onChangeText={setValorRecargoTexto}
              placeholder="0%"
              keyboardType="numeric"
            />

            <View style={styles.resultadoTarjeta}>
              <Text style={styles.resultadoTitulo}>Uso interno del taller</Text>

              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Subtotal</Text>
                <Text style={styles.resultadoValor}>{formatearPesos(totalServicios)}</Text>
              </View>

              {montoRecargo > 0 && (
                <View style={styles.resultadoFila}>
                  <Text style={styles.resultadoLabel}>Recargo</Text>
                  <Text style={styles.resultadoValorRecargo}>+{formatearPesos(montoRecargo)}</Text>
                </View>
              )}

              {montoDescuento > 0 && (
                <View style={styles.resultadoFila}>
                  <Text style={styles.resultadoLabel}>Descuento</Text>
                  <Text style={styles.resultadoValorDescuento}>-{formatearPesos(montoDescuento)}</Text>
                </View>
              )}

              <View style={styles.separador} />

              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabelDestacado}>Precio a cobrar</Text>
                <Text style={styles.resultadoValorGrande}>{formatearPesos(precioFinal)}</Text>
              </View>

              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Costo de insumos</Text>
                <Text style={styles.resultadoValor}>{formatearPesos(costoInsumosTotal)}</Text>
              </View>

              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Margen</Text>
                <Text style={[styles.resultadoValor, margenAbsoluto < 0 && styles.resultadoValorNegativo]}>
                  {formatearPesos(margenAbsoluto)}
                  {margenPorcentaje !== null ? ` (${Math.round(margenPorcentaje)}%)` : ""}
                </Text>
              </View>
            </View>

            <View style={styles.boton}>
              <Button
                title="Exportar presupuesto"
                onPress={handleExportar}
                loading={generandoPdf}
                disabled={generandoPdf || serviciosElegidos.length === 0}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </EstadoCarga>
    </SafeAreaView>
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
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 4,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 18,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: 16,
  },
  listaServicios: {
    marginBottom: 16,
  },
  filaServicio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filaServicioNombre: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filaServicioPrecio: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  descuentoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  descuentoInputWrap: {
    flex: 1,
  },
  recargoAyuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -6,
    marginBottom: 8,
  },
  resultadoTarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    marginTop: 12,
  },
  resultadoTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  resultadoFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  resultadoLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  resultadoLabelDestacado: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  resultadoValor: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  resultadoValorDescuento: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
  },
  resultadoValorRecargo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.amber,
  },
  resultadoValorNegativo: {
    color: colors.error,
  },
  resultadoValorGrande: {
    fontFamily: fonts.headingBlack,
    fontSize: 22,
    color: colors.textPrimary,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 8,
  },
  boton: {
    marginTop: 20,
  },
});
