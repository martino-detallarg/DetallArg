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

// Horario de atención de referencia (Mis Horarios). Por ahora es solo
// informativo: no restringe qué horas se pueden elegir en el wizard de
// Trabajo Nuevo. Arranca con un horario típico de taller (L-V 9 a 18,
// sábado medio día, domingo cerrado) para no mostrar la pantalla vacía.
export const horariosIniciales = [
  { dia: "Lunes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Martes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Miércoles", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Jueves", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Viernes", abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
  { dia: "Sábado", abierto: true, horaApertura: "09:00", horaCierre: "13:00" },
  { dia: "Domingo", abierto: false, horaApertura: "09:00", horaCierre: "18:00" },
];
