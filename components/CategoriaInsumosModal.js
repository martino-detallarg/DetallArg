import { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import ProductoCasillero from "./ProductoCasillero";
import { CATEGORIAS } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii } from "../theme";

const COLUMNAS = 3;
const PADDING_GRILLA = 20;
const ESPACIO_CASILLERO = 12;

export default function CategoriaInsumosModal({ visible, categoriaKey, productos, onClose, onAgregarEnCategoria }) {
  const { width } = useWindowDimensions();
  const [busqueda, setBusqueda] = useState("");
  const tamanoCasillero =
    (width - PADDING_GRILLA * 2 - ESPACIO_CASILLERO * (COLUMNAS - 1)) / COLUMNAS;
  const categoria = categoriaKey ? CATEGORIAS[categoriaKey] : null;

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.marca.toLowerCase().includes(termino)
    );
  }, [productos, busqueda]);

  function handleClose() {
    setBusqueda("");
    onClose();
  }

  function handleAgregarPrimero() {
    onAgregarEnCategoria?.(categoria?.etiqueta);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader titulo={categoria?.etiqueta ?? ""} paso={1} totalPasos={1} onAtras={handleClose} />

          {productos.length > 0 && (
            <View style={styles.buscador}>
              <Input
                placeholder="Buscar por producto o marca..."
                value={busqueda}
                onChangeText={setBusqueda}
                autoCapitalize="none"
              />
            </View>
          )}

          <FlatList
            data={filtrados}
            keyExtractor={(producto) => producto.id}
            numColumns={COLUMNAS}
            columnWrapperStyle={styles.fila}
            contentContainerStyle={styles.contenido}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <ProductoCasillero producto={item} tamano={tamanoCasillero} />}
            ListEmptyComponent={
              productos.length === 0 ? (
                <TouchableOpacity
                  style={styles.vacioContenedor}
                  onPress={handleAgregarPrimero}
                  activeOpacity={0.75}
                >
                  <View style={styles.vacioIconoWrap}>
                    <Ionicons name={categoria?.icono ?? "cube-outline"} size={28} color={colors.accent} />
                    <View style={styles.vacioMasBadge}>
                      <Ionicons name="add" size={13} color={colors.bg} />
                    </View>
                  </View>
                  <Text style={styles.vacioTexto}>
                    Todavía no cargaste productos de {categoria?.etiqueta ?? "esta categoría"}.
                  </Text>
                  <Text style={styles.vacioCta}>Tocá para agregar el primero</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.vacioContenedorSimple}>
                  <Text style={styles.vacioTexto}>No encontramos productos con ese criterio.</Text>
                </View>
              )
            }
          />
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
  buscador: {
    paddingHorizontal: PADDING_GRILLA,
  },
  contenido: {
    paddingHorizontal: PADDING_GRILLA,
    paddingTop: 10,
    paddingBottom: 40,
    flexGrow: 1,
    gap: ESPACIO_CASILLERO,
  },
  fila: {
    gap: ESPACIO_CASILLERO,
  },
  vacioContenedor: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    marginTop: 20,
  },
  vacioIconoWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  vacioMasBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  vacioContenedorSimple: {
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
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  vacioCta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
    marginTop: 8,
  },
});
