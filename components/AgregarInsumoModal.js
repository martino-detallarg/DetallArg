import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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

// Un producto "se diluye" si su catálogo lista alguna dilución real más allá
// de "Puro" (usarlo puro no es una dilución que el taller tenga que elegir).
function calcularTieneDilucion(diluciones) {
  if (!diluciones || diluciones.length === 0) return false;
  if (diluciones.length === 1 && diluciones[0].trim().toLowerCase() === "puro") return false;
  return true;
}

// Muchas diluciones reales del catálogo vienen como frase completa con
// aclaración entre paréntesis (ej. "1:50 (general — paneles, puertas,
// cuero)"). El chip solo puede mostrar la parte corta del ratio para no
// desbordar en la selección múltiple.
function etiquetaCortaDilucion(opcion) {
  const indiceParentesis = opcion.indexOf("(");
  return indiceParentesis > 0 ? opcion.slice(0, indiceParentesis).trim() : opcion;
}

function formatearMiles(digitos) {
  if (!digitos) return "";
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Validación de capacidad/precio/cantidad actual: compartida entre cada fila
// del catálogo y el formulario de insumo personalizado para que ambos
// acepten/rechacen exactamente los mismos valores.
function validarStock({ capacidadTotal, precioDigitos, cantidadActual }) {
  const capacidadNumerica = Number(capacidadTotal.replace(",", "."));
  const capacidadValida = capacidadTotal.trim() !== "" && !Number.isNaN(capacidadNumerica) && capacidadNumerica > 0;

  const precioNumerico = precioDigitos === "" ? NaN : Number(precioDigitos);
  const precioValido = precioDigitos !== "" && !Number.isNaN(precioNumerico) && precioNumerico > 0;

  const cantidadActualNumerica = Number(cantidadActual.replace(",", "."));
  const cantidadActualValida =
    cantidadActual.trim() !== "" && !Number.isNaN(cantidadActualNumerica) && cantidadActualNumerica >= 0;

  return {
    capacidadNumerica,
    precioNumerico,
    cantidadActualNumerica,
    stockValido: capacidadValida && precioValido && cantidadActualValida,
  };
}

// Bloque de capacidad de envase, precio de compra y cantidad actual en stock:
// compartido entre cada fila del catálogo y el formulario de insumo
// personalizado para no duplicar la lógica de validación/formato.
function CamposStock({
  capacidadTotal,
  onCambiarCapacidadTotal,
  capacidadUnidad,
  onCambiarCapacidadUnidad,
  precioDigitos,
  onCambiarPrecioDigitos,
  cantidadActual,
  onCambiarCantidadActual,
  tamanosEnvase,
  bloqueada = false,
}) {
  const precioFormateado = formatearMiles(precioDigitos);

  function handleCambiarPrecio(texto) {
    onCambiarPrecioDigitos(texto.replace(/\D/g, ""));
  }

  return (
    <>
      <View style={styles.camposEditables}>
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>Capacidad del envase</Text>
          <TextInput
            style={styles.campoInput}
            value={capacidadTotal}
            onChangeText={onCambiarCapacidadTotal}
            placeholder="Ej. 500"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            editable={!bloqueada}
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
                  onPress={() => onCambiarCapacidadUnidad(unidad)}
                  disabled={bloqueada}
                  pointerEvents={bloqueada ? "none" : "auto"}
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

      {tamanosEnvase && tamanosEnvase.length > 0 ? (
        <Text style={styles.filaEnvases}>Envases de referencia: {tamanosEnvase.join(" · ")}</Text>
      ) : null}

      <View style={styles.camposEditables}>
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>Precio de compra ($)</Text>
          <TextInput
            style={styles.campoInput}
            value={precioFormateado}
            onChangeText={handleCambiarPrecio}
            placeholder="Ej. 20.000"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            editable={!bloqueada}
          />
        </View>
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>¿Cuánto tenés ahora? ({capacidadUnidad})</Text>
          <TextInput
            style={styles.campoInput}
            value={cantidadActual}
            onChangeText={onCambiarCantidadActual}
            placeholder="Ej. 500"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            editable={!bloqueada}
          />
        </View>
      </View>
    </>
  );
}

function FilaProducto({ producto, agregado, bloqueada, expandida, onTogglePress, onAgregar }) {
  const categoria = CATEGORIAS[producto.categoria];
  const tieneDilucion = calcularTieneDilucion(producto.diluciones);

  const [opcionesDilucion, setOpcionesDilucion] = useState(() => [...producto.diluciones]);
  const [dilucionesSeleccionadas, setDilucionesSeleccionadas] = useState(() =>
    producto.diluciones.includes(producto.dilucionRecomendada) ? [producto.dilucionRecomendada] : []
  );
  const [dilucionCustomTexto, setDilucionCustomTexto] = useState("");

  const [rendimientoTexto, setRendimientoTexto] = useState(producto.rendimientoEstimado ?? "");

  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(UNIDADES_CAPACIDAD[0]);
  const [precioDigitos, setPrecioDigitos] = useState("");
  const [cantidadActual, setCantidadActual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const { capacidadNumerica, precioNumerico, cantidadActualNumerica, stockValido } = validarStock({
    capacidadTotal,
    precioDigitos,
    cantidadActual,
  });
  const puedeAgregar = stockValido;

  function toggleDilucion(opcion) {
    setDilucionesSeleccionadas((actuales) =>
      actuales.includes(opcion) ? actuales.filter((d) => d !== opcion) : [...actuales, opcion]
    );
  }

  function agregarDilucionCustom() {
    const texto = dilucionCustomTexto.trim();
    if (!texto) return;
    setOpcionesDilucion((actuales) => (actuales.includes(texto) ? actuales : [...actuales, texto]));
    setDilucionesSeleccionadas((actuales) => (actuales.includes(texto) ? actuales : [...actuales, texto]));
    setDilucionCustomTexto("");
  }

  async function handleAgregar() {
    setGuardando(true);
    setError(null);
    try {
      await onAgregar({
        diluciones: tieneDilucion ? dilucionesSeleccionadas : [],
        rendimiento: tieneDilucion ? null : rendimientoTexto.trim(),
        capacidadTotal: capacidadNumerica,
        capacidadUnidad,
        precioCompra: precioNumerico,
        cantidadActual: cantidadActualNumerica,
      });
    } catch (err) {
      setError("No se pudo agregar. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={[styles.fila, bloqueada && styles.filaBloqueada, expandida && styles.filaActiva]}>
      <TouchableOpacity
        style={styles.filaIcono}
        onPress={onTogglePress}
        disabled={agregado || bloqueada}
        activeOpacity={0.7}
      >
        {producto.imagen ? (
          <Image source={producto.imagen} style={styles.imagenProducto} resizeMode="contain" />
        ) : (
          <Ionicons name={categoria?.icono ?? "cube-outline"} size={26} color={colors.accentLight} />
        )}
      </TouchableOpacity>

      <View style={styles.filaInfo}>
        <TouchableOpacity onPress={onTogglePress} disabled={agregado || bloqueada} activeOpacity={0.7}>
          <Text style={styles.filaNombre} numberOfLines={2}>
            {producto.nombre}
          </Text>
          <Text style={styles.filaMarca}>
            {producto.marca} · {categoria?.etiqueta ?? "Sin categoría"}
          </Text>
        </TouchableOpacity>

        {tieneDilucion ? (
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Dilución</Text>
            <View style={styles.dilucionChips}>
              {opcionesDilucion.map((opcion) => {
                const activa = dilucionesSeleccionadas.includes(opcion);
                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[styles.unidadChip, activa && styles.unidadChipActivo]}
                    onPress={() => toggleDilucion(opcion)}
                    disabled={bloqueada}
                    pointerEvents={bloqueada ? "none" : "auto"}
                  >
                    <Text style={[styles.unidadChipTexto, activa && styles.unidadChipTextoActivo]} numberOfLines={1}>
                      {etiquetaCortaDilucion(opcion)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.dilucionCustomFila}>
              <TextInput
                style={styles.dilucionCustomInput}
                value={dilucionCustomTexto}
                onChangeText={setDilucionCustomTexto}
                placeholder="Otra dilución..."
                placeholderTextColor={colors.textMuted}
                editable={!bloqueada}
              />
              <TouchableOpacity
                style={styles.dilucionCustomBoton}
                onPress={agregarDilucionCustom}
                disabled={bloqueada}
                pointerEvents={bloqueada ? "none" : "auto"}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color={colors.bg} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Rendimiento</Text>
            <TextInput
              style={styles.campoInput}
              value={rendimientoTexto}
              onChangeText={setRendimientoTexto}
              placeholder="Ej. 200 lavados/L"
              placeholderTextColor={colors.textMuted}
              editable={!bloqueada}
            />
          </View>
        )}

        <CamposStock
          capacidadTotal={capacidadTotal}
          onCambiarCapacidadTotal={setCapacidadTotal}
          capacidadUnidad={capacidadUnidad}
          onCambiarCapacidadUnidad={setCapacidadUnidad}
          precioDigitos={precioDigitos}
          onCambiarPrecioDigitos={setPrecioDigitos}
          cantidadActual={cantidadActual}
          onCambiarCantidadActual={setCantidadActual}
          tamanosEnvase={producto.tamanosEnvase}
          bloqueada={bloqueada}
        />
        {error && <Text style={styles.filaError}>{error}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.botonAgregar, (agregado || !puedeAgregar || bloqueada || guardando) && styles.botonAgregarHecho]}
        onPress={handleAgregar}
        disabled={agregado || !puedeAgregar || bloqueada || guardando}
        activeOpacity={0.85}
      >
        {guardando ? (
          <ActivityIndicator color={colors.bg} size="small" />
        ) : (
          <Ionicons name={agregado ? "checkmark" : "add"} size={20} color={colors.bg} />
        )}
      </TouchableOpacity>
    </View>
  );
}

function FormularioPersonalizado({ onAgregar, onCancelar }) {
  const claveCategoriaInicial = Object.keys(CATEGORIAS)[0];
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState(claveCategoriaInicial);
  const [seDiluye, setSeDiluye] = useState(false);
  const [dilucionTexto, setDilucionTexto] = useState("");
  const [rendimientoTexto, setRendimientoTexto] = useState("");

  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(UNIDADES_CAPACIDAD[0]);
  const [precioDigitos, setPrecioDigitos] = useState("");
  const [cantidadActual, setCantidadActual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const { capacidadNumerica, precioNumerico, cantidadActualNumerica, stockValido } = validarStock({
    capacidadTotal,
    precioDigitos,
    cantidadActual,
  });
  const puedeAgregar = nombre.trim() !== "" && marca.trim() !== "" && stockValido;

  async function handleConfirmar() {
    setGuardando(true);
    setError(null);
    try {
      await onAgregar({
        nombre: nombre.trim(),
        marca: marca.trim(),
        categoria,
        diluciones: seDiluye && dilucionTexto.trim() ? [dilucionTexto.trim()] : [],
        rendimiento: seDiluye ? null : rendimientoTexto.trim(),
        capacidadTotal: capacidadNumerica,
        capacidadUnidad,
        precioCompra: precioNumerico,
        cantidadActual: cantidadActualNumerica,
      });
    } catch (err) {
      setError("No se pudo agregar. Probá de nuevo.");
      setGuardando(false);
    }
  }

  return (
    <View style={styles.formularioPersonalizado}>
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>Nombre</Text>
        <TextInput
          style={styles.campoInput}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del producto"
          placeholderTextColor={colors.textMuted}
          editable={!guardando}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.campoLabel}>Marca</Text>
        <TextInput
          style={styles.campoInput}
          value={marca}
          onChangeText={setMarca}
          placeholder="Marca"
          placeholderTextColor={colors.textMuted}
          editable={!guardando}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.campoLabel}>Categoría</Text>
        <View style={styles.dilucionChips}>
          {Object.entries(CATEGORIAS).map(([clave, datos]) => {
            const activa = categoria === clave;
            return (
              <TouchableOpacity
                key={clave}
                style={[styles.unidadChip, activa && styles.unidadChipActivo]}
                onPress={() => setCategoria(clave)}
                disabled={guardando}
              >
                <Text style={[styles.unidadChipTexto, activa && styles.unidadChipTextoActivo]}>
                  {datos.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.campoLabel}>¿Se diluye?</Text>
        <View style={styles.unidadChips}>
          <TouchableOpacity
            style={[styles.unidadChip, seDiluye && styles.unidadChipActivo]}
            onPress={() => setSeDiluye(true)}
            disabled={guardando}
          >
            <Text style={[styles.unidadChipTexto, seDiluye && styles.unidadChipTextoActivo]}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unidadChip, !seDiluye && styles.unidadChipActivo]}
            onPress={() => setSeDiluye(false)}
            disabled={guardando}
          >
            <Text style={[styles.unidadChipTexto, !seDiluye && styles.unidadChipTextoActivo]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      {seDiluye ? (
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>Dilución</Text>
          <TextInput
            style={styles.campoInput}
            value={dilucionTexto}
            onChangeText={setDilucionTexto}
            placeholder="Ej. 1:200"
            placeholderTextColor={colors.textMuted}
            editable={!guardando}
          />
        </View>
      ) : (
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>Rendimiento</Text>
          <TextInput
            style={styles.campoInput}
            value={rendimientoTexto}
            onChangeText={setRendimientoTexto}
            placeholder="Ej. 200 lavados/L"
            placeholderTextColor={colors.textMuted}
            editable={!guardando}
          />
        </View>
      )}

      <CamposStock
        capacidadTotal={capacidadTotal}
        onCambiarCapacidadTotal={setCapacidadTotal}
        capacidadUnidad={capacidadUnidad}
        onCambiarCapacidadUnidad={setCapacidadUnidad}
        precioDigitos={precioDigitos}
        onCambiarPrecioDigitos={setPrecioDigitos}
        cantidadActual={cantidadActual}
        onCambiarCantidadActual={setCantidadActual}
        bloqueada={guardando}
      />

      {error && <Text style={styles.filaError}>{error}</Text>}

      <View style={styles.formularioBotones}>
        <TouchableOpacity style={styles.formularioBotonCancelar} onPress={onCancelar} disabled={guardando} activeOpacity={0.8}>
          <Text style={styles.formularioBotonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formularioBotonConfirmar, (!puedeAgregar || guardando) && styles.formularioBotonConfirmarDeshabilitado]}
          onPress={handleConfirmar}
          disabled={!puedeAgregar || guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color={colors.bg} size="small" />
          ) : (
            <Text style={styles.formularioBotonConfirmarTexto}>Agregar insumo personalizado</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AgregarInsumoModal({ visible, busquedaInicial, onClose }) {
  const { agregarInsumo } = useData();
  const [busqueda, setBusqueda] = useState("");
  const [idsAgregados, setIdsAgregados] = useState(new Set());
  const [filaExpandidaId, setFilaExpandidaId] = useState(null);
  const [vistaPersonalizado, setVistaPersonalizado] = useState(false);

  // Cuando se abre desde el estado vacío de una categoría (CategoriaInsumosModal),
  // arranca con esa categoría ya buscada en vez de la lista completa de 478 productos.
  useEffect(() => {
    if (visible) {
      setBusqueda(busquedaInicial ?? "");
    }
  }, [visible, busquedaInicial]);

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
    setFilaExpandidaId(null);
    setVistaPersonalizado(false);
    onClose();
  }

  function handleTogglePress(productoId) {
    setFilaExpandidaId((actual) => (actual === productoId ? null : productoId));
  }

  async function handleAgregar(producto, { diluciones, rendimiento, capacidadTotal, capacidadUnidad, precioCompra, cantidadActual }) {
    await agregarInsumo({
      productoId: producto.id,
      marca: producto.marca,
      nombre: producto.nombre,
      categoria: producto.categoria,
      diluciones,
      rendimiento,
      imagen: producto.imagen ?? null,
      precioCompra,
      capacidadTotal,
      capacidadUnidad,
      cantidadActual,
    });
    setIdsAgregados((actuales) => new Set(actuales).add(producto.id));
    setFilaExpandidaId(null);
  }

  async function handleAgregarPersonalizado(valores) {
    await agregarInsumo({
      productoId: null,
      marca: valores.marca,
      nombre: valores.nombre,
      categoria: valores.categoria,
      diluciones: valores.diluciones,
      rendimiento: valores.rendimiento,
      imagen: null,
      precioCompra: valores.precioCompra,
      capacidadTotal: valores.capacidadTotal,
      capacidadUnidad: valores.capacidadUnidad,
      cantidadActual: valores.cantidadActual,
      esPersonalizado: true,
    });
    setVistaPersonalizado(false);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCerrar}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <WizardHeader
              titulo={vistaPersonalizado ? "Insumo personalizado" : "Agregar Insumo"}
              paso={1}
              totalPasos={1}
              onAtras={vistaPersonalizado ? () => setVistaPersonalizado(false) : handleCerrar}
            />

            {vistaPersonalizado ? (
              <ScrollView contentContainerStyle={styles.lista} keyboardShouldPersistTaps="handled">
                <FormularioPersonalizado
                  onAgregar={handleAgregarPersonalizado}
                  onCancelar={() => setVistaPersonalizado(false)}
                />
              </ScrollView>
            ) : (
              <>
                <View style={styles.buscador}>
                  <Input
                    placeholder="Buscar por producto, marca o categoría..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={styles.bannerPersonalizado}
                  onPress={() => setVistaPersonalizado(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.accentLight} />
                  <Text style={styles.bannerPersonalizadoTexto}>
                    ¿No está tu producto? Crear insumo personalizado
                  </Text>
                </TouchableOpacity>

                <FlatList
                  data={filtrados}
                  keyExtractor={(producto) => producto.id}
                  contentContainerStyle={styles.lista}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <FilaProducto
                      producto={item}
                      agregado={idsAgregados.has(item.id)}
                      expandida={filaExpandidaId === item.id}
                      bloqueada={filaExpandidaId !== null && filaExpandidaId !== item.id}
                      onTogglePress={() => handleTogglePress(item.id)}
                      onAgregar={(valores) => handleAgregar(item, valores)}
                    />
                  )}
                  ListEmptyComponent={
                    <Text style={styles.vacio}>No encontramos productos con ese criterio.</Text>
                  }
                />
              </>
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
  buscador: {
    paddingHorizontal: 20,
  },
  bannerPersonalizado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  bannerPersonalizadoTexto: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accentLight,
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
  filaBloqueada: {
    opacity: 0.4,
  },
  filaActiva: {
    borderColor: colors.accent,
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
    gap: 10,
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
  filaEnvases: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  filaError: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.error,
  },
  camposEditables: {
    flexDirection: "row",
    gap: 8,
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
  dilucionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dilucionCustomFila: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  dilucionCustomInput: {
    flex: 1,
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
  },
  dilucionCustomBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
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
  formularioPersonalizado: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 14,
  },
  formularioBotones: {
    gap: 10,
    marginTop: 6,
  },
  formularioBotonCancelar: {
    alignItems: "center",
    paddingVertical: 12,
  },
  formularioBotonCancelarTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  formularioBotonConfirmar: {
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    ...continuousCorner,
    alignItems: "center",
    paddingVertical: 14,
  },
  formularioBotonConfirmarDeshabilitado: {
    backgroundColor: colors.accentDark,
  },
  formularioBotonConfirmarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.bg,
  },
});
