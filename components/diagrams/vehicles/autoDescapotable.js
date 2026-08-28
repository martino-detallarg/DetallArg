import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/auto/descapotable/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/auto/descapotable/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/auto/descapotable/lateral/zonas.json";
import { AUTO_DESCAPOTABLE_FRENTE_IMG } from "../../../assets/checkin-diagrams/auto/descapotable/frente/imagen";
import { AUTO_DESCAPOTABLE_ATRAS_IMG } from "../../../assets/checkin-diagrams/auto/descapotable/atras/imagen";
import { AUTO_DESCAPOTABLE_LATERAL_IMG } from "../../../assets/checkin-diagrams/auto/descapotable/lateral/imagen";

export const VEHICLE_TYPE = "auto_descapotable";

// Mismo patrón base64 que autoCoupe.js/autoSedan.js (require() de los PNG
// de assets/ causaba el bug de recorte/zoom). RN necesita el source como
// { uri: dataUri }, no el string pelado.
const frenteImg = { uri: AUTO_DESCAPOTABLE_FRENTE_IMG };
const atrasImg = { uri: AUTO_DESCAPOTABLE_ATRAS_IMG };
const lateralImg = { uri: AUTO_DESCAPOTABLE_LATERAL_IMG };

// A diferencia del resto de la familia Auto, Descapotable NO tiene vista
// Cenital: con la capota abajo no hay techo que inspeccionar desde arriba,
// y los demás paneles visibles desde ahí (guardabarros, capó, baúl) ya
// están cubiertos por Frente/Atrás/Lateral. El carrusel de
// InspeccionVisualStep queda con 3 páginas en vez de 4 para esta
// carrocería — es esperado, no un faltante. Ver README de
// assets/checkin-diagrams para el detalle y la nota sobre la zona
// "capota" (reemplaza a "vidrio" en Atrás/Lateral: es la lona guardada,
// no un vidrio fijo).
export const AUTO_DESCAPOTABLE_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
};
