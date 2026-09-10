import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import GraficoTendenciaMensual from "../components/GraficoTendenciaMensual";
import RankingLista from "../components/RankingLista";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import {
  calcularTendenciaGananciaNeta,
  rankingClientesPorFacturacion,
  rankingServiciosPorGanancia,
} from "../utils/calculosFinanzas";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;
const CANTIDAD_MESES_TENDENCIA = 6;
// "Definilo vos, sugiero 15-20%" — 20 para no dejar pasar casos límite.
const UMBRAL_MARGEN_BAJO_PORCENTAJE = 20;

// Vieja "página 3" de Finanzas (tendencia de 6 meses, servicios más
// rentables, clientes que más aportan), movida a pantalla propia — ver FASE
// 2 del prompt de "nuevo home de Finanzas".
export default function FinanzasTendenciasScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { costosFijos, cargandoCostosFijos, errorCargaCostosFijos } = useData();
  const { cobros, cargandoCobros, errorCargaCobros, gastosVariables, cargandoGastosVariables, errorCargaGastosVariables } =
    useFinanzas();
  const { cargandoTurnos, errorCargaTurnos, getTurnoById } = useTurnos();
  const { cargandoClientes, errorCargaClientes, getClienteById } = useClientes();
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  const cargandoGananciaBruta = cargandoCostosFijos || cargandoCobros || cargandoGastosVariables;
  const errorGananciaBruta = errorCargaCostosFijos || errorCargaCobros || errorCargaGastosVariables;
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

  const rankingServiciosConAlerta = rankingServicios.map((item) => ({
    ...item,
    alerta: item.margenPorcentaje != null && item.margenPorcentaje < UMBRAL_MARGEN_BAJO_PORCENTAJE,
    alertaTexto: "Margen bajo, revisá el precio o la receta de este servicio.",
  }));

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Finanzas")} />

      <Text style={styles.titulo}>Tendencias y rankings</Text>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
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
  contenido: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 40,
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
  tarjetaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
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
  graficoContenedor: {
    marginTop: 20,
  },
});
