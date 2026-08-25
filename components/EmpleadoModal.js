import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import SelectorSiluetaModal from "./SelectorSiluetaModal";
import { useEquipo } from "../data/EquipoContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

// { hombre: "man-outline", mujer: "woman-outline" } — sin elegir, "person-outline".
const ICONOS_SILUETA = {
  hombre: "man-outline",
  mujer: "woman-outline",
};

// Formulario de alta y edición de empleado (mismo patrón que ClienteModal):
// si viene `item`, edita ese empleado y muestra el botón de eliminar; si
// viene null, crea uno nuevo. La validación del límite del plan la hace
// MiEquipoScreen.js antes de abrir este modal en modo alta.
export default function EmpleadoModal({ visible, item, onClose }) {
  const { empleados, agregarEmpleado, editarEmpleado, cambiarEstadoEmpleado, eliminarEmpleado } = useEquipo();
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoEstado, setCargandoEstado] = useState(false);
  const [error, setError] = useState(null);
  // Puramente visual, solo dentro de esta sesión del modal — no se guarda
  // en EquipoContext ni en Supabase, así que siempre arranca en null
  // (avatar neutro) al abrir, sin importar si el empleado ya existía.
  const [silueta, setSilueta] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const editando = item !== null;
  // El `item` que llega por prop es la foto del empleado al momento de
  // abrir el modal — no se actualiza solo. Para que el switch refleje el
  // estado real después de tocarlo (sin actualización optimista, mismo
  // criterio que el resto de la app), se busca la versión más nueva en
  // el propio EquipoContext.
  const empleadoActual = editando ? empleados.find((e) => e.id === item.id) ?? item : null;

  useEffect(() => {
    if (visible) {
      setNombre(item?.nombre ?? "");
      setRol(item?.rol ?? "");
      setTelefono(item?.telefono ?? "");
      setError(null);
      setSilueta(null);
    }
  }, [visible, item]);

  function handleElegirSilueta(id) {
    setSilueta(id);
    setSelectorVisible(false);
  }

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

  async function handleCambiarEstado(valor) {
    setCargandoEstado(true);
    setError(null);
    try {
      await cambiarEstadoEmpleado(item.id, valor);
    } catch (err) {
      setError("No se pudo actualizar el estado. Probá de nuevo.");
    } finally {
      setCargandoEstado(false);
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
              <View style={styles.avatarContenedor}>
                <TouchableOpacity
                  onPress={() => setSelectorVisible(true)}
                  activeOpacity={0.85}
                  style={styles.avatarToque}
                >
                  <View style={styles.avatarCirculo}>
                    <Ionicons
                      name={ICONOS_SILUETA[silueta] ?? "person-outline"}
                      size={44}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.avatarEditarBoton}>
                    <Ionicons name="pencil" size={14} color={colors.bg} />
                  </View>
                </TouchableOpacity>
              </View>

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
                <>
                  <View style={styles.estadoTarjeta}>
                    <View style={styles.estadoFila}>
                      <View style={styles.estadoTextos}>
                        <Text style={styles.estadoTitulo}>Empleado activo</Text>
                        <Text style={styles.estadoAyuda}>
                          Desactivalo para dejar de asignarle turnos nuevos, sin perder su historial.
                        </Text>
                      </View>
                      <Switch
                        value={empleadoActual?.activo ?? true}
                        onValueChange={handleCambiarEstado}
                        disabled={cargandoEstado || cargando}
                        trackColor={{ false: colors.surface2, true: colors.accentDark }}
                        thumbColor={empleadoActual?.activo ? colors.accent : colors.textMuted}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.eliminarBoton}
                    onPress={handleEliminar}
                    disabled={cargando}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={styles.eliminarBotonTexto}>Eliminar empleado</Text>
                  </TouchableOpacity>
                  <Text style={styles.eliminarAyuda}>
                    Eliminar borra el registro por completo, incluido su historial.
                  </Text>
                </>
              )}

              <View style={styles.botonCancelar}>
                <Button title="Cancelar" variant="secondary" onPress={onClose} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>

      <SelectorSiluetaModal
        visible={selectorVisible}
        onElegir={handleElegirSilueta}
        onCerrar={() => setSelectorVisible(false)}
      />
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
  avatarContenedor: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  avatarToque: {
    position: "relative",
  },
  avatarCirculo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditarBoton: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
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
  estadoTarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 18,
  },
  estadoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  estadoTextos: {
    flex: 1,
  },
  estadoTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  estadoAyuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
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
  eliminarAyuda: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 6,
  },
  botonCancelar: {
    marginTop: 10,
  },
});
