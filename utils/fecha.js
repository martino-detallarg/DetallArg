// Helpers de fecha para la Agenda. El campo `fecha` de un turno es texto
// libre cargado a mano en el wizard (placeholder "Ej: 18/08/2026", sin date
// picker todavía), así que el parseo es best-effort: si no matchea
// DD/MM/AAAA o el día no existe en ese mes/año, se trata como sin fecha.

const DIAS_SEMANA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_SEMANA_LARGO = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const MESES_LARGO = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function parsearFechaDDMMAAAA(texto) {
  if (!texto) return null;
  const match = texto.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  const fecha = new Date(anio, mes - 1, dia);

  // new Date() "rueda" fechas inválidas (ej: 31/02 pasa a marzo) en vez de
  // fallar, así que se chequea que el roundtrip coincida con lo tipeado.
  const esValida =
    fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;

  return esValida ? fecha : null;
}

export function esMismoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function sumarDias(fecha, cantidad) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + cantidad);
  return nueva;
}

// Los 7 días (lunes a domingo) de la semana que contiene `fechaBase`.
export function obtenerDiasDeLaSemana(fechaBase) {
  const diaSemana = fechaBase.getDay(); // 0 = domingo ... 6 = sábado
  const offsetHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = sumarDias(fechaBase, offsetHastaLunes);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

export function formatearDiaSemanaCorto(fecha) {
  return DIAS_SEMANA_CORTO[fecha.getDay()];
}

export function formatearFechaLarga(fecha) {
  return `${DIAS_SEMANA_LARGO[fecha.getDay()]} ${fecha.getDate()} de ${MESES_LARGO[fecha.getMonth()]}`;
}

// Inversa de parsearFechaDDMMAAAA: arma el string "DD/MM/AAAA" a partir de
// la fecha elegida en el date picker nativo, para que el valor guardado
// siga siendo compatible con el resto de la app (que todavía trata la
// fecha del turno como texto plano, no como Date/ISO).
export function formatearFechaDDMMAAAA(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}
