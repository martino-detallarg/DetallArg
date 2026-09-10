import { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import TrabajoPendienteCobroCard from "./TrabajoPendienteCobroCard";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import { useFinanzas } from "../data/FinanzasContext";
import { calcularSaldoPendienteTurno } from "../utils/calculosFinanzas";
import { colors, fonts } from "../theme";

function coincide(campo, termino) {
  return (campo ?? "").toLowerCase().includes(termino);
}

// Acceso rápido global a "Registrar seña" (ver HomeScreen.js ->
// OpcionesNuevoModal): para cuando alguien llama por teléfono a pagar una
// seña y el trabajo todavía no se abrió desde ningún otro lado (a
// diferencia del botón contextual de TrabajoDetalleModal.js, acá el trabajo
// NO está implícito). Busca por cliente, patente o servicio (mismo criterio
// que ClientesScreen.js) sobre cualquier turno con saldo pendiente, sin
// importar el estado — una seña es un cobro parcial más, disponible
// mientras quede saldo, no solo en Pendiente/En proceso (mismo criterio
// que puedeTomarSena en TrabajoDetalleModal.js).
export default function SeleccionarTrabajoSenaModal({ visible, onClose, onElegirTurno }) {
  const { turnos } = useTurnos();
  const { getClienteById, getVehiculoById } = useClientes();
  const { cobros } = useFinanzas();
  const [busqueda, setBusqueda] = useState("");

  const turnosDisponibles = useMemo(
    () =>
      turnos
        .map((turno) => ({
          turno,
          cliente: getClienteById(turno.clienteId),
          auto: getVehiculoById(turno.autoId),
          saldo: calcularSaldoPendienteTurno(turno, cobros),
        }))
        .filter(({ saldo }) => saldo === null || saldo > 0),
    [turnos, cobros, getClienteById, getVehiculoById]
  );

  const termino = busqueda.trim().toLowerCase();
  const filtrados =
    termino === ""
      ? turnosDisponibles
      : turnosDisponibles.filter(
          ({ turno, cliente, auto }) =>
            coincide(cliente?.nombre, termino) || coincide(auto?.patente, termino) || coincide(turno.servicio, termino)
        );

  function handleCerrar() {
    setBusqueda("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader titulo="Elegir Trabajo" paso={1} totalPasos={1} onAtras={handleCerrar} />

          <View style={styles.buscadorWrap}>
            <Input
              placeholder="Buscar por cliente, patente o servicio..."
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
            {turnosDisponibles.length === 0 ? (
              <Text style={styles.vacio}>No hay trabajos con saldo pendiente para tomar una seña.</Text>
            ) : filtrados.length === 0 ? (
              <Text style={styles.vacio}>No encontramos ningún trabajo con esos datos.</Text>
            ) : (
              filtrados.map(({ turno, cliente, auto, saldo }) => (
                <TrabajoPendienteCobroCard
                  key={turno.id}
                  turno={turno}
                  cliente={cliente}
                  auto={auto}
                  saldo={saldo}
                  textoSinPago="Tomar seña"
                  onPress={() => onElegirTurno(turno)}
                />
              ))
            )}
          </ScrollView>
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
  buscadorWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  lista: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
