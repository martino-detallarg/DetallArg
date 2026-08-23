import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useEquipo } from "../data/EquipoContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Formulario de alta y edición de empleado (mismo patrón que ClienteModal):
// si viene `item`, edita ese empleado y muestra el botón de eliminar; si
// viene null, crea uno nuevo. La validación del límite del plan la hace
// MiEquipoScreen.js antes de abrir este modal en modo alta.
export default function EmpleadoModal({ visible, item, onClose }) {
  const { agregarEmpleado, editarEmpleado, eliminarEmpleado } = useEquipo();
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const editando = item !== null;

  useEffect(() => {
    if (visible) {
      setNombre(item?.nombre ?? "");
      setRol(item?.rol ?? "");
      setTelefono(item?.telefono ?? "");
      setError(null);
    }
  }, [visible, item]);

  const esValido = nombre.trim() !== "" && rol.trim() !== "";

  async function handleGuardar() {
    if (!esValido) return;
    setCargando(true);
    setError(null);
    try {
      if (editando) {
        await editarEmpleado(item.id, { nombre: nombre.trim(), rol: rol.trim(), telefono: telefono.trim() });
      } else {
        await agregarEmpleado({ nombre: nombre.trim(), rol: rol.trim(), telefono: telefono.trim() });
      }
      onClose();
    } catch (err) {
      setError("No se pudo guardar el empleado. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function handleEliminar() {
    setCargando(true);
    setError(null);
    try {
      await eliminarEmpleado(item.id);
      onClose();
    } catch (err) {
      setError("No se pudo eliminar el empleado. Probá de nuevo.");
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
              titulo={editando ? "Editar Empleado" : "Agregar Empleado"}
              paso={1}
              totalPasos={1}
              onAtras={onClose}
            />

            <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
              <Input
                label="Nombre y apellido"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Carlos Gómez"
              />
              <Input
                label="Rol / puesto"
                value={rol}
                onChangeText={setRol}
                placeholder="Ej: Lavador, Encargado"
              />
              <Input
                label="Teléfono (opcional)"
                value={telefono}
                onChangeText={setTelefono}
                placeholder="11 2345-6789"
                keyboardType="phone-pad"
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.boton}>
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
                  <Text style={styles.eliminarBotonTexto}>Eliminar empleado</Text>
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
