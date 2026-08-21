import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useData } from "../data/DataContext";
import { CATEGORIAS_COSTOS_FIJOS, ORDEN_CATEGORIAS_COSTOS_FIJOS } from "../data/mockFinanzas";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function CostoFijoModal({ visible, item, onClose }) {
  const { agregarCostoFijo, actualizarCostoFijo, eliminarCostoFijo } = useData();
  const [categoria, setCategoria] = useState(null);
  const [monto, setMonto] = useState("");
  const editando = item !== null;

  useEffect(() => {
    if (visible) {
      setCategoria(item?.categoria ?? null);
      setMonto(item ? String(item.monto) : "");
    }
  }, [visible, item]);

  const montoNumerico = Number(monto.replace(",", "."));
  const esValido = categoria !== null && monto.trim() !== "" && !Number.isNaN(montoNumerico) && montoNumerico > 0;

  function handleGuardar() {
    if (!esValido) return;
    if (editando) {
      actualizarCostoFijo(item.id, { categoria, monto: montoNumerico });
    } else {
      agregarCostoFijo({ categoria, monto: montoNumerico });
    }
    onClose();
  }

  function handleEliminar() {
    eliminarCostoFijo(item.id);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader
            titulo={editando ? "Editar Costo Fijo" : "Agregar Costo Fijo"}
            paso={1}
            totalPasos={1}
            onAtras={onClose}
          />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.chips}>
              {ORDEN_CATEGORIAS_COSTOS_FIJOS.map((clave) => {
                const activo = categoria === clave;
                return (
                  <TouchableOpacity
                    key={clave}
                    style={[styles.chip, activo && styles.chipSeleccionado]}
                    onPress={() => setCategoria(clave)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                      {CATEGORIAS_COSTOS_FIJOS[clave].etiqueta}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Monto mensual"
              value={monto}
              onChangeText={setMonto}
              placeholder="Ej: 150000"
              keyboardType="numeric"
            />

            <View style={styles.boton}>
              <Button title="Guardar" onPress={handleGuardar} disabled={!esValido} />
            </View>

            {editando && (
              <TouchableOpacity style={styles.eliminarBoton} onPress={handleEliminar} activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={styles.eliminarBotonTexto}>Eliminar costo fijo</Text>
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
