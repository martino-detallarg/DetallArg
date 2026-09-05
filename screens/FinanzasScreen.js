import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import GraficoDonut from "../components/GraficoDonut";
import GraficoTrabajosDelMes from "../components/GraficoTrabajosDelMes";
import GraficoTendenciaMensual from "../components/GraficoTendenciaMensual";
import RankingLista from "../components/RankingLista";
import GastoVariableModal from "../components/GastoVariableModal";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import { useTaller } from "../data/TallerContext";
import { CATEGORIAS_GASTOS_VARIABLES } from "../data/mockFinanzas";
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
  calcularTendenciaGananciaNeta,
  calcularTotalDescontado,
  calcularProyeccionCierreMes,
  calcularPorcentajeInsumosSobreFacturacion,
  calcularDesgloseFacturado,
  calcularCuentasPorCobrar,
  claveMes,
  claveMesDeFecha,
  costoInsumosTurno,
  nombreTrabajoCobro,
  rankingClientesPorFacturacion,
  rankingServiciosPorGanancia,
} from "../utils/calculosFinanzas";
import { construirHtmlResumenFinanciero, generarYCompartirPdf } from "../utils/finanzasPdf";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;
const CANTIDAD_PAGINAS = 3;
const CANTIDAD_MESES_TENDENCIA = 6;
const UMBRAL_DIAS_ALERTA_EQUILIBRIO = 10;
// "Definilo vos, sugiero 15-20%" — 20 para no dejar pasar casos límite.
const UMBRAL_MARGEN_BAJO_PORCENTAJE = 20;

function obtenerTimestamp(fechaDDMMAAAA) {
  return parsearFechaDDMMAAAA(fechaDDMMAAAA)?.getTime() ?? 0;
}

function DetalleTrabajoCard({ trabajo }) {
  return (
    <View style={styles.detalleTarjeta}>
      <Text style={styles.detalleNombre} numberOfLines={1}>
        {trabajo.nombre}
      </Text>
      <View style={styles.detalleFila}>
        <Text style={styles.detalleLabel}>Monto cobrado</Text>
        <Text style={styles.detalleValor}>{formatearPesos(trabajo.cobro.monto)}</Text>
      </View>
      <View style={styles.detalleFila}>
        <Text style={styles.detalleLabel}>Costo de insumos</Text>
        <Text style={styles.detalleValor}>{formatearPesos(trabajo.costoInsumos)}</Text>
      </View>
      <View style={styles.detalleFila}>
        <Text style={styles.detalleLabel}>% de ganancia</Text>
        <Text style={styles.detalleValor}>{Math.round(trabajo.porcentajeGanancia)}%</Text>
      </View>
      <View style={styles.detalleFila}>
        <Text style={styles.detalleLabel}>% de costo variable</Text>
        <Text style={styles.detalleValor}>{Math.round(trabajo.porcentajeCostoVariable)}%</Text>
      </View>
    </View>
  );
}

