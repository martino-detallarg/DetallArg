// Traduce los mensajes de error de Supabase Auth (siempre en inglés) a algo
// entendible en español para mostrar en los formularios de Login/Signup.
export function mensajeErrorAuth(error) {
  const mensaje = error?.message ?? "";

  if (mensaje.includes("Invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (mensaje.includes("Email not confirmed")) {
    return "Todavía no confirmaste tu email. Revisá tu casilla de correo.";
  }
  if (mensaje.includes("User already registered")) {
    return "Ya existe una cuenta creada con ese email.";
  }
  if (mensaje.includes("Password should be at least")) {
    return mensaje.replace("Password should be at least", "La contraseña debe tener al menos");
  }
  if (mensaje.includes("Unable to validate email address")) {
    return "El email no es válido.";
  }
  if (mensaje.includes("Network request failed") || mensaje.includes("fetch")) {
    return "No hay conexión. Revisá tu internet e intentá de nuevo.";
  }
  if (mensaje.includes("Token has expired or is invalid")) {
    return "El código venció o es incorrecto. Pedí uno nuevo.";
  }
  if (mensaje.includes("For security purposes") || mensaje.includes("rate limit")) {
    return "Esperá un minuto antes de volver a intentarlo.";
  }

  return mensaje || "Ocurrió un error inesperado. Probá de nuevo.";
}
