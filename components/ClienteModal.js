import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useClientes } from "../data/ClienteContext";
import { useScrollAlHabilitar } from "../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Formulario de alta y edición de cliente (mismo patrón que CostoFijoModal):
// si viene `cliente`, edita ese cliente y muestra el botón de eliminar; si
// viene null, crea uno nuevo.
//
// `onEliminado` es distinto de `onClose` a propósito: `onClose` es "solo
// cerrar este modal" (cancelar o guardar edición, sin tocar nada más), pero
// eliminar el cliente además tiene que avisarle a ClientesScreen que cierre
// el detalle del cliente (VehiculosClienteModal) si estaba abierto — si no,
// ese modal quedaría con un clienteDetalleId apuntando a un cliente que ya
// no existe. Si no viene `onEliminado`, cae a `onClose` (mismo
// comportamiento que antes, para no romper otro uso futuro de este modal).
export default function ClienteModal({ visible, cliente, onClose, onEliminado }) {
  const { agregarCliente, editarCliente, eliminarCliente } = useClientes();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const editando = cliente !== null;
  const scrollRef = useRef(null);
  const telefonoRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setNombre(cliente?.nombre ?? "");
      setTelefono(cliente?.telefono ?? "");
      setError(null);
    }
  }, [visible, cliente]);

  const esValido = nombre.trim() !== "" && telefono.trim() !== "";
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, esValido);

  async function handleGuardar() {
    if (!esValido) return;
    setCargando(true);
    setError(null);
    try {
      if (editando) {
        await editarCliente(cliente.id, { nombre: nombre.trim(), telefono: telefono.trim() });
      } else {
        await agregarCliente({ nombre: nombre.trim(), telefono: telefono.trim() });
      }
      onClose();
    } catch (err) {
      setError("No se pudo guardar el cliente. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function handleEliminar() {
    setCargando(true);
    setError(null);
    try {
      await eliminarCliente(cliente.id);
      (onEliminado ?? onClose)();
    } catch (err) {
      setError("No se pudo eliminar el cliente. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <WizardHeader
              titulo={editando ? "Editar Cliente" : "Agregar Cliente"}
              paso={1}
              totalPasos={1}
              onAtras={onClose}
            />

            <ScrollView ref={scrollRef} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
              <Input
                label="Nombre y apellido"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Juan Pérez"
                returnKeyType="next"
                onSubmitEditing={() => telefonoRef.current?.focus()}
              />
              <Input
                ref={telefonoRef}
                label="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                placeholder="11 2345-6789"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.boton} onLayout={onLayoutBoton}>
                <Button title="Guardar" onPress={handleGuardar} disabled={!esValido} loading={cargando} />
              </View>

              {editando && (
                <TouchableOpacity
                  style={styles.eliminarBoton}
                  onPress={handleEliminar}
                  disabled={cargando}
                  activeOpacity={0.85}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={styles.eliminarBotonTexto}>Eliminar cliente</Text>
                </TouchableOpacity>
              )}

              <View style={styles.botonCancelar}>
                <Button title="Cancelar" variant="secondary" onPress={onClose} />
              </View>
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
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 4,
  },
  boton: {
    marginTop: 12,
  },
  eliminarBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: 10,
  },
  eliminarBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.error,
  },
  botonCancelar: {
    marginTop: 10,
  },
});
