import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/auto/hatchback/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/auto/hatchback/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/auto/hatchback/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/auto/hatchback/cenital/zonas.json";
import { AUTO_HATCHBACK_FRENTE_IMG } from "../../../assets/checkin-diagrams/auto/hatchback/frente/imagen";
import { AUTO_HATCHBACK_ATRAS_IMG } from "../../../assets/checkin-diagrams/auto/hatchback/atras/imagen";
import { AUTO_HATCHBACK_LATERAL_IMG } from "../../../assets/checkin-diagrams/auto/hatchback/lateral/imagen";
import { AUTO_HATCHBACK_CENITAL_IMG } from "../../../assets/checkin-diagrams/auto/hatchback/cenital/imagen";

export const VEHICLE_TYPE = "auto_hatchback";

// Mismo patrón base64 que el resto de la familia Auto (require() de los
// PNG de assets/ causaba el bug de recorte/zoom). RN necesita el source
// como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: AUTO_HATCHBACK_FRENTE_IMG };
const atrasImg = { uri: AUTO_HATCHBACK_ATRAS_IMG };
const lateralImg = { uri: AUTO_HATCHBACK_LATERAL_IMG };
const cenitalImg = { uri: AUTO_HATCHBACK_CENITAL_IMG };

// Las 4 vistas reales de Auto / Hatchback (zonas de
// assets/checkin-diagrams/auto/hatchback/*/zonas.json).
//
// A diferencia de Sedán/Familiar, la imagen de referencia acá es distinta
// (un VW Golf, no el Audi del resto de la familia Auto) — Frente/Atrás/
// Lateral/Cenital son todas zonas hechas a medida, ninguna calcada. La
// vista Atrás sí trae un portón trasero real de hatchback (vidrio + panel
// inferior articulados en una sola pieza), a diferencia del Familiar que
// quedó con el baúl del Sedán reciclado (ver README de
// assets/checkin-diagrams).
export const AUTO_HATCHBACK_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
