import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import EditarTallerModal from "../components/EditarTallerModal";
import EstadoCarga from "../components/EstadoCarga";
import { useTourTarget } from "../data/TourTargetContext";
import { useTaller } from "../data/TallerContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

const TAMANO_LOGO = 88;

// Mis Datos, Configuración de Finanzas, Historial de Clientes y Exportar
// mis datos NO están acá (pedido explícito de Augusto, 2026-09-26): viven en
// la pantalla Menú (screens/MenuScreen.js, 5to tab) aunque
// conceptualmente sigan siendo parte de Mi Taller — Mi Taller queda solo con
// los accesos de uso más frecuente/operativo.
const ITEMS_MENU = [
  { ruta: "MiEquipo", titulo: "Mi Equipo", icono: "people-outline" },
  { ruta: "MisInsumos", titulo: "Mis Insumos", icono: "cube-outline" },
  { ruta: "MisHorarios", titulo: "Mis Horarios", icono: "time-outline" },
  { ruta: "MisServicios", titulo: "Mis Servicios", icono: "construct-outline" },
  { ruta: "Catalogo", titulo: "Catálogo", icono: "albums-outline" },
  { ruta: "Presupuesto", titulo: "Calculadora de Presupuesto", icono: "calculator-outline" },
];

// Tutorial relacional (paso "mitaller"): se resaltan solo las primeras
// filas, no la lista entera — con la lista completa el recorte ocupaba casi
// toda la pantalla y la tarjeta del coachmark quedaba apretada contra el
// header. Así el recorte queda en la parte de arriba y la tarjeta entra
// abajo con aire.
const FILAS_RESALTADAS_TOUR = 3;

export default function MiTallerScreen({ navigation, onAbrirNotificaciones }) {
  const { nombreTaller, logoTaller, cargandoTaller, errorCargaTaller, recargarTaller } = useTaller();
  const [modalVisible, setModalVisible] = useState(false);
  const tourMenu = useTourTarget("mitaller.menu");

  function renderFila(item) {
    return (
      <TouchableOpacity
        key={item.ruta}
        style={styles.fila}
        onPress={() => navigation.navigate(item.ruta)}
        activeOpacity={0.8}
      >
        <View style={styles.filaIcono}>
          <Ionicons name={item.icono} size={20} color={colors.textPrimary} />
        </View>
        <Text style={styles.filaTexto}>{item.titulo}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirNotificaciones={onAbrirNotificaciones} />

      <EstadoCarga cargando={cargandoTaller} error={errorCargaTaller} onReintentar={recargarTaller}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <View style={styles.encabezado}>
            <View style={styles.logoBox}>
              {logoTaller ? (
                <Image source={{ uri: logoTaller }} style={styles.logoImagen} resizeMode="cover" />
              ) : (
                <Ionicons name="storefront-outline" size={34} color={colors.accentLight} />
              )}
            </View>

            <View style={styles.nombreFila}>
              <Text style={styles.nombreTaller} numberOfLines={1}>
                {nombreTaller}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.lapizBoton}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.accentLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* El wrapper de las primeras filas usa el mismo `gap` que la
          lista, así que el espaciado entre todas las filas no cambia. */}
          <View style={styles.lista}>
            <View ref={tourMenu.ref} onLayout={tourMenu.onLayout} collapsable={false} style={styles.lista}>
              {ITEMS_MENU.slice(0, FILAS_RESALTADAS_TOUR).map(renderFila)}
            </View>
            {ITEMS_MENU.slice(FILAS_RESALTADAS_TOUR).map(renderFila)}
          </View>
        </ScrollView>
      </EstadoCarga>

      <EditarTallerModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
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
  encabezado: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  logoBox: {
    width: TAMANO_LOGO,
    height: TAMANO_LOGO,
    borderRadius: TAMANO_LOGO / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImagen: {
    width: "100%",
    height: "100%",
  },
  nombreFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    maxWidth: "100%",
  },
  nombreTaller: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  lapizBoton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  lista: {
    gap: 10,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  filaTexto: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
