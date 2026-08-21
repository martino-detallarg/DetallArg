import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DamageDiagram, { PANEL_IDS as ZONAS_IDS, PANEL_LABELS as ZONAS_LABELS } from "./DamageDiagram";
import Input from "../Input";
import Button from "../Button";
import { DIAGRAMAS_POR_TIPO_VEHICULO } from "../diagrams/vehicles";
import { TIPOS_DANIO } from "../../data/tiposDanio";
import { colors, continuousCorner, fonts, radii } from "../../theme";

// Envuelve al diagrama de check-in visual que corresponda según
// `claveVehiculo` (el diagrama de paneles reales de esa carrocería si existe
// en components/diagrams/vehicles, o el genérico de Frente si no) y le
// suma, siempre igual sin importar qué diagrama se esté mostrando: el
// selector de tipos de daño por panel (selección múltiple) y la lista
// resumen "Daños registrados". Así, cuando se sumen las próximas
// carrocerías, alcanza con agregarlas al registro de
// components/diagrams/vehicles — no hay que tocar este selector.
//
// `danios` es un mapa { zonaId: { tipos: [tipoDanioId, ...], nota } }: cada
// zona puede tener varios tipos de daño a la vez (por eso `tipos` es un
// array), y `nota` solo se usa cuando "otro" está entre los tipos elegidos.
export default function DiagramaDanios({ claveVehiculo, danios, onCambiarZona, ancho = 220 }) {
  const [zonaActiva, setZonaActiva] = useState(null);

  const diagrama = DIAGRAMAS_POR_TIPO_VEHICULO[claveVehiculo];
  const Diagrama = diagrama?.Componente ?? DamageDiagram;
  const panelIds = diagrama?.panelIds ?? ZONAS_IDS;
  const panelLabels = diagrama?.panelLabels ?? ZONAS_LABELS;

  function handleTocarZona(id) {
    setZonaActiva((actual) => (actual === id ? null : id));
  }

  const zonaDatos = zonaActiva ? danios[zonaActiva] ?? { tipos: [], nota: "" } : null;

  function aplicarCambioZona(tipos, nota) {
    onCambiarZona(zonaActiva, tipos.length > 0 ? { tipos, nota } : null);
  }

  function handleToggleTipo(tipoId) {
    const yaEsta = zonaDatos.tipos.includes(tipoId);
    const nuevosTipos = yaEsta ? zonaDatos.tipos.filter((t) => t !== tipoId) : [...zonaDatos.tipos, tipoId];
    // Si se desmarca "otro" (o nunca estuvo), no tiene sentido arrastrar la nota.
    const nuevaNota = nuevosTipos.includes("otro") ? zonaDatos.nota : "";
    aplicarCambioZona(nuevosTipos, nuevaNota);
  }

  function handleCambiarNota(texto) {
    aplicarCambioZona(zonaDatos.tipos, texto);
  }

  const zonasConDanio = panelIds.filter((id) => danios[id]?.tipos?.length > 0);

  return (
    <View style={styles.contenedor}>
      <Diagrama danios={danios} onPanelPress={handleTocarZona} width={ancho} />

      {zonaActiva ? (
        <View style={styles.selector}>
          <Text style={styles.selectorTitulo}>{panelLabels[zonaActiva]} · marcá los daños</Text>
          <View style={styles.chips}>
            {Object.entries(TIPOS_DANIO).map(([id, tipo]) => {
              const activo = zonaDatos.tipos.includes(id);
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.chip, activo && { backgroundColor: tipo.color, borderColor: tipo.color }]}
                  onPress={() => handleToggleTipo(id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.chipPunto, { backgroundColor: tipo.color }]} />
                  <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>{tipo.etiqueta}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {zonaDatos.tipos.includes("otro") && (
            <View style={styles.notaWrap}>
              <Input
                placeholder="Ej: contaminación de pintura"
                value={zonaDatos.nota}
                onChangeText={handleCambiarNota}
              />
            </View>
          )}

          <Button title="Listo" variant="secondary" onPress={() => setZonaActiva(null)} />
        </View>
      ) : (
        <Text style={styles.ayuda}>Tocá un sector para marcar sus daños</Text>
      )}

      {zonasConDanio.length > 0 && (
        <View style={styles.resumen}>
          <Text style={styles.resumenTitulo}>Daños registrados</Text>
          {zonasConDanio.map((id) => (
            <View key={id} style={styles.resumenZona}>
              <Text style={styles.resumenZonaTitulo}>{panelLabels[id]}</Text>
              {danios[id].tipos.map((tipoId) => {
                const tipo = TIPOS_DANIO[tipoId];
                return (
                  <View key={tipoId} style={styles.resumenFila}>
                    <View style={[styles.resumenPunto, { backgroundColor: tipo.color }]} />
                    <Text style={styles.resumenTexto}>
                      {tipo.etiqueta}
                      {tipoId === "otro" && danios[id].nota ? `: ${danios[id].nota}` : ""}
                    </Text>
                  </View>
                );
              })}
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
    marginBottom: 4,
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
  notaWrap: {
    marginTop: 6,
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
  resumenZona: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  resumenZonaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  resumenFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  resumenPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resumenTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
