// Orden de las etapas por las que pasa un trabajo, de menos a más avanzado.
// Vive acá (no hardcodeado en TrabajoDetalleModal ni en TurnoCard) para
// poder ampliarlo más adelante a etapas más específicas por tipo de
// tratamiento sin tener que rehacer esas pantallas.
export const ESTADOS_TRABAJO = ["Pendiente", "En proceso", "Finalizado", "Entregado"];

// Los clienteId/autoId de acá (c1/c2, a1/a2/a3) tienen que coincidir con los
// IDs de los clientes/vehículos de ejemplo en ClienteContext.js — si se
// cambian los de un lado sin el otro, estos turnos vuelven a quedar con
// referencias sin resolver (TurnoCard lo contempla mostrando "Cliente sin
// datos" / "Auto sin datos", pero no debería pasar con los datos de fábrica).
export const turnosIniciales = [
  { id: "t1", clienteId: "c1", autoId: "a1", hora: "09:00", servicio: "Lavado + encerado", estado: "Pendiente" },
  { id: "t2", clienteId: "c2", autoId: "a3", hora: "10:30", servicio: "Limpieza de tapizados", estado: "En proceso" },
  { id: "t3", clienteId: "c1", autoId: "a2", hora: "12:00", servicio: "Detailing completo", estado: "Pendiente" },
];

export function separarMarcaModelo(texto) {
  const partes = texto.trim().split(/\s+/);
  const marca = partes[0] ?? "";
  const modelo = partes.slice(1).join(" ");
  return { marca, modelo };
}
