import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";
import { colors, fonts } from "../theme";

// Pantalla genérica reusada por "Términos y condiciones" y "Política de
// privacidad" (ver DashboardNavigator.js) mientras no exista contenido
// legal real todavía redactado.
export default function DocumentoLegalScreen({ navigation }) {
  const route = useRoute();
  const titulo = route.params?.titulo ?? route.name;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Configuracion")} />

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.texto}>
          Este documento todavía no fue redactado. Cuando esté listo, va a reemplazar este texto.
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
