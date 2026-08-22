import { usuarioActual } from "./mockUser";

// Catálogo de planes de suscripción y su límite de empleados en "Mi
// Equipo". Sin pagos reales conectados todavía: el plan se cambia a mano
// desde el panel de pruebas de MiEquipoScreen.js (ver PanelPruebasPlan.js).
export const PLANES = {
  basico: { etiqueta: "Básico", limiteEmpleados: 0 },
  intermedio: { etiqueta: "Intermedio", limiteEmpleados: 1 },
  pro: { etiqueta: "PRO", limiteEmpleados: 3 },
};

export const ORDEN_PLANES = ["basico", "intermedio", "pro"];

// Datos iniciales de ejemplo para "Mi Taller". El logo arranca en null para
// mostrar el placeholder circular hasta que el usuario cargue uno real.
// El plan arranca en "basico" (el default real de un taller recién dado de
// alta, que todavía no contrató nada).
export const tallerInicial = {
  nombre: usuarioActual.empresa,
  logo: null,
  plan: "basico",
};

// Situación fiscal es opcional: arranca en null (sin seleccionar).
export const misDatosIniciales = {
  nombrePersonal: usuarioActual.nombre,
  web: "",
  correo: usuarioActual.email,
  telefono: "",
  ubicacion: "",
  situacionFiscal: null,
};

export const SITUACIONES_FISCALES = [
  "Monotributista",
  "Responsable Inscripto",
  "Exento",
  "Consumidor Final",
  "Prefiero no decir",
];
