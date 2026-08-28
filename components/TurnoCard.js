import { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useServicios } from "../data/ServicioContext";
import { useTurnos } from "../data/TurnoContext";
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

// Acción roja revelada al deslizar la tarjeta hacia la izquierda (patrón
// swipe-to-delete de iOS). El ancho fijo determina cuánto "rightWidth" mide
// Swipeable para el reveal completo; el alto lo hereda por stretch de la
// fila interna del propio Swipeable, sin necesidad de fijarlo a mano.
function AccionEliminar({ onPress }) {
  return (
    <TouchableOpacity style={styles.botonEliminar} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
      <Text style={styles.botonEliminarTexto}>Eliminar</Text>
    </TouchableOpacity>
  );
}

export default function TurnoCard({ turno, cliente, auto, onPress }) {
  const { getServicioById } = useServicios();
  const { eliminarTurno } = useTurnos();
  const swipeableRef = useRef(null);
  const colorEstado = COLOR_PUNTO_ESTADO[turno.estado] ?? colors.textMuted;
  const vehiculoTexto = auto ? `${auto.marca} ${auto.modelo}` : "Auto sin datos";
  const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
  const infoEntrega = calcularInfoEntrega(turno, servicio);

  async function confirmarEliminar() {
    try {
      await eliminarTurno(turno.id);
    } catch (err) {
      swipeableRef.current?.close();
      Alert.alert("No se pudo eliminar el turno. Probá de nuevo.");
    }
  }

  function handleEliminar() {
    Alert.alert(
      "Eliminar turno",
      "¿Eliminar este turno? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel", onPress: () => swipeableRef.current?.close() },
        { text: "Eliminar", style: "destructive", onPress: confirmarEliminar },
      ],
      { onDismiss: () => swipeableRef.current?.close() }
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => <AccionEliminar onPress={handleEliminar} />}
      overshootRight={false}
      containerStyle={styles.swipeWrapper}
    >
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  // El margen de separación con el resto de la lista vive acá (en el
  // contenedor de Swipeable), no en `card`: así la tarjeta ocupa todo el
  // ancho que Swipeable mide para calcular el reveal, y el botón rojo queda
  // alineado con el borde derecho real de la tarjeta en vez de "flotar" más
  // allá, en el hueco que dejaría el propio margen de `card`.
  swipeWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  botonEliminar: {
    width: 96,
    backgroundColor: colors.error,
    borderRadius: radii.card,
    ...continuousCorner,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  botonEliminarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
