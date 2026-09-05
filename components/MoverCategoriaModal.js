import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import MedidorNivelInsumo from "./MedidorNivelInsumo";
import { useData } from "../data/DataContext";
import { CATEGORIAS } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Modal chico (bottom sheet) para ver/ajustar el nivel de un insumo ya
// cargado en "Mis Insumos" (medidor de bidón, ver MedidorNivelInsumo.js),
// moverlo a otra categoría, o eliminarlo del todo. Se abre desde un
// ProductoCasillero (ver MisInsumosScreen.js y CategoriaInsumosModal.js).
export default function MoverCategoriaModal({ visible, insumo, onClose }) {
  const { moverInsumoDeCategoria, eliminarInsumo, ajustarNivelInsumo } = useData();
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [ajustando, setAjustando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) setError(null);
  }, [visible, insumo?.id]);

  async function handleCambiarNivel(nivelNuevo) {
    if (!insumo || nivelNuevo === insumo.nivel) return;
    setAjustando(true);
    setError(null);
    try {
      await ajustarNivelInsumo(insumo.id, nivelNuevo);
    } catch (err) {
      setError("No se pudo actualizar el nivel del insumo. Probá de nuevo.");
    } finally {
      setAjustando(false);
    }
  }

  async function handleElegir(clave) {
    if (!insumo || clave === insumo.categoria || guardando || eliminando || ajustando) return;
    setGuardando(true);
    setError(null);
    try {
      await moverInsumoDeCategoria(insumo.id, clave);
      onClose();
    } catch (err) {
      setError("No se pudo mover el insumo. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    setEliminando(true);
    setError(null);
    try {
      await eliminarInsumo(insumo.id);
      onClose();
    } catch (err) {
      setError("No se pudo eliminar el insumo. Probá de nuevo.");
    } finally {
      setEliminando(false);
    }
  }

  function handleEliminar() {
    Alert.alert(
      "Eliminar insumo",
      `Esta acción no se puede deshacer. ¿Eliminar "${insumo?.nombre}" de Mis Insumos?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: confirmarEliminar },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* react-native-gesture-handler no llega adentro de un <Modal> nativo a
      través del GestureHandlerRootView de App.js (el modal abre su propia
      jerarquía nativa) — mismo detalle que TrabajoNuevoWizard.js, hace falta
      este wrapper propio para que el gesto de arrastre de
      MedidorNivelInsumo.js funcione. */}
      <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Mover a otra categoría</Text>

          {/* Único scroll para todo el contenido variable (antes solo
          scrolleaba la lista de categorías) — con el medidor nuevo sumando
          ~200px, el contenido puede superar el maxHeight del bottom sheet;
          así "Eliminar insumo"/"Cancelar" (fijos, fuera de este scroll)
          siguen siempre alcanzables. */}
          <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
            {insumo ? (
              <Text style={styles.subtitulo} numberOfLines={1}>
                {insumo.nombre}
              </Text>
            ) : null}

            {insumo && (
              <View style={styles.medidorContenedor}>
                <MedidorNivelInsumo
                  insumo={insumo}
                  onCambiarNivel={handleCambiarNivel}
                  deshabilitado={guardando || eliminando || ajustando}
                />
              </View>
            )}

            {Object.entries(CATEGORIAS).map(([clave, datos]) => {
              const esActual = insumo?.categoria === clave;
              return (
                <TouchableOpacity
                  key={clave}
                  style={[styles.opcion, esActual && styles.opcionActual]}
                  onPress={() => handleElegir(clave)}
                  disabled={esActual || guardando || eliminando || ajustando}
                  activeOpacity={0.8}
                >
                  <View style={styles.opcionIcono}>
                    <Ionicons name={datos.icono} size={20} color={colors.accentLight} />
                  </View>
                  <Text style={styles.opcionTexto}>{datos.etiqueta}</Text>
                  {esActual ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.eliminarBoton}
            onPress={handleEliminar}
            disabled={guardando || eliminando || ajustando}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.eliminarBotonTexto}>
              {eliminando ? "Eliminando..." : "Eliminar insumo"}
            </Text>
          </TouchableOpacity>

          <Button
            title="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={guardando || eliminando || ajustando}
          />
        </View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  medidorContenedor: {
    marginTop: 4,
    marginBottom: 4,
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 12,
    maxHeight: "75%",
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  lista: {
    flexGrow: 0,
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  opcionActual: {
    borderColor: colors.accent,
  },
  opcionIcono: {
    width: 34,
    height: 34,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionTexto: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
  },
  eliminarBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.error,
  },
  eliminarBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.error,
  },
});
