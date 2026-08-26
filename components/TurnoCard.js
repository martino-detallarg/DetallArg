import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLORES_ESTADO = {
  Pendiente: "#D9A441",
  "En proceso": colors.accent,
  Finalizado: "#4C9A6A",
  Entregado: colors.accentLight,
};

// Máximo de nombres que se muestran antes de truncar con "+N" (ej. "Juan,
// María +1"), para que la fila no se desborde con muchos asignados.
const MAX_NOMBRES_VISIBLES = 2;

function formatearEmpleadosAsignados(empleadosAsignados) {
  const nombres = empleadosAsignados.map((e) => e.nombreEmpleado);
  if (nombres.length <= MAX_NOMBRES_VISIBLES) return nombres.join(", ");
  const visibles = nombres.slice(0, MAX_NOMBRES_VISIBLES).join(", ");
  return `${visibles} +${nombres.length - MAX_NOMBRES_VISIBLES}`;
}

export default function TurnoCard({ turno, cliente, auto, onPress }) {
  const colorEstado = COLORES_ESTADO[turno.estado] ?? colors.textMuted;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.hora}>
        <Text style={styles.horaTexto}>{turno.hora}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.cliente}>{cliente?.nombre ?? "Cliente sin datos"}</Text>
        <Text style={styles.auto}>
          {auto ? `${auto.marca} ${auto.modelo} · ${auto.patente}` : "Auto sin datos"}
        </Text>
        <Text style={styles.servicio}>{turno.servicio}</Text>
        {turno.empleadosAsignados?.length > 0 && (
          <View style={styles.empleadosFila}>
            <Ionicons name="person-outline" size={12} color={colors.textMuted} />
            <Text style={styles.empleados} numberOfLines={1}>
              {formatearEmpleadosAsignados(turno.empleadosAsignados)}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.badge, { borderColor: colorEstado }]}>
        <Text style={[styles.badgeTexto, { color: colorEstado }]}>{turno.estado}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    ...shadow,
  },
  hora: {
    width: 56,
  },
  horaTexto: {
    fontFamily: fonts.mono,
    fontSize: 15,
    color: colors.textSecondary,
  },
  info: {
    flex: 1,
  },
  cliente: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  auto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  servicio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  empleadosFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  empleados: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeTexto: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
});
