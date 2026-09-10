import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import GraficoTrabajosDelMes from "../components/GraficoTrabajosDelMes";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { formatearPesos } from "../utils/formato";
import { claveMesDeFecha, parsearFechaDDMMAAAA } from "../utils/fecha";
import { claveMes, margenBrutoTrabajo, nombreTrabajoCobro } from "../utils/calculosFinanzas";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;

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

// Vieja "página 2" de Finanzas (ganancia bruta, barras de trabajos del mes,
// detalle al tocar una barra), movida a pantalla propia — ver FASE 2 del
// prompt de "nuevo home de Finanzas".
export default function FinanzasRendimientoScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { cargandoCostosFijos, errorCargaCostosFijos } = useData();
  const { cobros, cargandoCobros, errorCargaCobros, cargandoGastosVariables, errorCargaGastosVariables } =
    useFinanzas();
  const { cargandoTurnos, getTurnoById } = useTurnos();
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(null);
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  const claveMesActual = claveMesDeFecha(new Date());

  // Mismo criterio que FinanzasScreen.js: un trabajo por cobro del mes,
  // ordenado por fecha, con margen bruto prorrateado (ver
  // utils/calculosFinanzas.js).
  const trabajosDelMes = cobros
    .filter((c) => claveMes(c.fecha) === claveMesActual)
    .slice()
    .sort((a, b) => obtenerTimestamp(a.fecha) - obtenerTimestamp(b.fecha))
    .map((cobro) => {
      const turno = cobro.turnoId ? getTurnoById(cobro.turnoId) : null;
      const margen = margenBrutoTrabajo(cobro, turno);
      const costoInsumos = cobro.monto - margen;
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
  const margenPromedioMesPorcentaje =
    trabajosDelMes.length > 0
      ? trabajosDelMes.reduce((suma, t) => suma + t.porcentajeGanancia, 0) / trabajosDelMes.length
      : 0;

  const cargandoGananciaBruta = cargandoCostosFijos || cargandoCobros || cargandoGastosVariables;
  const errorGananciaBruta = errorCargaCostosFijos || errorCargaCobros || errorCargaGastosVariables;

  function handlePressBarra(indice) {
    setIndiceSeleccionado((actual) => (actual === indice ? null : indice));
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Finanzas")} />

      <Text style={styles.titulo}>Rendimiento y trabajos</Text>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
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
});
