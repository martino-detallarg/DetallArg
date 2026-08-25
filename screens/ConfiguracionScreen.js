import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { useTaller } from "../data/TallerContext";
import { useAuth } from "../data/AuthContext";
import { PLANES } from "../data/mockTaller";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Mantener sincronizado a mano con "expo.version" en app.json (no hay
// expo-constants instalado para leerlo en runtime).
const VERSION_APP = "1.0.0";

export default function ConfiguracionScreen({ navigation }) {
  const { plan, misDatos, nombreTaller } = useTaller();
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.getParent()?.openDrawer()} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Configuración</Text>

        <Text style={styles.seccionLabel}>Cuenta</Text>
        <View style={styles.tarjeta}>
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>Nombre</Text>
            <Text style={styles.datoValor}>{misDatos.nombrePersonal || "-"}</Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>Empresa</Text>
            <Text style={styles.datoValor}>{nombreTaller || "-"}</Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>Email</Text>
            <Text style={styles.datoValor} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>Plan</Text>
            <Text style={styles.datoValor}>{PLANES[plan].etiqueta}</Text>
          </View>
          <View style={styles.separador} />
          <TouchableOpacity
            style={styles.fila}
            onPress={() => navigation.navigate("MisDatos")}
            activeOpacity={0.8}
          >
            <Text style={styles.filaTexto}>Editar mis datos</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.seccionLabel}>Legal</Text>
        <View style={styles.tarjeta}>
          <TouchableOpacity
            style={styles.fila}
            onPress={() => navigation.navigate("Terminos")}
            activeOpacity={0.8}
          >
            <Text style={styles.filaTexto}>Términos y condiciones</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.separador} />
          <TouchableOpacity
            style={styles.fila}
            onPress={() => navigation.navigate("Privacidad")}
            activeOpacity={0.8}
          >
            <Text style={styles.filaTexto}>Política de privacidad</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.seccionLabel}>Acerca de</Text>
        <View style={styles.tarjeta}>
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>Versión</Text>
            <Text style={styles.datoValor}>{VERSION_APP}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cerrarSesion} onPress={signOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  seccionLabel: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 24,
    overflow: "hidden",
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 14,
  },
  datoFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
  },
  datoLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  datoValor: {
    flexShrink: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "right",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
  },
  filaTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cerrarSesion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 14,
  },
  cerrarSesionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.error,
  },
});
