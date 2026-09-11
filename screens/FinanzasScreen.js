import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import GastoVariableModal from "../components/GastoVariableModal";
import TourAnchor from "../components/tour/TourAnchor";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import { useTaller } from "../data/TallerContext";
import { formatearPesos } from "../utils/formato";
import {
  parsearFechaDDMMAAAA,
  formatearMesAnio,
  diasRestantesDelMes,
  diasTranscurridosDelMes,
  diasTotalesDelMes,
} from "../utils/fecha";
import {
  calcularMargenPromedio,
  calcularPuntoEquilibrio,
  calcularFaltanteParaEquilibrio,
  calcularColorSemaforoGananciaNeta,
  calcularColorSemaforoMonotributo,
  calcularFacturacionUltimos12Meses,
  calcularTotalComisionesTarjeta,
  calcularTotalDescontado,
  calcularProyeccionCierreMes,
  calcularDesgloseFacturado,
  calcularCuentasPorCobrar,
  claveMes,
  claveMesDeFecha,
  margenBrutoTrabajo,
  nombreTrabajoCobro,
  rankingServiciosPorGanancia,
} from "../utils/calculosFinanzas";
import { TOPES_MONOTRIBUTO } from "../data/monotributoCategorias";
import { construirHtmlResumenFinanciero, generarYCompartirPdf } from "../utils/finanzasPdf";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;
const CANTIDAD_MESES_TENDENCIA = 6;
const UMBRAL_DIAS_ALERTA_EQUILIBRIO = 10;

function obtenerTimestamp(fechaDDMMAAAA) {
  return parsearFechaDDMMAAAA(fechaDDMMAAAA)?.getTime() ?? 0;
}

