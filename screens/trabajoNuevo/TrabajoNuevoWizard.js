import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SeleccionarClienteStep from "../nuevoCliente/SeleccionarClienteStep";
import SeleccionarVehiculoStep from "../nuevoCliente/SeleccionarVehiculoStep";
import DatosServicioStep from "./DatosServicioStep";
import TipoVehiculoStep from "./TipoVehiculoStep";
import InspeccionVisualStep from "./InspeccionVisualStep";
import ConfirmacionTrabajoStep from "./ConfirmacionTrabajoStep";
import { useClientes } from "../../data/ClienteContext";
import { formatearFechaDDMMAAAA } from "../../utils/fecha";
import { colors } from "../../theme";

const { width: ANCHO_PANTALLA } = Dimensions.get("window");

function datosVacios(clienteId, autoId) {
  return {
    clienteId: clienteId ?? null,
    autoId: autoId ?? null,
    servicio: {
      tipo: "",
      servicioId: null,
      precio: null,
      // Arranca en HOY por defecto (el caso más común: la mayoría de los
      // trabajos se cargan el mismo día que llega el vehículo) — el picker
      // nativo sigue totalmente editable, esto es solo el valor inicial.
      fecha: formatearFechaDDMMAAAA(new Date()),
      hora: "",
      tiempoEstimado: "",
      observaciones: "",
      empleadosAsignados: [],
    },
    inspeccion: {
      tipoVehiculo: null,
      grupo: null,
      subdivision: null,
      kilometraje: "",
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
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);
  const desplazamiento = useRef(new Animated.Value(ANCHO_PANTALLA)).current;

  // Entra deslizándose desde la derecha (en vez del "slide" vertical nativo
  // del Modal) para que se lea como continuación del mismo movimiento con el
  // que se cierra OpcionesNuevoModal, no como un rebote subir/bajar (ver el
  // mismo patrón en ClienteNuevoSubmenu.js).
  useEffect(() => {
    if (visible) {
      setDatos(datosVacios(clienteIdInicial, autoIdInicial));
      setFase(clienteIdInicial && autoIdInicial ? "servicio" : "elegirCliente");
      setClienteTemporal(null);
      setErrorGuardado(null);
      desplazamiento.setValue(ANCHO_PANTALLA);
      Animated.timing(desplazamiento, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
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

  async function handleFinalizar() {
    setGuardando(true);
    setErrorGuardado(null);
    try {
      await onGuardarTrabajo({
        clienteId: datos.clienteId,
        autoId: datos.autoId,
        servicio: datos.servicio.tipo,
        servicioId: datos.servicio.servicioId,
        precio: datos.servicio.precio,
        fecha: datos.servicio.fecha,
        hora: datos.servicio.hora,
        tiempoEstimado: datos.servicio.tiempoEstimado,
        observaciones: datos.servicio.observaciones,
        empleadosAsignados: datos.servicio.empleadosAsignados,
        tipoVehiculo: datos.inspeccion.tipoVehiculo,
        grupoVehiculo: datos.inspeccion.grupo,
        subdivisionVehiculo: datos.inspeccion.subdivision,
        kilometraje: datos.inspeccion.kilometraje ? Number(datos.inspeccion.kilometraje) : null,
        nivelNafta: datos.inspeccion.nivelNafta,
        danios: datos.inspeccion.danios,
        fotosDano: datos.inspeccion.fotosDano,
        estado: "Pendiente",
      });
      setFase("confirmacion");
    } catch (err) {
      setErrorGuardado("No se pudo guardar el trabajo. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
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
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={cerrar}>
      {/* react-native-gesture-handler no llega adentro de un <Modal> nativo a
      través del GestureHandlerRootView de App.js (el modal abre su propia
      jerarquía nativa) — hace falta este wrapper propio para que el swipe
      de "volver" de los pasos funcione. */}
      <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <Animated.View style={[styles.pantalla, { transform: [{ translateX: desplazamiento }] }]}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
              guardando={guardando}
              error={errorGuardado}
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
        </Animated.View>
      </SafeAreaProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
});
