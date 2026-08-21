import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function PlaceholderScreen({ navigation }) {
  const route = useRoute();
  const titulo = route.params?.titulo ?? route.name;
  const volverA = route.params?.volverA;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      {volverA ? (
        <ScreenHeader onVolver={() => navigation.navigate(volverA)} />
      ) : (
        <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />
      )}

      <View style={styles.contenido}>
        <View style={styles.icono}>
          <Ionicons name="construct-outline" size={32} color={colors.accent} />
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.texto}>Próximamente</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  icono: {
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
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: "center",
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
});
