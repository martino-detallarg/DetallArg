/**
 * PickupCabinaSimpleDiagram
 * ─────────────────────────────────────────────────────────────────────────
 * Diagrama de check-in visual — Pickup, cabina simple.
 *
 * Las siluetas de este diagrama están vectorizadas a partir de la imagen de
 * referencia (plano 4 vistas) que nos pasó Augusto: se extrajeron los
 * contornos reales (capó, techo, puertas, guardabarros, caja) con
 * detección de bordes y se simplificaron a curvas limpias tipo ícono
 * técnico — por eso cada panel tiene la forma real de la parte del auto
 * (la puerta se ve como una puerta, el guardabarros sigue el paso de
 * rueda, etc.), no son bloques geométricos genéricos.
 *
 * Layout: "cruz desplegada" de 5 vistas apiladas verticalmente
 * (Frente / Techo / Izquierda / Derecha / Atrás), igual al layout que ya
 * usa la app. Cada panel de carrocería aparece UNA sola vez, en la vista
 * donde mejor se ve — no hay ids duplicados entre vistas.
 *
 * 12 paneles tocables:
 *   parachoque_delantero            (Frente)
 *   capot                           (Techo)
 *   techo                           (Techo)
 *   caja                            (Techo)   — caja / baúl de carga
 *   guardabarros_delantero_izq      (Izquierda)
 *   puerta_delantera_izq            (Izquierda)
 *   guardabarros_trasero_izq        (Izquierda) — incluye lateral de caja
 *   guardabarros_delantero_der      (Derecha)
 *   puerta_delantera_der            (Derecha)
 *   guardabarros_trasero_der        (Derecha)
 *   porton_trasero                  (Atrás)   — chapa del portón, con luces
 *   parachoque_trasero              (Atrás)   — paragolpes, franja inferior
 *
 * Atrás está dividido en dos paneles porque son piezas físicas distintas
 * (portón vs. paragolpes). La costura entre ambos no fue "a ojo": se
 * detectó una línea real y consistente en la foto de referencia (barrido
 * de contraste de píxeles sobre crop_rear.png, ~y=513-519 en la imagen
 * original) y se usó esa altura para cortar el contorno ya extraído.
 *
 * No tiene puerta_trasera (cabina simple = 2 puertas).
 *
 * Es puramente visual: recibe `danios` (mapa panelId -> tipoDanio, con las
 * claves de TIPOS_DANIO en data/tiposDanio.js) y avisa los toques por
 * `onPanelPress`. El selector de tipo de daño y la lista resumen viven en
 * components/wizard/DiagramaDanios.js, que envuelve a este componente con
 * la misma interfaz que el diagrama genérico de 5 zonas.
 *
 * Uso:
 *   <PickupCabinaSimpleDiagram
 *     danios={{ puerta_delantera_izq: "rayon", capot: "abolladura" }}
 *     onPanelPress={(panelId) => marcarDanio(panelId)}
 *   />
 * ─────────────────────────────────────────────────────────────────────────
 */
import Svg, { Path } from "react-native-svg";
import { TIPOS_DANIO } from "../../../data/tiposDanio";
import { colors } from "../../../theme";

export const VEHICLE_TYPE = "pickup_cabina_simple";

export const PANEL_IDS = [
  "parachoque_delantero",
  "capot",
  "techo",
  "caja",
  "guardabarros_delantero_izq",
  "puerta_delantera_izq",
  "guardabarros_trasero_izq",
  "guardabarros_delantero_der",
  "puerta_delantera_der",
  "guardabarros_trasero_der",
  "porton_trasero",
  "parachoque_trasero",
];

export const PANEL_LABELS = {
  parachoque_delantero: "Parachoque delantero",
  capot: "Capó",
  techo: "Techo",
  caja: "Caja / baúl",
  guardabarros_delantero_izq: "Guardabarros delantero izquierdo",
  puerta_delantera_izq: "Puerta delantera izquierda",
  guardabarros_trasero_izq: "Guardabarros trasero izquierdo",
  guardabarros_delantero_der: "Guardabarros delantero derecho",
  puerta_delantera_der: "Puerta delantera derecha",
  guardabarros_trasero_der: "Guardabarros trasero derecho",
  porton_trasero: "Portón trasero",
  parachoque_trasero: "Parachoque trasero",
};

const VIEW_BOX = "0 0 640 1656";

