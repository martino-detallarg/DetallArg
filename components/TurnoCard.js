import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useServicios } from "../data/ServicioContext";
import { diferenciaEnDias, parsearFechaDDMMAAAA } from "../utils/fecha";
import { calcularFechaEntrega } from "../utils/entregas";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLOR_PUNTO_ESTADO = {
  Pendiente: colors.error,
  "En proceso": colors.amber,
  Finalizado: colors.success,
  Entregado: colors.success,
};

// Reemplaza la hora de llegada por el estado de entrega del trabajo. Solo
// "En proceso" calcula la fecha de entrega estimada (hoy/mañana/en X días/
// atrasado); "Pendiente" todavía ni arrancó, así que muestra un texto fijo
// en vez de una fecha. "Atrasado" y "Se entrega hoy" comparten el mismo rojo
// de máxima urgencia; "Se entrega mañana" usa amber como alerta intermedia;
// "A entregar" (Finalizado) también es urgente porque falta que el cliente
// lo retire, aunque el trabajo en sí ya esté terminado.
function calcularInfoEntrega(turno, servicio) {
  if (turno.estado === "Entregado") {
    return { texto: "¡Entregado!", color: colors.success, urgente: false };
  }
  if (turno.estado === "Finalizado") {
    return { texto: "A entregar", color: colors.amber, urgente: true };
  }
  if (turno.estado === "Pendiente") {
    return { texto: "Sin comenzar", color: colors.textMuted, urgente: false };
  }

  // A partir de acá, estado "En proceso".
  const fechaLlegada = parsearFechaDDMMAAAA(turno.fecha);
  if (!fechaLlegada) {
    // Turno sin fecha parseable (ver "Sin fecha asignada" en AgendaScreen.js):
    // no hay con qué calcular una entrega, se mantiene el viejo dato de hora.
    return { texto: turno.hora, color: colors.textSecondary, urgente: false };
  }

  const fechaEntrega = calcularFechaEntrega(fechaLlegada, servicio);
  const diasHastaEntrega = diferenciaEnDias(new Date(), fechaEntrega);

  if (diasHastaEntrega < 0) {
    return { texto: "Atrasado", color: colors.error, urgente: true };
  }
  if (diasHastaEntrega === 0) {
    return { texto: "Se entrega hoy", color: colors.error, urgente: true };
  }
  if (diasHastaEntrega === 1) {
    return { texto: "Se entrega mañana", color: colors.amber, urgente: false };
  }
  return { texto: `Entrega en ${diasHastaEntrega} días`, color: colors.textSecondary, urgente: false };
}

export default function TurnoCard({ turno, cliente, auto, onPress }) {
  const { getServicioById } = useServicios();
  const colorEstado = COLOR_PUNTO_ESTADO[turno.estado] ?? colors.textMuted;
  const vehiculoTexto = auto ? `${auto.marca} ${auto.modelo}` : "Auto sin datos";
  const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
  const infoEntrega = calcularInfoEntrega(turno, servicio);

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

      <View style={styles.entregaWrap}>
        {infoEntrega.urgente && (
          <Ionicons name="alert-circle" size={13} color={infoEntrega.color} />
        )}
        <Text
          style={[styles.entrega, { color: infoEntrega.color }, infoEntrega.urgente && styles.entregaUrgente]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {infoEntrega.texto}
        </Text>
      </View>
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
  entregaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
    maxWidth: 120,
  },
  entrega: {
    fontFamily: fonts.body,
    fontSize: 13,
    flexShrink: 1,
  },
  entregaUrgente: {
    fontFamily: fonts.bodyBold,
  },
});
