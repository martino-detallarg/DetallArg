import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import { CATEGORIAS, UNIDADES_CAPACIDAD, catalogoInsumos } from "../data/mockInsumos";
import { useData } from "../data/DataContext";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../theme";

function FilaProducto({ producto, agregado, onAgregar }) {
  const categoria = CATEGORIAS[producto.categoria];
  const [dilucion, setDilucion] = useState(producto.dilucion);
  const [rendimiento, setRendimiento] = useState(producto.rendimiento);
  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(UNIDADES_CAPACIDAD[0]);

  const capacidadNumerica = Number(capacidadTotal.replace(",", "."));
  const capacidadValida = capacidadTotal.trim() !== "" && !Number.isNaN(capacidadNumerica) && capacidadNumerica > 0;

  return (
    <View style={styles.fila}>
      <View style={styles.filaIcono}>
        {producto.imagen ? (
          <Image source={producto.imagen} style={styles.imagenProducto} resizeMode="contain" />
        ) : (
          <Ionicons name={categoria?.icono ?? "cube-outline"} size={26} color={colors.accentLight} />
        )}
      </View>

      <View style={styles.filaInfo}>
        <Text style={styles.filaNombre} numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text style={styles.filaMarca}>
          {producto.marca} · {categoria?.etiqueta ?? "Sin categoría"}
        </Text>
        <Text style={styles.filaPh}>pH: {producto.ph}</Text>

        <View style={styles.camposEditables}>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Dilución</Text>
            <TextInput
              style={styles.campoInput}
              value={dilucion}
              onChangeText={setDilucion}
              placeholder="Ej. 1:200"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Rendimiento</Text>
            <TextInput
              style={styles.campoInput}
              value={rendimiento}
              onChangeText={setRendimiento}
              placeholder="Ej. 200 lavados/L"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.camposEditables}>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Capacidad del envase</Text>
            <TextInput
              style={styles.campoInput}
              value={capacidadTotal}
              onChangeText={setCapacidadTotal}
              placeholder="Ej. 500"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Unidad</Text>
            <View style={styles.unidadChips}>
              {UNIDADES_CAPACIDAD.map((unidad) => {
                const activa = capacidadUnidad === unidad;
                return (
                  <TouchableOpacity
                    key={unidad}
                    style={[styles.unidadChip, activa && styles.unidadChipActivo]}
                    onPress={() => setCapacidadUnidad(unidad)}
                  >
                    <Text style={[styles.unidadChipTexto, activa && styles.unidadChipTextoActivo]}>
                      {unidad}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botonAgregar, (agregado || !capacidadValida) && styles.botonAgregarHecho]}
        onPress={() => onAgregar({ dilucion, rendimiento, capacidadTotal: capacidadNumerica, capacidadUnidad })}
        disabled={agregado || !capacidadValida}
        activeOpacity={0.85}
      >
        <Ionicons name={agregado ? "checkmark" : "add"} size={20} color={colors.bg} />
      </TouchableOpacity>
    </View>
  );
}

export default function AgregarInsumoModal({ visible, onClose }) {
  const { agregarInsumo } = useData();
  const [busqueda, setBusqueda] = useState("");
  const [idsAgregados, setIdsAgregados] = useState(new Set());

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return catalogoInsumos;
    return catalogoInsumos.filter((producto) => {
      const etiquetaCategoria = CATEGORIAS[producto.categoria]?.etiqueta ?? "";
      return (
        producto.nombre.toLowerCase().includes(termino) ||
        producto.marca.toLowerCase().includes(termino) ||
        etiquetaCategoria.toLowerCase().includes(termino)
      );
    });
  }, [busqueda]);

  function handleCerrar() {
    setBusqueda("");
    setIdsAgregados(new Set());
    onClose();
  }

  function handleAgregar(producto, { dilucion, rendimiento, capacidadTotal, capacidadUnidad }) {
    agregarInsumo({
      productoId: producto.id,
      marca: producto.marca,
      nombre: producto.nombre,
      categoria: producto.categoria,
      ph: producto.ph,
      dilucion,
      rendimiento,
      imagen: producto.imagen ?? null,
      precioCompra: producto.precioCompra,
      capacidadTotal,
      capacidadUnidad,
    });
    setIdsAgregados((actuales) => new Set(actuales).add(producto.id));
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <WizardHeader titulo="Agregar Insumo" paso={1} totalPasos={1} onAtras={handleCerrar} />

            <View style={styles.buscador}>
              <Input
                placeholder="Buscar por producto, marca o categoría..."
                value={busqueda}
                onChangeText={setBusqueda}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={filtrados}
              keyExtractor={(producto) => producto.id}
              contentContainerStyle={styles.lista}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <FilaProducto
                  producto={item}
                  agregado={idsAgregados.has(item.id)}
                  onAgregar={(valores) => handleAgregar(item, valores)}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.vacio}>No encontramos productos con ese criterio.</Text>
              }
            />
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
  buscador: {
    paddingHorizontal: 20,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  fila: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  filaIcono: {
    width: 52,
    height: 52,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  imagenProducto: {
    width: "100%",
    height: "100%",
  },
  filaInfo: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaMarca: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filaPh: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  camposEditables: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  campo: {
    flex: 1,
  },
  campoLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campoInput: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...shadowSubtle,
  },
  unidadChips: {
    flexDirection: "row",
    gap: 6,
  },
  unidadChip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  unidadChipActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unidadChipTexto: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  unidadChipTextoActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  botonAgregar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  botonAgregarHecho: {
    backgroundColor: colors.accentDark,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
