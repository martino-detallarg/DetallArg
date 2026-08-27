import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLOR_PUNTO_ESTADO = {
  Pendiente: colors.error,
  "En proceso": colors.amber,
  Finalizado: colors.success,
  Entregado: colors.success,
};

export default function TurnoCard({ turno, cliente, auto, onPress }) {
  const colorEstado = COLOR_PUNTO_ESTADO[turno.estado] ?? colors.textMuted;
  const vehiculoTexto = auto ? `${auto.marca} ${auto.modelo}` : "Auto sin datos";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.punto, { backgroundColor: colorEstado }]} />

      <View style={styles.info}>
        <Text style={styles.cliente} numberOfLines={1} ellipsizeMode="tail">
          {cliente?.nombre ?? "Cliente sin datos"}
        </Text>
        <Text style={styles.vehiculo} numberOfLines={1} ellipsizeMode="tail">
          {vehiculoTexto}
        </Text>
      </View>

      <Text style={styles.hora} numberOfLines={1}>
        {turno.hora}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    ...shadow,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  cliente: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  vehiculo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  hora: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
