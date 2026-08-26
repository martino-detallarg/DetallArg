import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import RecetaServicioStep from "./servicio/RecetaServicioStep";
import { useServicios } from "../data/ServicioContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

const TOTAL_PASOS = 2;
const UNIDADES_DURACION = [
  { clave: "horas", etiqueta: "Horas" },
  { clave: "dias", etiqueta: "Días" },
];

export default function ServicioModal({ visible, item, onClose }) {
  const { agregarServicio, editarServicio, eliminarServicio } = useServicios();
  const [fase, setFase] = useState("datos");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracionValor, setDuracionValor] = useState("");
  const [duracionUnidad, setDuracionUnidad] = useState(UNIDADES_DURACION[0].clave);
  const [receta, setReceta] = useState([]);
  const editando = item !== null;

  useEffect(() => {
    if (visible) {
      setFase("datos");
      setNombre(item?.nombre ?? "");
      setDescripcion(item?.descripcion ?? "");
      setPrecio(item ? String(item.precio) : "");
      setDuracionValor(item?.duracionValor ? String(item.duracionValor) : "");
      setDuracionUnidad(item?.duracionUnidad ?? UNIDADES_DURACION[0].clave);
      setReceta(item?.receta ?? []);
    }
  }, [visible, item]);

  const precioNumerico = Number(precio.replace(",", "."));
  const duracionNumerica = Number(duracionValor.replace(",", "."));
  const esValido =
    nombre.trim() !== "" &&
    descripcion.trim() !== "" &&
    precio.trim() !== "" &&
    !Number.isNaN(precioNumerico) &&
    precioNumerico > 0 &&
    duracionValor.trim() !== "" &&
    !Number.isNaN(duracionNumerica) &&
    duracionNumerica > 0;

  function handleCerrar() {
    setFase("datos");
    onClose();
  }

  function handleContinuar() {
    if (!esValido) return;
    setFase("receta");
  }

  function handleGuardar() {
    // Sólo se guardan líneas con una cantidad/costo numérico válido — una
    // línea marcada pero sin cargar se descarta en vez de bloquear el
    // guardado del servicio. Las líneas libres (sin ficha en Mis Insumos) se
    // validan por costoEstimado en vez de cantidad.
    const recetaFinal = receta
      .map((linea) =>
        linea.libre
          ? { ...linea, costoEstimado: Number(String(linea.costoEstimado).replace(",", ".")) }
          : { ...linea, cantidad: Number(String(linea.cantidad).replace(",", ".")) }
      )
      .filter((linea) =>
        linea.libre
          ? !Number.isNaN(linea.costoEstimado) && linea.costoEstimado > 0
          : !Number.isNaN(linea.cantidad) && linea.cantidad > 0
      );

    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precioNumerico,
      duracionValor: duracionNumerica,
      duracionUnidad,
      receta: recetaFinal,
    };
    if (editando) {
      editarServicio(item.id, datos);
    } else {
      agregarServicio(datos);
    }
    handleCerrar();
  }

  function handleEliminar() {
    eliminarServicio(item.id);
    handleCerrar();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          {fase === "datos" && (
            <>
              <WizardHeader
                titulo={editando ? "Editar Servicio" : "Agregar Servicio"}
                paso={1}
                totalPasos={TOTAL_PASOS}
                onAtras={handleCerrar}
              />

              <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
                <Input
                  label="Nombre del servicio"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Pulido de mantenimiento"
                />

                <Input
                  label="Descripción"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Lo que va a ver el cliente en el Catálogo"
                  multiline
                  numberOfLines={4}
                />

                <Input
                  label="Precio estimado"
                  value={precio}
                  onChangeText={setPrecio}
                  placeholder="Ej: 20000"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Duración estimada</Text>
                <View style={styles.duracionFila}>
                  <View style={styles.duracionInput}>
                    <Input value={duracionValor} onChangeText={setDuracionValor} placeholder="Ej: 2" keyboardType="numeric" />
                  </View>
                  <View style={styles.chips}>
                    {UNIDADES_DURACION.map(({ clave, etiqueta }) => {
                      const activo = duracionUnidad === clave;
                      return (
                        <TouchableOpacity
                          key={clave}
                          style={[styles.chip, activo && styles.chipSeleccionado]}
                          onPress={() => setDuracionUnidad(clave)}
                        >
                          <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                            {etiqueta}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.boton}>
                  <Button title="Continuar a receta de insumos" onPress={handleContinuar} disabled={!esValido} />
                </View>

                {editando && (
                  <TouchableOpacity style={styles.eliminarBoton} onPress={handleEliminar} activeOpacity={0.85}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={styles.eliminarBotonTexto}>Eliminar servicio</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.botonCancelar}>
                  <Button title="Cancelar" variant="secondary" onPress={handleCerrar} />
                </View>
              </ScrollView>
            </>
          )}

          {fase === "receta" && (
            <RecetaServicioStep
              receta={receta}
              onCambiar={setReceta}
              paso={2}
              totalPasos={TOTAL_PASOS}
              onAtras={() => setFase("datos")}
              onGuardar={handleGuardar}
            />
          )}
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
  duracionFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  duracionInput: {
    width: 100,
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
