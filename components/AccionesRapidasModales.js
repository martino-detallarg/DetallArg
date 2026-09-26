import OpcionesNuevoModal from "./OpcionesNuevoModal";
import SeleccionarTrabajoSenaModal from "./SeleccionarTrabajoSenaModal";
import RegistrarCobroModal from "./RegistrarCobroModal";
import ClienteNuevoSubmenu from "./ClienteNuevoSubmenu";
import ConfirmarTrabajoModal from "./ConfirmarTrabajoModal";
import NuevoClienteWizard from "../screens/nuevoCliente/NuevoClienteWizard";
import TrabajoNuevoWizard from "../screens/trabajoNuevo/TrabajoNuevoWizard";
import { useAccionesRapidas } from "../data/AccionesRapidasContext";

// Todos los modales/wizards de "Cliente nuevo / Trabajo nuevo / Seña" en un
// solo lugar, montados una sola vez por encima de los 5 tabs (ver
// navigation/DashboardTabs.js) — así el tab central "+" los puede disparar
// sin importar en qué tab esté parado el taller. Antes vivían inline dentro
// de HomeScreen.js, atados al FAB de esa pantalla nada más.
export default function AccionesRapidasModales() {
  const {
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
  } = useAccionesRapidas();

  return (
    <>
      <OpcionesNuevoModal
        visible={opcionesVisibles}
        onClose={() => setOpcionesVisibles(false)}
        onClienteNuevo={handleAbrirClienteNuevo}
        onTrabajoNuevo={handleAbrirTrabajoNuevo}
        onSena={handleAbrirSena}
        onPresupuesto={handleAbrirPresupuesto}
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
    </>
  );
}
