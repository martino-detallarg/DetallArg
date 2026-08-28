import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/cenital/zonas.json";
import { UTILITARIO_CHICO_FRENTE_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/frente/imagen";
import { UTILITARIO_CHICO_ATRAS_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/atras/imagen";
import { UTILITARIO_CHICO_LATERAL_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/lateral/imagen";
import { UTILITARIO_CHICO_CENITAL_IMG } from "../../../assets/checkin-diagrams/camioneta/utilitario_acarrozado_chico/cenital/imagen";

export const VEHICLE_TYPE = "camioneta_utilitario_acarrozado_chico";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: UTILITARIO_CHICO_FRENTE_IMG };
const atrasImg = { uri: UTILITARIO_CHICO_ATRAS_IMG };
const lateralImg = { uri: UTILITARIO_CHICO_LATERAL_IMG };
const cenitalImg = { uri: UTILITARIO_CHICO_CENITAL_IMG };

// Primera subdivisión del grupo "Utilitario acarrozado" — carrocería
// CERRADA (furgón chico, referencia tipo Fiat Fiorino/similar), distinta
// de Cabina simple y Doble cabina (que tienen caja de carga ABIERTA). Esto
// cambia el criterio de zonas en varias vistas:
//
// - Frente: mismo criterio que el resto de Camioneta (9 zonas).
// - Lateral (4 zonas): guardabarro_delantero, puerta_delantera, vidrio,
//   `panel_carga` — reemplaza a `caja` porque acá el costado de carga es
//   un panel ciego sin ventanilla ni apertura, no una caja abierta.
// - Cenital (3 zonas, no 4): techo, parante_izq, parante_der — mismo
//   criterio que la familia Auto, SIN zona de caja separada, porque el
//   techo es una sola chapa continua desde la cabina hasta las puertas
//   traseras (no hay caja abierta que mirar desde arriba).
// - Atrás (4 zonas): PRIMERA Camioneta con puertas traseras batientes en
//   vez de compuerta/portón único — `puerta_izquierda`/`puerta_derecha`
//   (cada una con su propia zona `vidrio_izquierdo`/`vidrio_derecho`),
//   simétricas, abisagradas en los bordes exteriores.
export const UTILITARIO_CHICO_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
