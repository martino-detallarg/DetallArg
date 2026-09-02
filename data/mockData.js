// Orden de las etapas por las que pasa un trabajo, de menos a más avanzado.
// Vive acá (no hardcodeado en TrabajoDetalleModal ni en TurnoCard) para
// poder ampliarlo más adelante a etapas más específicas por tipo de
// tratamiento sin tener que rehacer esas pantallas.
export const ESTADOS_TRABAJO = ["Pendiente", "En proceso", "Finalizado", "Entregado"];

export function separarMarcaModelo(texto) {
  const partes = texto.trim().split(/\s+/);
  const marca = partes[0] ?? "";
  const modelo = partes.slice(1).join(" ");
  return { marca, modelo };
}
