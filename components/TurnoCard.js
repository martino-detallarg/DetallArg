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

// Frase relativa "hoy" / "mañana" / "en X días" a partir de una cantidad de
// días ya calculada — siempre respecto de AHORA real, sin importar qué día
// se esté mirando en Agenda (ver `diaVista` más abajo): es un dato sobre el
// turno ("cuánto falta desde ahora"), no sobre qué día de su rango estás
// navegando.
function fraseRelativaEntrega(diasHastaEntrega) {
  if (diasHastaEntrega === 0) return "hoy";
  if (diasHastaEntrega === 1) return "mañana";
  return `en ${diasHastaEntrega} días`;
}

// Refleja la entrega REAL calculada (inicio del turno + duración del
// servicio, con precisión de hora — ver utils/entregas.js), no la fecha en
// que se agendó el turno. Pendiente y En proceso comparten el mismo
// criterio a propósito (HomeScreen.js ya no distingue por estado para
// decidir urgencia): un turno vencido siempre muestra "Atrasado", sin
// importar si todavía no arrancó, si está en curso, o en qué día de su
// rango se lo esté mirando. "Atrasado" gana incluso sobre un Finalizado
// cuya hora prometida de entrega ya pasó sin que lo hayan retirado — mismo
// criterio de prioridad que usa HomeScreen.js para ordenar los 3 grupos de
// "Turnos activos".
//
// `diaVista` (opcional): el día que se está mostrando en Agenda, para un
// turno que abarca más de un día. Sin `diaVista` (uso en Home, siempre
// "ahora mismo") el mensaje es siempre el de la entrega, como hasta ahora.
// Con `diaVista`, un turno todavía activo (no atrasado, no Finalizado)
// muestra un mensaje distinto según en qué parte de su rango caiga ese
// día: "Ingresó hoy" en su día de inicio, "En curso — entrega en X días"
// en los días intermedios, o el mensaje normal de entrega en su día de
// entrega (que gana el empate si inicio y entrega caen el mismo día).
function calcularInfoEntrega(turno, servicio, diaVista) {
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
  // Sin diaVista, o si diaVista coincide con el día de entrega: mismo
  // mensaje de siempre. El empate inicio == entrega (turno de un solo día,
  // el caso más común) también cae acá, a propósito.
  const esDiaDeEntrega = !diaVista || diferenciaEnDias(diaVista, instanteEntrega) === 0;
  if (!esDiaDeEntrega) {
    const esDiaDeInicio = diferenciaEnDias(inicio, diaVista) === 0;
    if (esDiaDeInicio) {
      return { texto: "Ingresó hoy", color: colors.textSecondary, urgente: false };
    }
    return {
      texto: `En curso — entrega ${fraseRelativaEntrega(diasHastaEntrega)}`,
      color: colors.textSecondary,
      urgente: false,
    };
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

export default function TurnoCard({ turno, cliente, auto, onPress, diaVista }) {
  const { getServicioById } = useServicios();
  const { eliminarTurno } = useTurnos();
  const swipeableRef = useRef(null);
  const colorEstado = COLOR_PUNTO_ESTADO[turno.estado] ?? colors.textMuted;
  const vehiculoTexto = auto ? `${auto.marca} ${auto.modelo}` : "Auto sin datos";
  const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
  const infoEntrega = calcularInfoEntrega(turno, servicio, diaVista);

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
