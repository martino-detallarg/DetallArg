import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Input from "../components/Input";
import ClienteDetalleModal from "../components/ClienteDetalleModal";
import { useData } from "../data/DataContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function ClientesScreen({ navigation }) {
  const { clientes, getAutosByClienteId } = useData();
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Clientes</Text>
        <Input
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const cantidadAutos = getAutosByClienteId(item.id).length;
          return (
            <TouchableOpacity
              style={styles.fila}
              onPress={() => setClienteSeleccionado(item)}
              activeOpacity={0.8}
            >
              <View style={styles.filaIcono}>
                <Ionicons name="person-outline" size={20} color={colors.accentLight} />
              </View>
              <View style={styles.filaTexto}>
                <Text style={styles.filaNombre}>{item.nombre}</Text>
                <Text style={styles.filaSub}>
                  {item.telefono} · {cantidadAutos} vehículo{cantidadAutos === 1 ? "" : "s"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vacio}>No encontramos clientes con ese nombre.</Text>
        }
      />

      <ClienteDetalleModal
        visible={clienteSeleccionado !== null}
        cliente={clienteSeleccionado}
        onClose={() => setClienteSeleccionado(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  encabezado: {
    paddingHorizontal: 20,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 14,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    marginTop: 10,
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
  filaSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
