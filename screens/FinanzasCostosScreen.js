import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import GraficoDonut from "../components/GraficoDonut";
import GastoVariableModal from "../components/GastoVariableModal";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { CATEGORIAS_GASTOS_VARIABLES } from "../data/mockFinanzas";
import { formatearPesos } from "../utils/formato";
import { claveMesDeFecha } from "../utils/fecha";
import { claveMes, margenBrutoTrabajo, calcularPorcentajeInsumosSobreFacturacion } from "../utils/calculosFinanzas";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;

// Vieja "página 1" de Finanzas (donut Fijos/Variables, lista de gastos
// variables, eficiencia de insumos), movida a pantalla propia — ver FASE 2
// del prompt de "nuevo home de Finanzas". Cuentas por Cobrar NO vive acá: se
// fusionó a la grilla del home (FinanzasScreen.js).
export default function FinanzasCostosScreen({ navigation }) {
  const { costosFijos, cargandoCostosFijos, errorCargaCostosFijos } = useData();
  const {
    cobros,
    gastosVariables,
    cargandoGastosVariables,
    errorCargaGastosVariables,
    eliminarGastoVariable,
  } = useFinanzas();
  const { getTurnoById } = useTurnos();
  const [modalGastoVisible, setModalGastoVisible] = useState(false);
  const [eliminandoGastoId, setEliminandoGastoId] = useState(null);
  const [errorEliminarGasto, setErrorEliminarGasto] = useState(null);

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  const claveMesActual = claveMesDeFecha(new Date());
  const gastosVariablesDelMes = gastosVariables.filter((g) => claveMes(g.fecha) === claveMesActual);
  const totalGastosVariablesDelMes = gastosVariablesDelMes.reduce((suma, g) => suma + g.monto, 0);

  const segmentosDonut = [
    { clave: "fijos", etiqueta: "Fijos", valor: totalCostosFijos, color: colors.accent },
    { clave: "variables", etiqueta: "Variables", valor: totalGastosVariablesDelMes, color: colors.accentLight },
  ];

  const cargandoDona = cargandoCostosFijos || cargandoGastosVariables;
  const errorDona = errorCargaCostosFijos || errorCargaGastosVariables;

  // Mismo cálculo que el home (FinanzasScreen.js) para el % de insumos sobre
  // facturación — se recalcula acá en vez de recibirlo por prop, mismo
  // criterio que el resto de las pantallas nuevas de Finanzas.
  const trabajosDelMes = cobros
    .filter((c) => claveMes(c.fecha) === claveMesActual)
    .map((cobro) => {
      const turno = cobro.turnoId ? getTurnoById(cobro.turnoId) : null;
      const margen = margenBrutoTrabajo(cobro, turno);
      return { cobro, costoInsumos: cobro.monto - margen };
    });
  const porcentajeInsumosSobreFacturacion = calcularPorcentajeInsumosSobreFacturacion(trabajosDelMes);

  function handlePressSegmento(clave) {
    if (clave === "fijos") {
      navigation.navigate("CostosFijos");
    } else {
      setModalGastoVisible(true);
    }
  }

  async function handleEliminarGasto(id) {
    if (eliminandoGastoId) return;
    setEliminandoGastoId(id);
    setErrorEliminarGasto(null);
    try {
      await eliminarGastoVariable(id);
    } catch (err) {
      setErrorEliminarGasto("No se pudo eliminar el gasto. Probá de nuevo.");
    } finally {
      setEliminandoGastoId(null);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Finanzas")} />

      <Text style={styles.titulo}>Costos y gastos</Text>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
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
            {errorEliminarGasto && <Text style={styles.gastosError}>{errorEliminarGasto}</Text>}
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
                    disabled={eliminandoGastoId === gasto.id}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {porcentajeInsumosSobreFacturacion !== null && (
          <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
            <Text style={styles.tarjetaTitulo}>Eficiencia de insumos</Text>
            <Text style={styles.insumosPorcentajeTexto}>
              Tus insumos representan el {Math.round(porcentajeInsumosSobreFacturacion)}% de lo que facturás este
              mes.
            </Text>
          </View>
        )}
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
  gastosError: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
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
  tarjetaConMargen: {
    marginTop: 16,
  },
  insumosPorcentajeTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
