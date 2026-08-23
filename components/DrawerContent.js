import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTaller } from "../data/TallerContext";
import { useAuth } from "../data/AuthContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

const ITEMS_PRINCIPALES = [
  { ruta: "Home", titulo: "Inicio", icono: "home-outline" },
  { ruta: "Clientes", titulo: "Clientes", icono: "person-outline" },
  { ruta: "MiTaller", titulo: "Mi Taller", icono: "storefront-outline" },
  { ruta: "Finanzas", titulo: "Finanzas", icono: "stats-chart-outline" },
  { ruta: "Agenda", titulo: "Agenda", icono: "calendar-outline" },
  { ruta: "Configuracion", titulo: "Configuración", icono: "settings-outline" },
  { ruta: "Soporte", titulo: "Soporte", icono: "help-circle-outline" },
  { ruta: "Notificaciones", titulo: "Notificaciones", icono: "notifications-outline" },
];

function ItemMenu({ icono, titulo, activo, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.item, activo && styles.itemActivo]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icono} size={24} color={color ?? colors.textPrimary} />
      <Text style={[styles.itemTexto, activo && styles.itemTextoActivo, color && { color }]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

export default function DrawerContent({ navigation, state }) {
  const rutaActiva = state.routeNames[state.index];
  const { nombreTaller } = useTaller();
  const { user, signOut } = useAuth();

  function irA(ruta) {
    navigation.navigate(ruta);
    navigation.closeDrawer();
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={["top", "bottom"]}>
      <View style={styles.perfil}>
        <Text style={styles.empresa}>{nombreTaller || "Mi taller"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.separador} />

      <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
        {ITEMS_PRINCIPALES.map((item) => (
          <ItemMenu
            key={item.ruta}
            icono={item.icono}
            titulo={item.titulo}
            activo={rutaActiva === item.ruta}
            onPress={() => irA(item.ruta)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.separador} />
        <ItemMenu
          icono="log-out-outline"
          titulo="Cerrar sesión"
          color={colors.error}
          onPress={signOut}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  perfil: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  empresa: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  lista: {
    flex: 1,
  },
  footer: {
    paddingBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: radii.button,
    ...continuousCorner,
  },
  itemActivo: {
    backgroundColor: colors.surface2,
  },
  itemTexto: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  itemTextoActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
});
