// Los clientes/autos de ejemplo que originaban c1/c2/a1/a2/a3 se migraron a
// ClienteContext (que arranca vacío). Estos turnos de ejemplo quedan con
// referencias sin resolver hasta que se carguen clientes reales desde la
// pantalla de Clientes; TurnoCard ya contempla ese caso mostrando "Cliente
// sin datos" / "Auto sin datos".
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
