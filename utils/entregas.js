// Cálculo de entrega estimada de un turno, compartido entre AlmanaqueModal.js
// (Agenda), TurnoCard.js (Home/Agenda) y el orden de HomeScreen.js, para no
// duplicar el criterio.
import { diferenciaEnDias, parsearFechaDDMMAAAA, sumarDias } from "./fecha";

// Mismo set en toda la app (ver ESTADOS_TRABAJO en data/mockData.js): un
// trabajo ya cerrado se considera entregado, no tiene sentido seguir
// calculándole una fecha de entrega "pendiente".
export const ESTADOS_CERRADOS = new Set(["Finalizado", "Entregado"]);

// Fecha de entrega estimada de un turno: fecha de llegada + la duración del
// servicio asociado, SOLO cuando esa duración está cargada en días. Si es en
// horas, o no hay servicio/duración cargada, la entrega es el mismo día de
// la llegada (se devuelve `fechaLlegada` sin modificar).
export function calcularFechaEntrega(fechaLlegada, servicio) {
  if (servicio?.duracionUnidad === "dias" && servicio.duracionValor) {
    return sumarDias(fechaLlegada, servicio.duracionValor);
  }
  return fechaLlegada;
}

// Días de calendario que faltan para la entrega estimada de un turno (puede
// dar negativo si ya venció). null si el turno no tiene una fecha de
// llegada parseable, que es cuando no hay con qué calcular nada.
export function obtenerDiasHastaEntrega(turno, servicio) {
  const fechaLlegada = parsearFechaDDMMAAAA(turno.fecha);
  if (!fechaLlegada) return null;

  const fechaEntrega = calcularFechaEntrega(fechaLlegada, servicio);
  return diferenciaEnDias(new Date(), fechaEntrega);
}
