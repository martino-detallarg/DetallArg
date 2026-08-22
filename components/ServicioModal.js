import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useServicios } from "../data/ServicioContext";
import { CATEGORIAS_SERVICIOS } from "../data/mockServicios";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function ServicioModal({ visible, item, onClose }) {
  const { agregarServicio, editarServicio, eliminarServicio } = useServicios();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState(null);
  const editando = item !== null;

  useEffect(() => {
    if (visible) {
      setNombre(item?.nombre ?? "");
      setPrecio(item ? String(item.precio) : "");
      setCategoria(item?.categoria ?? null);
    }
  }, [visible, item]);

  const precioNumerico = Number(precio.replace(",", "."));
  const esValido =
    nombre.trim() !== "" &&
    categoria !== null &&
    precio.trim() !== "" &&
    !Number.isNaN(precioNumerico) &&
    precioNumerico > 0;

  function handleGuardar() {
    if (!esValido) return;
    if (editando) {
      editarServicio(item.id, { nombre: nombre.trim(), precio: precioNumerico, categoria });
    } else {
      agregarServicio({ nombre: nombre.trim(), precio: precioNumerico, categoria });
    }
    onClose();
  }

  function handleEliminar() {
    eliminarServicio(item.id);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader
            titulo={editando ? "Editar Servicio" : "Agregar Servicio"}
            paso={1}
            totalPasos={1}
            onAtras={onClose}
          />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Input
              label="Nombre del servicio"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Pulido de mantenimiento"
            />

            <Input
              label="Precio"
              value={precio}
              onChangeText={setPrecio}
              placeholder="Ej: 20000"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.chips}>
              {Object.entries(CATEGORIAS_SERVICIOS).map(([clave, cat]) => {
                const activo = categoria === clave;
                return (
                  <TouchableOpacity
                    key={clave}
                    style={[styles.chip, activo && styles.chipSeleccionado]}
                    onPress={() => setCategoria(clave)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                      {cat.etiqueta}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.boton}>
              <Button title="Guardar" onPress={handleGuardar} disabled={!esValido} />
            </View>

            {editando && (
              <TouchableOpacity style={styles.eliminarBoton} onPress={handleEliminar} activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={styles.eliminarBotonTexto}>Eliminar servicio</Text>
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
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSeleccionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
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
