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
import GraficoBarras from "../components/GraficoBarras";
import GraficoDonut from "../components/GraficoDonut";
import GastoVariableModal from "../components/GastoVariableModal";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { CATEGORIAS_GASTOS_VARIABLES } from "../data/mockFinanzas";
import { formatearPesos } from "../utils/formato";
import { formatearMesCorto, parsearFechaDDMMAAAA } from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;
const CANTIDAD_PAGINAS = 2;
const CANTIDAD_MESES_GRAFICO = 6;

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

// Los últimos `cantidad` meses, terminando en el mes actual, con su clave de
// agrupación y su etiqueta corta para el eje del gráfico de barras.
function obtenerUltimosMeses(cantidad) {
  const ahora = new Date();
  return Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (cantidad - 1 - i), 1);
    return { clave: claveMesDeFecha(fecha), etiqueta: formatearMesCorto(fecha) };
  });
}

export default function FinanzasScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { costosFijos, cargandoCostosFijos, errorCargaCostosFijos } = useData();
  const { cobros, gastosVariables, eliminarGastoVariable } = useFinanzas();
  const [paginaActiva, setPaginaActiva] = useState(0);
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  const claveMesActual = claveMesDeFecha(new Date());
  const gastosVariablesDelMes = gastosVariables.filter((g) => claveMes(g.fecha) === claveMesActual);
  const totalGastosVariablesDelMes = gastosVariablesDelMes.reduce((suma, g) => suma + g.monto, 0);

  const segmentosDonut = [
    { clave: "fijos", etiqueta: "Fijos", valor: totalCostosFijos, color: colors.accent },
    { clave: "variables", etiqueta: "Variables", valor: totalGastosVariablesDelMes, color: colors.accentLight },
  ];

  // Egresos = costos fijos (constante: no hay historial mes a mes de
  // costos_fijos, así que se aplica el total vigente a cada mes) + gastos
  // variables reales de ESE mes. A propósito NO se suma acá el costo de
  // insumos consumidos: ya se contó una vez al comprar el insumo (regla de
  // no doble conteo).
  const datosBarras = obtenerUltimosMeses(CANTIDAD_MESES_GRAFICO).map(({ clave, etiqueta }) => {
    const ingreso = cobros.filter((c) => claveMes(c.fecha) === clave).reduce((suma, c) => suma + c.monto, 0);
    const gastosDelMes = gastosVariables
      .filter((g) => claveMes(g.fecha) === clave)
      .reduce((suma, g) => suma + g.monto, 0);
    return { etiqueta, valor: ingreso, valorSecundario: totalCostosFijos + gastosDelMes };
  });

  const totalIngresosPeriodo = datosBarras.reduce((suma, d) => suma + d.valor, 0);
  const totalEgresosPeriodo = datosBarras.reduce((suma, d) => suma + d.valorSecundario, 0);

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

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.getParent()?.openDrawer()} />

      <Text style={styles.titulo}>Finanzas</Text>

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

            {/* Mientras cargandoCostosFijos, costosFijos vale [] y la dona
            mostraría un "Total mensual" y un "Fijos: $0" falsos (el total
            real todavía no llegó) — este overlay tapa la card hasta que se
            sepa el dato real. */}
            {(cargandoCostosFijos || errorCargaCostosFijos) && (
              <View style={styles.tarjetaOverlay}>
                {cargandoCostosFijos ? (
                  <ActivityIndicator color={colors.accent} size="large" />
                ) : (
                  <Text style={styles.tarjetaOverlayError}>{errorCargaCostosFijos}</Text>
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
            <Text style={styles.tarjetaTitulo}>Ingresos vs. Egresos · últimos 6 meses</Text>
            <GraficoBarras datos={datosBarras} ancho={anchoGrafico} colorSecundario={colors.error} />

            <View style={styles.leyenda}>
              <View style={styles.leyendaFila}>
                <View style={[styles.leyendaPunto, { backgroundColor: colors.accent }]} />
                <Text style={styles.leyendaTexto}>Ingresos (6 meses)</Text>
                <Text style={styles.leyendaMonto}>{formatearPesos(totalIngresosPeriodo)}</Text>
              </View>
              <View style={styles.leyendaFila}>
                <View style={[styles.leyendaPunto, { backgroundColor: colors.error }]} />
                <Text style={styles.leyendaTexto}>Egresos (6 meses)</Text>
                <Text style={styles.leyendaMonto}>{formatearPesos(totalEgresosPeriodo)}</Text>
              </View>
            </View>
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
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  gastosSeccion: {
    marginTop: 18,
  },
  gastosTitulo: {
    fontFamily: fonts.mono,
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
    fontFamily: fonts.mono,
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
