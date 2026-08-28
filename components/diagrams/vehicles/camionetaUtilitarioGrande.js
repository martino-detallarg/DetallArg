import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/cenital/zonas.json";
import { UTILITARIO_GRANDE_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/frente/imagen";
import { UTILITARIO_GRANDE_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/atras/imagen";
import { UTILITARIO_GRANDE_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/lateral/imagen";
import { UTILITARIO_GRANDE_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_grande/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_utilitario_acarrozado_grande";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: UTILITARIO_GRANDE_FRENTE_IMG };
const atrasImg = { uri: UTILITARIO_GRANDE_ATRAS_IMG };
const lateralImg = { uri: UTILITARIO_GRANDE_LATERAL_IMG };
const cenitalImg = { uri: UTILITARIO_GRANDE_CENITAL_IMG };

// Nueva subdivisión "Grande" de Utilitario acarrozado (agregada 23 agosto
// 2026 a pedido de Augusto — no existía en TIPOS_VEHICULO). Referencia
// tipo furgón grande (Mercedes Sprinter/similar). Mismo criterio de
// carrocería CERRADA que Utilitario acarrozado mediano:
//
// - Frente: 9 zonas, mismo criterio que el resto de Camioneta.
// - Lateral (4 zonas): guardabarro_delantero, puerta_delantera, vidrio,
//   `panel_carga` (panel ciego, sin apertura ni ventanilla — reemplaza a
//   `caja`, que es para caja de carga ABIERTA).
// - Cenital (3 zonas, no 4): techo, parante_izq, parante_der — sin caja
//   separada, techo continuo de punta a punta.
// - Atrás (4 zonas): puertas traseras batientes `puerta_izquierda`/
//   `puerta_derecha`, cada una con su `vidrio_izquierdo`/`vidrio_derecho`.
export const UTILITARIO_GRANDE_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