export default function FinanzasScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { costosFijos, cargandoCostosFijos, errorCargaCostosFijos } = useData();
  const {
    cobros,
    cargandoCobros,
    errorCargaCobros,
    gastosVariables,
    cargandoGastosVariables,
    errorCargaGastosVariables,
    eliminarGastoVariable,
  } = useFinanzas();
  const { turnos, cargandoTurnos, errorCargaTurnos, getTurnoById } = useTurnos();
  const { cargandoClientes, errorCargaClientes, getClienteById, getVehiculoById } = useClientes();
  const { nombreTaller, logoTaller, misDatos } = useTaller();
  const [paginaActiva, setPaginaActiva] = useState(0);
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  // Turnos ya terminados con saldo pendiente (sin cobro, o con un pago
  // parcial que todavía no cubre el precio) — ver Cuentas por Cobrar.
  const cuentasPorCobrar = calcularCuentasPorCobrar(turnos, cobros, getClienteById, getVehiculoById);
  const totalCuentasPorCobrar = cuentasPorCobrar.reduce((suma, item) => suma + (item.saldo ?? 0), 0);

  const claveMesActual = claveMesDeFecha(new Date());
  const gastosVariablesDelMes = gastosVariables.filter((g) => claveMes(g.fecha) === claveMesActual);
  const totalGastosVariablesDelMes = gastosVariablesDelMes.reduce((suma, g) => suma + g.monto, 0);

  const segmentosDonut = [
    { clave: "fijos", etiqueta: "Fijos", valor: totalCostosFijos, color: colors.accent },
    { clave: "variables", etiqueta: "Variables", valor: totalGastosVariablesDelMes, color: colors.accentLight },
  ];

  // La dona mezcla costosFijos (Fijos) y gastosVariables (Variables); la
  // card de ganancia bruta mezcla cobros (para trabajosDelMes) + costosFijos
  // y gastosVariables (para gananciaNetaDelMes/puntoEquilibrio) — cada
  // gráfico solo puede darse por completo cuando terminaron de cargar (sin
  // error) todas las fuentes que efectivamente usa.
  const cargandoDona = cargandoCostosFijos || cargandoGastosVariables;
  const errorDona = errorCargaCostosFijos || errorCargaGastosVariables;
  const cargandoGananciaBruta = cargandoCostosFijos || cargandoCobros || cargandoGastosVariables;
  const errorGananciaBruta = errorCargaCostosFijos || errorCargaCobros || errorCargaGastosVariables;

  // Un trabajo por cada cobro del mes actual, con su margen bruto (monto -
  // costo de insumos) ya calculado — ver utils/calculosFinanzas.js. Ordenado
  // por fecha para que las barras del gráfico sigan el orden cronológico.
  const trabajosDelMes = cobros
    .filter((c) => claveMes(c.fecha) === claveMesActual)
    .slice()
    .sort((a, b) => obtenerTimestamp(a.fecha) - obtenerTimestamp(b.fecha))
    .map((cobro) => {
      const turno = cobro.turnoId ? getTurnoById(cobro.turnoId) : null;
      const costoInsumos = costoInsumosTurno(turno);
      const margen = cobro.monto - costoInsumos;
      return {
        cobro,
        nombre: nombreTrabajoCobro(turno),
        costoInsumos,
        margen,
        porcentajeGanancia: cobro.monto > 0 ? (margen / cobro.monto) * 100 : 0,
        porcentajeCostoVariable: cobro.monto > 0 ? (costoInsumos / cobro.monto) * 100 : 0,
      };
    });

  const gananciaBrutaDelMes = trabajosDelMes.reduce((suma, t) => suma + t.margen, 0);
  // Facturación real (lo cobrado), distinta de gananciaBrutaDelMes (lo
  // cobrado menos costo de insumos) — el PDF "para el contador" necesita la
  // primera, no la segunda (ver utils/finanzasPdf.js).
  const totalFacturadoDelMes = trabajosDelMes.reduce((suma, t) => suma + t.cobro.monto, 0);
  const gananciaNetaDelMes = gananciaBrutaDelMes - totalCostosFijos - totalGastosVariablesDelMes;
  // Desglose facturado/no-facturado para el PDF "para el contador" (ver
  // utils/finanzasPdf.js) — reusa los cobros del mes ya filtrados en
  // trabajosDelMes en vez de volver a filtrar `cobros` desde cero.
  const cobrosDelMes = trabajosDelMes.map((t) => t.cobro);
  const desglose = calcularDesgloseFacturado(cobrosDelMes, gastosVariablesDelMes, totalCostosFijos);
  const margenPromedioMesPorcentaje =
    trabajosDelMes.length > 0
      ? trabajosDelMes.reduce((suma, t) => suma + t.porcentajeGanancia, 0) / trabajosDelMes.length
      : 0;

  // El margen promedio (para el punto de equilibrio) se calcula sobre TODOS
  // los cobros con turno resoluble, no solo los del mes actual — con pocos
  // trabajos por mes el dato sería demasiado ruidoso (ver
  // utils/calculosFinanzas.js).
  const margenPromedio = calcularMargenPromedio(cobros, getTurnoById);
  const puntoEquilibrio = calcularPuntoEquilibrio(totalCostosFijos, margenPromedio);

  // Cuánto se "regaló" este mes respecto del precio de lista congelado en
  // cada turno (ver calcularTotalDescontado) — solo cuenta cuando se cobró
  // menos que ese precio.
  const totalDescontadoDelMes = calcularTotalDescontado(
    cobros.filter((c) => claveMes(c.fecha) === claveMesActual),
    getTurnoById
  );

  // Alerta de punto de equilibrio: solo se muestra cuando falta poco para
  // que termine el mes Y todavía no se cubrieron los costos fijos+variables
  // de este mes — no antes (sería ruido) ni mientras los datos de los que
  // depende (cobros/gastos/costos/turnos) todavía están cargando (mostraría
  // un déficit falso).
  const diasRestantes = diasRestantesDelMes();
  const faltanteEquilibrio = calcularFaltanteParaEquilibrio(gananciaNetaDelMes, margenPromedio);
  const mostrarAlertaEquilibrio =
    !cargandoGananciaBruta &&
    !errorGananciaBruta &&
    !cargandoTurnos &&
    diasRestantes <= UMBRAL_DIAS_ALERTA_EQUILIBRIO &&
    faltanteEquilibrio !== null;

  // Página 3 (Tendencia y rendimiento): depende de costosFijos/cobros/
  // gastosVariables (igual que la ganancia bruta) más turnos (para resolver
  // cliente/servicio de cada cobro) y clientes (para los nombres del ranking).
  const cargandoTendencia = cargandoGananciaBruta || cargandoTurnos || cargandoClientes;
  const errorTendencia = errorGananciaBruta || errorCargaTurnos || errorCargaClientes;

  const tendenciaGananciaNeta = calcularTendenciaGananciaNeta(
    CANTIDAD_MESES_TENDENCIA,
    cobros,
    gastosVariables,
    totalCostosFijos,
    getTurnoById
  );
  const rankingServicios = rankingServiciosPorGanancia(cobros, getTurnoById, CANTIDAD_MESES_TENDENCIA);
  const rankingClientes = rankingClientesPorFacturacion(cobros, getTurnoById, getClienteById);

  // FEATURE 9: mismo ranking de arriba, con un aviso agregado en los
  // servicios cuyo margen % está por debajo del umbral — item.alerta/
  // item.alertaTexto son leídos por RankingLista.js, opcionales (el ranking
  // de clientes no los tiene y se ve exactamente igual que antes).
  const rankingServiciosConAlerta = rankingServicios.map((item) => ({
    ...item,
    alerta: item.margenPorcentaje != null && item.margenPorcentaje < UMBRAL_MARGEN_BAJO_PORCENTAJE,
    alertaTexto: "Margen bajo, revisá el precio o la receta de este servicio.",
  }));

  // FEATURE 7: proyección de cierre de mes, a partir del ritmo de lo que se
  // lleva facturado/gastado — ver calcularProyeccionCierreMes.
  const proyeccionGananciaNeta = calcularProyeccionCierreMes(
    gananciaBrutaDelMes,
    totalGastosVariablesDelMes,
    totalCostosFijos,
    diasTranscurridosDelMes(),
    diasTotalesDelMes()
  );

  // FEATURE 8: costo de insumos consumidos como % de lo facturado este mes
  // — dato de eficiencia, no de ganancia (por eso va aparte de las tarjetas
  // de margen).
  const porcentajeInsumosSobreFacturacion = calcularPorcentajeInsumosSobreFacturacion(trabajosDelMes);

  function handlePressSegmento(clave) {
    if (clave === "fijos") {
      navigation.navigate("CostosFijos");
    } else {
      setModalGastoVisible(true);
    }
  }

  async function handleEliminarGasto(id) {
    try {
      await eliminarGastoVariable(id);
    } catch (err) {
      Alert.alert("No se pudo eliminar", "No se pudo eliminar el gasto. Probá de nuevo.");
    }
  }

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setPaginaActiva(indice);
  }

  function handlePressBarra(indice) {
    setIndiceSeleccionado((actual) => (actual === indice ? null : indice));
  }

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

      <View style={styles.resumenContenedor}>
        <View style={styles.tarjeta}>
          <Text style={styles.resumenLabel}>Ganancia neta del mes</Text>
          <Text style={[styles.resumenMonto, gananciaNetaDelMes < 0 && styles.resumenMontoNegativo]}>
            {formatearPesos(gananciaNetaDelMes)}
          </Text>
          <Text style={styles.proyeccionTexto}>
            {proyeccionGananciaNeta !== null
              ? `A este ritmo, vas a cerrar el mes con ~${formatearPesos(proyeccionGananciaNeta)} de ganancia neta.`
              : "Todavía es pronto en el mes para proyectar cómo vas a cerrar."}
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.resumenLabel}>Punto de equilibrio</Text>
          {puntoEquilibrio ? (
            <Text style={styles.equilibrioTexto}>
              Necesitás facturar {formatearPesos(puntoEquilibrio.facturacion)} (o hacer ~
              {puntoEquilibrio.trabajos} {puntoEquilibrio.trabajos === 1 ? "trabajo" : "trabajos"}) este mes
              para cubrir tus costos fijos.
            </Text>
          ) : (
            <Text style={styles.equilibrioTexto}>
              Todavía no hay suficientes trabajos cobrados para calcular esto.
            </Text>
          )}
        </View>

        {totalDescontadoDelMes > 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.resumenLabel}>Regalado este mes</Text>
            <Text style={styles.resumenMonto}>{formatearPesos(totalDescontadoDelMes)}</Text>
            <Text style={styles.equilibrioTexto}>
              Es lo que cobraste de menos respecto del precio de lista en los trabajos con descuento.
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollFin}
        style={styles.pager}
      >
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.pagina}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.cuentasPorCobrarTarjeta}
            onPress={() => navigation.navigate("CuentasPorCobrar")}
            activeOpacity={0.85}
          >
            <View style={styles.cuentasPorCobrarIcono}>
              <Ionicons name="time-outline" size={20} color={colors.accentLight} />
            </View>
            <View style={styles.cuentasPorCobrarTextos}>
              <Text style={styles.cuentasPorCobrarTitulo}>Cuentas por Cobrar</Text>
              {totalCuentasPorCobrar > 0 && (
                <Text style={styles.cuentasPorCobrarMonto}>{formatearPesos(totalCuentasPorCobrar)} adeudado</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.tarjeta}>
            <View style={styles.tarjetaHeaderFila}>
              <Text style={styles.tarjetaTitulo}>Costos del mes</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("CostosFijos")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.accentLight} />
              </TouchableOpacity>
            </View>

            <GraficoDonut segmentos={segmentosDonut} onPressSegmento={handlePressSegmento} />

            <View style={styles.leyenda}>
              {segmentosDonut.map((segmento) => (
                <TouchableOpacity
                  key={segmento.clave}
                  style={styles.leyendaFila}
                  onPress={() => handlePressSegmento(segmento.clave)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.leyendaPunto, { backgroundColor: segmento.color }]} />
                  <Text style={styles.leyendaTexto}>{segmento.etiqueta}</Text>
                  <Text style={styles.leyendaMonto}>{formatearPesos(segmento.valor)}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Mientras cargandoCostosFijos o cargandoGastosVariables,
            costosFijos y/o gastosVariables valen [] y la dona mostraría
            "Fijos"/"Variables" en $0 falsos (el total real todavía no
            llegó) — este overlay tapa la card hasta que se sepan los dos
            datos reales. */}
            {(cargandoDona || errorDona) && (
              <View style={styles.tarjetaOverlay}>
                {cargandoDona ? (
                  <ActivityIndicator color={colors.accent} size="large" />
                ) : (
                  <Text style={styles.tarjetaOverlayError}>{errorDona}</Text>
                )}
              </View>
            )}
          </View>

          {gastosVariablesDelMes.length > 0 && (
            <View style={styles.gastosSeccion}>
              <Text style={styles.gastosTitulo}>Gastos variables de este mes</Text>
              {gastosVariablesDelMes.map((gasto) => {
                const categoria = CATEGORIAS_GASTOS_VARIABLES[gasto.categoria];
                return (
                  <View key={gasto.id} style={styles.gastoFila}>
                    <View style={styles.gastoFilaIcono}>
                      <Ionicons name={categoria?.icono ?? "cash-outline"} size={18} color={colors.accentLight} />
                    </View>
                    <View style={styles.gastoFilaTexto}>
                      <Text style={styles.gastoFilaCategoria}>{categoria?.etiqueta ?? "Otro"}</Text>
                      <Text style={styles.gastoFilaDetalle} numberOfLines={1}>
                        {gasto.fecha}
                        {gasto.descripcion ? ` · ${gasto.descripcion}` : ""}
                      </Text>
                    </View>
                    <Text style={styles.gastoFilaMonto}>{formatearPesos(gasto.monto)}</Text>
                    <TouchableOpacity
                      style={styles.gastoQuitarBoton}
                      onPress={() => handleEliminarGasto(gasto.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* FEATURE 8 — va aparte de las tarjetas de margen (resumenContenedor
          de arriba) a propósito: es un dato de eficiencia (cuánto de lo que
          entra se va en insumos), no de ganancia. */}
          {porcentajeInsumosSobreFacturacion !== null && (
            <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
              <Text style={styles.tarjetaTitulo}>Eficiencia de insumos</Text>
              <Text style={styles.insumosPorcentajeTexto}>
                Tus insumos representan el {Math.round(porcentajeInsumosSobreFacturacion)}% de lo que facturás
                este mes.
              </Text>
            </View>
          )}
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.pagina}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tarjeta}>
            <Text style={styles.gananciaBrutaMonto}>{formatearPesos(gananciaBrutaDelMes)}</Text>
            <Text style={styles.gananciaBrutaLabel}>Ganancia bruta del mes</Text>

            {trabajosDelMes.length === 0 ? (
              <Text style={styles.vacio}>Todavía no cobraste ningún trabajo este mes.</Text>
            ) : (
              <>
                <Text style={styles.subtitulo}>
                  {trabajosDelMes.length} {trabajosDelMes.length === 1 ? "trabajo realizado" : "trabajos realizados"}{" "}
                  · margen promedio {Math.round(margenPromedioMesPorcentaje)}%
                </Text>

                <View style={styles.graficoContenedor}>
                  <GraficoTrabajosDelMes
                    datos={trabajosDelMes.map((t) => ({ valor: t.margen }))}
                    ancho={anchoGrafico}
                    indiceSeleccionado={indiceSeleccionado}
                    onPressBarra={handlePressBarra}
                  />
                </View>

                {indiceSeleccionado !== null && trabajosDelMes[indiceSeleccionado] && (
                  <DetalleTrabajoCard trabajo={trabajosDelMes[indiceSeleccionado]} />
                )}
              </>
            )}

            {/* Mismo criterio que la card de "Costos del mes": mientras
            cargandoCobros/cargandoGastosVariables/cargandoCostosFijos,
            trabajosDelMes/gananciaNetaDelMes mezclarían fuentes a medio
            cargar y mostrarían montos en $0 falsos — este overlay tapa la
            card hasta que se sepan los tres datos reales. */}
            {(cargandoGananciaBruta || errorGananciaBruta) && (
              <View style={styles.tarjetaOverlay}>
                {cargandoGananciaBruta ? (
                  <ActivityIndicator color={colors.accent} size="large" />
                ) : (
                  <Text style={styles.tarjetaOverlayError}>{errorGananciaBruta}</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.pagina}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo}>Tendencia de {CANTIDAD_MESES_TENDENCIA} meses</Text>
            <View style={styles.graficoContenedor}>
              <GraficoTendenciaMensual datos={tendenciaGananciaNeta} ancho={anchoGrafico} />
            </View>

            {(cargandoTendencia || errorTendencia) && (
              <View style={styles.tarjetaOverlay}>
                {cargandoTendencia ? (
                  <ActivityIndicator color={colors.accent} size="large" />
                ) : (
                  <Text style={styles.tarjetaOverlayError}>{errorTendencia}</Text>
                )}
              </View>
            )}
          </View>

          <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
            <Text style={styles.tarjetaTitulo}>Servicios más rentables</Text>
            <Text style={styles.tarjetaSubtitulo}>Últimos {CANTIDAD_MESES_TENDENCIA} meses, por ganancia total</Text>
            <View style={styles.rankingContenedor}>
              <RankingLista
                items={rankingServiciosConAlerta}
                etiquetaCantidad="ventas"
                vacioTexto="Todavía no hay suficientes cobros para armar este ranking."
              />
            </View>

            {(cargandoTendencia || errorTendencia) && (
              <View style={styles.tarjetaOverlay}>
                {cargandoTendencia ? (
                  <ActivityIndicator color={colors.accent} size="large" />
                ) : (
                  <Text style={styles.tarjetaOverlayError}>{errorTendencia}</Text>
                )}
              </View>
            )}
          </View>

          <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
            <Text style={styles.tarjetaTitulo}>Clientes que más aportan</Text>
            <Text style={styles.tarjetaSubtitulo}>Facturación histórica total</Text>
            <View style={styles.rankingContenedor}>
              <RankingLista
                items={rankingClientes}
                etiquetaCantidad="trabajos"
                vacioTexto="Todavía no hay suficientes cobros para armar este ranking."
              />
            </View>

            {(cargandoTendencia || errorTendencia) && (
              <View style={styles.tarjetaOverlay}>
                {cargandoTendencia ? (
                  <ActivityIndicator color={colors.accent} size="large" />
                ) : (
                  <Text style={styles.tarjetaOverlayError}>{errorTendencia}</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>

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
        <Text style={styles.botonGastoTexto}>
          {generandoPdf ? "Generando..." : "Exportar resumen del mes"}
        </Text>
      </TouchableOpacity>

      <View style={styles.puntos}>
        {Array.from({ length: CANTIDAD_PAGINAS }).map((_, indice) => (
          <View key={indice} style={[styles.punto, indice === paginaActiva && styles.puntoActivo]} />
        ))}
      </View>

      <GastoVariableModal visible={modalGastoVisible} onClose={() => setModalGastoVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: PADDING_PANTALLA,
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
    marginHorizontal: PADDING_PANTALLA,
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
  resumenContenedor: {
    paddingHorizontal: PADDING_PANTALLA,
    gap: 12,
    marginBottom: 16,
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
  resumenMontoNegativo: {
    color: colors.error,
  },
  equilibrioTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  proyeccionTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  insumosPorcentajeTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  pager: {
    flex: 1,
  },
  pagina: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 20,
  },
  cuentasPorCobrarTarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 16,
  },
  cuentasPorCobrarIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  cuentasPorCobrarTextos: {
    flex: 1,
  },
  cuentasPorCobrarTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cuentasPorCobrarMonto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  tarjetaOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // rgba de colors.surface (#0E1315) — mismo criterio que el fondo
    // semitransparente de los modals (rgba de colors.bg).
    backgroundColor: "rgba(14, 19, 21, 0.85)",
    borderRadius: radii.card,
    ...continuousCorner,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  tarjetaOverlayError: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
  },
  tarjetaHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tarjetaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  leyenda: {
    marginTop: 18,
    gap: 8,
  },
  leyendaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leyendaPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  leyendaMonto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  gastosSeccion: {
    marginTop: 18,
  },
  gastosTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  gastoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
    marginBottom: 8,
  },
  gastoFilaIcono: {
    width: 34,
    height: 34,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  gastoFilaTexto: {
    flex: 1,
  },
  gastoFilaCategoria: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  gastoFilaDetalle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  gastoFilaMonto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  gastoQuitarBoton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  gananciaBrutaMonto: {
    fontFamily: fonts.headingBlack,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: "center",
  },
  gananciaBrutaLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 6,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  graficoContenedor: {
    marginTop: 20,
  },
  tarjetaConMargen: {
    marginTop: 16,
  },
  tarjetaSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rankingContenedor: {
    marginTop: 14,
  },
  detalleTarjeta: {
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 18,
  },
  detalleNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  detalleFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detalleLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  detalleValor: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  botonGasto: {
    marginHorizontal: PADDING_PANTALLA,
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
    marginHorizontal: PADDING_PANTALLA,
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
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  puntoActivo: {
    width: 18,
    backgroundColor: colors.accent,
  },
});
