import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/cenital/zonas.json";
import { UTILITARIO_MEDIANO_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/frente/imagen";
import { UTILITARIO_MEDIANO_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/atras/imagen";
import { UTILITARIO_MEDIANO_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/lateral/imagen";
import { UTILITARIO_MEDIANO_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_mediano/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_utilitario_acarrozado_mediano";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: UTILITARIO_MEDIANO_FRENTE_IMG };
const atrasImg = { uri: UTILITARIO_MEDIANO_ATRAS_IMG };
const lateralImg = { uri: UTILITARIO_MEDIANO_LATERAL_IMG };
const cenitalImg = { uri: UTILITARIO_MEDIANO_CENITAL_IMG };

// ⚠️ RENOMBRADO 23 agosto 2026: esta subdivisión se armó primero como
// "Chico" (referencia tipo Fiat Fiorino/similar), pero Augusto aclaró que
// en realidad corresponde a "Mediano" — reservando "Chico" para un
// furgón más chico todavía no procesado. Mismo diagrama y zonas de
// siempre, solo cambiaron el slug de carpeta (`utilitario_acarrozado_chico`
// → `utilitario_acarrozado_mediano`), el VEHICLE_TYPE, los nombres de
// export de imagen y este archivo (reemplaza a camionetaUtilitarioChico.js,
// que queda huérfano — ver README para el detalle de qué borrar en el repo).
//
// Primera subdivisión de la familia Utilitario acarrozado con carrocería
// CERRADA (furgón), distinta de Cabina simple y Doble cabina (que tienen
// caja de carga ABIERTA). Esto cambia el criterio de zonas en 3 de las 4
// vistas — ver detalle en camionetaUtilitarioGrande.js (mismo criterio) y
// en el README de assets/checkin-diagrams.
export const UTILITARIO_MEDIANO_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
