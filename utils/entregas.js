// Cálculo de entrega estimada de un turno. `calcularFechaEntrega` es el
// cálculo histórico a nivel DÍA, usado por AlmanaqueModal.js y
// WidgetCalendarioHome.js (solo necesitan saber en qué día cae la entrega
// para marcar el calendario, no a qué hora). `obtenerInicioTurno` /
// `calcularInstanteEntrega` son la versión con precisión de HORA, usada por
// TurnoCard.js (mensaje de cada burbuja) y HomeScreen.js (orden de "Turnos
// activos" por urgencia) — hace falta esa precisión porque un servicio
// puede durar horas (ej. "3 horas") en vez de días, y ahí sí importa la
// hora exacta de llegada, no solo el día.
import { combinarFechaYHora, parsearFechaDDMMAAAA, sumarDias } from "./fecha";

// Mismo set en toda la app (ver ESTADOS_TRABAJO en data/mockData.js): un
// trabajo ya cerrado se considera entregado, no tiene sentido seguir
// calculándole una fecha de entrega "pendiente".
export const ESTADOS_CERRADOS = new Set(["Finalizado", "Entregado"]);

// Fecha de entrega estimada de un turno, a nivel día: fecha de llegada + la
// duración del servicio asociado, SOLO cuando esa duración está cargada en
// días. Si es en horas, o no hay servicio/duración cargada, la entrega es
// el mismo día de la llegada (se devuelve `fechaLlegada` sin modificar) —
// alcanza para los consumidores que solo marcan días, no horas.
export function calcularFechaEntrega(fechaLlegada, servicio) {
  if (servicio?.duracionUnidad === "dias" && servicio.duracionValor) {
    return sumarDias(fechaLlegada, servicio.duracionValor);
  }
  return fechaLlegada;
}

// Instante real de inicio de un turno: fecha + hora de llegada combinadas.
// null si el turno no tiene una fecha parseable (ver "Sin fecha asignada"
// en AgendaScreen.js) — no hay con qué calcular nada a partir de ahí.
export function obtenerInicioTurno(turno) {
  const fechaLlegada = parsearFechaDDMMAAAA(turno.fecha);
  return fechaLlegada ? combinarFechaYHora(fechaLlegada, turno.hora) : null;
}

// Instante estimado de entrega, con precisión de hora: inicio + duración
// del servicio. "horas" suma horas exactas (la entrega puede caer más
// tarde el mismo día, o pasar a la madrugada del día siguiente); "días"
// suma días de calendario conservando la hora de inicio (no tiene sentido
// prometer una hora exacta para un trabajo de varios días). Sin servicio o
// sin duración cargada, la entrega es el propio inicio del turno — mismo
// criterio que calcularFechaEntrega, ahora con hora. `inicioTurno` puede
// ser null (turno sin fecha/hora válida): se propaga tal cual.
export function calcularInstanteEntrega(inicioTurno, servicio) {
  if (!inicioTurno) return null;
  if (!servicio?.duracionValor || !servicio?.duracionUnidad) return inicioTurno;
  if (servicio.duracionUnidad === "horas") {
    return new Date(inicioTurno.getTime() + servicio.duracionValor * 3600000);
  }
  return sumarDias(inicioTurno, servicio.duracionValor);
}
