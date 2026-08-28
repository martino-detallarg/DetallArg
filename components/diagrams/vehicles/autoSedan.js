import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/auto/sedan/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/auto/sedan/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/auto/sedan/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/auto/sedan/cenital/zonas.json";
import { AUTO_SEDAN_FRENTE_IMG } from "../../../assets/checkin-diagrams/auto/sedan/frente/imagen";
import { AUTO_SEDAN_ATRAS_IMG } from "../../../assets/checkin-diagrams/auto/sedan/atras/imagen";
import { AUTO_SEDAN_LATERAL_IMG } from "../../../assets/checkin-diagrams/auto/sedan/lateral/imagen";
import { AUTO_SEDAN_CENITAL_IMG } from "../../../assets/checkin-diagrams/auto/sedan/cenital/imagen";

export const VEHICLE_TYPE = "auto_sedan";

// Imágenes embebidas en base64 (mismo patrón que autoCoupe.js — el
// require(".../diagrama.png") fue el bug que causaba el recorte/zoom en
// Coupé) en vez de require() de los PNG. RN necesita el source como
// { uri: dataUri }, no el string pelado.
const frenteImg = { uri: AUTO_SEDAN_FRENTE_IMG };
const atrasImg = { uri: AUTO_SEDAN_ATRAS_IMG };
const lateralImg = { uri: AUTO_SEDAN_LATERAL_IMG };
const cenitalImg = { uri: AUTO_SEDAN_CENITAL_IMG };

// Las 4 vistas reales de Auto / Sedán (zonas de
// assets/checkin-diagrams/auto/sedan/*/zonas.json), armadas con el
// diagrama genérico "imagen + zonas".
export const AUTO_SEDAN_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
