import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import NotificacionStockBajoCard from "../components/NotificacionStockBajoCard";
import SolicitarPedidoModal from "../components/SolicitarPedidoModal";
import { useData } from "../data/DataContext";
import { usePedido } from "../data/PedidoContext";
import { UMBRAL_STOCK_BAJO } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const CANTIDAD_PAGINAS = 2;

export default function NotificacionesScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { misInsumos } = useData();
  const { pedido } = usePedido();
  const [modalVisible, setModalVisible] = useState(false);
  const [paginaActiva, setPaginaActiva] = useState(0);
  const insumosStockBajo = misInsumos.filter((insumo) => insumo.nivel <= UMBRAL_STOCK_BAJO);
  const hayPedido = pedido.length > 0;

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setPaginaActiva(indice);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <Text style={styles.titulo}>Notificaciones</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollFin}
        style={styles.pager}
      >
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {insumosStockBajo.length === 0 ? (
            <Text style={styles.vacio}>Por ahora no hay alertas de stock.</Text>
          ) : (
            insumosStockBajo.map((insumo) => (
              <NotificacionStockBajoCard key={insumo.id} insumo={insumo} />
            ))
          )}
        </ScrollView>

        <View style={[styles.paginaClientes, { width }]}>
          <View style={styles.clientesIcono}>
            <Ionicons name="notifications-outline" size={32} color={colors.accent} />
          </View>
          <Text style={styles.clientesTexto}>
            Acá vas a ver recordatorios para tus clientes, como renovación de tratamientos o
            aplicar booster.
          </Text>
        </View>
      </ScrollView>

      {hayPedido && paginaActiva === 0 && (
        <TouchableOpacity
          style={styles.botonPedido}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={18} color={colors.bg} />
          <Text style={styles.botonPedidoTexto}>Solicitar pedido ({pedido.length})</Text>
        </TouchableOpacity>
      )}

      <View style={styles.puntos}>
        {Array.from({ length: CANTIDAD_PAGINAS }).map((_, indice) => (
          <View key={indice} style={[styles.punto, indice === paginaActiva && styles.puntoActivo]} />
        ))}
      </View>

      <SolicitarPedidoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
  pager: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  paginaClientes: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  clientesIcono: {
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
  clientesTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  puntoActivo: {
    width: 18,
    backgroundColor: colors.accent,
  },
  botonPedido: {
    marginHorizontal: 20,
    marginTop: 10,
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
