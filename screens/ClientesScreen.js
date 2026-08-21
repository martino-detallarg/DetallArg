import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Input from "../components/Input";
import ClienteModal from "../components/ClienteModal";
import VehiculosClienteModal from "../components/VehiculosClienteModal";
import { useClientes } from "../data/ClienteContext";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

function coincide(campo, termino) {
  return (campo ?? "").toLowerCase().includes(termino);
}

export default function ClientesScreen({ navigation }) {
  const { clientes } = useClientes();
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [clienteDetalleId, setClienteDetalleId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const clienteEditando = clientes.find((c) => c.id === clienteEditandoId) ?? null;
  const clienteDetalle = clientes.find((c) => c.id === clienteDetalleId) ?? null;

  // Filtra por nombre del cliente o por patente/marca/modelo de cualquiera
  // de sus vehículos: un cliente aparece si matchea por cualquiera de los
  // dos, aunque su nombre no coincida.
  const termino = busqueda.trim().toLowerCase();
  const clientesFiltrados =
    termino === ""
      ? clientes
      : clientes.filter((cliente) => {
          const coincideNombre = coincide(cliente.nombre, termino);
          const coincideVehiculo = cliente.vehiculos.some(
            (v) => coincide(v.patente, termino) || coincide(v.marca, termino) || coincide(v.modelo, termino)
          );
          return coincideNombre || coincideVehiculo;
        });

  // Si el cliente que se está viendo en detalle se borra (por ejemplo desde
  // el modal de edición), cerramos ambos modales para no dejar el detalle
  // abierto apuntando a un cliente que ya no existe.
  useEffect(() => {
    if (clienteDetalleId && !clientes.some((c) => c.id === clienteDetalleId)) {
      setClienteDetalleId(null);
      setModalVisible(false);
    }
  }, [clientes, clienteDetalleId]);

  function handleAgregar() {
    setClienteEditandoId(null);
    setModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <Text style={styles.titulo}>Clientes</Text>

      <View style={styles.buscadorWrap}>
        <Input
          placeholder="Buscar por cliente, patente, marca o modelo..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {clientes.length === 0 ? (
          <Text style={styles.vacio}>Todavía no cargaste clientes.</Text>
        ) : clientesFiltrados.length === 0 ? (
          <Text style={styles.vacio}>No encontramos clientes ni vehículos con esos datos.</Text>
        ) : (
          clientesFiltrados.map((cliente) => {
            const cantidad = cliente.vehiculos.length;
            return (
              <TouchableOpacity
                key={cliente.id}
                style={styles.fila}
                onPress={() => setClienteDetalleId(cliente.id)}
                activeOpacity={0.8}
              >
                <View style={styles.filaIcono}>
                  <Ionicons name="person-outline" size={20} color={colors.accentLight} />
                </View>
                <View style={styles.filaTexto}>
                  <Text style={styles.filaNombre}>{cliente.nombre}</Text>
                  <Text style={styles.filaSub}>{cliente.telefono}</Text>
                  <Text style={styles.filaVehiculos}>
                    {cantidad === 0 ? "Sin vehículos" : `${cantidad} vehículo${cantidad === 1 ? "" : "s"}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <ClienteModal
        visible={modalVisible}
        cliente={clienteEditando}
        onClose={() => setModalVisible(false)}
      />

      <VehiculosClienteModal
        visible={clienteDetalleId !== null}
        cliente={clienteDetalle}
        onClose={() => setClienteDetalleId(null)}
        onEditarCliente={() => {
          setClienteEditandoId(clienteDetalleId);
          setModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  buscadorWrap: {
    paddingHorizontal: 20,
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
  filaSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  filaVehiculos: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.accentLight,
    marginTop: 4,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
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