const PANELS = [
  { id: "parachoque_delantero", d: "M156.55,20 L490.17,22.88 C510.14,67.29 605.37,216.05 610,289.39 C614.63,362.73 533.31,433.99 517.97,462.91 L119.16,463.87 C104.3,432.87 23.77,351.86 30,277.88 C36.23,203.91 135.45,62.98 156.55,20 Z" },
  { id: "capot", d: "M65.73,514.42 C58.11,523.38 27.54,540.89 20,568.19 C12.46,595.49 14.47,652.28 20.5,678.24 C26.53,704.21 45.54,714 56.18,723.97 C66.82,733.94 79.63,735.7 84.32,738.04 L178.29,739.11 L178.29,504.29 C167.57,504.3 132.73,502.68 113.97,504.37 C95.21,506.06 73.77,512.75 65.73,514.42 Z" },
  { id: "techo", d: "M178.29,739.11 L376.78,741.36 L376.78,504.04 L178.29,504.29 Z" },
  { id: "caja", d: "M376.78,741.36 L526.53,743.07 C537.76,741.89 579.63,739.72 593.87,736.03 C608.11,732.35 607.6,745.41 611.96,720.96 C616.31,696.5 620.08,621.96 620,589.3 C619.92,556.63 615.48,537.87 611.46,524.98 C607.44,512.08 612.96,515.43 595.88,511.91 C578.79,508.39 523.43,505.21 508.94,503.87 L376.78,504.04 Z" },
  { id: "guardabarros_delantero_izq", d: "M170.24,836.4 C149.29,839.39 67.72,850.02 44.57,854.35 C21.42,858.68 35.43,856.16 31.34,862.38 C27.24,868.6 20.94,880.33 20,891.67 C19.06,903.01 16.22,921.52 25.67,930.41 C35.12,939.31 65.43,949.86 76.69,945.06 C87.95,940.26 85.2,911.04 93.23,901.59 C101.26,892.15 113.23,889.07 124.88,888.37 C136.54,887.66 153.07,888.05 163.15,897.34 C173.23,906.63 181.65,936.32 185.35,944.11 L170.24,836.4 Z" },
  { id: "puerta_delantera_izq", d: "M354.02,838.29 C353.39,828.05 365.98,786 350.24,776.87 C334.49,767.74 289.53,773.56 259.53,783.48 C229.53,793.41 185.12,827.58 170.24,836.4 L185.35,944.11 L354.02,940.84 L354.02,838.29 Z" },
  { id: "guardabarros_trasero_izq", d: "M354.02,940.84 L428.66,939.39 C430.94,932.46 434.49,906.95 442.36,897.81 C450.24,888.68 464.72,885.69 475.91,884.59 C487.09,883.48 500.47,882.85 509.45,891.2 C518.43,899.55 512.76,928.44 529.76,934.67 C546.77,940.89 596.46,931.04 611.5,928.52 C626.54,926 621.1,935.14 620,919.55 C618.9,903.96 649.21,848.52 604.88,834.98 C560.55,821.44 395.83,837.74 354.02,838.29 Z" },
  { id: "guardabarros_delantero_der", d: "M469.76,1044.59 C490.71,1047.58 572.28,1058.21 595.43,1062.54 C618.58,1066.87 604.57,1064.35 608.66,1070.57 C612.76,1076.79 619.06,1088.52 620,1099.86 C620.94,1111.2 623.78,1129.71 614.33,1138.6 C604.88,1147.5 574.57,1158.05 563.31,1153.25 C552.05,1148.45 554.8,1119.23 546.77,1109.78 C538.74,1100.34 526.77,1097.26 515.12,1096.56 C503.46,1095.85 486.93,1096.24 476.85,1105.53 C466.77,1114.82 458.35,1144.51 454.65,1152.3 L469.76,1044.59 Z" },
  { id: "puerta_delantera_der", d: "M285.98,1046.48 C286.61,1036.24 274.02,994.19 289.76,985.06 C305.51,975.93 350.47,981.75 380.47,991.67 C410.47,1001.6 454.88,1035.77 469.76,1044.59 L454.65,1152.3 L285.98,1149.03 L285.98,1046.48 Z" },
  { id: "guardabarros_trasero_der", d: "M285.98,1149.03 L211.34,1147.58 C209.06,1140.65 205.51,1115.14 197.64,1106 C189.76,1096.87 175.28,1093.88 164.09,1092.78 C152.91,1091.67 139.53,1091.04 130.55,1099.39 C121.57,1107.74 127.24,1136.63 110.24,1142.86 C93.23,1149.08 43.54,1139.23 28.5,1136.71 C13.46,1134.19 18.9,1143.33 20,1127.74 C21.1,1112.15 -9.21,1056.71 35.12,1043.17 C79.45,1029.63 244.17,1045.93 285.98,1046.48 Z" },
  { id: "porton_trasero", d: "M149.56,1193.25 L496.37,1197.2 C515.31,1237.88 598.42,1385.92 610,1441.26 C621.58,1496.59 573.19,1514.54 565.83,1529.2 L69.33,1529.2 C62.77,1517.17 16.63,1513.06 30,1457.07 C43.37,1401.08 129.63,1237.22 149.56,1193.25 Z" },
  { id: "parachoque_trasero", d: "M69.33,1529.2 L126.83,1634.92 L512.18,1635.91 L565.83,1529.2 L69.33,1529.2 Z" },
];

