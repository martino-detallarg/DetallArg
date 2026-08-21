import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TIPOS_DANIO } from "../../data/tiposDanio";
import { colors, continuousCorner, fonts, radii } from "../../theme";

export const PANEL_IDS = ["frente", "izquierdo", "techo", "derecho", "atras"];

export const PANEL_LABELS = {
  frente: "Frente",
  izquierdo: "Izq.",
  techo: "Techo",
  derecho: "Der.",
  atras: "Atrás",
};

// Diagrama genérico de 5 zonas grandes (cruz desplegada), usado como
// fallback para cualquier tipo de vehículo que todavía no tiene un diagrama
// de paneles reales propio en components/diagrams/vehicles. Es puramente
// visual: recibe `danios` (mapa panelId -> tipoDanio) y avisa los toques por
// `onPanelPress`; el selector de tipo de daño y la lista resumen viven en
// DiagramaDanios, que envuelve a este componente (o a los específicos por
// carrocería) siempre con la misma interfaz.
export default function DamageDiagram({ danios, onPanelPress }) {
  return (
    <View style={styles.auto}>
      <Zona
        id="frente"
        etiqueta={PANEL_LABELS.frente}
        tipo={danios.frente}
        onPress={onPanelPress}
        style={styles.zonaFrente}
      />

      <View style={styles.filaMedia}>
        <Zona
          id="izquierdo"
          etiqueta={PANEL_LABELS.izquierdo}
          tipo={danios.izquierdo}
          onPress={onPanelPress}
          style={styles.zonaLateral}
        />
        <Zona
          id="techo"
          etiqueta={PANEL_LABELS.techo}
          tipo={danios.techo}
          onPress={onPanelPress}
          style={styles.techo}
        />
        <Zona
          id="derecho"
          etiqueta={PANEL_LABELS.derecho}
          tipo={danios.derecho}
          onPress={onPanelPress}
          style={styles.zonaLateral}
        />
      </View>

      <Zona
        id="atras"
        etiqueta={PANEL_LABELS.atras}
        tipo={danios.atras}
        onPress={onPanelPress}
        style={styles.zonaAtras}
      />
    </View>
  );
}

function Zona({ id, etiqueta, tipo, onPress, style }) {
  const info = tipo ? TIPOS_DANIO[tipo] : null;
  return (
    <TouchableOpacity
      style={[style, info && { backgroundColor: info.color, borderColor: info.color }]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.zonaTexto, info && styles.zonaTextoMarcado]}>{etiqueta}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  auto: {
    width: 180,
    borderRadius: 32,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    overflow: "hidden",
  },
  filaMedia: {
    flexDirection: "row",
    height: 140,
  },
  zonaFrente: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
  },
  zonaAtras: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
  },
  zonaLateral: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
  },
  techo: {
    flex: 1,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
  },
  zonaTexto: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  zonaTextoMarcado: {
    fontFamily: fonts.monoMedium,
    color: colors.textPrimary,
  },
});
