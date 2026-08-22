import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
      <View style={styles.chips}>
        {ORDEN_PLANES.map((clave) => {
          const activo = plan === clave;
          return (
            <TouchableOpacity
              key={clave}
              style={[styles.chip, activo && styles.chipSeleccionado]}
              onPress={() => cambiarPlan(clave)}
            >
              <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                {PLANES[clave].etiqueta} · {PLANES[clave].limiteEmpleados}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSeleccionado: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
});
