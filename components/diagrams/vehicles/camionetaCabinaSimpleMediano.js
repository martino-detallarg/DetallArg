import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/cenital/zonas.json";
import { CAMIONETA_CSM_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/frente/imagen";
import { CAMIONETA_CSM_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/atras/imagen";
import { CAMIONETA_CSM_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/lateral/imagen";
import { CAMIONETA_CSM_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_mediano/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_cabina_simple_mediano";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: CAMIONETA_CSM_FRENTE_IMG };
const atrasImg = { uri: CAMIONETA_CSM_ATRAS_IMG };
const lateralImg = { uri: CAMIONETA_CSM_LATERAL_IMG };
const cenitalImg = { uri: CAMIONETA_CSM_CENITAL_IMG };

// Segunda carrocería de la familia Camioneta: Cabina simple / Mediano
// (referencia tipo Toyota Hilux cabina simple). Mismo criterio de zonas
// que Cabina simple chico en Frente (9 zonas), Lateral (4 zonas) y
// Cenital (4 zonas, "caja" es la candidata para "Rasgada").
//
// Atrás SÍ cambia respecto a Chico: acá la referencia trae un paragolpes
// trasero real, distinto de la compuerta (línea de partición visible en
// la imagen) — por eso son 5 zonas (vidrio, compuerta, luz_izquierda,
// luz_derecha, paragolpes_trasero), igual criterio que la familia Auto,
// en vez de las 4 zonas sin paragolpes de Cabina simple chico.
export const CAMIONETA_CSM_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
