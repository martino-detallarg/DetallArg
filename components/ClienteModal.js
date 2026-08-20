import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useClientes } from "../data/ClienteContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Formulario de alta y edición de cliente (mismo patrón que CostoFijoModal):
// si viene `cliente`, edita ese cliente y muestra el botón de eliminar; si
// viene null, crea uno nuevo.
export default function ClienteModal({ visible, cliente, onClose }) {
  const { agregarCliente, editarCliente, eliminarCliente } = useClientes();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const editando = cliente !== null;

  useEffect(() => {
    if (visible) {
      setNombre(cliente?.nombre ?? "");
      setTelefono(cliente?.telefono ?? "");
    }
  }, [visible, cliente]);

  const esValido = nombre.trim() !== "" && telefono.trim() !== "";

  function handleGuardar() {
    if (!esValido) return;
    if (editando) {
      editarCliente(cliente.id, { nombre: nombre.trim(), telefono: telefono.trim() });
    } else {
      agregarCliente({ nombre: nombre.trim(), telefono: telefono.trim() });
    }
    onClose();
  }

  function handleEliminar() {
    eliminarCliente(cliente.id);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader
            titulo={editando ? "Editar Cliente" : "Agregar Cliente"}
            paso={1}
            totalPasos={1}
            onAtras={onClose}
          />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Input
              label="Nombre y apellido"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Juan Pérez"
            />
            <Input
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="11 2345-6789"
              keyboardType="phone-pad"
            />

            <View style={styles.boton}>
              <Button title="Guardar" onPress={handleGuardar} disabled={!esValido} />
            </View>

            {editando && (
              <TouchableOpacity style={styles.eliminarBoton} onPress={handleEliminar} activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={styles.eliminarBotonTexto}>Eliminar cliente</Text>
              </TouchableOpacity>
            )}

            <View style={styles.botonCancelar}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} />
            </View>
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
