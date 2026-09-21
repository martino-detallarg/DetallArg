// Cálculo de entrega estimada de un turno, con precisión de HORA:
// `obtenerInicioTurno`/`calcularInstanteEntrega` (usadas por TurnoCard.js
// para el mensaje de cada burbuja y por HomeScreen.js para el orden de
// "Turnos activos") y `obtenerRangoTurno` (que las combina, usada además
// por AgendaScreen.js y AlmanaqueModal.js para saber qué días "toca" un
// turno que abarca más de uno) — hace falta esa precisión porque un
// servicio puede durar horas (ej. "3 horas") en vez de días, y ahí sí
// importa la hora exacta de llegada, no solo el día.
import { combinarFechaYHora, diferenciaEnDias, parsearFechaDDMMAAAA, sumarDias } from "./fecha";

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
// sin duración cargada, la entrega es el propio inicio del turno.
// `inicioTurno` puede ser null (turno sin fecha/hora válida): se propaga
// tal cual.
export function calcularInstanteEntrega(inicioTurno, servicio) {
  if (!inicioTurno) return null;
  if (!servicio?.duracionValor || !servicio?.duracionUnidad) return inicioTurno;
  if (servicio.duracionUnidad === "horas") {
    return new Date(inicioTurno.getTime() + servicio.duracionValor * 3600000);
  }
  return sumarDias(inicioTurno, servicio.duracionValor);
}

// Resumen del rango completo de un turno: instante de inicio, instante de
// entrega estimada, y si ya está atrasado (respecto de AHORA real, no del
// día que se esté mirando en Agenda/Almanaque — "atrasado" es un hecho
// absoluto del turno, no depende de qué día del rango se consulte). null si
// el turno no tiene fecha/hora parseable (ver "Sin fecha asignada" en
// AgendaScreen.js) — no hay rango que armar.
export function obtenerRangoTurno(turno, servicio) {
  const inicio = obtenerInicioTurno(turno);
  if (!inicio) return null;

  const instanteEntrega = calcularInstanteEntrega(inicio, servicio);
  return {
    inicio,
    instanteEntrega,
    atrasado: instanteEntrega.getTime() < Date.now(),
  };
}

// ¿El día `dia` cae dentro del rango [inicio, instanteEntrega] del turno,
// inclusive por día de calendario (no por instante exacto)? Usa
// diferenciaEnDias (normaliza a medianoche) para no perder un día por
// culpa de la hora exacta de inicio/entrega.
export function diaEstaEnRango(rango, dia) {
  return diferenciaEnDias(rango.inicio, dia) >= 0 && diferenciaEnDias(dia, rango.instanteEntrega) >= 0;
}
