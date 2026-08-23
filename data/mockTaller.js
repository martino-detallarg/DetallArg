// Catálogo de planes de suscripción y su límite de empleados en "Mi
// Equipo". Sin pagos reales conectados todavía: el plan se cambia a mano
// desde el panel de pruebas de MiEquipoScreen.js (ver PanelPruebasPlan.js).
export const PLANES = {
  basico: { etiqueta: "Básico", limiteEmpleados: 0 },
  intermedio: { etiqueta: "Intermedio", limiteEmpleados: 1 },
  pro: { etiqueta: "PRO", limiteEmpleados: 3 },
};

export const ORDEN_PLANES = ["basico", "intermedio", "pro"];

// Nota: ya no hay `tallerInicial`/`misDatosIniciales` acá — TallerContext.js
// trae los datos reales del taller desde Supabase (fila creada por el
// trigger handle_new_user al registrarse, ver supabase/trigger_nuevo_usuario.sql)
// en vez de sembrarlos de un usuario mock.

export const SITUACIONES_FISCALES = [
  "Monotributista",
  "Responsable Inscripto",
  "Exento",
  "Consumidor Final",
  "Prefiero no decir",
];

// Horario de atención de referencia (Mis Horarios). Cumple doble función:
// (1) valor por defecto de `TallerContext.horarios` mientras se resuelve el
// fetch a Supabase, y (2) plantilla que `TallerContext` usa para sembrar las
// 7 filas de `horarios_atencion` en Supabase la primera vez que un taller
// (nuevo o ya existente de antes de esta migración) no tiene ninguna
// cargada todavía. Horario típico de taller (L-V 9 a 18, sábado medio día,
// domingo cerrado).
export const horariosIniciales = [
  { dia: "Lunes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Martes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Miércoles", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Jueves", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Viernes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Sábado", abierto: true, horaApertura: "09:00", horaCierre: "13:00" },
  { dia: "Domingo", abierto: false, horaApertura: "09:00", horaCierre: "18:00" },
];
