import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { useAuth } from "../data/AuthContext";
import { useTaller } from "../data/TallerContext";
import { useClientes } from "../data/ClienteContext";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { generarYCompartirBackup } from "../utils/backupDatos";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Ítems de navegación: Mis Datos, Configuración de Finanzas e Historial de
// Clientes se sumaron acá el 2026-09-26 (pedido explícito de Augusto) — antes
// vivían como accesos dentro de MiTallerScreen, pero él los quiere en el
// Menú aunque conceptualmente sigan siendo parte de Mi Taller. Todas las
// rutas salvo HistorialClientes son tabs hermanos sin botón visible (ver
// navigation/DashboardNavigator.js), así que `navigation.navigate(ruta)`
// las resuelve directo en el Tab.Navigator. HistorialClientes vive más
// arriba, en el RootStack: el Tab.Navigator no la conoce y la acción hace
// bubbling hasta el RootStack, que sí.
//
// "Volver" desde cualquiera de estas pantallas regresa acá gracias a
// backBehavior="history" en el Tab.Navigator (ver DashboardNavigator.js).
const ITEMS = [
  { ruta: "Clientes", titulo: "Clientes", icono: "person-outline" },
  { ruta: "Agenda", titulo: "Agenda", icono: "calendar-outline" },
  { ruta: "MisDatos", titulo: "Mis Datos", icono: "document-text-outline" },
  { ruta: "ConfiguracionFinanzas", titulo: "Configuración de Finanzas", icono: "options-outline" },
  { ruta: "HistorialClientes", titulo: "Historial de Clientes", icono: "archive-outline" },
  { ruta: "ConfiguracionStack", titulo: "Configuración", icono: "settings-outline" },
  { ruta: "Soporte", titulo: "Soporte", icono: "help-circle-outline" },
];

// 5to tab de la barra de abajo ("las cosas que sobran", pedido explícito de
// Augusto). Hasta el 2026-09-27 era un bottom-sheet (components/MenuModal.js,
// borrado); ahora es una pantalla de tab más, con el mismo tratamiento que
// Home / Mi Taller / Finanzas (header con campanita, filas iguales a las de
// Mi Taller). "Exportar mis datos" es una acción, no una pantalla, así que
// no está en ITEMS sino como su propia fila con loading.
export default function MenuScreen({ navigation, onAbrirNotificaciones }) {
  const { signOut } = useAuth();
  const { nombreTaller } = useTaller();
  const { clientes } = useClientes();
  const { turnos } = useTurnos();
  const { servicios } = useServicios();
  const { misInsumos, costosFijos } = useData();
  const { cobros, gastosVariables } = useFinanzas();
  const [exportando, setExportando] = useState(false);

  // 100% de solo lectura sobre lo que ya está cargado en memoria por los
  // contextos de arriba — no dispara ningún fetch nuevo ni toca Supabase.
  async function handleExportarDatos() {
    setExportando(true);
    try {
      await generarYCompartirBackup(nombreTaller, {
        clientes,
        turnos,
        servicios,
        insumos: misInsumos,
        costosFijos,
        cobros,
        gastosVariables,
      });
    } catch (err) {
      Alert.alert("No se pudo generar el backup", "Probá de nuevo en unos segundos.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirNotificaciones={onAbrirNotificaciones} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Menú</Text>

        <View style={styles.lista}>
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.ruta}
              style={styles.fila}
              onPress={() => navigation.navigate(item.ruta)}
              activeOpacity={0.8}
            >
              <View style={styles.filaIcono}>
                <Ionicons name={item.icono} size={20} color={colors.textPrimary} />
              </View>
              <Text style={styles.filaTexto}>{item.titulo}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.separador} />

        <TouchableOpacity
          style={styles.fila}
          onPress={handleExportarDatos}
          disabled={exportando}
          activeOpacity={0.8}
        >
          <View style={styles.filaIcono}>
            {exportando ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Ionicons name="cloud-download-outline" size={20} color={colors.textPrimary} />
            )}
          </View>
          <Text style={styles.filaTexto}>Exportar mis datos</Text>
        </TouchableOpacity>

        <View style={styles.separador} />

        <TouchableOpacity style={styles.fila} onPress={signOut} activeOpacity={0.8}>
          <View style={[styles.filaIcono, styles.filaIconoError]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </View>
          <Text style={[styles.filaTexto, styles.filaTextoError]}>Cerrar sesión</Text>
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
    // El "+" central de la tab bar sobresale ~22px por encima de ella
    // (marginTop: -22 en DashboardNavigator.js): con 48 la última fila
    // ("Cerrar sesión") queda siempre scrolleable por encima del botón.
    paddingBottom: 48,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 14,
  },
  lista: {
    gap: 10,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 16,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  filaIconoError: {
    backgroundColor: colors.errorTint,
  },
  filaTexto: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaTextoError: {
    color: colors.error,
  },
});
