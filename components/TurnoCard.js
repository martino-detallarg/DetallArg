import { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useServicios } from "../data/ServicioContext";
import { useTurnos } from "../data/TurnoContext";
import { diferenciaEnDias } from "../utils/fecha";
import { calcularInstanteEntrega, obtenerInicioTurno } from "../utils/entregas";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLOR_PUNTO_ESTADO = {
  Pendiente: colors.error,
  "En proceso": colors.amber,
  Finalizado: colors.success,
  Entregado: colors.success,
};

// Refleja la entrega REAL calculada (inicio del turno + duración del
// servicio, con precisión de hora — ver utils/entregas.js), no la fecha en
// que se agendó el turno. Pendiente y En proceso comparten el mismo
// criterio a propósito (HomeScreen.js ya no distingue por estado para
// decidir urgencia): un turno vencido siempre muestra "Atrasado", sin
// importar si todavía no arrancó o si ya está en curso. "Atrasado" gana
// incluso sobre un Finalizado cuya hora prometida de entrega ya pasó sin
// que lo hayan retirado — mismo criterio de prioridad que usa HomeScreen.js
// para ordenar los 3 grupos de "Turnos activos".
function calcularInfoEntrega(turno, servicio) {
  if (turno.estado === "Entregado") {
    return { texto: "¡Entregado!", color: colors.success, urgente: false };
  }

  const inicio = obtenerInicioTurno(turno);
  if (!inicio) {
    // Turno sin fecha/hora parseable (ver "Sin fecha asignada" en
    // AgendaScreen.js): no hay con qué calcular una entrega.
    return { texto: turno.hora || "Sin fecha", color: colors.textSecondary, urgente: false };
  }

  const instanteEntrega = calcularInstanteEntrega(inicio, servicio);
  if (instanteEntrega.getTime() < Date.now()) {
    return { texto: "Atrasado", color: colors.error, urgente: true };
  }
  if (turno.estado === "Finalizado") {
    return { texto: "A entregar", color: colors.amber, urgente: true };
  }

  const diasHastaEntrega = diferenciaEnDias(new Date(), instanteEntrega);
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
    paddingVertical: 14,
    paddingHorizontal: 18,
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
