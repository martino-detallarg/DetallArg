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
import GastoVariableModal from "../components/GastoVariableModal";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { CATEGORIAS_GASTOS_VARIABLES } from "../data/mockFinanzas";
import { formatearPesos } from "../utils/formato";
import { parsearFechaDDMMAAAA } from "../utils/fecha";
import {
  calcularMargenPromedio,
  calcularPuntoEquilibrio,
  costoInsumosTurno,
  nombreTrabajoCobro,
} from "../utils/calculosFinanzas";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;
const CANTIDAD_PAGINAS = 2;

// Clave "año-mes" (ej. "2026-7") para agrupar cobros/gastos variables por
// mes real.
function claveMesDeFecha(fecha) {
  return `${fecha.getFullYear()}-${fecha.getMonth()}`;
}

// Misma clave a partir de una fecha "DD/MM/AAAA" (formato de cobro.fecha /
// gastoVariable.fecha). null si la fecha no es válida (mismo criterio
// best-effort que el resto de utils/fecha.js).
function claveMes(fechaDDMMAAAA) {
  const fecha = parsearFechaDDMMAAAA(fechaDDMMAAAA);
  return fecha ? claveMesDeFecha(fecha) : null;
}

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
  const { getTurnoById } = useTurnos();
  const [paginaActiva, setPaginaActiva] = useState(0);
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(null);
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

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
  const gananciaNetaDelMes = gananciaBrutaDelMes - totalCostosFijos - totalGastosVariablesDelMes;
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

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.getParent()?.openDrawer()} />

      <Text style={styles.titulo}>Finanzas</Text>

      <View style={styles.resumenContenedor}>
        <View style={styles.tarjeta}>
          <Text style={styles.resumenLabel}>Ganancia neta del mes</Text>
          <Text style={[styles.resumenMonto, gananciaNetaDelMes < 0 && styles.resumenMontoNegativo]}>
            {formatearPesos(gananciaNetaDelMes)}
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
      </ScrollView>

      <TouchableOpacity style={styles.botonGasto} onPress={() => setModalGastoVisible(true)} activeOpacity={0.85}>
        <Ionicons name="remove-circle-outline" size={18} color={colors.bg} />
        <Text style={styles.botonGastoTexto}>Cargar gasto</Text>
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
  resumenContenedor: {
    paddingHorizontal: PADDING_PANTALLA,
    gap: 12,
    marginBottom: 16,
  },
  resumenLabel: {
    fontFamily: fonts.mono,
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
  pager: {
    flex: 1,
  },
  pagina: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 20,
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
    fontFamily: fonts.mono,
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
    fontFamily: fonts.mono,
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
