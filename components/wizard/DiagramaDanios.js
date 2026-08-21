import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DamageDiagram, { PANEL_IDS as ZONAS_IDS, PANEL_LABELS as ZONAS_LABELS } from "./DamageDiagram";
import { DIAGRAMAS_POR_TIPO_VEHICULO } from "../diagrams/vehicles";
import { TIPOS_DANIO } from "../../data/tiposDanio";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const ANCHO_DIAGRAMA = 220;

// Envuelve al diagrama de check-in visual que corresponda según
// `claveVehiculo` (el diagrama de paneles reales de esa carrocería si existe
// en components/diagrams/vehicles, o el genérico de 5 zonas si no) y le
// suma, siempre igual sin importar qué diagrama se esté mostrando: el
// selector de tipo de daño por panel y la lista resumen "Daños registrados".
// Así, cuando se sumen las próximas carrocerías, alcanza con agregarlas al
// registro de components/diagrams/vehicles — no hay que tocar este selector.
export default function DiagramaDanios({ claveVehiculo, danios, onCambiarZona }) {
  const [zonaActiva, setZonaActiva] = useState(null);

  const diagrama = DIAGRAMAS_POR_TIPO_VEHICULO[claveVehiculo];
  const Diagrama = diagrama?.Componente ?? DamageDiagram;
  const panelIds = diagrama?.panelIds ?? ZONAS_IDS;
  const panelLabels = diagrama?.panelLabels ?? ZONAS_LABELS;

  function handleTocarZona(id) {
    setZonaActiva((actual) => (actual === id ? null : id));
  }

  function handleElegirTipo(tipo) {
    onCambiarZona(zonaActiva, tipo);
    setZonaActiva(null);
  }

  const zonasConDanio = panelIds.filter((id) => danios[id]);

  return (
    <View style={styles.contenedor}>
      <Diagrama danios={danios} onPanelPress={handleTocarZona} width={ANCHO_DIAGRAMA} />

      {zonaActiva ? (
        <View style={styles.selector}>
          <Text style={styles.selectorTitulo}>{panelLabels[zonaActiva]} · elegí el tipo de daño</Text>
          <View style={styles.chips}>
            {Object.entries(TIPOS_DANIO).map(([id, tipo]) => {
              const activo = danios[zonaActiva] === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.chip, activo && { backgroundColor: tipo.color, borderColor: tipo.color }]}
                  onPress={() => handleElegirTipo(id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.chipPunto, { backgroundColor: tipo.color }]} />
                  <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>{tipo.etiqueta}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.chip, !danios[zonaActiva] && styles.chipSeleccionado]}
              onPress={() => handleElegirTipo(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTexto, !danios[zonaActiva] && styles.chipTextoSeleccionado]}>
                Sin daño
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.ayuda}>Tocá un sector para elegir el tipo de daño</Text>
      )}

      {zonasConDanio.length > 0 && (
        <View style={styles.resumen}>
          <Text style={styles.resumenTitulo}>Daños registrados</Text>
          {zonasConDanio.map((id) => {
            const tipo = TIPOS_DANIO[danios[id]];
            return (
              <View key={id} style={styles.resumenFila}>
                <View style={[styles.resumenPunto, { backgroundColor: tipo.color }]} />
                <Text style={styles.resumenTexto}>
                  {panelLabels[id]} — {tipo.etiqueta}
                </Text>
              </View>
            );
          })}
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
  selector: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 12,
  },
  selectorTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSeleccionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  resumen: {
    width: "100%",
    marginTop: 16,
  },
  resumenTitulo: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resumenFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
  },
  resumenPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resumenTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
