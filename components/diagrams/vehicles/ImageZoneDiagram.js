import { Image, StyleSheet, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { colors } from "../../../theme";

function pointsToStr(pts) {
  return pts.map((p) => `${p[0]},${p[1]}`).join(" ");
}

// Diagrama genérico "imagen + zonas": pinta una imagen de referencia (fondo
// transparente, silueta rellena, sin logo — como las que arma el chat de
// diseño gráfico en assets/checkin-diagrams) con un <Polygon> tocable por
// zona encima, resaltando el borde con un color neutro cuando esa zona
// tiene uno o más daños cargados (nunca con el color de un tipo puntual,
// porque una zona puede tener varios a la vez — el detalle vive en la
// lista resumen de DiagramaDanios, no acá).
//
// No se usa directo desde el registro de diagramas: cada vista de cada
// carrocería (ver autoCoupe.js) arma con `crearVistaDesdeZonas` un
// componente liviano que le pasa `imageSource`/`zones`/`viewBox` ya
// resueltos, para cumplir el contrato { danios, onPanelPress, width } que
// espera DiagramaDanios.
export default function ImageZoneDiagram({ imageSource, zones, viewBox, danios, onPanelPress, width = "100%" }) {
  const [, , viewW, viewH] = viewBox.split(" ").map(Number);
  // aspectRatio (CSS) puede no recalcular bien la altura cuando el width
  // viene encadenado desde useWindowDimensions (InspeccionVisualStep ->
  // DiagramaDanios -> acá) — se calcula la altura a mano en JS en su lugar.
  const alto = typeof width === "number" ? width * (viewH / viewW) : undefined;

  return (
    <View style={[styles.contenedor, { width, height: alto }]}>
      <Image source={imageSource} style={StyleSheet.absoluteFill} resizeMode="contain" />
      <Svg style={StyleSheet.absoluteFill} viewBox={viewBox}>
        {zones.map((zone) => {
          const marcado = danios[zone.id]?.tipos?.length > 0;
          return (
            <Polygon
              key={zone.id}
              points={pointsToStr(zone.points)}
              fill={colors.textPrimary}
              fillOpacity={marcado ? 0.12 : 0.05}
              stroke={marcado ? colors.error : colors.textPrimary}
              strokeOpacity={marcado ? 1 : 0.3}
              strokeWidth={marcado ? 2 : 1.25}
              strokeDasharray={marcado ? undefined : "4,4"}
              onPress={() => onPanelPress(zone.id)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {},
});

// Arma { Componente, panelIds, panelLabels } a partir de un diagrama.png +
// un zonas.json de assets/checkin-diagrams (mismo formato para cualquier
// carrocería futura, no solo Auto/Coupé).
//
// Los ids de zona se namespacean con el id de la vista (`${vistaId}__${id}`)
// porque distintas vistas reutilizan nombres de zona genéricos para paneles
// físicamente distintos — por ejemplo "vidrio" es el parabrisas en Frente
// pero la luneta trasera en Atrás y la ventanilla en Lateral. Sin este
// prefijo, marcar un daño en una vista se filtraría a la zona de mismo
// nombre en las demás. (La única excepción real — parante_izq/parante_der
// se repiten entre Frente y Cenital porque son el mismo panel visto desde
// dos ángulos — queda igual namespaceada por vista con este helper, así que
// hoy se marcan por separado; si más adelante se quiere que compartan
// estado, alcanza con pasarles a mano el mismo id ya prefijado.)
export function crearVistaDesdeZonas(vistaId, imageSource, zonasJson) {
  const zonesNamespaced = zonasJson.zones.map((zone) => ({
    ...zone,
    id: `${vistaId}__${zone.id}`,
  }));

  function Componente({ danios, onPanelPress, width }) {
    return (
      <ImageZoneDiagram
        imageSource={imageSource}
        zones={zonesNamespaced}
        viewBox={zonasJson.viewBox}
        danios={danios}
        onPanelPress={onPanelPress}
        width={width}
      />
    );
  }

  return {
    Componente,
    panelIds: zonesNamespaced.map((z) => z.id),
    panelLabels: Object.fromEntries(zonesNamespaced.map((z) => [z.id, z.label])),
  };
}
