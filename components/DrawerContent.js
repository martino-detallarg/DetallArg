import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usuarioActual } from "../data/mockUser";
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
      <Ionicons name={icono} size={20} color={color ?? (activo ? colors.accentLight : colors.textSecondary)} />
      <Text style={[styles.itemTexto, activo && styles.itemTextoActivo, color && { color }]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

export default function DrawerContent({ navigation, state, onLogout }) {
  const rutaActiva = state.routeNames[state.index];

  function irA(ruta) {
    navigation.navigate(ruta);
    navigation.closeDrawer();
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={["top", "bottom"]}>
      <View style={styles.perfil}>
        <Text style={styles.empresa}>{usuarioActual.empresa}</Text>
        <Text style={styles.email}>{usuarioActual.email}</Text>
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
          onPress={onLogout}
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemTextoActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
});
