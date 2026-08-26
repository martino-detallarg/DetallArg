// Orden de las etapas por las que pasa un trabajo, de menos a más avanzado.
// Vive acá (no hardcodeado en TrabajoDetalleModal ni en TurnoCard) para
// poder ampliarlo más adelante a etapas más específicas por tipo de
// tratamiento sin tener que rehacer esas pantallas.
export const ESTADOS_TRABAJO = ["Pendiente", "En proceso", "Finalizado", "Entregado"];

// Sin turnos de ejemplo: la app arranca sin nada cargado en Home. Si en
// algún momento se vuelven a sembrar turnos acá, los clienteId/autoId
// tienen que coincidir con los IDs de clientes/vehículos de ejemplo en
// ClienteContext.js — si se cambian los de un lado sin el otro, quedan
// referencias sin resolver (TurnoCard lo contempla mostrando "Cliente sin
// datos" / "Auto sin datos", pero no debería pasar con los datos de fábrica).
export const turnosIniciales = [];

export function separarMarcaModelo(texto) {
  const partes = texto.trim().split(/\s+/);
  const marca = partes[0] ?? "";
  const modelo = partes.slice(1).join(" ");
  return { marca, modelo };
}
