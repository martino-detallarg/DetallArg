import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import StatCard from "../components/StatCard";
import TurnoCard from "../components/TurnoCard";
import TrabajoDetalleModal from "../components/TrabajoDetalleModal";
import OpcionesNuevoModal from "../components/OpcionesNuevoModal";
import ClienteNuevoSubmenu from "../components/ClienteNuevoSubmenu";
import ConfirmarTrabajoModal from "../components/ConfirmarTrabajoModal";
import NuevoClienteWizard from "./nuevoCliente/NuevoClienteWizard";
import TrabajoNuevoWizard from "./trabajoNuevo/TrabajoNuevoWizard";
import { turnosIniciales } from "../data/mockData";
import { useClientes } from "../data/ClienteContext";
import { usuarioActual } from "../data/mockUser";
import { colors, fonts, shadow } from "../theme";

const INGRESOS_DEL_MES = 1245000;

function formatearMonto(valor) {
  if (Math.abs(valor) >= 1_000_000) {
    const millones = (valor / 1_000_000).toFixed(1).replace(".0", "").replace(".", ",");
    return `$${millones}M`;
  }
  return `$${valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function HomeScreen({ navigation }) {
  const { getClienteById, getVehiculoById } = useClientes();
  const [turnos, setTurnos] = useState(turnosIniciales);
  const [turnoSeleccionadoId, setTurnoSeleccionadoId] = useState(null);

  const [opcionesVisibles, setOpcionesVisibles] = useState(false);
  const [submenuClienteVisible, setSubmenuClienteVisible] = useState(false);
  const [modoClienteWizard, setModoClienteWizard] = useState("cliente");
  const [wizardClienteVisible, setWizardClienteVisible] = useState(false);
  const [wizardTrabajoVisible, setWizardTrabajoVisible] = useState(false);
  const [prefillTrabajo, setPrefillTrabajo] = useState(null);
  const [confirmacionTrabajoVisible, setConfirmacionTrabajoVisible] = useState(false);
  const [clienteVehiculoPendiente, setClienteVehiculoPendiente] = useState(null);

  const turnosOrdenados = [...turnos].sort((a, b) => a.hora.localeCompare(b.hora));
  const turnoSeleccionado = turnos.find((t) => t.id === turnoSeleccionadoId) ?? null;

  function agregarTrabajo(datosTrabajo) {
    const nuevoTrabajo = { id: `t${Date.now()}`, ...datosTrabajo };
    setTurnos((actuales) => [...actuales, nuevoTrabajo]);
  }

  function actualizarEstadoTrabajo(turnoId, nuevoEstado) {
    setTurnos((actuales) =>
      actuales.map((t) => (t.id === turnoId ? { ...t, estado: nuevoEstado } : t))
    );
  }

  function handleAbrirClienteNuevo() {
    setOpcionesVisibles(false);
    setSubmenuClienteVisible(true);
  }

  function handleAbrirTrabajoNuevo() {
    setOpcionesVisibles(false);
    setPrefillTrabajo(null);
    setWizardTrabajoVisible(true);
  }

  function handleElegirModoCliente(modo) {
    setSubmenuClienteVisible(false);
    setModoClienteWizard(modo);
    setWizardClienteVisible(true);
  }

  function handleClienteVehiculoListo(clienteId, autoId) {
    setWizardClienteVisible(false);
    setClienteVehiculoPendiente({ clienteId, autoId });
    setConfirmacionTrabajoVisible(true);
  }

  function handleConfirmarTrabajoSi() {
    setConfirmacionTrabajoVisible(false);
    setPrefillTrabajo(clienteVehiculoPendiente);
    setClienteVehiculoPendiente(null);
    setWizardTrabajoVisible(true);
  }

  function handleConfirmarTrabajoNo() {
    setConfirmacionTrabajoVisible(false);
    setClienteVehiculoPendiente(null);
  }

  function handleCerrarTrabajo() {
    setWizardTrabajoVisible(false);
    setPrefillTrabajo(null);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <FlatList
        data={turnosOrdenados}
        keyExtractor={(turno) => turno.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <>
            <Text style={styles.saludo}>Hola, {usuarioActual.nombre} 👋</Text>

            <View style={styles.stats}>
              <StatCard label="Turnos de hoy" valor={turnosOrdenados.length} />
              <StatCard label="Ingresos del mes" valor={formatearMonto(INGRESOS_DEL_MES)} />
            </View>

            <Text style={styles.seccionTitulo}>Turnos de hoy</Text>
          </>
        }
        renderItem={({ item }) => (
          <TurnoCard
            turno={item}
            cliente={getClienteById(item.clienteId)}
            auto={getVehiculoById(item.autoId)}
            onPress={() => setTurnoSeleccionadoId(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>Todavía no hay turnos cargados para hoy.</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setOpcionesVisibles(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <OpcionesNuevoModal
        visible={opcionesVisibles}
        onClose={() => setOpcionesVisibles(false)}
        onClienteNuevo={handleAbrirClienteNuevo}
        onTrabajoNuevo={handleAbrirTrabajoNuevo}
      />

      <ClienteNuevoSubmenu
        visible={submenuClienteVisible}
        onClose={() => setSubmenuClienteVisible(false)}
        onClienteNuevo={() => handleElegirModoCliente("cliente")}
        onVehiculoNuevo={() => handleElegirModoCliente("vehiculo")}
      />

      <TrabajoDetalleModal
        visible={turnoSeleccionado !== null}
        turno={turnoSeleccionado}
        cliente={turnoSeleccionado ? getClienteById(turnoSeleccionado.clienteId) : null}
        auto={turnoSeleccionado ? getVehiculoById(turnoSeleccionado.autoId) : null}
        onCambiarEstado={(nuevoEstado) => actualizarEstadoTrabajo(turnoSeleccionado.id, nuevoEstado)}
        onClose={() => setTurnoSeleccionadoId(null)}
      />

      <NuevoClienteWizard
        visible={wizardClienteVisible}
        modo={modoClienteWizard}
        onClose={() => setWizardClienteVisible(false)}
        onListo={handleClienteVehiculoListo}
      />

      <ConfirmarTrabajoModal
        visible={confirmacionTrabajoVisible}
        onSi={handleConfirmarTrabajoSi}
        onNo={handleConfirmarTrabajoNo}
      />

      <TrabajoNuevoWizard
        visible={wizardTrabajoVisible}
        onClose={handleCerrarTrabajo}
        onGuardarTrabajo={agregarTrabajo}
        clienteIdInicial={prefillTrabajo?.clienteId}
        autoIdInicial={prefillTrabajo?.autoId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  lista: {
    paddingBottom: 100,
  },
  saludo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 4,
  },
  vacio: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.textMuted,
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
