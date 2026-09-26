import { useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../data/AuthContext";
import { useTaller } from "../data/TallerContext";
import { useClientes } from "../data/ClienteContext";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { generarYCompartirBackup } from "../utils/backupDatos";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Ítems de navegación: Mis Datos, Configuración de Finanzas e Historial de
// Clientes se sumaron acá el 2026-09-26 (pedido explícito de Augusto) — antes
// vivían como accesos dentro de MiTallerScreen, pero él los quiere en el
// menú de hamburguesa aunque conceptualmente sigan siendo parte de Mi
// Taller. Mis Datos/ConfiguracionFinanzas son tabs de nivel superior sin
// botón visible (ver navigation/DashboardNavigator.js) — sus pantallas ya
// navegaban de vuelta con `navigation.navigate("MiTaller")`, no con
// `goBack()`, así que sacarlas del stack anidado de Mi Taller no rompe nada.
// HistorialClientes vive más arriba todavía, en el RootStack (ver el
// comentario de esa ruta en DashboardNavigator.js) — `navigation.navigate`
// la encuentra igual por bubbling.
const ITEMS = [
  { ruta: "Clientes", titulo: "Clientes", icono: "person-outline" },
  { ruta: "Agenda", titulo: "Agenda", icono: "calendar-outline" },
  { ruta: "MisDatos", titulo: "Mis Datos", icono: "document-text-outline" },
  { ruta: "ConfiguracionFinanzas", titulo: "Configuración de Finanzas", icono: "options-outline" },
  { ruta: "HistorialClientes", titulo: "Historial de Clientes", icono: "archive-outline" },
  { ruta: "ConfiguracionStack", titulo: "Configuración", icono: "settings-outline" },
  { ruta: "Soporte", titulo: "Soporte", icono: "help-circle-outline" },
];

function Opcion({ icono, titulo, color, onPress, disabled, cargando }) {
  return (
    <TouchableOpacity style={styles.opcion} onPress={onPress} activeOpacity={0.8} disabled={disabled}>
      {cargando ? (
        <ActivityIndicator size="small" color={colors.textMuted} style={styles.opcionIconoSlot} />
      ) : (
        <Ionicons name={icono} size={22} color={color ?? colors.textPrimary} style={styles.opcionIconoSlot} />
      )}
      <Text style={[styles.opcionTitulo, color && { color }]}>{titulo}</Text>
    </TouchableOpacity>
  );
}

// Bottom-sheet del 5to tab ("las cosas que sobran", pedido explícito de
// Augusto): reemplaza al viejo Drawer completo (components/DrawerContent.js)
// ahora que Home/MiTaller/Finanzas pasaron a ser tabs propios y
// Notificaciones se movió al ícono de campana del header (ver
// ScreenHeader.js). "Exportar mis datos" también vive acá (se sacó de
// MiTallerScreen el 2026-09-26, mismo pedido de arriba) — es una acción, no
// una pantalla, así que no está en ITEMS/onNavegar sino como su propio botón
// con loading, igual que tenía antes en Mi Taller.
export default function MenuModal({ visible, onClose, onNavegar }) {
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.fondo} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.contenedor} activeOpacity={1} onPress={() => {}}>
          {ITEMS.map((item) => (
            <Opcion
              key={item.ruta}
              icono={item.icono}
              titulo={item.titulo}
              onPress={() => onNavegar(item.ruta)}
            />
          ))}

          <View style={styles.separador} />

          <Opcion
            icono="cloud-download-outline"
            titulo="Exportar mis datos"
            onPress={handleExportarDatos}
            disabled={exportando}
            cargando={exportando}
          />

          <View style={styles.separador} />

          <Opcion icono="log-out-outline" titulo="Cerrar sesión" color={colors.error} onPress={signOut} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    paddingBottom: 34,
    gap: 2,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  opcionIconoSlot: {
    width: 22,
  },
  opcionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 6,
  },
});
