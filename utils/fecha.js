// Helpers de fecha y hora compartidos por varias partes de la app: la
// Agenda, el horario de atención de Mis Horarios (parsearHoraHHMM/
// formatearHoraHHMM), el date/time picker del wizard de Trabajo Nuevo
// (parsearFechaDDMMAAAA/formatearFechaDDMMAAAA, ver DatosServicioStep.js) y
// la traducción DD/MM/AAAA <-> ISO contra la columna `date` de `turnos` en
// Supabase (convertirFechaAISO/convertirFechaDesdeISO, ver TurnoContext.js).
// El campo `fecha` de un turno se carga hoy con el date picker nativo, pero
// el parseo sigue siendo best-effort por si llega un valor con otro formato:
// si no matchea DD/MM/AAAA o el día no existe en ese mes/año, se trata como
// sin fecha.

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
// Nombres capitalizados "Lunes".."Domingo", en el mismo orden que
// Date.getDay() (0 = domingo) — para cruzar una fecha del wizard contra
// `TallerContext.horarios`, que usa exactamente estos strings como `dia`
// (y así están cargados en la tabla `horarios_atencion` de Supabase).
const DIAS_SEMANA_HORARIO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
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

export function obtenerDiaSemanaHorario(fecha) {
  return DIAS_SEMANA_HORARIO[fecha.getDay()];
}

export function formatearFechaLarga(fecha) {
  return `${DIAS_SEMANA_LARGO[fecha.getDay()]} ${fecha.getDate()} de ${MESES_LARGO[fecha.getMonth()]}`;
}

// "agosto 2026" — para el label chico de mes/año arriba de la tira de días
// de la Agenda (el textTransform: "uppercase" del estilo se encarga de
// mostrarlo en mayúsculas, mismo criterio que el resto de los labels chicos
// en fonts.mono).
export function formatearMesAnio(fecha) {
  return `${MESES_LARGO[fecha.getMonth()]} ${fecha.getFullYear()}`;
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

// Par de helpers análogos a los de fecha, pero para el campo "HH:MM" de los
// horarios de atención (Mis Horarios). parsearHoraHHMM devuelve un Date con
// esa hora seteada sobre el día actual (solo importan horas/minutos) para
// poder inicializar el date picker en modo "time".
export function parsearHoraHHMM(texto) {
  if (!texto) return null;
  const match = texto.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const horas = Number(match[1]);
  const minutos = Number(match[2]);
  if (horas > 23 || minutos > 59) return null;

  const fecha = new Date();
  fecha.setHours(horas, minutos, 0, 0);
  return fecha;
}

export function formatearHoraHHMM(fecha) {
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

// Traducción DD/MM/AAAA (formato de turno.fecha en toda la app) <-> ISO
// (formato real de la columna `date` de turnos en Supabase). Reutilizan el
// parseo/validación ya existente en vez de duplicarlo.
export function convertirFechaAISO(ddmmaaaa) {
  const fecha = parsearFechaDDMMAAAA(ddmmaaaa);
  if (!fecha) return null;
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function convertirFechaDesdeISO(iso) {
  if (!iso) return "";
  const [anio, mes, dia] = iso.split("-").map(Number);
  return formatearFechaDDMMAAAA(new Date(anio, mes - 1, dia));
}
