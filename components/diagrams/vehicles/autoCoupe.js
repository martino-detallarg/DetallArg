import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/auto/coupe/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/auto/coupe/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/auto/coupe/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/auto/coupe/cenital/zonas.json";
import { AUTO_COUPE_FRENTE_IMG } from "./img/autoCoupeFrenteImagen";
import { AUTO_COUPE_ATRAS_IMG } from "./img/autoCoupeAtrasImagen";
import { AUTO_COUPE_LATERAL_IMG } from "./img/autoCoupeLateralImagen";
import { AUTO_COUPE_CENITAL_IMG } from "./img/autoCoupeCenitalImagen";

export const VEHICLE_TYPE = "auto_coupe";

// Imágenes embebidas en base64 (mismo patrón que
// components/wizard/frenteReferenciaImagen.js, que ya se sabe que
// renderiza bien) en vez de require() de los PNG en assets/ — se probó
// como diagnóstico del recorte/zoom que se veía en las 4 vistas y quedó
// así. RN necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: AUTO_COUPE_FRENTE_IMG };
const atrasImg = { uri: AUTO_COUPE_ATRAS_IMG };
const lateralImg = { uri: AUTO_COUPE_LATERAL_IMG };
const cenitalImg = { uri: AUTO_COUPE_CENITAL_IMG };

// Las 4 vistas reales de Auto / Coupé (zonas de
// assets/checkin-diagrams/auto/coupe/*/zonas.json), armadas con el
// diagrama genérico "imagen + zonas".
//
// Pendiente, sin bloquear nada (viene marcado en los zonas.json de origen):
// la vista Lateral es de un solo lado — falta la versión espejada del otro
// lado, y no tiene zona propia para las llantas todavía.
export const AUTO_COUPE_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
