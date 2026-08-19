export const clientes = [
  { id: "c1", nombre: "Juan Pérez", telefono: "11 2345-6789" },
  { id: "c2", nombre: "Marina López", telefono: "11 3456-7890" },
];

export const autos = [
  { id: "a1", marca: "Volkswagen", modelo: "Golf", patente: "AB123CD", color: "Gris", clienteId: "c1" },
  { id: "a2", marca: "Toyota", modelo: "Hilux", patente: "AC456EF", color: "Blanca", clienteId: "c1" },
  { id: "a3", marca: "Fiat", modelo: "Cronos", patente: "AD789GH", color: "Negro", clienteId: "c2" },
];

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
