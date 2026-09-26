import { createContext, useContext, useState } from "react";
import { useTurnos } from "./TurnoContext";
import { useFinanzas } from "./FinanzasContext";
import { navigationRef } from "../navigation/navigationRef";
import { calcularSaldoPendienteTurno } from "../utils/calculosFinanzas";

// Todo el flujo de "Cliente nuevo / Trabajo nuevo / Seña" vivía como estado
// local de HomeScreen (el botón "+" era un FAB dentro de esa pantalla). Con
// el rediseño de navegación a 5 tabs abajo (ver navigation/DashboardTabs.js)
// ese "+" pasó a ser el tab central, disparable desde CUALQUIER pantalla —
// no solo Home — así que este estado se levantó a un Context propio,
// montado una sola vez por encima de los tabs, en vez de duplicarlo o
// pasarlo por props a través de navigators.
//
// Necesita useTurnos()/useFinanzas() (agregarTurno, cobros), por eso el
// Provider tiene que montarse por debajo de esos dos en App.js — mismo
// motivo que hooks/useConfirmarYEliminarCliente.js no es parte de un
// Context más arriba en la cadena.
const AccionesRapidasContext = createContext(null);

export function AccionesRapidasProvider({ children }) {
  const { turnos, agregarTurno } = useTurnos();
  const { cobros } = useFinanzas();

  const [opcionesVisibles, setOpcionesVisibles] = useState(false);
  const [submenuClienteVisible, setSubmenuClienteVisible] = useState(false);
  const [modoClienteWizard, setModoClienteWizard] = useState("cliente");
  const [wizardClienteVisible, setWizardClienteVisible] = useState(false);
  const [wizardTrabajoVisible, setWizardTrabajoVisible] = useState(false);
  const [prefillTrabajo, setPrefillTrabajo] = useState(null);
  const [confirmacionTrabajoVisible, setConfirmacionTrabajoVisible] = useState(false);
  const [clienteVehiculoPendiente, setClienteVehiculoPendiente] = useState(null);
  // Igual que antes en HomeScreen: el trabajo NO está implícito, primero se
  // elige desde SeleccionarTrabajoSenaModal y ahí se abre RegistrarCobroModal
  // directo, sin pasar por TrabajoDetalleModal.
  const [selectorSenaVisible, setSelectorSenaVisible] = useState(false);
  const [turnoSenaId, setTurnoSenaId] = useState(null);

  const turnoSena = turnos.find((t) => t.id === turnoSenaId) ?? null;
  const cobrosDelTurnoSena = turnoSena ? cobros.filter((c) => c.turnoId === turnoSena.id) : [];
  const totalCobradoSena = cobrosDelTurnoSena.reduce((suma, c) => suma + c.monto, 0);
  const saldoPendienteSena = turnoSena ? calcularSaldoPendienteTurno(turnoSena, cobros) : null;

  function abrirOpciones() {
    setOpcionesVisibles(true);
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

  // "Presupuesto" no es un modal/wizard como los otros 3: es una navegación
  // a una pantalla real (PresupuestoScreen, tab oculto de nivel superior —
  // ver navigation/DashboardNavigator.js). Como este Provider vive por
  // encima del Tab.Navigator (no dentro de ningún Screen), no hay ningún
  // `navigation` de prop/hook normal disponible acá — se usa el
  // `navigationRef` global (ver navigation/navigationRef.js), que es el
  // mecanismo de React Navigation para navegar desde fuera del árbol de
  // pantallas.
  function handleAbrirPresupuesto() {
    setOpcionesVisibles(false);
    // "Presupuesto" vive adentro del Tab.Navigator (un nivel abajo de la
    // screen "Dashboard" del RootStack) — mismo motivo que en
    // navigation/DashboardNavigator.js (ver el comentario de
    // `abrirNotificaciones`/`navegarDesdeMenu` ahí): un `navigate` a secas
    // desde este ref, que opera al nivel raíz, no lo encontraría.
    navigationRef.navigate("Dashboard", { screen: "Presupuesto" });
  }

  function handleElegirTurnoSena(turno) {
    setSelectorSenaVisible(false);
    setTurnoSenaId(turno.id);
  }

  const value = {
    abrirOpciones,
    opcionesVisibles,
    setOpcionesVisibles,
    handleAbrirClienteNuevo,
    handleAbrirTrabajoNuevo,
    handleAbrirSena,
    handleAbrirPresupuesto,
    selectorSenaVisible,
    setSelectorSenaVisible,
    handleElegirTurnoSena,
    turnoSena,
    turnoSenaId,
    setTurnoSenaId,
    saldoPendienteSena,
    totalCobradoSena,
    submenuClienteVisible,
    setSubmenuClienteVisible,
    handleVolverAOpciones,
    handleElegirModoCliente,
    modoClienteWizard,
    wizardClienteVisible,
    setWizardClienteVisible,
    handleClienteVehiculoListo,
    confirmacionTrabajoVisible,
    handleConfirmarTrabajoSi,
    handleConfirmarTrabajoNo,
    wizardTrabajoVisible,
    handleCerrarTrabajo,
    prefillTrabajo,
    agregarTurno,
  };

  return <AccionesRapidasContext.Provider value={value}>{children}</AccionesRapidasContext.Provider>;
}

export function useAccionesRapidas() {
  const contexto = useContext(AccionesRapidasContext);
  if (!contexto) {
    throw new Error("useAccionesRapidas debe usarse dentro de <AccionesRapidasProvider>");
  }
  return contexto;
}