// Ruedas decorativas — NO son paneles tocables, no llevan onPress.
// Cada rueda es cubierta ("tire") + rin ("hub"), dos círculos, para que
// se lea mejor a tamaño chico en el celular.
const DECORATIVE_WHEELS = [
  { id: "deco_rueda_izq_del", part: "tire", d: "M99.88,945.06 A25,25 0 1 0 149.88,945.06 A25,25 0 1 0 99.88,945.06 Z" },
  { id: "deco_rueda_izq_del_rin", part: "hub", d: "M114.88,945.06 A10,10 0 1 0 134.88,945.06 A10,10 0 1 0 114.88,945.06 Z" },
  { id: "deco_rueda_izq_tras", part: "tire", d: "M450.91,945.06 A25,25 0 1 0 500.91,945.06 A25,25 0 1 0 450.91,945.06 Z" },
  { id: "deco_rueda_izq_tras_rin", part: "hub", d: "M465.91,945.06 A10,10 0 1 0 485.91,945.06 A10,10 0 1 0 465.91,945.06 Z" },
  { id: "deco_rueda_der_del", part: "tire", d: "M490.12,1153.25 A25,25 0 1 0 540.12,1153.25 A25,25 0 1 0 490.12,1153.25 Z" },
  { id: "deco_rueda_der_del_rin", part: "hub", d: "M505.12,1153.25 A10,10 0 1 0 525.12,1153.25 A10,10 0 1 0 505.12,1153.25 Z" },
  { id: "deco_rueda_der_tras", part: "tire", d: "M139.09,1153.25 A25,25 0 1 0 189.09,1153.25 A25,25 0 1 0 139.09,1153.25 Z" },
  { id: "deco_rueda_der_tras_rin", part: "hub", d: "M154.09,1153.25 A10,10 0 1 0 174.09,1153.25 A10,10 0 1 0 154.09,1153.25 Z" },
];

// Colores por defecto tomados de theme.js: fondo de superficie (panelFill),
// borde sutil (panelStroke) y el mismo gris de fondo/superficie para las
// ruedas decorativas. Ya no hay un color "damaged" fijo acá: cuando un
// panel tiene un daño cargado, se pinta con el color propio de ese tipo de
// daño (TIPOS_DANIO), no con un único color de alerta genérico.
const defaultColors = {
  panelFill: colors.surface2,
  panelStroke: colors.borderSubtle,
  wheelFill: colors.bg,
  wheelStroke: colors.borderSubtle,
  hubFill: colors.surface,
  hubStroke: colors.borderSubtle,
};

export default function PickupCabinaSimpleDiagram({
  danios = {},
  onPanelPress,
  width = "100%",
  colors: coloresOverride,
}) {
  const c = { ...defaultColors, ...coloresOverride };

  return (
    <Svg viewBox={VIEW_BOX} width={width} aspectRatio={640 / 1656}>
      {DECORATIVE_WHEELS.map((w) => (
        <Path
          key={w.id}
          d={w.d}
          fill={w.part === "hub" ? c.hubFill : c.wheelFill}
          stroke={w.part === "hub" ? c.hubStroke : c.wheelStroke}
          strokeWidth={w.part === "hub" ? 0.75 : 1}
        />
      ))}

      {PANELS.map((panel) => {
        const tipo = danios[panel.id] ? TIPOS_DANIO[danios[panel.id]] : null;
        return (
          <Path
            key={panel.id}
            d={panel.d}
            fill={tipo ? tipo.color : c.panelFill}
            stroke={tipo ? tipo.color : c.panelStroke}
            strokeWidth={1.25}
            onPress={onPanelPress ? () => onPanelPress(panel.id) : undefined}
          />
        );
      })}
    </Svg>
  );
}
