import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";
import StatCard from "../components/StatCard";
import WidgetCalendarioHome from "../components/WidgetCalendarioHome";
import TurnoCard from "../components/TurnoCard";
import TrabajoDetalleModal from "../components/TrabajoDetalleModal";
import OpcionesNuevoModal from "../components/OpcionesNuevoModal";
import ClienteNuevoSubmenu from "../components/ClienteNuevoSubmenu";
import ConfirmarTrabajoModal from "../components/ConfirmarTrabajoModal";
import EstadoCarga from "../components/EstadoCarga";
import NuevoClienteWizard from "./nuevoCliente/NuevoClienteWizard";
import TrabajoNuevoWizard from "./trabajoNuevo/TrabajoNuevoWizard";
import { useClientes } from "../data/ClienteContext";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { useTaller } from "../data/TallerContext";
import { obtenerDiasHastaEntrega } from "../utils/entregas";
import { colors, fonts, shadow } from "../theme";

const ESTADOS_TERMINADOS = new Set(["Finalizado", "Entregado"]);

// Orden de prioridad de la lista de Home: "En proceso" arriba de todo,
// después "Finalizado" (a entregar), después "Pendiente" (sin comenzar), y
// "Entregado" siempre al final sin importar nada más.
const PRIORIDAD_ESTADO = {
  "En proceso": 0,
  Finalizado: 1,
  Pendiente: 2,
  Entregado: 3,
};

// Dentro de "En proceso", más urgente primero: entrega hoy o atrasada (mismo
// "rojo" que TurnoCard.js), después mañana, después el resto — un turno sin
// fecha calculable cae en "el resto" (no hay con qué priorizarlo).
function obtenerRangoUrgencia(turno, getServicioById) {
  const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
  const diasHastaEntrega = obtenerDiasHastaEntrega(turno, servicio);
  if (diasHastaEntrega === null || diasHastaEntrega > 1) return 2;
  if (diasHastaEntrega === 1) return 1;
  return 0; // hoy (0) o atrasado (negativo)
}

