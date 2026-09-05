// 3 estilos curados para el Catálogo (reemplazan a los 3 anteriores,
// Clásica/Oscura Premium/Clara Moderna) — ver el Editor de Catálogo
// (screens/EditorCatalogoScreen.js) donde el taller elige uno como base y
// puede repisar el acento con uno de los 3 tonos de `paletaColores`.
//
// Colores verificados contra el mockup de referencia (los 3 diseños venían
// en oklch(), acá van ya convertidos a hex). `googleFontsHref` es el <link>
// que utils/catalogoPdf.js inyecta en el <head> del PDF para que las
// tipografías carguen sin tener que embeber los archivos de fuente.
export const PLANTILLAS_CATALOGO = {
  dark_luxury: {
    nombre: "Dark Luxury",
    colorFondo: "#0B0B0C",
    colorPrimario: "#F5F0E6",
    colorAcento: "#D6B174",
    colorTexto: "#EDEAE3",
    colorTextoSecundario: "#9C9791",
    fontTitulo: "'Cormorant Garamond', Georgia, serif",
    fontCuerpo: "'Jost', Helvetica, Arial, sans-serif",
    paletaColores: ["#D6B174", "#F7D293", "#B8925A"],
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@300;400;500&display=swap",
  },
  clean_apple: {
    nombre: "Clean-Apple",
    colorFondo: "#FAFAFA",
    colorPrimario: "#1D1D1F",
    colorAcento: "#446C95",
    colorTexto: "#1D1D1F",
    colorTextoSecundario: "#6E6E73",
    fontTitulo: "'Manrope', Helvetica, Arial, sans-serif",
    fontCuerpo: "'Manrope', Helvetica, Arial, sans-serif",
    paletaColores: ["#446C95", "#285077", "#6E93B8"],
    googleFontsHref: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap",
  },
  sport_tecnico: {
    nombre: "Sport-Técnico",
    colorFondo: "#1A1A1A",
    colorPrimario: "#FFFFFF",
    colorAcento: "#E8491D",
    colorTexto: "#F2F2F2",
    colorTextoSecundario: "#B0B0B0",
    fontTitulo: "'Oswald', Impact, sans-serif",
    fontCuerpo: "'Barlow', Helvetica, Arial, sans-serif",
    paletaColores: ["#E8491D", "#D62828", "#F77F00"],
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap",
  },
};
