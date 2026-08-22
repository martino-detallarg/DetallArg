import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/auto/coupe/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/auto/coupe/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/auto/coupe/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/auto/coupe/cenital/zonas.json";

// require() estático: Metro resuelve los assets analizando el literal del
// path en build time, no puede armarse el path con una variable.
const frenteImg = require("../../../assets/checkin-diagrams/auto/coupe/frente/diagrama.png");
const atrasImg = require("../../../assets/checkin-diagrams/auto/coupe/atras/diagrama.png");
const lateralImg = require("../../../assets/checkin-diagrams/auto/coupe/lateral/diagrama.png");
const cenitalImg = require("../../../assets/checkin-diagrams/auto/coupe/cenital/diagrama.png");

export const VEHICLE_TYPE = "auto_coupe";

// Las 4 vistas reales de Auto / Coupé (assets/checkin-diagrams/auto/coupe),
// armadas con el diagrama genérico "imagen + zonas".
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
