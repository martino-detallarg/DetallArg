import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useClientes } from "../data/ClienteContext";
import { esPatenteValida, formatearPatente, normalizarPatente } from "../utils/patente";
import { colors, continuousCorner, fonts, radii } from "../theme";

const VEHICULO_VACIO = { marca: "", modelo: "", anio: "", patente: "", color: "", sinPatente: false };

function FilaVehiculo({ vehiculo, onEditar, onEliminar, eliminando }) {
  return (
    <TouchableOpacity style={styles.fila} onPress={onEditar} activeOpacity={0.8}>
      <View style={styles.filaIcono}>
        <Ionicons name="car-outline" size={20} color={colors.accentLight} />
      </View>
      <View style={styles.filaTexto}>
        <Text style={styles.filaNombre} numberOfLines={1}>
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio ? `(${vehiculo.anio})` : ""}
        </Text>
        <Text style={styles.filaSub}>
          {vehiculo.patente || "Sin patente"} · {vehiculo.color || "Sin color"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.quitarBoton}
        onPress={onEliminar}
        disabled={eliminando}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Vista de detalle de un cliente: sus datos y la lista de sus vehículos, con
// alta/edición/borrado de vehículos en un formulario simple que se despliega
// dentro del mismo modal (sin agregar otra pantalla).
export default function VehiculosClienteModal({ visible, cliente, onClose, onEditarCliente, navigation }) {
  const { agregarVehiculo, editarVehiculo, eliminarVehiculo } = useClientes();
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [vehiculoEditandoId, setVehiculoEditandoId] = useState(null);
  const [datosVehiculo, setDatosVehiculo] = useState(VEHICULO_VACIO);
  const [cargando, setCargando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setFormularioVisible(false);
      setVehiculoEditandoId(null);
      setDatosVehiculo(VEHICULO_VACIO);
      setError(null);
    }
  }, [visible, cliente?.id]);

  if (!cliente) return null;

  function handleAgregar() {
    setVehiculoEditandoId(null);
    setDatosVehiculo(VEHICULO_VACIO);
    setFormularioVisible(true);
  }

  function handleEditar(vehiculo) {
    setVehiculoEditandoId(vehiculo.id);
    setDatosVehiculo({
      marca: vehiculo.marca ?? "",
      modelo: vehiculo.modelo ?? "",
      anio: vehiculo.anio ?? "",
      patente: vehiculo.patente ?? "",
      color: vehiculo.color ?? "",
      sinPatente: !vehiculo.patente,
    });
    setFormularioVisible(true);
  }

  async function handleGuardarVehiculo() {
    const datos = {
      marca: datosVehiculo.marca.trim(),
      modelo: datosVehiculo.modelo.trim(),
      anio: datosVehiculo.anio.trim(),
      patente: datosVehiculo.sinPatente ? "" : formatearPatente(datosVehiculo.patente),
      color: datosVehiculo.color.trim(),
    };
    setCargando(true);
    setError(null);
    try {
      if (vehiculoEditandoId) {
        await editarVehiculo(cliente.id, vehiculoEditandoId, datos);
      } else {
        await agregarVehiculo(cliente.id, datos);
      }
      setFormularioVisible(false);
    } catch (err) {
      setError("No se pudo guardar el vehículo. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function handleEliminarVehiculo(vehiculoId) {
    if (eliminandoId) return;
    setEliminandoId(vehiculoId);
    setError(null);
    try {
      await eliminarVehiculo(cliente.id, vehiculoId);
    } catch (err) {
      setError("No se pudo eliminar el vehículo. Probá de nuevo.");
    } finally {
      setEliminandoId(null);
    }
  }

  const esValido =
    datosVehiculo.marca.trim() !== "" &&
    (datosVehiculo.sinPatente || esPatenteValida(datosVehiculo.patente));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <WizardHeader titulo={cliente.nombre} paso={1} totalPasos={1} onAtras={onClose} />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <View style={styles.encabezadoCliente}>
              <Text style={styles.telefono}>{cliente.telefono}</Text>
              <TouchableOpacity
                onPress={onEditarCliente}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.editarBoton}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.accentLight} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                onClose();
                navigation.navigate("HistorialClientes", { clienteIdInicial: cliente.id });
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.verHistorialBoton}
            >
              <Text style={styles.verHistorialTexto}>Ver historial</Text>
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.seccionHeader}>
              <Text style={styles.seccion}>Vehículos ({cliente.vehiculos.length})</Text>
              <TouchableOpacity
                onPress={handleAgregar}
                style={styles.agregarBoton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={18} color={colors.bg} />
              </TouchableOpacity>
            </View>

            {cliente.vehiculos.length === 0 ? (
              <Text style={styles.vacio}>Este cliente todavía no tiene vehículos cargados.</Text>
            ) : (
              cliente.vehiculos.map((vehiculo) => (
                <FilaVehiculo
                  key={vehiculo.id}
                  vehiculo={vehiculo}
                  onEditar={() => handleEditar(vehiculo)}
                  onEliminar={() => handleEliminarVehiculo(vehiculo.id)}
                  eliminando={eliminandoId === vehiculo.id}
                />
              ))
            )}

            {formularioVisible && (
              <View style={styles.formulario}>
                <Text style={styles.formularioTitulo}>
                  {vehiculoEditandoId ? "Editar vehículo" : "Agregar vehículo"}
                </Text>

                <Input
                  label="Marca"
                  value={datosVehiculo.marca}
                  onChangeText={(v) => setDatosVehiculo((d) => ({ ...d, marca: v }))}
                  placeholder="Volkswagen"
                />
                <Input
                  label="Modelo"
                  value={datosVehiculo.modelo}
                  onChangeText={(v) => setDatosVehiculo((d) => ({ ...d, modelo: v }))}
                  placeholder="Golf"
                />
                <Input
                  label="Año (opcional)"
                  value={datosVehiculo.anio}
                  onChangeText={(v) => setDatosVehiculo((d) => ({ ...d, anio: v }))}
                  placeholder="2020"
                  keyboardType="numeric"
                />
                {!datosVehiculo.sinPatente && (
                  <>
                    <Input
                      label="Patente"
                      value={datosVehiculo.patente}
                      onChangeText={(v) => setDatosVehiculo((d) => ({ ...d, patente: normalizarPatente(v) }))}
                      placeholder="ABC123 o AB123CD"
                      autoCapitalize="characters"
                    />
                    <Text style={styles.ayudaPatente}>Formato: ABC123 (viejo) o AB123CD (Mercosur)</Text>
                  </>
                )}
                <View style={styles.switchFila}>
                  <Text style={styles.switchTexto}>Todavía no tiene patente</Text>
                  <Switch
                    value={datosVehiculo.sinPatente}
                    onValueChange={(valor) =>
                      setDatosVehiculo((d) => ({ ...d, sinPatente: valor, patente: valor ? "" : d.patente }))
                    }
                    trackColor={{ false: colors.surface2, true: colors.accentDark }}
                  />
                </View>
                <Input
                  label="Color"
                  value={datosVehiculo.color}
                  onChangeText={(v) => setDatosVehiculo((d) => ({ ...d, color: v }))}
                  placeholder="Gris"
                />

                <View style={styles.boton}>
                  <Button
                    title={vehiculoEditandoId ? "Guardar cambios" : "Agregar vehículo"}
                    onPress={handleGuardarVehiculo}
                    disabled={!esValido}
                    loading={cargando}
                  />
                </View>
                <View style={styles.botonCancelar}>
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={() => setFormularioVisible(false)}
                  />
                </View>
              </View>
            )}
          </ScrollView>
          </KeyboardAvoidingView>
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
  flexUno: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  encabezadoCliente: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 20,
  },
  telefono: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  editarBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  verHistorialBoton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  verHistorialTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
    textDecorationLine: "underline",
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  seccion: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  agregarBoton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  vacio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 10,
  },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  filaTexto: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  quitarBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  formulario: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 6,
  },
  formularioTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  ayudaPatente: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -10,
    marginBottom: 16,
  },
  switchFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  boton: {
    marginTop: 4,
  },
  botonCancelar: {
    marginTop: 10,
  },
});
