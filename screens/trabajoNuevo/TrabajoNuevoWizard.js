import { useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SeleccionarClienteStep from "../nuevoCliente/SeleccionarClienteStep";
import SeleccionarVehiculoStep from "../nuevoCliente/SeleccionarVehiculoStep";
import DatosServicioStep from "./DatosServicioStep";
import TipoVehiculoStep from "./TipoVehiculoStep";
import InspeccionVisualStep from "./InspeccionVisualStep";
import ConfirmacionTrabajoStep from "./ConfirmacionTrabajoStep";
import { useClientes } from "../../data/ClienteContext";
import { colors } from "../../theme";

function datosVacios(clienteId, autoId) {
  return {
    clienteId: clienteId ?? null,
    autoId: autoId ?? null,
    servicio: { tipo: "", servicioId: null, precio: null, fecha: "", hora: "", tiempoEstimado: "", observaciones: "" },
    inspeccion: {
      tipoVehiculo: null,
      grupo: null,
      subdivision: null,
      nivelNafta: 50,
      // Mapa { zonaId: { tipos: [tipoDanioId, ...], nota } }: cada zona
      // puede tener varios tipos de daño previo a la vez, no uno solo.
      danios: {},
      fotosDano: [],
    },
  };
}

// Si vienen clienteIdInicial + autoIdInicial (porque el cliente/vehículo se
// acaba de crear en el flujo de "Cliente nuevo"), el paso de elegir
// cliente/vehículo se saltea directo a "Datos del servicio".
export default function TrabajoNuevoWizard({
  visible,
  onClose,
  onGuardarTrabajo,
  clienteIdInicial,
  autoIdInicial,
}) {
  const { getClienteById } = useClientes();
  const seSaltaSeleccion = !!(clienteIdInicial && autoIdInicial);
  const totalPasos = seSaltaSeleccion ? 3 : 4;

  const [fase, setFase] = useState(seSaltaSeleccion ? "servicio" : "elegirCliente");
  const [datos, setDatos] = useState(datosVacios(clienteIdInicial, autoIdInicial));
  const [clienteTemporal, setClienteTemporal] = useState(null);

  useEffect(() => {
    if (visible) {
      setDatos(datosVacios(clienteIdInicial, autoIdInicial));
      setFase(clienteIdInicial && autoIdInicial ? "servicio" : "elegirCliente");
      setClienteTemporal(null);
    }
  }, [visible, clienteIdInicial, autoIdInicial]);

  function cerrar() {
    onClose();
  }

  function actualizarServicio(cambios) {
    setDatos((d) => ({ ...d, servicio: { ...d.servicio, ...cambios } }));
  }

  function actualizarInspeccion(cambios) {
    setDatos((d) => ({ ...d, inspeccion: { ...d.inspeccion, ...cambios } }));
  }

  function handleElegirCliente(cliente) {
    setClienteTemporal(cliente);
    setFase("elegirVehiculo");
  }

  function handleElegirVehiculo(auto) {
    setDatos((d) => ({ ...d, clienteId: clienteTemporal.id, autoId: auto.id }));
    setFase("servicio");
  }

  function handleFinalizar() {
    onGuardarTrabajo({
      clienteId: datos.clienteId,
      autoId: datos.autoId,
      servicio: datos.servicio.tipo,
      servicioId: datos.servicio.servicioId,
      precio: datos.servicio.precio,
      fecha: datos.servicio.fecha,
      hora: datos.servicio.hora,
      tiempoEstimado: datos.servicio.tiempoEstimado,
      observaciones: datos.servicio.observaciones,
      tipoVehiculo: datos.inspeccion.tipoVehiculo,
      grupoVehiculo: datos.inspeccion.grupo,
      subdivisionVehiculo: datos.inspeccion.subdivision,
      nivelNafta: datos.inspeccion.nivelNafta,
      danios: datos.inspeccion.danios,
      fotosDano: datos.inspeccion.fotosDano,
      estado: "Pendiente",
    });
    setFase("confirmacion");
  }

  const pasoActual = {
    elegirCliente: 1,
    elegirVehiculo: 1,
    servicio: seSaltaSeleccion ? 1 : 2,
    tipoVehiculo: seSaltaSeleccion ? 2 : 3,
    inspeccionVisual: seSaltaSeleccion ? 3 : 4,
  }[fase];

  const clienteSeleccionado = datos.clienteId ? getClienteById(datos.clienteId) : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={cerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          {fase === "elegirCliente" && (
            <SeleccionarClienteStep
              titulo="Elegir Cliente"
              paso={pasoActual}
              totalPasos={totalPasos}
              onAtras={cerrar}
              onSeleccionar={handleElegirCliente}
            />
          )}
          {fase === "elegirVehiculo" && clienteTemporal && (
            <SeleccionarVehiculoStep
              cliente={clienteTemporal}
              paso={pasoActual}
              totalPasos={totalPasos}
              onAtras={() => setFase("elegirCliente")}
              onSeleccionar={handleElegirVehiculo}
            />
          )}
          {fase === "servicio" && (
            <DatosServicioStep
              datos={datos.servicio}
              paso={pasoActual}
              totalPasos={totalPasos}
              onCambiar={actualizarServicio}
              onAtras={seSaltaSeleccion ? cerrar : () => setFase("elegirVehiculo")}
              onContinuar={() => setFase("tipoVehiculo")}
            />
          )}
          {fase === "tipoVehiculo" && (
            <TipoVehiculoStep
              datos={datos.inspeccion}
              paso={pasoActual}
              totalPasos={totalPasos}
              onCambiar={actualizarInspeccion}
              onAtras={() => setFase("servicio")}
              onContinuar={() => setFase("inspeccionVisual")}
            />
          )}
          {fase === "inspeccionVisual" && (
            <InspeccionVisualStep
              datos={datos.inspeccion}
              paso={pasoActual}
              totalPasos={totalPasos}
              onCambiar={actualizarInspeccion}
              onAtras={() => setFase("tipoVehiculo")}
              onFinalizar={handleFinalizar}
            />
          )}
          {fase === "confirmacion" && clienteSeleccionado && (
            <ConfirmacionTrabajoStep
              cliente={clienteSeleccionado}
              servicio={datos.servicio}
              onTerminar={cerrar}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
