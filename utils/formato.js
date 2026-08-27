// Formato de moneda compartido para no repetir el mismo Intl.NumberFormat
// en cada pantalla de Finanzas.
const formateadorPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPesos(monto) {
  return formateadorPesos.format(monto ?? 0);
}

// Duración de un servicio (Mis Servicios / Catálogo): "2 horas" / "1 día".
// Sin minutos — ver ServicioModal.js, duracionUnidad es "horas" o "dias".
export function formatearDuracion(valor, unidad) {
  if (!valor) return "No especificado";
  if (unidad === "dias") return `${valor} ${valor === 1 ? "día" : "días"}`;
  return `${valor} ${valor === 1 ? "hora" : "horas"}`;
}
