// Traduce errores de una carga inicial (SELECT) contra Supabase a un mensaje
// entendible en español. Distinto de mensajeErrorAuth (utils/auth.js), que
// es específico de los mensajes de Supabase Auth — este es genérico para
// cualquier fetch de datos (Taller, Horarios, Clientes, Equipo).
export function mensajeErrorCarga(error, quePlural = "los datos") {
  const mensaje = error?.message ?? "";

  if (mensaje.includes("Network request failed") || mensaje.includes("fetch")) {
    return "No hay conexión. Revisá tu internet e intentá de nuevo.";
  }

  return `No pudimos cargar ${quePlural}. Probá de nuevo.`;
}
