import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/cenital/zonas.json";
import { CAMIONETA_CSC_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/frente/imagen";
import { CAMIONETA_CSC_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/atras/imagen";
import { CAMIONETA_CSC_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/lateral/imagen";
import { CAMIONETA_CSC_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/cabina_simple_chico/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_cabina_simple_chico";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: CAMIONETA_CSC_FRENTE_IMG };
const atrasImg = { uri: CAMIONETA_CSC_ATRAS_IMG };
const lateralImg = { uri: CAMIONETA_CSC_LATERAL_IMG };
const cenitalImg = { uri: CAMIONETA_CSC_CENITAL_IMG };

// Primera carrocería de la familia Camioneta: Cabina simple / Chico
// (referencia tipo VW Gol/Voyage "Saveiro"). Las 4 vistas son zonas
// hechas a medida sobre fotos reales de esta pickup, no reutilizadas de
// Auto ni del viejo PickupCabinaSimpleDiagram.
//
// Frente/Lateral/Cenital: mismo criterio de paneles que Auto (parabrisas,
// capó, ópticas, parantes, espejos / guardabarro, puerta, vidrio, caja /
// techo, parantes, caja).
//
// Atrás: fue corregida a pedido — la foto de referencia es genuinamente
// la parte trasera real de esta pickup (parece un auto pero no lo es), no
// debía sustituirse por arte reciclado. Trae exactamente 4 zonas:
// compuerta, luz_izquierda, luz_derecha y vidrio, sin paragolpes separado
// (a diferencia de las vistas Atrás de la familia Auto).
export const CAMIONETA_CSC_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
