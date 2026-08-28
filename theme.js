export const colors = {
  bg: "#040303",
  surface: "#0E1315",
  surface2: "#182023",
  textPrimary: "#FFFFFF",
  textSecondary: "#C0C9CA",
  textMuted: "#758386",
  accent: "#529CC1",
  accentLight: "#72B2D5",
  accentDark: "#36494E",
  borderSubtle: "rgba(192, 201, 202, 0.12)",
  borderAccent: "rgba(82, 156, 193, 0.38)",
  error: "#B5564A",
  amber: "#D9A441",
  success: "#5DCAA5",
  // Versiones tenues (18% opacidad) de amber/success, para fondos de
  // indicadores tipo "anillo" (ver AlmanaqueModal.js) sin tapar el color de
  // fondo de la tarjeta/modal detrás.
  successTint: "rgba(93, 202, 165, 0.18)",
  amberTint: "rgba(217, 164, 65, 0.18)",
};

export const radii = {
  card: 20,
  button: 14,
};

// Esquinas estilo iOS ("squircle"): más suaves que un borderRadius circular
// común. borderCurve es una prop de RN que solo tiene efecto en iOS; en
// Android se ignora sin romper nada, así que se puede spread siempre.
export const continuousCorner = {
  borderCurve: "continuous",
};

export const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 4,
};

// Versión más liviana para elementos chicos y repetidos (inputs), donde la
// sombra completa se siente pesada si hay varios apilados.
export const shadowSubtle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 2,
};

export const fonts = {
  heading: "Archivo_800ExtraBold",
  headingBlack: "Archivo_900Black",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
};
