import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/suv/grande/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/suv/grande/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/suv/grande/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/suv/grande/cenital/zonas.json";
import { SUV_GRANDE_FRENTE_IMG } from "../../../assets/checkin-diagrams/suv/grande/frente/imagen";
import { SUV_GRANDE_ATRAS_IMG } from "../../../assets/checkin-diagrams/suv/grande/atras/imagen";
import { SUV_GRANDE_LATERAL_IMG } from "../../../assets/checkin-diagrams/suv/grande/lateral/imagen";
import { SUV_GRANDE_CENITAL_IMG } from "../../../assets/checkin-diagrams/suv/grande/cenital/imagen";

export const VEHICLE_TYPE = "suv_grande";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: SUV_GRANDE_FRENTE_IMG };
const atrasImg = { uri: SUV_GRANDE_ATRAS_IMG };
const lateralImg = { uri: SUV_GRANDE_LATERAL_IMG };
const cenitalImg = { uri: SUV_GRANDE_CENITAL_IMG };

// Segunda subdivisión de SUV (agregada 24 agosto 2026). Referencia tipo
// SUV grande 3 filas (Toyota Fortuner/similar). Mismo criterio de zonas
// que SUV Compacto (ver suvCompacto.js) — carrocería cerrada de 4
// puertas, sin caja de carga, calcado de Auto Sedán/Familiar/Hatchback:
//
// - Frente: 9 zonas, mismo criterio que el resto de la app.
// - Lateral (5 zonas): guardabarro_delantero, puerta_delantera,
//   puerta_trasera, vidrio, `cola` (cuarto trasero + portón).
// - Cenital (3 zonas): techo, parante_izq, parante_der.
// - Atrás (5 zonas): vidrio, `baul` (portón trasero), luz_izquierda,
//   luz_derecha, paragolpes_trasero.
export const SUV_GRANDE_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
