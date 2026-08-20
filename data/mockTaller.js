import { usuarioActual } from "./mockUser";

// Datos iniciales de ejemplo para "Mi Taller". El logo arranca en null para
// mostrar el placeholder circular hasta que el usuario cargue uno real.
export const tallerInicial = {
  nombre: usuarioActual.empresa,
  logo: null,
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
