import { StyleSheet, Text, View } from "react-native";
import DamageDiagram, { PANEL_IDS as ZONAS_IDS, PANEL_LABELS as ZONAS_LABELS } from "./DamageDiagram";
import { DIAGRAMAS_POR_TIPO_VEHICULO } from "../diagrams/vehicles";
import { colors, continuousCorner, fonts } from "../../theme";

// Mismo diagrama de paneles reales que ya usa DiagramaDanios.js (check-in
// visual), pero en modo "selección de paneles para PPF" en vez de "marcar
// daño": tocar un panel lo agrega/quita de `panelesElegidos` (sin abrir
// ningún selector de tipo de daño), y se resalta en `colors.accent` (no en
// `colors.error`, que en el resto de la app lee como "hay un problema acá")
// para que se lea como "va a ir protegido", no como una alerta.
//
// `panelesDisponibles` es el objeto `paneles` de data/ppfPanelMatrix.js para
// la subdivisión elegida (via utils/calculosPpf.js: obtenerClavePpf +
// obtenerPanelesPpf) — los ids de zona reales que NO están ahí (ej. las
// zonas "vidrio", que PPF no cubre) quedan tocables en el diagrama pero no
// hacen nada al tocarlas, en vez de romper o mostrar un estado roto.
export default function SelectorPanelesPpf({ claveVehiculo, vista, panelesDisponibles, panelesElegidos, onTogglePanel, ancho = 220 }) {
  const diagramaVehiculo = DIAGRAMAS_POR_TIPO_VEHICULO[claveVehiculo];
  const diagramaVista = diagramaVehiculo?.vistas?.[vista];
  const Diagrama = diagramaVista?.Componente ?? DamageDiagram;
  const panelIds = diagramaVista?.panelIds ?? ZONAS_IDS;
  const panelLabels = diagramaVista?.panelLabels ?? ZONAS_LABELS;

  // Mismo shape que `danios` de DiagramaDanios ({ zonaId: { tipos: [...] } })
  // para reusar el mismo criterio de "marcado" de ImageZoneDiagram/
  // PickupCabinaSimpleDiagram sin tocar esos componentes.
  const danios = Object.fromEntries(panelesElegidos.map((id) => [id, { tipos: ["ppf"] }]));

  function handleTocarZona(id) {
    if (!panelesDisponibles[id]) return; // zona real sin cobertura en la matriz de PPF (ej. vidrio)
    onTogglePanel(id);
  }

  const panelesDeEstaVista = panelIds.filter((id) => panelesElegidos.includes(id));

  return (
    <View style={styles.contenedor}>
      <Diagrama danios={danios} onPanelPress={handleTocarZona} width={ancho} colorMarcado={colors.accent} />

      <Text style={styles.ayuda}>Tocá los paneles que vas a proteger con PPF</Text>

      {panelesDeEstaVista.length > 0 && (
        <View style={styles.resumen}>
          {panelesDeEstaVista.map((id) => (
            <View key={id} style={styles.chip}>
              <View style={styles.chipPunto} />
              <Text style={styles.chipTexto}>{panelLabels[id]}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
  },
  resumen: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
