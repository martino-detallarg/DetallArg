import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { calcularFechaEntrega, ESTADOS_CERRADOS } from "../utils/entregas";
import {
  diferenciaEnDias,
  obtenerDiaSemanaHorario,
  obtenerDiasDeLaSemana,
  parsearFechaDDMMAAAA,
} from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Tarjeta tipo calendario para el dashboard de Home, al lado del anillo de
// "Turnos de hoy" (StatCard): muestra el día de hoy y un resumen breve de lo
// que viene el resto de la semana — turnos agendados (sin contar el de hoy,
// que ya cuenta el anillo) y entregas estimadas que caen mañana (mismo
// cálculo compartido que AlmanaqueModal.js, ver utils/entregas.js). Es de
// solo lectura, no escribe nada en TurnoContext/ServicioContext.
export default function WidgetCalendarioHome({ onPress }) {
  const { turnos } = useTurnos();
  const { getServicioById } = useServicios();

  const hoy = new Date();
  const diaSemana = obtenerDiaSemanaHorario(hoy).toUpperCase();
  const numeroDia = hoy.getDate();

  // Domingo de la semana actual (obtenerDiasDeLaSemana ya arranca en lunes,
  // mismo criterio que Agenda) — límite superior de "esta semana".
  const finDeSemana = obtenerDiasDeLaSemana(hoy)[6];
  const diasHastaFinDeSemana = diferenciaEnDias(hoy, finDeSemana);

  let turnosMasEstaSemana = 0;
  let entregasManana = 0;

  for (const turno of turnos) {
    const fechaLlegada = parsearFechaDDMMAAAA(turno.fecha);
    if (!fechaLlegada) continue;

    // Estrictamente después de hoy (>0) y hasta el domingo inclusive.
    const diasHastaLlegada = diferenciaEnDias(hoy, fechaLlegada);
    if (diasHastaLlegada > 0 && diasHastaLlegada <= diasHastaFinDeSemana) {
      turnosMasEstaSemana++;
    }

    if (!ESTADOS_CERRADOS.has(turno.estado)) {
      const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
      const fechaEntrega = calcularFechaEntrega(fechaLlegada, servicio);
      if (diferenciaEnDias(hoy, fechaEntrega) === 1) entregasManana++;
    }
  }

  const lineas = [];
  if (turnosMasEstaSemana > 0) {
    lineas.push(`${turnosMasEstaSemana} turno${turnosMasEstaSemana === 1 ? "" : "s"} más esta semana`);
  }
  if (entregasManana > 0) {
    lineas.push(`${entregasManana} entrega${entregasManana === 1 ? "" : "s"} mañana`);
  }
  if (lineas.length === 0) {
    lineas.push("Sin más turnos esta semana");
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.diaSemana}>{diaSemana}</Text>
      <Text style={styles.numeroDia}>{numeroDia}</Text>
      <View style={styles.lineas}>
        {lineas.map((linea, indice) => (
          <Text key={indice} style={styles.linea} numberOfLines={1} ellipsizeMode="tail">
            {linea}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 110,
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  diaSemana: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  numeroDia: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  lineas: {
    gap: 2,
  },
  linea: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
