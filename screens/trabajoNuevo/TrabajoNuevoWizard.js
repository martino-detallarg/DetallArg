import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SeleccionarClienteStep from "../nuevoCliente/SeleccionarClienteStep";
import SeleccionarVehiculoStep from "../nuevoCliente/SeleccionarVehiculoStep";
import DatosServicioStep from "./DatosServicioStep";
import TipoVehiculoStep from "./TipoVehiculoStep";
import SeleccionPanelesPpfStep from "./SeleccionPanelesPpfStep";
import PresupuestoPpfStep from "./PresupuestoPpfStep";
import InspeccionVisualStep from "./InspeccionVisualStep";
import FirmaConformidadStep from "./FirmaConformidadStep";
import ConfirmacionTrabajoStep from "./ConfirmacionTrabajoStep";
import { useClientes } from "../../data/ClienteContext";
import { useServicios } from "../../data/ServicioContext";
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
      observaciones: "",
      empleadosAsignados: [],
    },
    inspeccion: {
      tipoVehiculo: null,
      grupo: null,
      subdivision: null,
      kilometraje: "",
      // null = todavía no tocó la barra (distinto de 0, que es "Reserva"
      // elegido a propósito) — ver TipoVehiculoStep.js y FuelGauge.js.
      nivelNafta: null,
      // Solo se usa/se pisa cuando el servicio elegido es PPF (servicio.esPpf,
      // ver ServicioContext.js) — array de ids de panel namespaced por vista
      // ("frente__capot", ver data/ppfPanelMatrix.js), cargado en
      // SeleccionPanelesPpfStep.js y consumido por PresupuestoPpfStep.js y,
      // al finalizar el trabajo, por TurnoContext (turno_ppf_seleccion ->
      // turno_ppf_paneles).
      panelesElegidos: [],
      // Mapa { zonaId: { tipos: [tipoDanioId, ...], nota } }: cada zona
      // puede tener varios tipos de daño previo a la vez, no uno solo.
      danios: {},
      fotosDano: [],
      // [{ vistaId, etiqueta, imagen }] — capturada por InspeccionVisualStep
      // al tocar "Continuar" (react-native-view-shot), consumida por
      // FirmaConformidadStep para armar el PDF de conformidad. No se manda a
      // Supabase (turnoACamposDb solo traduce los campos de MAPEO_CAMPOS_TURNO).
      imagenesDiagrama: [],
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
  const { getClienteById, getVehiculoById } = useClientes();
  const { getServicioById } = useServicios();
  const seSaltaSeleccion = !!(clienteIdInicial && autoIdInicial);

  const [fase, setFase] = useState(seSaltaSeleccion ? "servicio" : "elegirCliente");
  const [datos, setDatos] = useState(datosVacios(clienteIdInicial, autoIdInicial));
  const [clienteTemporal, setClienteTemporal] = useState(null);
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

  // Ya no maneja "guardando"/error ni cambia de fase: eso ahora lo hace
  // FirmaConformidadStep, que llama a esto una sola vez (cuando el cliente
  // ya firmó, o cuando elige "Firmar después" — ver conformidadEstado) y
  // decide qué mostrar/hacer con el resultado — relanza el error tal cual
  // para que quien llama lo capture.
  async function handleFinalizar(conformidadEstado) {
    await onGuardarTrabajo({
      clienteId: datos.clienteId,
      autoId: datos.autoId,
      servicio: datos.servicio.tipo,
      servicioId: datos.servicio.servicioId,
      precio: datos.servicio.precio,
      fecha: datos.servicio.fecha,
      hora: datos.servicio.hora,
      observaciones: datos.servicio.observaciones,
      empleadosAsignados: datos.servicio.empleadosAsignados,
      tipoVehiculo: datos.inspeccion.tipoVehiculo,
      grupoVehiculo: datos.inspeccion.grupo,
      subdivisionVehiculo: datos.inspeccion.subdivision,
      kilometraje: datos.inspeccion.kilometraje ? Number(datos.inspeccion.kilometraje) : null,
      nivelNafta: datos.inspeccion.nivelNafta,
      danios: datos.inspeccion.danios,
      fotosDano: datos.inspeccion.fotosDano,
      panelesElegidos: datos.inspeccion.panelesElegidos,
      estado: "Pendiente",
      conformidadEstado,
    });
  }

  // Servicio PPF (servicio.esPpf, ver ServicioContext.js): suma 2 pasos
  // extra (Selección de paneles + Presupuesto PPF) entre "Inspección
  // Visual" y "Conformidad" — ver SeleccionPanelesPpfStep.js/
  // PresupuestoPpfStep.js. Van DESPUÉS de la inspección (no antes) a
  // propósito: el taller marca en Inspección Visual qué paneles ya traen
  // PPF puesto o PPF viejo a retirar (ver data/tiposDanio.js) antes de
  // decidir qué paneles elegir para el PPF nuevo.
  const servicioSeleccionado = datos.servicio.servicioId ? getServicioById(datos.servicio.servicioId) : null;
  const esPpf = !!servicioSeleccionado?.esPpf;
  const totalPasos = (seSaltaSeleccion ? 4 : 5) + (esPpf ? 2 : 0);

  const basePaso = seSaltaSeleccion ? 2 : 3; // paso de "tipoVehiculo"
  const pasoActual = {
    elegirCliente: 1,
    elegirVehiculo: 1,
    servicio: seSaltaSeleccion ? 1 : 2,
    tipoVehiculo: basePaso,
    inspeccionVisual: basePaso + 1,
    seleccionPanelesPpf: basePaso + 2,
    presupuestoPpf: basePaso + 3,
    conformidad: basePaso + 2 + (esPpf ? 2 : 0),
  }[fase];

  const clienteSeleccionado = datos.clienteId ? getClienteById(datos.clienteId) : null;
  const autoSeleccionado = datos.autoId ? getVehiculoById(datos.autoId) : null;

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
              onContinuar={(imagenesDiagrama) => {
                actualizarInspeccion({ imagenesDiagrama });
                setFase(esPpf ? "seleccionPanelesPpf" : "conformidad");
              }}
            />
          )}
          {fase === "seleccionPanelesPpf" && (
            <SeleccionPanelesPpfStep
              datos={datos.inspeccion}
              paso={pasoActual}
              totalPasos={totalPasos}
              onCambiar={actualizarInspeccion}
              onAtras={() => setFase("inspeccionVisual")}
              onContinuar={() => setFase("presupuestoPpf")}
            />
          )}
          {fase === "presupuestoPpf" && (
            <PresupuestoPpfStep
              datos={datos.inspeccion}
              paso={pasoActual}
              totalPasos={totalPasos}
              onAtras={() => setFase("seleccionPanelesPpf")}
              onContinuar={() => setFase("conformidad")}
            />
          )}
          {fase === "conformidad" && clienteSeleccionado && (
            <FirmaConformidadStep
              cliente={clienteSeleccionado}
              auto={autoSeleccionado}
              servicio={datos.servicio}
              inspeccion={datos.inspeccion}
              paso={pasoActual}
              totalPasos={totalPasos}
              onAtras={() => setFase(esPpf ? "presupuestoPpf" : "inspeccionVisual")}
              onFinalizar={handleFinalizar}
              onTerminar={() => setFase("confirmacion")}
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
