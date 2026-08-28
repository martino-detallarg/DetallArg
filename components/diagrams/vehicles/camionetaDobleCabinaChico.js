import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/cenital/zonas.json";
import { CAMIONETA_DCC_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/frente/imagen";
import { CAMIONETA_DCC_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/atras/imagen";
import { CAMIONETA_DCC_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/lateral/imagen";
import { CAMIONETA_DCC_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_chico/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_doble_cabina_chico";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: CAMIONETA_DCC_FRENTE_IMG };
const atrasImg = { uri: CAMIONETA_DCC_ATRAS_IMG };
const lateralImg = { uri: CAMIONETA_DCC_LATERAL_IMG };
const cenitalImg = { uri: CAMIONETA_DCC_CENITAL_IMG };

// Primera subdivisión de la familia Doble cabina (grupo agregado a pedido
// de Augusto — "Chico" no existía antes en TIPOS_VEHICULO, se sumó junto
// con este diagrama). Referencia tipo Ford Maverick (doble cabina chica).
//
// Primera Camioneta con 2 puertas por lado: Frente/Cenital siguen el
// mismo criterio que el resto de Camioneta; Lateral pasa a 5 zonas
// (guardabarro_delantero, puerta_delantera, puerta_trasera, vidrio, caja),
// igual patrón que Auto Sedán/Familiar/Hatchback (4 puertas) pero con
// "caja" en vez de "cola"/"baul". Atrás tiene paragolpes trasero separado
// de la compuerta, igual criterio que Cabina simple mediano.
export const CAMIONETA_DCC_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
