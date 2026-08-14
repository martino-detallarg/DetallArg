import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TurnoCard from "./components/TurnoCard";
import DetalleTurnoModal from "./components/DetalleTurnoModal";
import NuevoTurnoModal from "./components/NuevoTurnoModal";
import { getAutoById, getClienteById, turnosIniciales } from "./data/mockData";

export default function App() {
  const [turnos, setTurnos] = useState(turnosIniciales);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);

  const turnosOrdenados = [...turnos].sort((a, b) => a.hora.localeCompare(b.hora));

  function agregarTurno(datosTurno) {
    const nuevoTurno = { id: `t${Date.now()}`, ...datosTurno };
    setTurnos((actuales) => [...actuales, nuevoTurno]);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.header}>
        <Text style={styles.titulo}>DetallArg</Text>
        <Text style={styles.subtitulo}>Agenda de hoy · {turnosOrdenados.length} turnos</Text>
      </View>

      <FlatList
        data={turnosOrdenados}
        keyExtractor={(turno) => turno.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TurnoCard
            turno={item}
            cliente={getClienteById(item.clienteId)}
            auto={getAutoById(item.autoId)}
            onPress={() => setTurnoSeleccionado(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>Todavía no hay turnos cargados para hoy.</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalNuevoVisible(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <DetalleTurnoModal
        visible={turnoSeleccionado !== null}
        turno={turnoSeleccionado}
        cliente={turnoSeleccionado ? getClienteById(turnoSeleccionado.clienteId) : null}
        auto={turnoSeleccionado ? getAutoById(turnoSeleccionado.autoId) : null}
        onClose={() => setTurnoSeleccionado(null)}
      />

      <NuevoTurnoModal
        visible={modalNuevoVisible}
        onClose={() => setModalNuevoVisible(false)}
        onGuardar={agregarTurno}
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  lista: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  vacio: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 40,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabTexto: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "400",
    marginTop: -2,
  },
});
