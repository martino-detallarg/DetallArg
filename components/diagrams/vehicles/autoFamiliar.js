import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/auto/familiar/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/auto/familiar/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/auto/familiar/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/auto/familiar/cenital/zonas.json";
import { AUTO_FAMILIAR_FRENTE_IMG } from "../../../assets/checkin-diagrams/auto/familiar/frente/imagen";
import { AUTO_FAMILIAR_ATRAS_IMG } from "../../../assets/checkin-diagrams/auto/familiar/atras/imagen";
import { AUTO_FAMILIAR_LATERAL_IMG } from "../../../assets/checkin-diagrams/auto/familiar/lateral/imagen";
import { AUTO_FAMILIAR_CENITAL_IMG } from "../../../assets/checkin-diagrams/auto/familiar/cenital/imagen";

export const VEHICLE_TYPE = "auto_familiar";

// Mismo patrón base64 que autoCoupe.js/autoSedan.js/autoDescapotable.js
// (require() de los PNG de assets/ causaba el bug de recorte/zoom). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: AUTO_FAMILIAR_FRENTE_IMG };
const atrasImg = { uri: AUTO_FAMILIAR_ATRAS_IMG };
const lateralImg = { uri: AUTO_FAMILIAR_LATERAL_IMG };
const cenitalImg = { uri: AUTO_FAMILIAR_CENITAL_IMG };

// Las 4 vistas reales de Auto / Familiar (zonas de
// assets/checkin-diagrams/auto/familiar/*/zonas.json).
//
// Pendiente, sin bloquear nada (viene marcado en el zonas.json de origen):
// la imagen de referencia de Atrás es la misma que la de Sedán (baúl con
// tapa separada), no un portón/tailgate real de familiar con vidrio
// integrado — a reprocesar si se consigue una referencia mejor. Lateral y
// Cenital sí son imágenes propias del familiar (techo extendido).
export const AUTO_FAMILIAR_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
