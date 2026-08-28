import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/cenital/zonas.json";
import { CAMIONETA_DCG_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/frente/imagen";
import { CAMIONETA_DCG_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/atras/imagen";
import { CAMIONETA_DCG_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/lateral/imagen";
import { CAMIONETA_DCG_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_grande/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_doble_cabina_grande";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: CAMIONETA_DCG_FRENTE_IMG };
const atrasImg = { uri: CAMIONETA_DCG_ATRAS_IMG };
const lateralImg = { uri: CAMIONETA_DCG_LATERAL_IMG };
const cenitalImg = { uri: CAMIONETA_DCG_CENITAL_IMG };

// Tercera y última subdivisión de la familia Doble cabina. Referencia tipo
// Ford F-150 Raptor (doble cabina grande). Mismo criterio de zonas que
// Doble cabina chico y mediano: Lateral con 5 zonas (guardabarro_delantero,
// puerta_delantera, puerta_trasera, vidrio, caja), Atrás con paragolpes
// trasero separado de la compuerta. Frente y Cenital comparten el mismo
// criterio del resto de la familia Camioneta.
//
// Esta referencia dibuja las ruedas TOCANDO la línea del guardabarro (un
// solo contorno externo en las 4 vistas, sin huecos) — a diferencia de
// Cabina simple mediano y Doble cabina mediano, acá el pipeline no tuvo
// que separar contornos de rueda en ningún caso.
export const CAMIONETA_DCG_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
