import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import EmpleadoModal from "../components/EmpleadoModal";
import PanelPruebasPlan from "../components/PanelPruebasPlan";
import EstadoCarga from "../components/EstadoCarga";
import { useEquipo } from "../data/EquipoContext";
import { useTaller } from "../data/TallerContext";
import { PLANES } from "../data/mockTaller";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

export default function MiEquipoScreen({ navigation }) {
  const { empleados, cargandoEquipo, errorCargaEquipo, recargarEquipo, eliminarEmpleado } = useEquipo();
  const { plan, limiteEmpleados } = useTaller();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);

  const alLimite = empleados.length >= limiteEmpleados;

  function handleAgregar() {
    setItemEditando(null);
    setModalVisible(true);
  }

  function handleEditar(item) {
    setItemEditando(item);
    setModalVisible(true);
  }

  async function handleEliminar(id) {
    setError(null);
    try {
      await eliminarEmpleado(id);
    } catch (err) {
      setError("No se pudo eliminar el empleado. Probá de nuevo.");
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <View style={styles.encabezadoFijo}>
        <Text style={styles.titulo}>Mi Equipo</Text>

        <PanelPruebasPlan />

        {alLimite && (
          <View style={styles.limiteAviso}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.accentLight} />
            <Text style={styles.limiteAvisoTexto}>
              {limiteEmpleados === 0
                ? `Tu plan actual (${PLANES[plan].etiqueta}) no permite cargar empleados.`
                : `Llegaste al límite de empleados de tu plan actual (${PLANES[plan].etiqueta}): hasta ${limiteEmpleados}.`}
            </Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <EstadoCarga cargando={cargandoEquipo} error={errorCargaEquipo} onReintentar={recargarEquipo}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          {empleados.length === 0 ? (
            <Text style={styles.vacio}>Todavía no cargaste empleados.</Text>
          ) : (
            empleados.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.fila}
                onPress={() => handleEditar(item)}
                activeOpacity={0.8}
              >
                <View style={styles.filaIcono}>
                  <Ionicons name="person-outline" size={20} color={colors.accentLight} />
                </View>
                <View style={styles.filaTexto}>
                  <Text style={styles.filaNombre} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.filaRol}>{item.rol}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quitarBoton}
                  onPress={() => handleEliminar(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </EstadoCarga>

      {!alLimite && !cargandoEquipo && !errorCargaEquipo && (
        <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
          <Text style={styles.fabTexto}>+</Text>
        </TouchableOpacity>
      )}

      <EmpleadoModal visible={modalVisible} item={itemEditando} onClose={() => setModalVisible(false)} />
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
    paddingBottom: 100,
  },
  encabezadoFijo: {
    paddingHorizontal: 20,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  limiteAviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 14,
    marginBottom: 16,
  },
  limiteAvisoTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
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
    marginBottom: 10,
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
  filaTexto: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaRol: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  quitarBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  fabTexto: {
    color: colors.bg,
    fontSize: 30,
    fontWeight: "400",
    marginTop: -2,
  },
});
