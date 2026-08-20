import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import AgregarInsumoModal from "../components/AgregarInsumoModal";
import { useData } from "../data/DataContext";
import { CATEGORIAS } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii, shadow, shadowSubtle } from "../theme";

const COLUMNAS = 3;
const PADDING_GRILLA = 20;
const ESPACIO_CASILLERO = 12;

export default function MisInsumosScreen({ navigation }) {
  const { misInsumos } = useData();
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);

  const tamanoCasillero =
    (width - PADDING_GRILLA * 2 - ESPACIO_CASILLERO * (COLUMNAS - 1)) / COLUMNAS;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <Text style={styles.titulo}>Mis Insumos</Text>

      <FlatList
        data={misInsumos}
        keyExtractor={(insumo) => insumo.id}
        numColumns={COLUMNAS}
        columnWrapperStyle={misInsumos.length > 0 ? styles.filaCasilleros : undefined}
        ItemSeparatorComponent={() => <View style={styles.repisa} />}
        contentContainerStyle={styles.grilla}
        renderItem={({ item }) => (
          <View style={[styles.casillero, { width: tamanoCasillero, height: tamanoCasillero }]}>
            {item.imagen ? (
              <Image source={item.imagen} style={styles.imagenProducto} resizeMode="contain" />
            ) : (
              <Ionicons
                name={CATEGORIAS[item.categoria]?.icono ?? "cube-outline"}
                size={tamanoCasillero * 0.4}
                color={colors.accentLight}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <View style={styles.vacioIcono}>
              <Ionicons name="cube-outline" size={32} color={colors.accent} />
            </View>
            <Text style={styles.vacioTitulo}>Todavía no cargaste insumos</Text>
            <Text style={styles.vacioTexto}>
              Tocá el botón + para sumar productos a tu estantería.
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <AgregarInsumoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  grilla: {
    paddingHorizontal: PADDING_GRILLA,
    paddingBottom: 100,
    flexGrow: 1,
  },
  filaCasilleros: {
    gap: ESPACIO_CASILLERO,
  },
  casillero: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagenProducto: {
    width: "70%",
    height: "70%",
  },
  // Barra metálica que separa cada fila de casilleros, simulando las repisas
  // de una estantería industrial de taller.
  repisa: {
    height: 14,
    backgroundColor: colors.surface2,
    borderTopWidth: 1,
    borderTopColor: colors.borderAccent,
    borderBottomWidth: 3,
    borderBottomColor: colors.accentDark,
    borderRadius: 4,
    marginVertical: ESPACIO_CASILLERO,
    ...shadowSubtle,
  },
  vacioContenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  vacioIcono: {
    width: 64,
    height: 64,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  vacioTitulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
  },
  vacioTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  fabTexto: {
    color: colors.bg,
    fontSize: 30,
    fontWeight: "400",
    marginTop: -2,
  },
});
