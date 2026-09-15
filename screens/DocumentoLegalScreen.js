import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { TERMINOS_Y_CONDICIONES, POLITICA_PRIVACIDAD } from "../data/textosLegales";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Pantalla genérica reusada por "Términos y condiciones" y "Política de
// privacidad" (ver DashboardNavigator.js) — el contenido de cada una vive en
// data/textosLegales.js, todavía borradores sin revisión legal (ver el
// banner de aviso más abajo).
const DOCUMENTOS = {
  terminos: { titulo: "Términos y condiciones", texto: TERMINOS_Y_CONDICIONES },
  privacidad: { titulo: "Política de privacidad", texto: POLITICA_PRIVACIDAD },
};

export default function DocumentoLegalScreen({ navigation }) {
  const route = useRoute();
  const documento = DOCUMENTOS[route.params?.tipo] ?? DOCUMENTOS.terminos;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Configuracion")} />

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>{documento.titulo}</Text>

        <View style={styles.banner}>
          <Ionicons name="warning-outline" size={18} color={colors.error} />
          <Text style={styles.bannerTexto}>
            Este documento es un borrador en revisión legal. Todavía no es la versión definitiva.
          </Text>
        </View>

        <Text style={styles.texto}>{documento.texto}</Text>
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
    marginBottom: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.error,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 20,
  },
  bannerTexto: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.error,
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
