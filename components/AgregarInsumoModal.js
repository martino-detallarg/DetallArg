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
import ChipGroup from "./ChipGroup";
import MedidorNivelInsumo from "./MedidorNivelInsumo";
import ConfiguracionConsumoInsumo, { calcularMlPorUso } from "./insumos/ConfiguracionConsumoInsumo";
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

// Un rollo de PPF no tiene diluciones ni "cuánto rinde" como el resto de los
// insumos: se mide en m² del rollo, no en ml/g/unidades (ver CamposStock).
function esCategoriaPpf(categoria) {
  return categoria === "ppf";
}

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

// Convierte un texto de input (coma o punto decimal) en número, o null si no
// es un número usable — mismo criterio de parseo que el resto del archivo.
function numeroDesdeTexto(texto) {
  const numero = Number(String(texto).replace(",", "."));
  return Number.isNaN(numero) ? null : numero;
}

// Bloque de capacidad de envase, precio de compra y cantidad actual en stock:
// compartido entre cada fila del catálogo y el formulario de insumo
// personalizado para no duplicar la lógica de validación/formato. Para un
// rollo de PPF (esRollo), "capacidad de envase" no tiene sentido — en vez de
// eso se pide ancho + largo por separado y `capacidadTotal`/`cantidadActual`
// (los mismos que ya usa cualquier otro insumo, ver validarStock/medidor) se
// derivan solos como ancho × largo / ancho × metros restantes.
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
  anchoRollo = "",
  onCambiarAnchoRollo = () => {},
}) {
  const precioFormateado = formatearMiles(precioDigitos);
  const [largoRollo, setLargoRollo] = useState("");
  const [metrosRestantes, setMetrosRestantes] = useState("");

  function handleCambiarPrecio(texto) {
    onCambiarPrecioDigitos(texto.replace(/\D/g, ""));
  }

  // Recalcula capacidadTotal (ancho × largo) y cantidadActual (ancho ×
  // metros restantes) cada vez que cambia cualquiera de los tres valores —
  // un rollo no cambia de ancho al usarse, solo se acorta, así que el mismo
  // ancho sirve para las dos cuentas.
  function recalcularRollo({ ancho = anchoRollo, largo = largoRollo, restantes = metrosRestantes }) {
    const anchoNum = numeroDesdeTexto(ancho);
    const largoNum = numeroDesdeTexto(largo);
    const restantesNum = numeroDesdeTexto(restantes);

    const total = anchoNum > 0 && largoNum > 0 ? anchoNum * largoNum : null;
    onCambiarCapacidadTotal(total != null ? String(total) : "");

    const actual = anchoNum > 0 && restantesNum >= 0 ? anchoNum * restantesNum : null;
    onCambiarCantidadActual(actual != null ? String(actual) : "");
  }

  function handleCambiarAncho(texto) {
    onCambiarAnchoRollo(texto);
    recalcularRollo({ ancho: texto });
  }

  function handleCambiarLargo(texto) {
    setLargoRollo(texto);
    recalcularRollo({ largo: texto });
  }

  function handleCambiarMetrosRestantes(texto) {
    setMetrosRestantes(texto);
    recalcularRollo({ restantes: texto });
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
      {esRollo ? (
        <View style={styles.camposEditables}>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Ancho del rollo (m)</Text>
            <TextInput
              style={styles.campoInput}
              value={anchoRollo}
              onChangeText={handleCambiarAncho}
              placeholder="Ej. 1.52"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              editable={!bloqueada}
              {...PROPS_NUMERICO_DONE}
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Largo del rollo (m)</Text>
            <TextInput
              style={styles.campoInput}
              value={largoRollo}
              onChangeText={handleCambiarLargo}
              placeholder="Ej. 15"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              editable={!bloqueada}
              {...PROPS_NUMERICO_DONE}
            />
          </View>
        </View>
      ) : (
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
              {...PROPS_NUMERICO_DONE}
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Unidad</Text>
            <ChipGroup
              disabled={bloqueada}
              options={UNIDADES_CAPACIDAD.filter((unidad) => unidad !== "m2").map((unidad) => ({
                value: unidad,
                label: unidad,
                selected: capacidadUnidad === unidad,
              }))}
              onPress={onCambiarCapacidadUnidad}
            />
          </View>
        </View>
      )}

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
          {esRollo ? (
            <>
              <Text style={styles.campoLabel}>¿Cuántos metros te quedan?</Text>
              <TextInput
                style={styles.campoInput}
                value={metrosRestantes}
                onChangeText={handleCambiarMetrosRestantes}
                placeholder="Ej. 8"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                editable={!bloqueada}
                {...PROPS_NUMERICO_DONE}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </View>
      </View>

      {esRollo && hayCapacidadValida && (
        <Text style={styles.filaEnvases}>
          ≈ {capacidadNumericaMedidor.toFixed(1)} m² en total · ≈ {(cantidadActualNumericaMedidor || 0).toFixed(1)} m²
          disponibles ahora
        </Text>
      )}

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
  const esRollo = esCategoriaPpf(producto.categoria);
  // Punto de partida inferido del catálogo (calcularTieneDilucion), pero
  // editable de acá en más -- el taller puede corregirlo si en su taller el
  // uso real es distinto del que publica la marca.
  const [seDiluye, setSeDiluye] = useState(() => !esRollo && calcularTieneDilucion(producto.diluciones));
  // Precarga con el ratio de la dilución recomendada del catálogo cuando se
  // puede parsear (ej. "Balde 1:400" -> "400") -- sigue editable igual que
  // el resto.
  const [dilucionX, setDilucionX] = useState(() => {
    const ratio = extraerRatioDilucion(producto.dilucionRecomendada ?? "");
    return ratio != null ? String(ratio) : "";
  });
  const [envaseAplicadorMl, setEnvaseAplicadorMl] = useState("");
  const [mlPorAutoTexto, setMlPorAutoTexto] = useState("");
  // Solo tiene sentido para un rollo de PPF (esRollo): a qué le corresponde
  // este rollo puntual, carrocería o vidrio (lámina distinta, pensada para
  // vidrio curvo -- ver data/ppfPanelMatrix.js). Default "carroceria" para
  // que un insumo que no es de PPF (donde este campo no se usa para nada)
  // no quede con un valor sin sentido.
  const [materialPpf, setMaterialPpf] = useState("carroceria");

  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(esRollo ? "m2" : UNIDADES_CAPACIDAD[0]);
  const [precioDigitos, setPrecioDigitos] = useState("");
  const [cantidadActual, setCantidadActual] = useState("");
  const [anchoRollo, setAnchoRollo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const { capacidadNumerica, precioNumerico, cantidadActualNumerica, stockValido } = validarStock({
    capacidadTotal,
    precioDigitos,
    cantidadActual,
  });
  const anchoRolloNumerico = numeroDesdeTexto(anchoRollo);
  const puedeAgregar = stockValido && (!esRollo || anchoRolloNumerico > 0);

  // Diluciones reales que publica la marca para este producto (["Puro"] o
  // vacío no cuenta, ver calcularTieneDilucion) -- se muestran nada más
  // como referencia informativa, ya no se pueden tocar ni seleccionar.
  const dilucionesSugeridas =
    !esRollo && calcularTieneDilucion(producto.diluciones)
      ? producto.diluciones.map(etiquetaCortaDilucion)
      : null;

  async function handleAgregar() {
    setGuardando(true);
    setError(null);
    try {
      await onAgregar({
        seDiluye: !esRollo && seDiluye,
        dilucionX: !esRollo && seDiluye ? numeroDesdeTexto(dilucionX) : null,
        envaseAplicadorMl: !esRollo && seDiluye ? numeroDesdeTexto(envaseAplicadorMl) : null,
        mlPorUso: esRollo ? null : calcularMlPorUso({ seDiluye, dilucionX, envaseAplicadorMl, mlPorAutoTexto }),
        materialPpf,
        capacidadTotal: capacidadNumerica,
        capacidadUnidad,
        precioCompra: precioNumerico,
        cantidadActual: cantidadActualNumerica,
        anchoRollo: esRollo ? anchoRolloNumerico : null,
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

        {expandida && (
          <>
            {!esRollo && (
              <ConfiguracionConsumoInsumo
                seDiluye={seDiluye}
                onCambiarSeDiluye={setSeDiluye}
                dilucionX={dilucionX}
                onCambiarDilucionX={setDilucionX}
                envaseAplicadorMl={envaseAplicadorMl}
                onCambiarEnvaseAplicadorMl={setEnvaseAplicadorMl}
                mlPorAutoTexto={mlPorAutoTexto}
                onCambiarMlPorAutoTexto={setMlPorAutoTexto}
                dilucionesSugeridas={dilucionesSugeridas}
                bloqueada={bloqueada}
              />
            )}

            {esRollo && (
              <View style={styles.campo}>
                <Text style={styles.campoLabel}>¿Este rollo es para carrocería o para vidrio?</Text>
                <ChipGroup
                  disabled={bloqueada}
                  options={[
                    { value: "carroceria", label: "Carrocería", selected: materialPpf === "carroceria" },
                    { value: "vidrio", label: "Vidrio", selected: materialPpf === "vidrio" },
                  ]}
                  onPress={setMaterialPpf}
                />
              </View>
            )}

            <CamposStock
              esRollo={esRollo}
              anchoRollo={anchoRollo}
              onCambiarAnchoRollo={setAnchoRollo}
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
          </>
        )}
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
  const esRollo = esCategoriaPpf(categoria);
  const [seDiluye, setSeDiluye] = useState(false);
  // Solo el X: el "1:" es fijo, no se tipea — mismo criterio que patente.js
  // (normalizar en el momento, no aceptar cualquier formato libre).
  const [dilucionX, setDilucionX] = useState("");
  const [envaseAplicadorMl, setEnvaseAplicadorMl] = useState("");
  const [mlPorAutoTexto, setMlPorAutoTexto] = useState("");
  // Mismo criterio que FilaProducto: solo tiene sentido para un rollo de
  // PPF (esRollo).
  const [materialPpf, setMaterialPpf] = useState("carroceria");

  const [capacidadTotal, setCapacidadTotal] = useState("");
  const [capacidadUnidad, setCapacidadUnidad] = useState(UNIDADES_CAPACIDAD[0]);
  const [precioDigitos, setPrecioDigitos] = useState("");
  const [cantidadActual, setCantidadActual] = useState("");
  const [anchoRollo, setAnchoRollo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Categoría "PPF" elegida a mano acá: mismo criterio que FilaProducto,
  // fuerza la unidad a m2 (y la saca en cuanto se elige otra categoría).
  function handleCambiarCategoria(nuevaCategoria) {
    setCategoria(nuevaCategoria);
    if (esCategoriaPpf(nuevaCategoria)) {
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
  const anchoRolloNumerico = numeroDesdeTexto(anchoRollo);
  const puedeAgregar =
    nombre.trim() !== "" &&
    marca.trim() !== "" &&
    (esRollo || !seDiluye || dilucionX.trim() !== "") &&
    stockValido &&
    (!esRollo || anchoRolloNumerico > 0);
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, puedeAgregar);

  async function handleConfirmar() {
    setGuardando(true);
    setError(null);
    try {
      await onAgregar({
        nombre: nombre.trim(),
        marca: marca.trim(),
        categoria,
        seDiluye: !esRollo && seDiluye,
        dilucionX: !esRollo && seDiluye ? numeroDesdeTexto(dilucionX) : null,
        envaseAplicadorMl: !esRollo && seDiluye ? numeroDesdeTexto(envaseAplicadorMl) : null,
        mlPorUso: esRollo ? null : calcularMlPorUso({ seDiluye, dilucionX, envaseAplicadorMl, mlPorAutoTexto }),
        materialPpf,
        capacidadTotal: capacidadNumerica,
        capacidadUnidad,
        precioCompra: precioNumerico,
        cantidadActual: cantidadActualNumerica,
        anchoRollo: esRollo ? anchoRolloNumerico : null,
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
        <ChipGroup
          disabled={guardando}
          options={Object.entries(CATEGORIAS).map(([clave, datos]) => ({
            value: clave,
            label: datos.etiqueta,
            selected: categoria === clave,
          }))}
          onPress={handleCambiarCategoria}
        />
      </View>

      {!esRollo && (
        <ConfiguracionConsumoInsumo
          seDiluye={seDiluye}
          onCambiarSeDiluye={setSeDiluye}
          dilucionX={dilucionX}
          onCambiarDilucionX={setDilucionX}
          envaseAplicadorMl={envaseAplicadorMl}
          onCambiarEnvaseAplicadorMl={setEnvaseAplicadorMl}
          mlPorAutoTexto={mlPorAutoTexto}
          onCambiarMlPorAutoTexto={setMlPorAutoTexto}
          bloqueada={guardando}
        />
      )}

      {esRollo && (
        <View style={styles.campo}>
          <Text style={styles.campoLabel}>¿Este rollo es para carrocería o para vidrio?</Text>
          <ChipGroup
            disabled={guardando}
            options={[
              { value: "carroceria", label: "Carrocería", selected: materialPpf === "carroceria" },
              { value: "vidrio", label: "Vidrio", selected: materialPpf === "vidrio" },
            ]}
            onPress={setMaterialPpf}
          />
        </View>
      )}

      <CamposStock
        esRollo={esRollo}
        anchoRollo={anchoRollo}
        onCambiarAnchoRollo={setAnchoRollo}
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

  async function handleAgregar(
    producto,
    {
      seDiluye,
      dilucionX,
      envaseAplicadorMl,
      mlPorUso,
      materialPpf,
      capacidadTotal,
      capacidadUnidad,
      precioCompra,
      cantidadActual,
      anchoRollo,
    }
  ) {
    await agregarInsumo({
      productoId: producto.id,
      marca: producto.marca,
      nombre: producto.nombre,
      categoria: producto.categoria,
      seDiluye,
      dilucionX,
      envaseAplicadorMl,
      mlPorUso,
      materialPpf,
      imagen: producto.imagen ?? null,
      precioCompra,
      capacidadTotal,
      capacidadUnidad,
      cantidadActual,
      anchoRollo,
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
      seDiluye: valores.seDiluye,
      dilucionX: valores.dilucionX,
      envaseAplicadorMl: valores.envaseAplicadorMl,
      mlPorUso: valores.mlPorUso,
      materialPpf: valores.materialPpf,
      imagen: null,
      precioCompra: valores.precioCompra,
      capacidadTotal: valores.capacidadTotal,
      capacidadUnidad: valores.capacidadUnidad,
      cantidadActual: valores.cantidadActual,
      anchoRollo: valores.anchoRollo,
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
