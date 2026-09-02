import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import CostoFijoModal from "../components/CostoFijoModal";
import EstadoCarga from "../components/EstadoCarga";
import { useData } from "../data/DataContext";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

export default function CostosFijosScreen({ navigation }) {
  const { costosFijos, cargandoCostosFijos, errorCargaCostosFijos, recargarCostosFijos, eliminarCostoFijo } =
    useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const total = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  function handleAgregar() {
    setItemEditando(null);
    setModalVisible(true);
  }

  function handleEditar(item) {
    setItemEditando(item);
    setModalVisible(true);
  }

  async function handleEliminar(id) {
    try {
      await eliminarCostoFijo(id);
    } catch (err) {
      Alert.alert("No se pudo eliminar", "No se pudo eliminar el costo fijo. Probá de nuevo.");
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Finanzas")} />

      <Text style={styles.titulo}>Costos Fijos</Text>

      <EstadoCarga cargando={cargandoCostosFijos} error={errorCargaCostosFijos} onReintentar={recargarCostosFijos}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <View style={styles.totalTarjeta}>
            <Text style={styles.totalLabel}>Total mensual</Text>
            <Text style={styles.totalMonto}>{formatearPesos(total)}</Text>
          </View>

          {costosFijos.length === 0 ? (
            <Text style={styles.vacio}>Todavía no cargaste costos fijos.</Text>
          ) : (
            costosFijos.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.fila}
                  onPress={() => handleEditar(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.filaIcono}>
                    <Ionicons name="cash-outline" size={20} color={colors.accentLight} />
                  </View>
                  <View style={styles.filaTexto}>
                    <Text style={styles.filaNombre}>{item.nombre}</Text>
                    <Text style={styles.filaMonto}>{formatearPesos(item.monto)} / mes</Text>
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
              );
            })
          )}
        </ScrollView>
      </EstadoCarga>

      <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <CostoFijoModal visible={modalVisible} item={itemEditando} onClose={() => setModalVisible(false)} />
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
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  totalTarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
  },
  totalLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalMonto: {
    fontFamily: fonts.headingBlack,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 6,
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
  filaMonto: {
    fontFamily: fonts.bodySemiBold,
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
