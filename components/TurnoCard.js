import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLORES_ESTADO = {
  Pendiente: "#D9A441",
  "En proceso": colors.accent,
  Terminado: "#4C9A6A",
};

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
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
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
