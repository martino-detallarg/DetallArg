import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import lateralZonas from "../../../assets/checkin-diagrams/moto/scooter/lateral/zonas.json";
import { MOTO_SCOOTER_LATERAL_IMG } from "../../../assets/checkin-diagrams/moto/scooter/lateral/imagen";

export const VEHICLE_TYPE = "moto_scooter";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const lateralImg = { uri: MOTO_SCOOTER_LATERAL_IMG };

// Segunda subdivisión de Moto (agregada 25 agosto 2026). Referencia Honda
// Wave 110 (scooter/cub semiautomática). A diferencia de
// motoEnduroCalle.js, acá NO hay zona `tanque` — a pedido de Augusto, ya
// que la Wave es una carrocería "cub" (paso a través, tanque escondido
// bajo el piso/asiento, sin tanque expuesto como una enduro/naked). En su
// lugar, las 4 zonas son: `asiento`, `plasticos` (cubre-cola trasero),
// `motor`, `foco_delantero`. Zonas coarse igual que el resto de la app,
// no una disección anatómica exacta de la moto.
export const MOTO_SCOOTER_VISTAS = {
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
};
