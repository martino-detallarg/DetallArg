import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DatosClienteStep from "./DatosClienteStep";
import DatosVehiculoStep from "./DatosVehiculoStep";
import SeleccionarClienteStep from "./SeleccionarClienteStep";
import { separarMarcaModelo } from "../../data/mockData";
import { useClientes } from "../../data/ClienteContext";
import { formatearPatente } from "../../utils/patente";
import { colors } from "../../theme";

const { width: ANCHO_PANTALLA } = Dimensions.get("window");

const CLIENTE_VACIO = { nombre: "", telefono: "" };
const VEHICULO_VACIO = { patente: "", marcaModelo: "", anio: "", color: "", sinPatente: false };
const TOTAL_PASOS = 2;

// modo "cliente": Datos del Cliente -> Datos del Vehículo (crea cliente + vehículo nuevos)
// modo "vehiculo": Elegir Cliente -> Datos del Vehículo (crea vehículo nuevo para un cliente existente)
export default function NuevoClienteWizard({ visible, onClose, modo, onListo }) {
  const { agregarVehiculo, agregarCliente } = useClientes();
  const esVehiculoNuevo = modo === "vehiculo";

  const [paso, setPaso] = useState(esVehiculoNuevo ? "elegirCliente" : "cliente");
  const [clienteExistente, setClienteExistente] = useState(null);
  const [datosCliente, setDatosCliente] = useState(CLIENTE_VACIO);
  const [datosVehiculo, setDatosVehiculo] = useState(VEHICULO_VACIO);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const desplazamiento = useRef(new Animated.Value(ANCHO_PANTALLA)).current;

  // Entra deslizándose desde la derecha (en vez del "slide" vertical nativo
  // del Modal) para que se lea como continuación del mismo movimiento con el
  // que se cierra OpcionesNuevoModal/ClienteNuevoSubmenu, no como un rebote
  // subir/bajar (ver el mismo patrón en ClienteNuevoSubmenu.js).
  useEffect(() => {
    if (visible) {
      setPaso(modo === "vehiculo" ? "elegirCliente" : "cliente");
      setClienteExistente(null);
      setDatosCliente(CLIENTE_VACIO);
      setDatosVehiculo(VEHICULO_VACIO);
      setError(null);
      desplazamiento.setValue(ANCHO_PANTALLA);
      Animated.timing(desplazamiento, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, modo]);

  function cerrar() {
    onClose();
  }

  function handleElegirCliente(cliente) {
    setClienteExistente(cliente);
    setPaso("vehiculo");
  }

  async function handleFinalizarVehiculo() {
    setCargando(true);
    setError(null);
    try {
      const clienteId = esVehiculoNuevo
        ? clienteExistente.id
        : (
            await agregarCliente({
              nombre: datosCliente.nombre.trim(),
              telefono: datosCliente.telefono.trim(),
            })
          ).id;

      const { marca, modelo } = separarMarcaModelo(datosVehiculo.marcaModelo);
      const nuevoVehiculo = await agregarVehiculo(clienteId, {
        marca,
        modelo,
        anio: datosVehiculo.anio.trim(),
        patente: datosVehiculo.sinPatente ? "" : formatearPatente(datosVehiculo.patente),
        color: datosVehiculo.color.trim(),
      });

      onListo(clienteId, nuevoVehiculo.id);
    } catch (err) {
      setError("No se pudo guardar. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  const pasoNumero = paso === "vehiculo" ? 2 : 1;

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
          {paso === "elegirCliente" && (
            <SeleccionarClienteStep
              titulo="Elegir Cliente"
              paso={1}
              totalPasos={TOTAL_PASOS}
              onAtras={cerrar}
              onSeleccionar={handleElegirCliente}
            />
          )}
          {paso === "cliente" && (
            <DatosClienteStep
              datos={datosCliente}
              paso={1}
              totalPasos={TOTAL_PASOS}
              onCambiar={(c) => setDatosCliente((d) => ({ ...d, ...c }))}
              onAtras={cerrar}
              onContinuar={() => setPaso("vehiculo")}
            />
          )}
          {paso === "vehiculo" && (
            <DatosVehiculoStep
              datos={datosVehiculo}
              paso={pasoNumero}
              totalPasos={TOTAL_PASOS}
              onCambiar={(c) => setDatosVehiculo((d) => ({ ...d, ...c }))}
              onAtras={() => setPaso(esVehiculoNuevo ? "elegirCliente" : "cliente")}
              onContinuar={handleFinalizarVehiculo}
              cargando={cargando}
              error={error}
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