export default function HomeScreen({ navigation }) {
  const { getClienteById, getVehiculoById } = useClientes();
  const { turnos, cargandoTurnos, errorCargaTurnos, recargarTurnos, agregarTurno, actualizarEstadoTrabajo, eliminarTurno } =
    useTurnos();
  const { getServicioById } = useServicios();
  const { misDatos } = useTaller();
  const [turnoSeleccionadoId, setTurnoSeleccionadoId] = useState(null);
  // Cambia cada vez que Home gana/pierde foco: se usa como `key` del anillo
  // de progreso para forzar su remount (y que la animación de llenado se
  // repita) cada vez que se vuelve a esta pantalla, no solo al abrir la app.
  const estaEnfocada = useIsFocused();

  const [opcionesVisibles, setOpcionesVisibles] = useState(false);
  const [submenuClienteVisible, setSubmenuClienteVisible] = useState(false);
  const [modoClienteWizard, setModoClienteWizard] = useState("cliente");
  const [wizardClienteVisible, setWizardClienteVisible] = useState(false);
  const [wizardTrabajoVisible, setWizardTrabajoVisible] = useState(false);
  const [prefillTrabajo, setPrefillTrabajo] = useState(null);
  const [confirmacionTrabajoVisible, setConfirmacionTrabajoVisible] = useState(false);
  const [clienteVehiculoPendiente, setClienteVehiculoPendiente] = useState(null);

  // "En proceso" primero (con sub-orden por urgencia de entrega), después
  // Finalizado, después Pendiente, y Entregado siempre al final — dentro de
  // cada grupo (y dentro de cada sub-grupo de urgencia en "En proceso"), por
  // hora ascendente.
  const turnosOrdenados = [...turnos].sort((a, b) => {
    const prioridadA = PRIORIDAD_ESTADO[a.estado] ?? 4;
    const prioridadB = PRIORIDAD_ESTADO[b.estado] ?? 4;
    if (prioridadA !== prioridadB) return prioridadA - prioridadB;

    if (a.estado === "En proceso") {
      const urgenciaA = obtenerRangoUrgencia(a, getServicioById);
      const urgenciaB = obtenerRangoUrgencia(b, getServicioById);
      if (urgenciaA !== urgenciaB) return urgenciaA - urgenciaB;
    }

    return a.hora.localeCompare(b.hora);
  });
  const turnoSeleccionado = turnos.find((t) => t.id === turnoSeleccionadoId) ?? null;

  // Solo para el anillo de progreso de la card "Turnos de hoy": cuántos de
  // los turnos de hoy ya están en un estado de cierre (Finalizado o
  // Entregado) sobre el total. Es un cálculo derivado nada más para mostrar
  // en el anillo, no cambia el dato ni el flujo de estados del turno.
  const turnosCompletados = turnosOrdenados.filter((t) => ESTADOS_TERMINADOS.has(t.estado)).length;
  const progresoTurnosHoy = turnosOrdenados.length > 0 ? turnosCompletados / turnosOrdenados.length : 0;

  function handleAbrirClienteNuevo() {
    setOpcionesVisibles(false);
    setSubmenuClienteVisible(true);
  }

  function handleAbrirTrabajoNuevo() {
    setOpcionesVisibles(false);
    setPrefillTrabajo(null);
    setWizardTrabajoVisible(true);
  }

  function handleVolverAOpciones() {
    setSubmenuClienteVisible(false);
    setOpcionesVisibles(true);
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

      <EstadoCarga cargando={cargandoTurnos} error={errorCargaTurnos} onReintentar={recargarTurnos}>
        <FlatList
          data={turnosOrdenados}
          keyExtractor={(turno) => turno.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <>
              <Text style={styles.saludo}>Hola{misDatos.nombrePersonal ? `, ${misDatos.nombrePersonal}` : ""} 👋</Text>

              <View style={styles.stats}>
                <View style={styles.statAnillo}>
                  <StatCard
                    key={estaEnfocada}
                    label="Turnos hoy"
                    valor={turnosOrdenados.length}
                    progreso={progresoTurnosHoy}
                    tamano={110}
                    onPress={() => navigation.navigate("Agenda")}
                  />
                </View>
                <View style={styles.statWidget}>
                  <WidgetCalendarioHome onPress={() => navigation.navigate("Agenda")} />
                </View>
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
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => navigation.navigate("HistorialClientes")}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.linkHistorialWrap}
            >
              <Text style={styles.linkHistorial}>Ver historial de clientes</Text>
            </TouchableOpacity>
          }
        />
      </EstadoCarga>

      {!cargandoTurnos && !errorCargaTurnos && (
        <TouchableOpacity style={styles.fab} onPress={() => setOpcionesVisibles(true)}>
          <Text style={styles.fabTexto}>+</Text>
        </TouchableOpacity>
      )}

      <OpcionesNuevoModal
        visible={opcionesVisibles}
        onClose={() => setOpcionesVisibles(false)}
        onClienteNuevo={handleAbrirClienteNuevo}
        onTrabajoNuevo={handleAbrirTrabajoNuevo}
      />

      <ClienteNuevoSubmenu
        visible={submenuClienteVisible}
        onClose={() => setSubmenuClienteVisible(false)}
        onVolver={handleVolverAOpciones}
        onClienteNuevo={() => handleElegirModoCliente("cliente")}
        onVehiculoNuevo={() => handleElegirModoCliente("vehiculo")}
      />

      <TrabajoDetalleModal
        visible={turnoSeleccionado !== null}
        turno={turnoSeleccionado}
        cliente={turnoSeleccionado ? getClienteById(turnoSeleccionado.clienteId) : null}
        auto={turnoSeleccionado ? getVehiculoById(turnoSeleccionado.autoId) : null}
        onCambiarEstado={(nuevoEstado) => actualizarEstadoTrabajo(turnoSeleccionado.id, nuevoEstado)}
        onEliminar={async () => {
          await eliminarTurno(turnoSeleccionado.id);
          setTurnoSeleccionadoId(null);
        }}
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
        onGuardarTrabajo={agregarTurno}
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
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statAnillo: {
    flex: 1,
    alignItems: "center",
  },
  statWidget: {
    flex: 1,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 4,
  },
  linkHistorialWrap: {
    alignItems: "center",
    marginTop: 20,
  },
  linkHistorial: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: "underline",
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
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.textPrimary,
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
