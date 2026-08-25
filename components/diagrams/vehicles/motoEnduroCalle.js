import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import lateralZonas from "../../../assets/checkin-diagrams/moto/enduro_calle/lateral/zonas.json";
import { MOTO_ENDURO_CALLE_LATERAL_IMG } from "../../../assets/checkin-diagrams/moto/enduro_calle/lateral/imagen";

export const VEHICLE_TYPE = "moto_enduro_calle";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const lateralImg = { uri: MOTO_ENDURO_CALLE_LATERAL_IMG };

// Primera subdivisión de Moto (agregada 24 agosto 2026). Referencia Honda
// Tornado (enduro/calle). A diferencia de Auto/Camioneta/SUV, Moto usa un
// criterio de zonas completamente distinto, definido a pedido de Augusto:
//
// - Una sola vista (Lateral) en vez de las 4 vistas de las demás familias
//   — no hay Frente/Atrás/Cenital para Moto por ahora.
// - Solo 4 zonas, mucho más simples que el resto de la app: tanque,
//   plasticos, motor, foco_delantero (el foco delantero completo, sin
//   separar óptica/parante como en Auto/SUV).
// - Tipos de daño propios (ver data/tiposDanio.js -> TIPOS_DANIO_MOTO),
//   elegidos en DiagramaDanios según `tipoVehiculo === "moto"`.
export const MOTO_ENDURO_CALLE_VISTAS = {
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
};
