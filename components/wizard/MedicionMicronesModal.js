import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WizardHeader from "./WizardHeader";
import Button from "../Button";
import ChipGroup from "../ChipGroup";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const OPCIONES_MODO = [
  { value: "panel", label: "Por panel" },
  { value: "promedio", label: "Promedio general" },
];

// Cuánto de lo cargado en `medicion` alcanza para mostrar en el resumen
// compacto de InspeccionVisualStep.js (la fila que abre este modal) — "No
// cargado" hasta que haya al menos un valor numérico válido en el modo
// elegido. Exportado para que InspeccionVisualStep.js no duplique este
// criterio.
export function resumenMedicionMicrones(medicion) {
  if (medicion?.modo === "promedio") {
    return medicion.promedio?.trim() ? `Promedio: ${medicion.promedio} µm` : "No cargado";
  }
  if (medicion?.modo === "panel") {
    const cantidad = Object.values(medicion.porPanel ?? {}).reduce(
      (suma, mapa) => suma + Object.values(mapa ?? {}).filter((v) => v?.trim()).length,
      0
    );
    return cantidad > 0 ? `${cantidad} panel${cantidad > 1 ? "es" : ""} medido${cantidad > 1 ? "s" : ""}` : "No cargado";
  }
  return "No cargado";
}

// Modal de "Espesor de pintura" (medidor de espesor en micrones, µm) — Modal
// aparte en vez de una sección inline en InspeccionVisualStep.js: en modo
// "Por panel" la lista puede tener una fila por cada panel del diagrama
// (hasta 12+ en algunas carrocerías), y esa pantalla ya tiene su propio
// carrusel de vistas con altura fija — un bloque así de largo ahí rompería
// el layout. Acá adentro, en cambio, tiene su propio ScrollView.
//
// El taller elige UN SOLO modo por trabajo — no se combinan "Por panel" y
// "Promedio general" en el mismo turno (ver TurnoContext.agregarTurno, que
// solo persiste el modo activo al guardar). `medicion` es { modo:
// null|"panel"|"promedio", promedio: "texto", porPanel: { [vistaId]: {
// [panelId]: "texto" } } }. `panelesPorVista` es [{ vistaId, etiqueta,
// panelIds, panelLabels }], mismo dato de origen que ya usa DiagramaDanios.js
// para el selector de tipos de daño (ver InspeccionVisualStep.js).
export default function MedicionMicronesModal({ visible, panelesPorVista, medicion, onCambiar, onCerrar }) {
  const modo = medicion?.modo ?? null;
  const promedio = medicion?.promedio ?? "";
  const porPanel = medicion?.porPanel ?? {};

  function elegirModo(nuevoModo) {
    onCambiar({ ...medicion, modo: modo === nuevoModo ? null : nuevoModo });
  }

  function cambiarPromedio(valor) {
    onCambiar({ ...medicion, modo: "promedio", promedio: valor });
  }

  function cambiarPanel(vistaId, panelId, valor) {
    onCambiar({
      ...medicion,
      modo: "panel",
      porPanel: { ...porPanel, [vistaId]: { ...(porPanel[vistaId] ?? {}), [panelId]: valor } },
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onCerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader titulo="Espesor de pintura" paso={1} totalPasos={1} onAtras={onCerrar} />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Text style={styles.ayuda}>
              Opcional — dato de un medidor de espesor/micrómetro, útil para detectar repintados. Elegí un solo
              modo: un promedio general del vehículo, o un valor por cada panel.
            </Text>

            <ChipGroup
              style={styles.chips}
              options={OPCIONES_MODO.map((o) => ({ ...o, selected: modo === o.value }))}
              onPress={elegirModo}
            />

            {modo === "promedio" && (
              <View style={styles.filaPanel}>
                <Text style={styles.filaLabel}>Promedio general</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={promedio}
                    onChangeText={cambiarPromedio}
                    placeholder="Ej: 110"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={styles.sufijo}>µm</Text>
                </View>
              </View>
            )}

            {modo === "panel" &&
              panelesPorVista.map((vista) => (
                <View key={vista.vistaId} style={styles.vistaBloque}>
                  <Text style={styles.vistaTitulo}>{vista.etiqueta}</Text>
                  {vista.panelIds.map((panelId) => (
                    <View key={panelId} style={styles.filaPanel}>
                      <Text style={styles.filaLabel} numberOfLines={1}>
                        {vista.panelLabels[panelId] ?? panelId}
                      </Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          value={porPanel[vista.vistaId]?.[panelId] ?? ""}
                          onChangeText={(valor) => cambiarPanel(vista.vistaId, panelId, valor)}
                          placeholder="-"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                        />
                        <Text style={styles.sufijo}>µm</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}

            <View style={styles.boton}>
              <Button title="Listo" onPress={onCerrar} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  chips: {
    marginBottom: 16,
  },
  vistaBloque: {
    marginTop: 10,
  },
  vistaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  filaPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 6,
  },
  filaLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: 92,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    height: 38,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    padding: 0,
  },
  sufijo: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  boton: {
    marginTop: 20,
  },
});
