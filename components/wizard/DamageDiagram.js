import { Image, StyleSheet, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { FRENTE_REFERENCIA_IMG } from "./frenteReferenciaImagen";
import { TIPOS_DANIO } from "../../data/tiposDanio";
import { colors } from "../../theme";

// Diagrama genérico de check-in visual: por ahora es SOLO la vista de
// Frente (con una foto de referencia), usado como fallback para cualquier
// tipo de vehículo que no tenga un diagrama de paneles reales propio en
// components/diagrams/vehicles. Las otras 4 vistas (Techo, Izquierda,
// Derecha, Atrás) todavía no están listas, así que no se simulan acá — se
// van a sumar más adelante, junto con el resto de las carrocerías.
//
// Es puramente visual: recibe `danios` (mapa panelId -> tipoDanio) y avisa
// los toques por `onPanelPress`, el mismo contrato que usan los diagramas
// específicos por carrocería (por ejemplo PickupCabinaSimpleDiagram).
export const PANEL_IDS = [
  "capot",
  "vidrio",
  "parante_izq",
  "parante_der",
  "optica_izq",
  "optica_der",
  "frente_completo",
];

export const PANEL_LABELS = {
  vidrio: "Parabrisas",
  capot: "Capó",
  optica_izq: "Óptica izquierda",
  optica_der: "Óptica derecha",
  parante_izq: "Parante izquierdo",
  parante_der: "Parante derecho",
  frente_completo: "Frente / paragolpes",
};

const VIEW_W = 692;
const VIEW_H = 499;

const ZONES = {
  vidrio: [[126, 130], [173, 52], [406, 38], [530, 56], [565, 134], [138, 144]],
  capot: [[138, 144], [565, 134], [624, 220], [481, 258], [346, 235], [212, 258], [67, 220]],
  optica_izq: [[58, 205], [200, 195], [210, 270], [160, 288], [75, 278], [45, 240]],
  optica_der: [[634, 205], [492, 195], [482, 270], [532, 288], [617, 278], [647, 240]],
  parante_izq: [[95, 18], [178, 18], [173, 52], [126, 130], [85, 148], [60, 90]],
  parante_der: [[597, 18], [514, 18], [519, 52], [566, 130], [607, 148], [632, 90]],
  frente_completo: [[20, 290], [672, 290], [660, 470], [30, 470]],
};

function pointsToStr(pts) {
  return pts.map((p) => `${p[0]},${p[1]}`).join(" ");
}

export default function DamageDiagram({ danios, onPanelPress, width = "100%" }) {
  return (
    <View style={[styles.contenedor, { width }]}>
      <Image source={{ uri: FRENTE_REFERENCIA_IMG }} style={StyleSheet.absoluteFill} resizeMode="contain" />
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {PANEL_IDS.map((id) => {
          const tipo = danios[id] ? TIPOS_DANIO[danios[id]] : null;
          return (
            <Polygon
              key={id}
              points={pointsToStr(ZONES[id])}
              fill={tipo ? tipo.color : colors.textPrimary}
              fillOpacity={tipo ? 0.4 : 0.05}
              stroke={tipo ? tipo.color : colors.textPrimary}
              strokeOpacity={tipo ? 1 : 0.3}
              strokeWidth={tipo ? 1.5 : 1.25}
              strokeDasharray={tipo ? undefined : "4,4"}
              onPress={() => onPanelPress(id)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    aspectRatio: VIEW_W / VIEW_H,
  },
});
