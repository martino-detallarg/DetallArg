import { StyleSheet, Text, View } from "react-native";
import ChipGroup from "./ChipGroup";
import { useTaller } from "../data/TallerContext";
import { ORDEN_PLANES, PLANES } from "../data/mockTaller";
import { colors, continuousCorner, fonts, radii } from "../theme";

// PANEL TEMPORAL DE DESARROLLO — no es parte del producto final.
// Permite simular el plan de suscripción del taller a mano para probar los
// límites de "Mi Equipo" (Básico/Intermedio/PRO) mientras no haya un flujo
// de pagos real conectado. Para sacarlo el día que eso exista: borrar este
// archivo y su uso (import + <PanelPruebasPlan />) en MiEquipoScreen.js.
export default function PanelPruebasPlan() {
  const { plan, cambiarPlan } = useTaller();

  return (
    <View style={styles.panel}>
      <Text style={styles.titulo}>⚠ Panel de pruebas</Text>
      <Text style={styles.subtitulo}>Simulá el plan del taller (todavía no hay pagos reales)</Text>
      <ChipGroup
        options={ORDEN_PLANES.map((clave) => ({
          value: clave,
          label: `${PLANES[clave].etiqueta} · ${PLANES[clave].limiteEmpleados}`,
          selected: plan === clave,
        }))}
        onPress={cambiarPlan}
        selectedColor={colors.error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.error,
    borderRadius: radii.card,
    ...continuousCorner,
    padding: 14,
    marginBottom: 18,
  },
  titulo: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.error,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
});
