import { crearVistaDesdeZonas } from "./ImageZoneDiagram";
import frenteZonas from "../../../assets/checkin-diagrams/suv/compacto/frente/zonas.json";
import atrasZonas from "../../../assets/checkin-diagrams/suv/compacto/atras/zonas.json";
import lateralZonas from "../../../assets/checkin-diagrams/suv/compacto/lateral/zonas.json";
import cenitalZonas from "../../../assets/checkin-diagrams/suv/compacto/cenital/zonas.json";
import { SUV_COMPACTO_FRENTE_IMG } from "../../../assets/checkin-diagrams/suv/compacto/frente/imagen";
import { SUV_COMPACTO_ATRAS_IMG } from "../../../assets/checkin-diagrams/suv/compacto/atras/imagen";
import { SUV_COMPACTO_LATERAL_IMG } from "../../../assets/checkin-diagrams/suv/compacto/lateral/imagen";
import { SUV_COMPACTO_CENITAL_IMG } from "../../../assets/checkin-diagrams/suv/compacto/cenital/imagen";

export const VEHICLE_TYPE = "suv_compacto";

// Mismo patrón base64 que el resto de los diagramas reales (require() de
// los PNG de assets/ causaba el bug de recorte/zoom en Expo Go). RN
// necesita el source como { uri: dataUri }, no el string pelado.
const frenteImg = { uri: SUV_COMPACTO_FRENTE_IMG };
const atrasImg = { uri: SUV_COMPACTO_ATRAS_IMG };
const lateralImg = { uri: SUV_COMPACTO_LATERAL_IMG };
const cenitalImg = { uri: SUV_COMPACTO_CENITAL_IMG };

// Primera subdivisión de SUV (agregada 24 agosto 2026). Referencia tipo
// SUV coupé compacto (techo con caída trasera, 4 puertas). Con Camioneta
// ya completa (10 de 10 subdivisiones), esta es la primera familia nueva
// que arranca — criterio de zonas calcado de Auto Sedán/Familiar/Hatchback
// (misma cantidad de puertas, sin caja de carga, carrocería cerrada):
//
// - Frente: 9 zonas, mismo criterio que el resto de la app.
// - Lateral (5 zonas): guardabarro_delantero, puerta_delantera,
//   puerta_trasera, vidrio, `cola` (cuarto trasero + portón, mismo
//   criterio que Auto Hatchback/Familiar — NO usa `caja` ni `panel_carga`,
//   esos son propios de Camioneta).
// - Cenital (3 zonas): techo, parante_izq, parante_der — sin caja
//   separada, mismo criterio que la familia Auto.
// - Atrás (5 zonas): vidrio, `baul` (portón trasero, panel bajo el
//   vidrio), luz_izquierda, luz_derecha, paragolpes_trasero — mismo
//   criterio que Auto Hatchback (portón con vidrio y panel inferior como
//   zonas separadas, no una sola pieza).
export const SUV_COMPACTO_VISTAS = {
  frente: { etiqueta: "Frente", ...crearVistaDesdeZonas("frente", frenteImg, frenteZonas) },
  atras: { etiqueta: "Atrás", ...crearVistaDesdeZonas("atras", atrasImg, atrasZonas) },
  lateral: { etiqueta: "Lateral", ...crearVistaDesdeZonas("lateral", lateralImg, lateralZonas) },
  cenital: { etiqueta: "Cenital", ...crearVistaDesdeZonas("cenital", cenitalImg, cenitalZonas) },
};
