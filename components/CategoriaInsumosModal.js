import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WizardHeader from "./wizard/WizardHeader";
import ProductoCasillero from "./ProductoCasillero";
import { CATEGORIAS } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii } from "../theme";

const COLUMNAS = 3;
const PADDING_GRILLA = 20;
const ESPACIO_CASILLERO = 12;

export default function CategoriaInsumosModal({ visible, categoriaKey, productos, onClose }) {
  const { width } = useWindowDimensions();
  const tamanoCasillero =
    (width - PADDING_GRILLA * 2 - ESPACIO_CASILLERO * (COLUMNAS - 1)) / COLUMNAS;
  const categoria = categoriaKey ? CATEGORIAS[categoriaKey] : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader titulo={categoria?.etiqueta ?? ""} paso={1} totalPasos={1} onAtras={onClose} />

          <ScrollView contentContainerStyle={styles.contenido}>
            {productos.length === 0 ? (
              <View style={styles.vacioContenedor}>
                <Text style={styles.vacioTexto}>
                  Todavía no hay productos cargados en esta categoría.
                </Text>
              </View>
            ) : (
              <View style={styles.grilla}>
                {productos.map((producto) => (
                  <ProductoCasillero key={producto.id} producto={producto} tamano={tamanoCasillero} />
                ))}
              </View>
            )}
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
    paddingHorizontal: PADDING_GRILLA,
    paddingTop: 10,
    paddingBottom: 40,
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACIO_CASILLERO,
  },
  vacioContenedor: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderAccent,
    borderRadius: radii.card,
    ...continuousCorner,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },
  vacioTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
});
