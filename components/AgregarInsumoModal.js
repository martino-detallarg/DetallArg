import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import MedidorNivelInsumo from "./MedidorNivelInsumo";
import { CATEGORIAS, UNIDADES_CAPACIDAD, catalogoInsumos } from "../data/mockInsumos";
import { useData } from "../data/DataContext";
import { useScrollAlHabilitar } from "../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../theme";

// returnKeyType="done" + Keyboard.dismiss() para todo campo numérico crudo
// de este archivo (no pasan por Input.js, que ya trae este default) — mismo
// criterio en los 5 campos numéricos: capacidad, precio, cantidad actual y
// ml por uso (x2, catálogo y formulario personalizado).
const PROPS_NUMERICO_DONE = {
  returnKeyType: "done",
  onSubmitEditing: () => Keyboard.dismiss(),
};

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

// Extrae el X de una dilución real del catálogo (ej. "Snow Foam 1:20",
// "Hasta 1:10 (grasa/aceite)", "1:50 (general — paneles, puertas, cuero)").
// Hay entradas reales del catálogo SIN ninguna proporción numérica ("No
// publicada", "Sin recomendación oficial") — para esas no hay nada que
// calcular y se sigue pidiendo el ml a mano más abajo.
function extraerRatioDilucion(opcion) {
  const match = opcion.match(/1\s*:\s*(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

// Convención del rubro: ml de producto puro necesarios para preparar 1
// litro de mezcla lista para usar, dada una dilución 1:X. Decisión de
// Augusto (9/9): la base del cálculo es "por litro de mezcla final", no
// "por uso/vehículo" (que hubiera necesitado un campo extra).
function calcularMlPorLitro(x) {
  return Math.round((1000 / (x + 1)) * 10) / 10;
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
  idParaMedidor,
  esRollo = false,
}) {
  const precioFormateado = formatearMiles(precioDigitos);

  function handleCambiarPrecio(texto) {
    onCambiarPrecioDigitos(texto.replace(/\D/g, ""));
  }

  // El medidor solo tiene sentido una vez que hay una capacidad de envase
  // válida cargada (necesita capacidadTotal/capacidadUnidad para dibujar las
  // proporciones) — antes de eso no se muestra. Es una forma alternativa de
  // fijar "cuánto tenés ahora": el nivel se deriva de cantidadActual en cada
  // render (no hay todavía un insumo guardado con su propio `nivel`), así que
  // tipear en el input numérico también mueve el medidor y viceversa.
  const capacidadNumericaMedidor = Number(capacidadTotal.replace(",", "."));
  const hayCapacidadValida =
    capacidadTotal.trim() !== "" && !Number.isNaN(capacidadNumericaMedidor) && capacidadNumericaMedidor > 0;
  const cantidadActualNumericaMedidor = Number(cantidadActual.replace(",", "."));
  const nivelParaMedidor = hayCapacidadValida
    ? Math.max(
        0,
        Math.min(100, Math.round(((cantidadActualNumericaMedidor || 0) / capacidadNumericaMedidor) * 100))
      )
    : 0;

  function handleCambiarNivelMedidor(nivelNuevo) {
    onCambiarCantidadActual(String(Math.round(capacidadNumericaMedidor * (nivelNuevo / 100))));
  }

  return (
    <>
      <View style={styles.camposEditables}>
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>{esRollo ? "m² del rollo (ancho × largo)" : "Capacidad del envase"}</Text>
          <TextInput
            style={styles.campoInput}
            value={capacidadTotal}
            onChangeText={onCambiarCapacidadTotal}
            placeholder={esRollo ? "Ej. 22.8" : "Ej. 500"}
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            editable={!bloqueada}
            {...PROPS_NUMERICO_DONE}
          />
        </View>
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>Unidad</Text>
          {esRollo ? (
            <View style={[styles.unidadChip, styles.unidadChipActivo]}>
              <Text style={[styles.unidadChipTexto, styles.unidadChipTextoActivo]}>m2</Text>
            </View>
          ) : (
            <View style={styles.unidadChips}>
              {UNIDADES_CAPACIDAD.filter((unidad) => unidad !== "m2").map((unidad) => {
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
          )}
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
            {...PROPS_NUMERICO_DONE}
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
            {...PROPS_NUMERICO_DONE}
          />
        </View>
      </View>

      {hayCapacidadValida && (
        <View style={styles.medidorContenedor}>
          <MedidorNivelInsumo
            insumo={{
              id: idParaMedidor,
              nivel: nivelParaMedidor,
              capacidadTotal: capacidadNumericaMedidor,
              capacidadUnidad,
            }}
            onCambiarNivel={handleCambiarNivelMedidor}
            deshabilitado={bloqueada}
          />
        </View>
      )}
    </>
  );
}

function FilaProducto({ producto, agregado, bloqueada, expandida, onTogglePress, onAgregar }) {
  const categoria = CATEGORIAS[producto.categoria];
  const esRollo = producto.categoria === "ppf";
  const tieneDilucion = !esRollo && calcularTieneDilucion(producto.diluciones);

  const [opcionesDilucion, setOpcionesDilucion] = useState(() => [...producto.diluciones]);
  const [dilucionesSeleccionadas, setDilucionesSeleccionadas] = useState(() =>
    producto.diluciones.includes(producto.dilucionRecomendada) ? [producto.dilucionRecomendada] : []
  );
  const [dilucionCustomTexto, setDilucionCustomTexto] = useState("");
  const [mlPorUsoPorDilucion, setMlPorUsoPorDilucion] = useState({});

  const [rendimientoTexto, setRendimientoTexto] = useState(producto.rendimientoEstimado ?? "");

  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(esRollo ? "m2" : UNIDADES_CAPACIDAD[0]);
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
        diluciones: tieneDilucion
          ? dilucionesSeleccionadas.map((texto) => {
              const ratioX = extraerRatioDilucion(texto);
              const mlCalculado = ratioX != null ? calcularMlPorLitro(ratioX) : null;
              return {
                texto,
                mlPorUso:
                  mlCalculado != null
                    ? mlCalculado
                    : mlPorUsoPorDilucion[texto]?.trim()
                    ? Number(mlPorUsoPorDilucion[texto].replace(",", "."))
                    : null,
              };
            })
          : [],
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
            {dilucionesSeleccionadas.length > 0 ? (
              <View style={styles.mlPorUsoLista}>
                {dilucionesSeleccionadas.map((opcion) => {
                  // Si la dilución trae una proporción real (la inmensa
                  // mayoría del catálogo), el ml sale solo — no se le pide
                  // al taller que lo calcule a mano. Solo las pocas
                  // entradas sin proporción publicada ("No publicada", etc.)
                  // siguen con el input manual de siempre.
                  const ratioX = extraerRatioDilucion(opcion);
                  const mlCalculado = ratioX != null ? calcularMlPorLitro(ratioX) : null;
                  return (
                    <View key={opcion} style={styles.mlPorUsoFila}>
                      <Text style={styles.mlPorUsoLabel} numberOfLines={1}>
                        {etiquetaCortaDilucion(opcion)}
                      </Text>
                      {mlCalculado != null ? (
                        <Text style={styles.mlPorUsoCalculado}>{mlCalculado} ml/L</Text>
                      ) : (
                        <TextInput
                          style={styles.mlPorUsoInput}
                          value={mlPorUsoPorDilucion[opcion] ?? ""}
                          onChangeText={(texto) =>
                            setMlPorUsoPorDilucion((actuales) => ({
                              ...actuales,
                              [opcion]: texto.replace(/[^\d.,]/g, ""),
                            }))
                          }
                          placeholder="ml/L (sin dato)"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                          editable={!bloqueada}
                          {...PROPS_NUMERICO_DONE}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            ) : null}
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
        ) : esRollo ? null : (
          <View style={styles.campo}>
            <Text style={styles.campoPuroTexto}>Se utiliza puro</Text>
            <Text style={styles.campoLabel}>Rendimiento (cantidad de vehículos)</Text>
            <TextInput
              style={styles.campoInput}
              value={rendimientoTexto}
              onChangeText={(texto) => setRendimientoTexto(texto.replace(/[^0-9]/g, "").slice(0, 3))}
              placeholder="Ej. 50"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              editable={!bloqueada}
              {...PROPS_NUMERICO_DONE}
            />
          </View>
        )}

        <CamposStock
          esRollo={esRollo}
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
          idParaMedidor={producto.id}
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

function FormularioPersonalizado({ onAgregar, onCancelar, scrollRef }) {
  const claveCategoriaInicial = Object.keys(CATEGORIAS)[0];
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState(claveCategoriaInicial);
  const esRollo = categoria === "ppf";
  const [seDiluye, setSeDiluye] = useState(false);
  // Solo el X: el "1:" es fijo, no se tipea — mismo criterio que patente.js
  // (normalizar en el momento, no aceptar cualquier formato libre).
  const [dilucionX, setDilucionX] = useState("");
  const [rendimientoTexto, setRendimientoTexto] = useState("");

  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(UNIDADES_CAPACIDAD[0]);
  const [precioDigitos, setPrecioDigitos] = useState("");
  const [cantidadActual, setCantidadActual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Categoría "PPF" elegida a mano acá: mismo criterio que FilaProducto,
  // fuerza la unidad a m2 (y la saca en cuanto se elige otra categoría).
  function handleCambiarCategoria(nuevaCategoria) {
    setCategoria(nuevaCategoria);
    if (nuevaCategoria === "ppf") {
      setCapacidadUnidad("m2");
    } else if (capacidadUnidad === "m2") {
      setCapacidadUnidad(UNIDADES_CAPACIDAD[0]);
    }
  }

  const { capacidadNumerica, precioNumerico, cantidadActualNumerica, stockValido } = validarStock({
    capacidadTotal,
    precioDigitos,
    cantidadActual,
  });
  const puedeAgregar =
    nombre.trim() !== "" &&
    marca.trim() !== "" &&
    (!seDiluye || dilucionX.trim() !== "") &&
    stockValido;
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, puedeAgregar);

  async function handleConfirmar() {
    setGuardando(true);
    setError(null);
    try {
      await onAgregar({
        nombre: nombre.trim(),
        marca: marca.trim(),
        categoria,
        diluciones:
          seDiluye && dilucionX.trim()
            ? [
                {
                  texto: `1:${dilucionX.trim()}`,
                  mlPorUso: calcularMlPorLitro(Number(dilucionX)),
                },
              ]
            : [],
        rendimiento: seDiluye ? null : rendimientoTexto.trim(),
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
                onPress={() => handleCambiarCategoria(clave)}
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
          <View style={styles.dilucionRatioFila}>
            <Text style={styles.dilucionRatioPrefijo}>1 :</Text>
            <TextInput
              style={styles.dilucionRatioInput}
              value={dilucionX}
              onChangeText={(texto) => setDilucionX(texto.replace(/[^0-9]/g, "").slice(0, 3))}
              placeholder="200"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              editable={!guardando}
              {...PROPS_NUMERICO_DONE}
            />
          </View>
          {dilucionX.trim() !== "" && (
            <Text style={styles.dilucionCalculoTexto}>
              ≈ {calcularMlPorLitro(Number(dilucionX))} ml de producto puro por litro de mezcla
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.campo}>
          <Text style={styles.campoPuroTexto}>Se utiliza puro</Text>
          <Text style={styles.campoLabel}>Rendimiento (cantidad de vehículos)</Text>
          <TextInput
            style={styles.campoInput}
            value={rendimientoTexto}
            onChangeText={(texto) => setRendimientoTexto(texto.replace(/[^0-9]/g, "").slice(0, 3))}
            placeholder="Ej. 50"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            editable={!guardando}
            {...PROPS_NUMERICO_DONE}
          />
        </View>
      )}

      <CamposStock
        esRollo={esRollo}
        capacidadTotal={capacidadTotal}
        onCambiarCapacidadTotal={setCapacidadTotal}
        capacidadUnidad={capacidadUnidad}
        onCambiarCapacidadUnidad={setCapacidadUnidad}
        precioDigitos={precioDigitos}
        onCambiarPrecioDigitos={setPrecioDigitos}
        cantidadActual={cantidadActual}
        onCambiarCantidadActual={setCantidadActual}
        bloqueada={guardando}
        idParaMedidor="personalizado"
      />

      {error && <Text style={styles.filaError}>{error}</Text>}

      <View style={styles.formularioBotones} onLayout={onLayoutBoton}>
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
  // Modo de búsqueda del catálogo: "todos" mantiene el buscador de texto
  // libre de siempre (nombre/marca/categoría mezclados); "marca"/"categoria"
  // agregan una fila de chips para elegir un valor puntual de ESE campo,
  // sobre la cual el texto libre sigue filtrando también si se escribe algo.
  const [modoFiltro, setModoFiltro] = useState("todos");
  const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
  const formularioScrollRef = useRef(null);

  const marcasDisponibles = useMemo(
    () => [...new Set(catalogoInsumos.map((p) => p.marca))].sort((a, b) => a.localeCompare(b)),
    []
  );

  function handleCambiarModoFiltro(nuevoModo) {
    setModoFiltro(nuevoModo);
    setFiltroSeleccionado(null);
  }

  // Cuando se abre desde el estado vacío de una categoría (CategoriaInsumosModal),
  // arranca con esa categoría ya buscada en vez de la lista completa de 478 productos.
  useEffect(() => {
    if (visible) {
      setBusqueda(busquedaInicial ?? "");
    }
  }, [visible, busquedaInicial]);

  const filtrados = useMemo(() => {
    let base = catalogoInsumos;
    if (modoFiltro === "marca" && filtroSeleccionado) {
      base = base.filter((producto) => producto.marca === filtroSeleccionado);
    } else if (modoFiltro === "categoria" && filtroSeleccionado) {
      base = base.filter((producto) => producto.categoria === filtroSeleccionado);
    }

    const termino = busqueda.trim().toLowerCase();
    if (!termino) return base;
    return base.filter((producto) => {
      const etiquetaCategoria = CATEGORIAS[producto.categoria]?.etiqueta ?? "";
      return (
        producto.nombre.toLowerCase().includes(termino) ||
        producto.marca.toLowerCase().includes(termino) ||
        etiquetaCategoria.toLowerCase().includes(termino)
      );
    });
  }, [busqueda, modoFiltro, filtroSeleccionado]);

  function handleCerrar() {
    setBusqueda("");
    setIdsAgregados(new Set());
    setFilaExpandidaId(null);
    setVistaPersonalizado(false);
    setModoFiltro("todos");
    setFiltroSeleccionado(null);
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
      {/* react-native-gesture-handler no llega adentro de un <Modal> nativo a
      través del GestureHandlerRootView de App.js (el modal abre su propia
      jerarquía nativa) — mismo detalle que MoverCategoriaModal.js, hace falta
      este wrapper propio para que el gesto de arrastre de
      MedidorNivelInsumo.js funcione acá también. */}
      <GestureHandlerRootView style={styles.flexUno}>
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
              <ScrollView ref={formularioScrollRef} contentContainerStyle={styles.lista} keyboardShouldPersistTaps="handled">
                <FormularioPersonalizado
                  onAgregar={handleAgregarPersonalizado}
                  onCancelar={() => setVistaPersonalizado(false)}
                  scrollRef={formularioScrollRef}
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

                <View style={styles.modoFiltroFila}>
                  {[
                    { id: "todos", etiqueta: "Todos" },
                    { id: "marca", etiqueta: "Por marca" },
                    { id: "categoria", etiqueta: "Por categoría" },
                  ].map((opcion) => {
                    const activo = modoFiltro === opcion.id;
                    return (
                      <TouchableOpacity
                        key={opcion.id}
                        style={[styles.modoFiltroChip, activo && styles.modoFiltroChipActivo]}
                        onPress={() => handleCambiarModoFiltro(opcion.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.modoFiltroChipTexto, activo && styles.modoFiltroChipTextoActivo]}>
                          {opcion.etiqueta}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {modoFiltro !== "todos" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.valorFiltroScroll}
                    contentContainerStyle={styles.valorFiltroContenido}
                  >
                    {(modoFiltro === "marca" ? marcasDisponibles : Object.keys(CATEGORIAS)).map((valor) => {
                      const etiqueta = modoFiltro === "marca" ? valor : CATEGORIAS[valor]?.etiqueta ?? valor;
                      const activo = filtroSeleccionado === valor;
                      return (
                        <TouchableOpacity
                          key={valor}
                          style={[styles.valorFiltroChip, activo && styles.valorFiltroChipActivo]}
                          onPress={() => setFiltroSeleccionado(activo ? null : valor)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[styles.valorFiltroChipTexto, activo && styles.valorFiltroChipTextoActivo]}
                            numberOfLines={1}
                          >
                            {etiqueta}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

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
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  medidorContenedor: {
    marginTop: 4,
    marginBottom: 4,
  },
  flexUno: {
    flex: 1,
  },
  buscador: {
    paddingHorizontal: 20,
  },
  modoFiltroFila: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  modoFiltroChip: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingVertical: 8,
  },
  modoFiltroChipActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modoFiltroChipTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  modoFiltroChipTextoActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  valorFiltroScroll: {
    marginBottom: 12,
  },
  valorFiltroContenido: {
    paddingHorizontal: 20,
    gap: 6,
  },
  valorFiltroChip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 6,
  },
  valorFiltroChipActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  valorFiltroChipTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  valorFiltroChipTextoActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
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
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campoPuroTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.accentLight,
    marginBottom: 6,
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
  mlPorUsoLista: {
    gap: 6,
    marginTop: 8,
  },
  mlPorUsoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mlPorUsoLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  mlPorUsoInput: {
    width: 90,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mlPorUsoCalculado: {
    width: 90,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.accentLight,
    textAlign: "right",
  },
  dilucionRatioFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dilucionRatioPrefijo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dilucionRatioInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dilucionCalculoTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.accentLight,
    marginTop: 6,
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
