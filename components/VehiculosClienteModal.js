import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useClientes } from "../data/ClienteContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

const VEHICULO_VACIO = { marca: "", modelo: "", anio: "", patente: "", color: "" };

function FilaVehiculo({ vehiculo, onEditar, onEliminar }) {
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
export default function VehiculosClienteModal({ visible, cliente, onClose, onEditarCliente }) {
  const { agregarVehiculo, editarVehiculo, eliminarVehiculo } = useClientes();
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [vehiculoEditandoId, setVehiculoEditandoId] = useState(null);
  const [datosVehiculo, setDatosVehiculo] = useState(VEHICULO_VACIO);

  useEffect(() => {
    if (visible) {
      setFormularioVisible(false);
      setVehiculoEditandoId(null);
      setDatosVehiculo(VEHICULO_VACIO);
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
    });
    setFormularioVisible(true);
  }

  function handleGuardarVehiculo() {
    const datos = {
      marca: datosVehiculo.marca.trim(),
      modelo: datosVehiculo.modelo.trim(),
      anio: datosVehiculo.anio.trim(),
      patente: datosVehiculo.patente.trim(),
      color: datosVehiculo.color.trim(),
    };
    if (vehiculoEditandoId) {
      editarVehiculo(cliente.id, vehiculoEditandoId, datos);
    } else {
      agregarVehiculo(cliente.id, datos);
    }
    setFormularioVisible(false);
  }

  const esValido = datosVehiculo.marca.trim() !== "" && datosVehiculo.patente.trim() !== "";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
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
                  onEliminar={() => eliminarVehiculo(cliente.id, vehiculo.id)}
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
                <Input
                  label="Patente"
                  value={datosVehiculo.patente}
                  onChangeText={(v) => setDatosVehiculo((d) => ({ ...d, patente: v }))}
                  placeholder="AB 123 CD"
                  autoCapitalize="characters"
                />
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
  boton: {
    marginTop: 4,
  },
  botonCancelar: {
    marginTop: 10,
  },
});
