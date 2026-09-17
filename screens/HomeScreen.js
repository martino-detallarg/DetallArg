import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";
import StatCard from "../components/StatCard";
import WidgetCalendarioHome from "../components/WidgetCalendarioHome";
import TurnoCard from "../components/TurnoCard";
import TrabajoDetalleModal from "../components/TrabajoDetalleModal";
import OpcionesNuevoModal from "../components/OpcionesNuevoModal";
import SeleccionarTrabajoSenaModal from "../components/SeleccionarTrabajoSenaModal";
import RegistrarCobroModal from "../components/RegistrarCobroModal";
import ClienteNuevoSubmenu from "../components/ClienteNuevoSubmenu";
import ConfirmarTrabajoModal from "../components/ConfirmarTrabajoModal";
import EstadoCarga from "../components/EstadoCarga";
import TourAnchor from "../components/tour/TourAnchor";
import NuevoClienteWizard from "./nuevoCliente/NuevoClienteWizard";
import TrabajoNuevoWizard from "./trabajoNuevo/TrabajoNuevoWizard";
import { useClientes } from "../data/ClienteContext";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { useTaller } from "../data/TallerContext";
import { useFinanzas } from "../data/FinanzasContext";
import { calcularInstanteEntrega, obtenerInicioTurno } from "../utils/entregas";
import { calcularSaldoPendienteTurno } from "../utils/calculosFinanzas";
import { sumarDias } from "../utils/fecha";
import { colors, fonts, shadow } from "../theme";

// Horizonte hacia adelante para turnos que todavía no están atrasados ni
// tienen el trabajo terminado (ver armarListaUrgencias) — más allá de esto
// no tiene sentido mostrarlos en Home, siguen visibles en Agenda. Los
// atrasados y los "Finalizado sin entregar" no respetan este límite: son
// urgentes sin importar cuán lejos haya quedado su fecha agendada original.
const HORIZONTE_DIAS = 7;

// Arma la lista de "Turnos activos" de Home: ya no es un filtro por fecha
// agendada, es una vista de urgencias. Se ignora el estado para el orden
// (Pendiente y En proceso se mezclan) y se arma en 3 grupos, en este orden:
//   1. Atrasados: cualquier turno activo cuya entrega estimada ya pasó,
//      incluido un Finalizado cuya hora prometida ya venció — el más
//      atrasado primero.
//   2. Finalizado sin entregar, pero todavía a tiempo (el auto está listo,
//      esperando al cliente).
//   3. El resto (Pendiente/En proceso, todavía a tiempo), de menor a mayor
//      según cuánto falta para la entrega estimada — pero solo si esa
//      entrega cae dentro de HORIZONTE_DIAS; si no, se excluye de Home.
// La "entrega estimada" es un instante real (fecha + hora de llegada +
// duración del servicio, con precisión de hora — ver utils/entregas.js), no
// la fecha en la que se agendó el turno. Un turno sin fecha/hora válida, o
// cuyo servicio no tiene duración cargada, no se puede ubicar con
// precisión: igual se muestra (nunca desaparece), pero al final de su
// grupo, sin orden preciso.
function armarListaUrgencias(turnos, getServicioById) {
  const ahora = new Date();
  const limiteHorizonte = sumarDias(ahora, HORIZONTE_DIAS);

  const atrasados = [];
  const finalizados = [];
  const resto = [];

  for (const turno of turnos) {
    if (turno.estado === "Entregado") continue;

    const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
    const inicio = obtenerInicioTurno(turno);
    const instanteEntrega = calcularInstanteEntrega(inicio, servicio);
    const atrasado = instanteEntrega !== null && instanteEntrega.getTime() < ahora.getTime();
    const item = { turno, instanteEntrega };

    if (atrasado) {
      atrasados.push(item);
    } else if (turno.estado === "Finalizado") {
      finalizados.push(item);
    } else if (instanteEntrega === null || instanteEntrega.getTime() <= limiteHorizonte.getTime()) {
      resto.push(item);
    }
    // Pendiente/En proceso a tiempo pero fuera del horizonte: se excluye de
    // Home a propósito, sigue visible en Agenda.
  }

  // Sin instante calculable (null) siempre al final de su propio grupo:
  // Infinity nunca gana una comparación ascendente contra un timestamp real.
  const porCercania = (a, b) =>
    (a.instanteEntrega?.getTime() ?? Infinity) - (b.instanteEntrega?.getTime() ?? Infinity);

  atrasados.sort(porCercania); // más viejo (más atrasado) primero
  finalizados.sort(porCercania);
  resto.sort(porCercania);

  return [...atrasados, ...finalizados, ...resto].map((item) => item.turno);
}

