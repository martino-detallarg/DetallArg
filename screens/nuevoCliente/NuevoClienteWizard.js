import { useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DatosClienteStep from "./DatosClienteStep";
import DatosVehiculoStep from "./DatosVehiculoStep";
import SeleccionarClienteStep from "./SeleccionarClienteStep";
import PreguntaTrabajoStep from "./PreguntaTrabajoStep";
import { separarMarcaModelo } from "../../data/mockData";
import { useData } from "../../data/DataContext";
import { colors } from "../../theme";

const CLIENTE_VACIO = { nombre: "", telefono: "", direccion: "" };
const VEHICULO_VACIO = { patente: "", marcaModelo: "", color: "", kilometros: "", observaciones: "" };
const TOTAL_PASOS = 2;

// modo "cliente": Datos del Cliente -> Datos del Vehículo (crea cliente + auto nuevos)
// modo "vehiculo": Elegir Cliente -> Datos del Vehículo (crea auto nuevo para un cliente existente)
export default function NuevoClienteWizard({ visible, onClose, modo, onListo }) {
  const { agregarAuto, agregarCliente } = useData();
  const esVehiculoNuevo = modo === "vehiculo";

  const [paso, setPaso] = useState(esVehiculoNuevo ? "elegirCliente" : "cliente");
  const [clienteExistente, setClienteExistente] = useState(null);
  const [datosCliente, setDatosCliente] = useState(CLIENTE_VACIO);
  const [datosVehiculo, setDatosVehiculo] = useState(VEHICULO_VACIO);
  const [clienteVehiculoCreado, setClienteVehiculoCreado] = useState(null);

  useEffect(() => {
    if (visible) {
      setPaso(modo === "vehiculo" ? "elegirCliente" : "cliente");
      setClienteExistente(null);
      setDatosCliente(CLIENTE_VACIO);
      setDatosVehiculo(VEHICULO_VACIO);
      setClienteVehiculoCreado(null);
    }
  }, [visible, modo]);

  function cerrar() {
    onClose();
  }

  function handleElegirCliente(cliente) {
    setClienteExistente(cliente);
    setPaso("vehiculo");
  }

  function handleFinalizarVehiculo() {
    const nombreCliente = esVehiculoNuevo
      ? clienteExistente.nombre
      : datosCliente.nombre.trim();
    const clienteId = esVehiculoNuevo
      ? clienteExistente.id
      : agregarCliente({
          nombre: datosCliente.nombre.trim(),
          telefono: datosCliente.telefono.trim(),
          direccion: datosCliente.direccion.trim(),
        }).id;

    const { marca, modelo } = separarMarcaModelo(datosVehiculo.marcaModelo);
    const nuevoAuto = agregarAuto({
      marca,
      modelo,
      patente: datosVehiculo.patente.trim(),
      color: datosVehiculo.color.trim(),
      clienteId,
      kilometros: datosVehiculo.kilometros.trim(),
      observaciones: datosVehiculo.observaciones.trim(),
    });

    setClienteVehiculoCreado({ clienteId, autoId: nuevoAuto.id, nombreCliente });
    setPaso("preguntaTrabajo");
  }

  function handleSiCargarTrabajo() {
    onListo(clienteVehiculoCreado.clienteId, clienteVehiculoCreado.autoId);
  }

  function handleNoCargarTrabajo() {
    onClose();
  }

  const pasoNumero = paso === "vehiculo" ? 2 : 1;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={cerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
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
            />
          )}
          {paso === "preguntaTrabajo" && (
            <PreguntaTrabajoStep
              nombreCliente={clienteVehiculoCreado?.nombreCliente}
              onSi={handleSiCargarTrabajo}
              onNo={handleNoCargarTrabajo}
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
