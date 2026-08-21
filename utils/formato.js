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
