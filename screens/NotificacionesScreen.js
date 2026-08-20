import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import NotificacionStockBajoCard from "../components/NotificacionStockBajoCard";
import SolicitarPedidoModal from "../components/SolicitarPedidoModal";
import { useData } from "../data/DataContext";
import { usePedido } from "../data/PedidoContext";
import { UMBRAL_STOCK_BAJO } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

export default function NotificacionesScreen({ navigation }) {
  const { misInsumos } = useData();
  const { pedido } = usePedido();
  const [modalVisible, setModalVisible] = useState(false);
  const insumosStockBajo = misInsumos.filter((insumo) => insumo.nivel <= UMBRAL_STOCK_BAJO);
  const hayPedido = pedido.length > 0;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <ScrollView
        contentContainerStyle={[styles.contenido, hayPedido && styles.contenidoConBoton]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Notificaciones</Text>

        {insumosStockBajo.length === 0 ? (
          <Text style={styles.vacio}>Por ahora no hay alertas de stock.</Text>
        ) : (
          insumosStockBajo.map((insumo) => (
            <NotificacionStockBajoCard key={insumo.id} insumo={insumo} />
          ))
        )}
      </ScrollView>

      {hayPedido && (
        <TouchableOpacity
          style={styles.botonPedido}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={18} color={colors.bg} />
          <Text style={styles.botonPedidoTexto}>Solicitar pedido ({pedido.length})</Text>
        </TouchableOpacity>
      )}

      <SolicitarPedidoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
  contenidoConBoton: {
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
  botonPedido: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    height: 52,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...shadow,
  },
  botonPedidoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.bg,
  },
});