export default function HomeScreen({ navigation }) {
  const { getClienteById, getVehiculoById } = useClientes();
  const { turnos, cargandoTurnos, errorCargaTurnos, recargarTurnos, agregarTurno, actualizarEstadoTrabajo, eliminarTurno } =
    useTurnos();
  const { getServicioById } = useServicios();
  const { misDatos } = useTaller();
  const { cobros } = useFinanzas();
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
  // Acceso rápido global a "Registrar seña" (ver OpcionesNuevoModal.js): a
  // diferencia de turnoSeleccionadoId (que abre el detalle completo del
  // trabajo), acá el trabajo NO está implícito — primero se elige desde
  // SeleccionarTrabajoSenaModal, y recién ahí se abre RegistrarCobroModal
  // directo, sin pasar por TrabajoDetalleModal.
  const [selectorSenaVisible, setSelectorSenaVisible] = useState(false);
  const [turnoSenaId, setTurnoSenaId] = useState(null);

  const turnosOrdenados = useMemo(
    () => armarListaUrgencias(turnos, getServicioById),
    [turnos, getServicioById]
  );
  const turnoSeleccionado = turnos.find((t) => t.id === turnoSeleccionadoId) ?? null;
  const turnoSena = turnos.find((t) => t.id === turnoSenaId) ?? null;
  const cobrosDelTurnoSena = turnoSena ? cobros.filter((c) => c.turnoId === turnoSena.id) : [];
  const totalCobradoSena = cobrosDelTurnoSena.reduce((suma, c) => suma + c.monto, 0);
  const saldoPendienteSena = turnoSena ? calcularSaldoPendienteTurno(turnoSena, cobros) : null;

  // Solo para el anillo de progreso de la card "Turnos activos": cuántos ya
  // están Finalizado (a entregar) sobre el total — Entregado no puede
  // aparecer acá (armarListaUrgencias ya los excluye). Es un cálculo
  // derivado nada más para mostrar en el anillo, no cambia el dato ni el
  // flujo de estados del turno.
  const turnosCompletados = turnosOrdenados.filter((t) => t.estado === "Finalizado").length;
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

  function handleAbrirSena() {
    setOpcionesVisibles(false);
    setSelectorSenaVisible(true);
  }

  function handleElegirTurnoSena(turno) {
    setSelectorSenaVisible(false);
    setTurnoSenaId(turno.id);
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
                    label="Turnos activos"
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

              <Text style={styles.seccionTitulo}>Turnos activos</Text>
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
            <Text style={styles.vacio}>No tenés turnos activos en este momento.</Text>
          }
          ListFooterComponent={
            <TourAnchor id="home.historial">
              <TouchableOpacity
                onPress={() => navigation.navigate("HistorialClientes")}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.linkHistorialWrap}
              >
                <Text style={styles.linkHistorial}>Ver historial de clientes</Text>
              </TouchableOpacity>
            </TourAnchor>
          }
        />
      </EstadoCarga>

      {!cargandoTurnos && !errorCargaTurnos && (
        <TourAnchor id="home.fab">
          <TouchableOpacity style={styles.fab} onPress={() => setOpcionesVisibles(true)}>
            <Text style={styles.fabTexto}>+</Text>
          </TouchableOpacity>
        </TourAnchor>
      )}

      <OpcionesNuevoModal
        visible={opcionesVisibles}
        onClose={() => setOpcionesVisibles(false)}
        onClienteNuevo={handleAbrirClienteNuevo}
        onTrabajoNuevo={handleAbrirTrabajoNuevo}
        onSena={handleAbrirSena}
      />

      <SeleccionarTrabajoSenaModal
        visible={selectorSenaVisible}
        onClose={() => setSelectorSenaVisible(false)}
        onElegirTurno={handleElegirTurnoSena}
      />

      <RegistrarCobroModal
        visible={turnoSenaId !== null}
        turno={turnoSena}
        esSena
        saldoPendiente={saldoPendienteSena}
        montoYaCobrado={totalCobradoSena}
        onClose={() => setTurnoSenaId(null)}
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
