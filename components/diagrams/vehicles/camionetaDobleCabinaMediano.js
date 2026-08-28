import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/cenital/zonas.json";
import { CAMIONETA_DCM_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/frente/imagen";
import { CAMIONETA_DCM_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/atras/imagen";
import { CAMIONETA_DCM_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/lateral/imagen";
import { CAMIONETA_DCM_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/doble_cabina_mediano/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_doble_cabina_mediano";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: CAMIONETA_DCM_FRENTE_IMG };
const atrasImg = { uri: CAMIONETA_DCM_ATRAS_IMG };
const lateralImg = { uri: CAMIONETA_DCM_LATERAL_IMG };
const cenitalImg = { uri: CAMIONETA_DCM_CENITAL_IMG };

// Segunda subdivisión de la familia Doble cabina. Referencia tipo Toyota
// Hilux doble cabina (mediana). Mismo criterio de zonas que Doble cabina
// chico: Lateral con 5 zonas (guardabarro_delantero, puerta_delantera,
// puerta_trasera, vidrio, caja), Atrás con paragolpes trasero separado de
// la compuerta. Frente y Cenital comparten el mismo criterio del resto de
// la familia Camioneta (frente: vidrio/capot/ópticas/parantes/espejos;
// cenital: techo/parantes/caja).
//
// Pipeline de tratamiento usó min_area=200 (fix del bug de ruedas de
// Cabina simple mediano) desde el inicio: la vista Lateral de esta
// referencia tiene las ruedas separadas del guardabarro en el dibujo
// (3 contornos externos), y quedaron conservadas automáticamente sin
// necesitar intervención manual — confirma que el fix es robusto para
// este tipo de arte de referencia.
export const CAMIONETA_DCM_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
