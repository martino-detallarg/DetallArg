import { StyleSheet, Text, View } from "react-native";
import { diferenciaEnDias } from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Mismo patrón visual que NotificacionStockBajoCard.js — a diferencia de
// esa, es de solo lectura (no hay ninguna acción tipo "pedir a un
// proveedor" para un recordatorio de tratamiento, ver Notificaciones >
// Clientes / utils/recordatorios.js).
export default function RecordatorioTratamientoCard({ recordatorio }) {
  const { cliente, vehiculo, servicio, vencimiento } = recordatorio;

  const diasVencido = diferenciaEnDias(vencimiento, new Date());
  const textoVencimiento =
    diasVencido <= 0 ? "Vence hoy" : `Venció hace ${diasVencido} ${diasVencido === 1 ? "día" : "días"}`;

  const detalleVehiculo = vehiculo ? vehiculo.patente || `${vehiculo.marca} ${vehiculo.modelo}` : "Vehículo sin datos";

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.cliente} numberOfLines={1}>
        {cliente?.nombre ?? "Cliente sin datos"}
      </Text>
      <Text style={styles.detalle} numberOfLines={1}>
        {detalleVehiculo}
      </Text>
      <Text style={styles.servicio} numberOfLines={1}>
        {servicio.nombre}
      </Text>
      <Text style={styles.vencimiento}>{textoVencimiento}</Text>
    </View>
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
  cliente: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  detalle: {
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
  vencimiento: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
    marginTop: 10,
  },
});
