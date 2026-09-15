import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { useTaller } from "../data/TallerContext";
import { ORDEN_PLANES, PLANES, PLANES_SUSCRIPCION } from "../data/planesSuscripcion";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Pantalla de "elegir/pagar un plan" — hoy es solo el esqueleto de la UI: no
// hay ningún preapproval_plan real de Mercado Pago todavía (ver
// data/planesSuscripcion.js), así que "Suscribirme" queda deshabilitado en
// los 3 planes. Cuando existan los ids reales, ese botón pasa a llamar a la
// función (todavía sin construir, fuera de alcance de este trabajo) que crea
// la suscripción en Mercado Pago y abre su checkout.
export default function SeleccionPlanScreen({ navigation }) {
  const { plan: planActual } = useTaller();

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.goBack()} />

      <View style={styles.encabezadoFijo}>
        <Text style={styles.titulo}>Elegí tu plan</Text>
        <Text style={styles.subtitulo}>
          Los precios y el pago con Mercado Pago todavía se están terminando de configurar.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {ORDEN_PLANES.map((clave) => {
          const { etiqueta, limiteEmpleados } = PLANES[clave];
          const { precio, mpPreapprovalPlanId } = PLANES_SUSCRIPCION[clave];
          const esPlanActual = clave === planActual;

          return (
            <View key={clave} style={[styles.tarjeta, esPlanActual && styles.tarjetaActual]}>
              <View style={styles.tarjetaHeader}>
                <Text style={styles.planNombre}>{etiqueta}</Text>
                {esPlanActual && (
                  <View style={styles.badgeActual}>
                    <Text style={styles.badgeActualTexto}>Tu plan actual</Text>
                  </View>
                )}
              </View>

              <Text style={styles.planPrecio}>
                {precio == null ? "Precio a confirmar" : `${formatearPesos(precio)}/mes`}
              </Text>

              <Text style={styles.planDetalle}>
                {limiteEmpleados === 0
                  ? "No incluye empleados"
                  : `Hasta ${limiteEmpleados} ${limiteEmpleados === 1 ? "empleado" : "empleados"}`}
              </Text>

              <Button
                title="Suscribirme"
                variant="secondary"
                disabled={!mpPreapprovalPlanId}
                onPress={() => {}}
              />

              {!mpPreapprovalPlanId && (
                <View style={styles.avisoPendiente}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.avisoPendienteTexto}>
                    La suscripción todavía no está disponible — falta terminar de configurar Mercado Pago.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  encabezadoFijo: {
    paddingHorizontal: 20,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 6,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    gap: 10,
  },
  tarjetaActual: {
    borderColor: colors.borderAccent,
  },
  tarjetaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  planNombre: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  badgeActual: {
    backgroundColor: colors.accentTint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeActualTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.accentLight,
  },
  planPrecio: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  planDetalle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  avisoPendiente: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  avisoPendienteTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
