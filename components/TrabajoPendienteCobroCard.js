import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Tarjeta de la página "Trabajos" de Notificaciones: un turno ya
// Finalizado/Entregado (ver ESTADOS_QUE_PERMITEN_COBRO en
// NotificacionesScreen.js) que todavía no tiene un cobro registrado. Tocar
// la tarjeta entera abre RegistrarCobroModal para ese turno — mismo modal
// que ya usa TrabajoDetalleModal.js.
export default function TrabajoPendienteCobroCard({ turno, cliente, auto, onPress }) {
  return (
    <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.encabezado}>
        <Text style={styles.nombreCliente} numberOfLines={1}>
          {cliente?.nombre ?? "Cliente sin datos"}
        </Text>
        <Text style={styles.fecha}>{turno.fecha || "-"}</Text>
      </View>

      <Text style={styles.detalle} numberOfLines={1}>
        {auto ? `${auto.marca} ${auto.modelo}` : "Vehículo sin datos"}
      </Text>
      <Text style={styles.servicio} numberOfLines={1}>
        {turno.servicio?.trim() || "Servicio no especificado"}
      </Text>

      <View style={styles.cobroFila}>
        <Ionicons name="cash-outline" size={16} color={colors.accentLight} />
        <Text style={styles.cobroTexto}>Registrar cobro</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  nombreCliente: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  fecha: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  detalle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  servicio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  cobroFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  cobroTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
  },
});
