import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import GraficoBarras from "../components/GraficoBarras";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;

// Datos de ejemplo (inventados) de los últimos 6 meses, solo para ilustrar
// el diseño de la pantalla hasta que se defina de dónde sale la información
// real de facturación.
const INGRESOS_EJEMPLO = [
  { etiqueta: "Mar", valor: 185000 },
  { etiqueta: "Abr", valor: 210000 },
  { etiqueta: "May", valor: 260000 },
  { etiqueta: "Jun", valor: 240000 },
  { etiqueta: "Jul", valor: 300000 },
  { etiqueta: "Ago", valor: 275000 },
].map((item) => ({ ...item, valorTexto: `$${Math.round(item.valor / 1000)}K` }));

export default function FinanzasScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Finanzas</Text>

        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>Ingresos · últimos 6 meses</Text>
          <GraficoBarras datos={INGRESOS_EJEMPLO} ancho={anchoGrafico} />
        </View>

        <Text style={styles.nota}>
          Datos de ejemplo para mostrar el diseño. Más adelante se reemplaza por la facturación real.
        </Text>
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
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 40,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  tarjetaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  nota: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },
});
