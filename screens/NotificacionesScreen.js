import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import NotificacionStockBajoCard from "../components/NotificacionStockBajoCard";
import { useData } from "../data/DataContext";
import { UMBRAL_STOCK_BAJO } from "../data/mockInsumos";
import { colors, fonts } from "../theme";

export default function NotificacionesScreen({ navigation }) {
  const { misInsumos } = useData();
  const insumosStockBajo = misInsumos.filter((insumo) => insumo.nivel <= UMBRAL_STOCK_BAJO);

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Notificaciones</Text>

        {insumosStockBajo.length === 0 ? (
          <Text style={styles.vacio}>Por ahora no hay alertas de stock.</Text>
        ) : (
          insumosStockBajo.map((insumo) => (
            <NotificacionStockBajoCard key={insumo.id} insumo={insumo} />
          ))
        )}
      </ScrollView>
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
});
