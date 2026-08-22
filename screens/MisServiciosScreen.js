import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import ServicioModal from "../components/ServicioModal";
import { useServicios } from "../data/ServicioContext";
import { CATEGORIAS_SERVICIOS } from "../data/mockServicios";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

export default function MisServiciosScreen({ navigation }) {
  const { servicios, eliminarServicio } = useServicios();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  function handleAgregar() {
    setItemEditando(null);
    setModalVisible(true);
  }

  function handleEditar(item) {
    setItemEditando(item);
    setModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Mis Servicios</Text>

        {servicios.length === 0 ? (
          <Text style={styles.vacio}>Todavía no cargaste servicios.</Text>
        ) : (
          servicios.map((item) => {
            const categoria = CATEGORIAS_SERVICIOS[item.categoria];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.fila}
                onPress={() => handleEditar(item)}
                activeOpacity={0.8}
              >
                <View style={styles.filaIcono}>
                  <Ionicons name={categoria?.icono ?? "construct-outline"} size={20} color={colors.accentLight} />
                </View>
                <View style={styles.filaTexto}>
                  <Text style={styles.filaNombre} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.filaPrecio}>{formatearPesos(item.precio)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quitarBoton}
                  onPress={() => eliminarServicio(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <ServicioModal visible={modalVisible} item={itemEditando} onClose={() => setModalVisible(false)} />
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
    paddingBottom: 100,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
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
    marginBottom: 10,
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
  },
  filaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaPrecio: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  quitarBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
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