// Home de Finanzas: tarjeta "hero" de Ganancia neta + grilla de 3 datos +
// 3 tarjetas de navegación a Costos/Rendimiento/Tendencias (pantallas
// propias, ver FASE 2). Reemplaza las 3 tarjetas apiladas + el pager de 3
// páginas que había antes — ver el prompt "nuevo home de Finanzas".
//
// Los cálculos de acá siguen siendo la fuente de datos del PDF exportable
// (botón "Exportar resumen del mes" de abajo), que necesita el detalle
// completo del mes (trabajosDelMes, rankingServicios, desglose) aunque las
// pantallas de Costos/Rendimiento/Tendencias ya no lo muestren en esta
// pantalla — por eso ese cálculo sigue viviendo acá, no se duplica.
export default function FinanzasScreen({ navigation }) {
  const { costosFijos, cargandoCostosFijos, errorCargaCostosFijos } = useData();
  const {
    cobros,
    cargandoCobros,
    errorCargaCobros,
    gastosVariables,
    cargandoGastosVariables,
    errorCargaGastosVariables,
  } = useFinanzas();
  const { turnos, cargandoTurnos, errorCargaTurnos, getTurnoById } = useTurnos();
  const { cargandoClientes, errorCargaClientes, getClienteById, getVehiculoById } = useClientes();
  const { nombreTaller, logoTaller, misDatos, umbralGananciaVerdePorcentaje } = useTaller();
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  // Turnos ya terminados con saldo pendiente (sin cobro, o con un pago
  // parcial que todavía no cubre el precio) — ver Cuentas por Cobrar.
  const cuentasPorCobrar = calcularCuentasPorCobrar(turnos, cobros, getClienteById, getVehiculoById);
  const totalCuentasPorCobrar = cuentasPorCobrar.reduce((suma, item) => suma + (item.saldo ?? 0), 0);

  const claveMesActual = claveMesDeFecha(new Date());
  const gastosVariablesDelMes = gastosVariables.filter((g) => claveMes(g.fecha) === claveMesActual);
  const totalGastosVariablesDelMes = gastosVariablesDelMes.reduce((suma, g) => suma + g.monto, 0);

  const cargandoGananciaBruta = cargandoCostosFijos || cargandoCobros || cargandoGastosVariables;
  const errorGananciaBruta = errorCargaCostosFijos || errorCargaCobros || errorCargaGastosVariables;

  // Un trabajo por cada cobro del mes actual, con su margen bruto ya
  // calculado — ver utils/calculosFinanzas.js. Alimenta el PDF exportable
  // (utils/finanzasPdf.js necesita nombre/costoInsumos/margen de cada uno).
  const trabajosDelMes = cobros
    .filter((c) => claveMes(c.fecha) === claveMesActual)
    .slice()
    .sort((a, b) => obtenerTimestamp(a.fecha) - obtenerTimestamp(b.fecha))
    .map((cobro) => {
      const turno = cobro.turnoId ? getTurnoById(cobro.turnoId) : null;
      const margen = margenBrutoTrabajo(cobro, turno);
      return { cobro, nombre: nombreTrabajoCobro(turno), costoInsumos: cobro.monto - margen, margen };
    });

  const gananciaBrutaDelMes = trabajosDelMes.reduce((suma, t) => suma + t.margen, 0);
  // Facturación real (lo cobrado), distinta de gananciaBrutaDelMes (lo
  // cobrado menos costo de insumos) — el PDF "para el contador" necesita la
  // primera, no la segunda (ver utils/finanzasPdf.js). La comisión de
  // tarjeta (ver más abajo) NUNCA la toca: es un costo, no una reducción de
  // lo facturado.
  const totalFacturadoDelMes = trabajosDelMes.reduce((suma, t) => suma + t.cobro.monto, 0);
  const cobrosDelMes = trabajosDelMes.map((t) => t.cobro);
  // Comisión de tarjeta fotografiada en los cobros del mes (ver
  // RegistrarCobroModal.js/alter_cobros_comision_porcentaje.sql) — se resta
  // de la ganancia neta junto con costos fijos y gastos variables.
  const totalComisionesTarjetaDelMes = calcularTotalComisionesTarjeta(cobrosDelMes);
  const gananciaNetaDelMes =
    gananciaBrutaDelMes - totalCostosFijos - totalGastosVariablesDelMes - totalComisionesTarjetaDelMes;
  // Desglose facturado/no-facturado para el PDF "para el contador".
  const desglose = calcularDesgloseFacturado(cobrosDelMes, gastosVariablesDelMes, totalCostosFijos);

  // El margen promedio (para el punto de equilibrio) se calcula sobre TODOS
  // los cobros con turno resoluble, no solo los del mes actual — con pocos
  // trabajos por mes el dato sería demasiado ruidoso.
  const margenPromedio = calcularMargenPromedio(cobros, getTurnoById);
  const puntoEquilibrio = calcularPuntoEquilibrio(totalCostosFijos, margenPromedio);

  // Semáforo de color de la tarjeta hero (rojo/ámbar/verde/neutro) — ver
  // calcularColorSemaforoGananciaNeta en utils/calculosFinanzas.js.
  const colorSemaforoGananciaNeta = calcularColorSemaforoGananciaNeta(
    gananciaNetaDelMes,
    totalFacturadoDelMes,
    puntoEquilibrio,
    umbralGananciaVerdePorcentaje
  );

  // Aviso de tope de Monotributo (solo si el taller es Monotributista y
  // cargó categoría en Mis Datos, ver MisDatosScreen.js) — ventana MÓVIL de
  // 12 meses, no año calendario (ver calcularFacturacionUltimos12Meses en
  // utils/calculosFinanzas.js, ARCA recategoriza así).
  const mostrarTopeMonotributo = misDatos.situacionFiscal === "Monotributista" && !!misDatos.categoriaMonotributo;
  const facturacionUltimos12Meses = mostrarTopeMonotributo ? calcularFacturacionUltimos12Meses(cobros) : 0;
  const topeMonotributo = mostrarTopeMonotributo ? TOPES_MONOTRIBUTO[misDatos.categoriaMonotributo] : null;
  const colorSemaforoMonotributo = calcularColorSemaforoMonotributo(facturacionUltimos12Meses, topeMonotributo);

  // Cuánto se "descontó" este mes respecto del precio de lista congelado en
  // cada turno (ver calcularTotalDescontado) — solo cuenta cuando se cobró
  // menos que ese precio.
  const totalDescontadoDelMes = calcularTotalDescontado(
    cobros.filter((c) => claveMes(c.fecha) === claveMesActual),
    getTurnoById
  );

  // Alerta de punto de equilibrio: solo se muestra cuando falta poco para
  // que termine el mes Y todavía no se cubrieron los costos fijos+variables
  // de este mes.
  const diasRestantes = diasRestantesDelMes();
  const faltanteEquilibrio = calcularFaltanteParaEquilibrio(gananciaNetaDelMes, margenPromedio);
  const mostrarAlertaEquilibrio =
    !cargandoGananciaBruta &&
    !errorGananciaBruta &&
    !cargandoTurnos &&
    diasRestantes <= UMBRAL_DIAS_ALERTA_EQUILIBRIO &&
    faltanteEquilibrio !== null;

  // "Tendencia" (usado para deshabilitar Exportar mientras carga): depende
  // de costosFijos/cobros/gastosVariables (igual que la ganancia bruta) más
  // turnos y clientes (para resolver el ranking de servicios que va al PDF).
  const cargandoTendencia = cargandoGananciaBruta || cargandoTurnos || cargandoClientes;

  const rankingServicios = rankingServiciosPorGanancia(cobros, getTurnoById, CANTIDAD_MESES_TENDENCIA);

  // Proyección de cierre de mes, a partir del ritmo de lo que se lleva
  // facturado/gastado — ver calcularProyeccionCierreMes.
  const proyeccionGananciaNeta = calcularProyeccionCierreMes(
    gananciaBrutaDelMes,
    totalGastosVariablesDelMes,
    totalCostosFijos,
    diasTranscurridosDelMes(),
    diasTotalesDelMes()
  );

  // Paso 1: confirmar que quiere exportar (Sí/No). Paso 2, solo si dijo que
  // sí: elegir el propósito, que define qué versión del PDF se arma (ver
  // utils/finanzasPdf.js) — "completo" con todo el detalle interno, o
  // "contador" con solo los totales fiscales. `null` en cualquier punto en
  // que cancele (No, o Cancelar en el segundo paso).
  function elegirTipoExportacion() {
    return new Promise((resolve) => {
      Alert.alert("Exportar resumen del mes", "¿Querés exportar el resumen de este mes?", [
        { text: "No", style: "cancel", onPress: () => resolve(null) },
        {
          text: "Sí",
          onPress: () => {
            Alert.alert("¿Para qué es este resumen?", "Elegí qué versión del PDF generar.", [
              { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
              { text: "Para analizar tus finanzas", onPress: () => resolve("completo") },
              { text: "Para mostrarle a tu contador", onPress: () => resolve("contador") },
            ]);
          },
        },
      ]);
    });
  }

  async function handleExportarPdf() {
    const tipo = await elegirTipoExportacion();
    if (!tipo) return;

    setGenerandoPdf(true);
    try {
      const mesEtiqueta = formatearMesAnio(new Date());
      const html = construirHtmlResumenFinanciero({
        tipo,
        taller: { nombreTaller, logoTaller, misDatos },
        mesEtiqueta,
        totalFacturadoDelMes,
        gananciaNetaDelMes,
        gananciaBrutaDelMes,
        totalCostosFijos,
        totalGastosVariablesDelMes,
        puntoEquilibrio,
        trabajosDelMes,
        rankingServicios,
        desglose,
      });
      const sufijo = tipo === "contador" ? "Contador" : "Análisis";
      await generarYCompartirPdf(html, `${nombreTaller} - Resumen ${mesEtiqueta} (${sufijo}).pdf`);
    } catch (err) {
      Alert.alert("No se pudo generar el PDF", "Probá de nuevo en unos segundos.");
    } finally {
      setGenerandoPdf(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.getParent()?.openDrawer()} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Finanzas</Text>

        {mostrarAlertaEquilibrio && (
          <View style={styles.alertaBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.amber} />
            <Text style={styles.alertaTexto}>
              Quedan {diasRestantes} {diasRestantes === 1 ? "día" : "días"} del mes. Te{" "}
              {faltanteEquilibrio.trabajos === 1 ? "falta" : "faltan"} {faltanteEquilibrio.trabajos}{" "}
              {faltanteEquilibrio.trabajos === 1 ? "trabajo" : "trabajos"} o{" "}
              {formatearPesos(faltanteEquilibrio.facturacion)} para cubrir tus costos fijos este mes.
            </Text>
          </View>
        )}

        <TourAnchor id="finanzas.info">
          <View style={styles.heroTarjeta}>
            <Text style={styles.resumenLabel}>Ganancia neta del mes</Text>
            <Text style={[styles.resumenMonto, ESTILOS_SEMAFORO[colorSemaforoGananciaNeta]]}>
              {formatearPesos(gananciaNetaDelMes)}
            </Text>
            <Text style={styles.proyeccionTexto}>
              {proyeccionGananciaNeta !== null
                ? `A este ritmo, vas a cerrar el mes con ~${formatearPesos(proyeccionGananciaNeta)} de ganancia neta.`
                : "Todavía es pronto en el mes para proyectar cómo vas a cerrar."}
            </Text>
          </View>
        </TourAnchor>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Punto de equilibrio</Text>
            {puntoEquilibrio ? (
              <>
                <Text style={styles.gridValor} numberOfLines={1} adjustsFontSizeToFit>
                  {formatearPesos(puntoEquilibrio.facturacion)}
                </Text>
                <Text style={styles.gridSub}>
                  (~{puntoEquilibrio.trabajos} {puntoEquilibrio.trabajos === 1 ? "trabajo" : "trabajos"})
                </Text>
              </>
            ) : (
              <Text style={styles.gridSub}>Todavía no hay datos suficientes.</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate("CuentasPorCobrar")}
            activeOpacity={0.85}
          >
            <Text style={styles.gridLabel}>Cuentas por Cobrar</Text>
            <Text style={styles.gridValor} numberOfLines={1} adjustsFontSizeToFit>
              {formatearPesos(totalCuentasPorCobrar)}
            </Text>
          </TouchableOpacity>

          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Descontado</Text>
            <Text style={styles.gridValor} numberOfLines={1} adjustsFontSizeToFit>
              {formatearPesos(totalDescontadoDelMes)}
            </Text>
            <Text style={styles.gridSub}>vs. precio de lista</Text>
          </View>
        </View>

        {mostrarTopeMonotributo && (
          <View style={styles.monotributoTarjeta}>
            <Text style={styles.resumenLabel}>
              Facturación últimos 12 meses (Categoría {misDatos.categoriaMonotributo})
            </Text>
            <Text style={[styles.resumenMonto, styles.monotributoMonto, ESTILOS_SEMAFORO[colorSemaforoMonotributo]]}>
              {formatearPesos(facturacionUltimos12Meses)}
            </Text>
            <Text style={styles.proyeccionTexto}>de {formatearPesos(topeMonotributo)} de tope anual</Text>
          </View>
        )}

        <View style={styles.navLista}>
          <TouchableOpacity
            style={styles.navTarjeta}
            onPress={() => navigation.navigate("FinanzasCostos")}
            activeOpacity={0.85}
          >
            <View style={styles.navIcono}>
              <Ionicons name="pie-chart-outline" size={20} color={colors.accentLight} />
            </View>
            <Text style={styles.navTitulo}>Costos y gastos</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTarjeta}
            onPress={() => navigation.navigate("FinanzasRendimiento")}
            activeOpacity={0.85}
          >
            <View style={styles.navIcono}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.accentLight} />
            </View>
            <Text style={styles.navTitulo}>Rendimiento y trabajos</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTarjeta}
            onPress={() => navigation.navigate("FinanzasTendencias")}
            activeOpacity={0.85}
          >
            <View style={styles.navIcono}>
              <Ionicons name="trending-up-outline" size={20} color={colors.accentLight} />
            </View>
            <Text style={styles.navTitulo}>Tendencias y rankings</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botonGasto} onPress={() => setModalGastoVisible(true)} activeOpacity={0.85}>
          <Ionicons name="remove-circle-outline" size={18} color={colors.bg} />
          <Text style={styles.botonGastoTexto}>Cargar gasto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonExportar}
          onPress={handleExportarPdf}
          disabled={generandoPdf || cargandoGananciaBruta || cargandoTendencia}
          activeOpacity={0.85}
        >
          {generandoPdf ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <Ionicons name="download-outline" size={18} color={colors.textPrimary} />
          )}
          <Text style={styles.botonGastoTexto}>{generandoPdf ? "Generando..." : "Exportar resumen del mes"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <GastoVariableModal visible={modalGastoVisible} onClose={() => setModalGastoVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 30,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 14,
  },
  alertaBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.amberTint,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.amber,
    marginBottom: 16,
    padding: 14,
  },
  alertaTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  heroTarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    marginBottom: 12,
  },
  resumenLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resumenMonto: {
    fontFamily: fonts.headingBlack,
    fontSize: 30,
    color: colors.textPrimary,
  },
  resumenMontoError: {
    color: colors.error,
  },
  resumenMontoAmbar: {
    color: colors.amber,
  },
  resumenMontoVerde: {
    color: colors.success,
  },
  proyeccionTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
  },
  gridLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  gridValor: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  gridSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },
  monotributoTarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    marginBottom: 12,
  },
  monotributoMonto: {
    fontSize: 22,
  },
  navLista: {
    gap: 10,
    marginBottom: 16,
  },
  navTarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  navIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitulo: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  botonGasto: {
    marginTop: 10,
    height: 48,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botonExportar: {
    marginTop: 10,
    height: 48,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botonGastoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});

// Traduce la clave de calcularColorSemaforoGananciaNeta al estilo real —
// `undefined` (clave `null`, color neutro) hace que el array de estilos de
// la tarjeta hero simplemente no agregue nada, quedando en textPrimary.
const ESTILOS_SEMAFORO = {
  error: styles.resumenMontoError,
  amber: styles.resumenMontoAmbar,
  success: styles.resumenMontoVerde,
};
