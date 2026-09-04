import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "./Button";
import ChipGroup from "./ChipGroup";
import { useData } from "../data/DataContext";
import { usePedido } from "../data/PedidoContext";
import { catalogoInsumos, UNIDADES_CAPACIDAD } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Best-effort: intenta sacar { capacidad, unidad } de un tamaño de envase
// de catálogo (texto libre de la marca, ej. "500ml", "1L" — a veces mal
// partido en el dato de origen, ej. "1" + "5L" por "1,5L", ver
// data/mockInsumos.js). Es solo un atajo para precargar los inputs de
// abajo, que siguen siendo la fuente real del dato — si el parseo da algo
// raro (o ninguna unidad reconocida), el taller lo corrige a mano antes de
// confirmar, nunca se guarda el texto del catálogo directamente.
function parsearTamanoEnvase(texto) {
  const match = String(texto).trim().match(/^([\d.,]+)\s*([a-zA-Z]*)$/);
  if (!match) return null;
  const numero = Number(match[1].replace(",", "."));
  if (Number.isNaN(numero) || numero <= 0) return null;

  const unidad = match[2].toLowerCase();
  if (unidad === "l") return { capacidad: String(numero * 1000), unidad: "ml" };
  if (unidad === "ml" || unidad === "g") return { capacidad: String(numero), unidad };
  return { capacidad: String(numero), unidad: "" };
}

const PASO_CONFIRMAR = "confirmar";
const PASO_YA_RENOVADO = "yaRenovado";
const PASO_FORMULARIO = "formulario";

// Se monta UNA sola vez cerca de la raíz de la app (ver
// DashboardNavigator.js), sin props: mira insumosParaRenovar de
// DataContext y, si hay algo en la cola, muestra el flujo para el PRIMERO
// — uno por vez, mismo criterio "nunca dos <Modal> nativos superpuestos"
// que MoverCategoriaModal.js. Disparado por
// TurnoContext.actualizarEstadoTrabajo -> DataContext.descontarInsumos
// cuando un consumo deja algún insumo en 0% de stock.
export default function RenovacionInsumoModal() {
  const { insumosParaRenovar, descartarRenovacion, reponerInsumo, getInsumoById } = useData();
  const { agregarAlPedido } = usePedido();
  const [paso, setPaso] = useState(PASO_CONFIRMAR);
  const [capacidadTexto, setCapacidadTexto] = useState("");
  const [unidad, setUnidad] = useState("ml");
  const [precioTexto, setPrecioTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const pendiente = insumosParaRenovar[0] ?? null;
  // Se resuelve contra misInsumos en vivo (no el snapshot {id, nombre} de
  // la cola) para tener productoId/capacidadUnidad actuales al armar el
  // formulario — por si el insumo se editó entre que se encoló y que le
  // toca el turno.
  const insumo = pendiente ? getInsumoById(pendiente.id) : null;
  const envasesSugeridos = insumo
    ? (catalogoInsumos.find((p) => p.id === insumo.productoId)?.tamanosEnvase ?? [])
    : [];

  function cerrarYSeguir() {
    descartarRenovacion(pendiente.id);
    setPaso(PASO_CONFIRMAR);
    setError(null);
  }

  function handleNoSeAcabo() {
    cerrarYSeguir();
  }

  function handleSiSeAcabo() {
    setPaso(PASO_YA_RENOVADO);
  }

  function handleNoLoRenove() {
    agregarAlPedido({ id: pendiente.id, nombre: pendiente.nombre });
    cerrarYSeguir();
  }

  function handleSiLoRenove() {
    setCapacidadTexto("");
    setPrecioTexto("");
    setUnidad(insumo?.capacidadUnidad || "ml");
    setPaso(PASO_FORMULARIO);
  }

  function handleElegirEnvase(texto) {
    const parseado = parsearTamanoEnvase(texto);
    if (!parseado) return;
    setCapacidadTexto(parseado.capacidad);
    if (parseado.unidad) setUnidad(parseado.unidad);
  }

  async function handleConfirmarRenovacion() {
    const capacidad = Number(String(capacidadTexto).replace(",", "."));
    const precio = Number(String(precioTexto).replace(",", "."));
    if (!capacidad || capacidad <= 0) {
      setError("Ingresá la capacidad del envase.");
      return;
    }
    if (!precio || precio <= 0) {
      setError("Ingresá el precio que pagaste.");
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await reponerInsumo(pendiente.id, {
        capacidadTotal: capacidad,
        capacidadUnidad: unidad,
        precioCompra: precio,
        cantidadActual: capacidad,
      });
      cerrarYSeguir();
    } catch (err) {
      setError("No se pudo actualizar el insumo. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  if (!pendiente) return null;

  // onRequestClose vacío a propósito: se contesta con los botones (incluido
  // el "No" de cada pregunta), no se puede descartar con el back de Android
  // sin responder — si se pudiera, un insumo agotado quedaría sin registrar
  // ni pedido ni renovación, silenciosamente.
  return (
    <Modal visible animationType="slide" transparent onRequestClose={() => {}}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          {paso === PASO_CONFIRMAR && (
            <>
              <Text style={styles.titulo}>¿Se te acabó {pendiente.nombre}?</Text>
              <Text style={styles.subtitulo}>Quedó en 0% de stock después de este trabajo.</Text>
              <View style={styles.botonesFila}>
                <View style={styles.botonMitad}>
                  <Button title="No" variant="secondary" onPress={handleNoSeAcabo} />
                </View>
                <View style={styles.botonMitad}>
                  <Button title="Sí" onPress={handleSiSeAcabo} />
                </View>
              </View>
            </>
          )}

          {paso === PASO_YA_RENOVADO && (
            <>
              <Text style={styles.titulo}>¿Ya lo renovaste?</Text>
              <Text style={styles.subtitulo}>
                Si todavía no lo compraste, te lo sumamos a la lista de pedido a proveedor.
              </Text>
              <View style={styles.botonesFila}>
                <View style={styles.botonMitad}>
                  <Button title="No" variant="secondary" onPress={handleNoLoRenove} />
                </View>
                <View style={styles.botonMitad}>
                  <Button title="Sí" onPress={handleSiLoRenove} />
                </View>
              </View>
            </>
          )}

          {paso === PASO_FORMULARIO && (
            <>
              <Text style={styles.titulo}>Cargar envase nuevo</Text>
              <Text style={styles.subtitulo}>{pendiente.nombre}</Text>

              {envasesSugeridos.length > 0 && (
                <View style={styles.campo}>
                  <Text style={styles.label}>Tamaños sugeridos por la marca</Text>
                  <ChipGroup
                    options={envasesSugeridos.map((e) => ({ value: e, label: e, selected: false }))}
                    onPress={handleElegirEnvase}
                  />
                </View>
              )}

              <View style={styles.campo}>
                <Text style={styles.label}>Capacidad del envase</Text>
                <View style={styles.capacidadFila}>
                  <TextInput
                    style={styles.input}
                    value={capacidadTexto}
                    onChangeText={setCapacidadTexto}
                    placeholder="500"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <ChipGroup
                    options={UNIDADES_CAPACIDAD.map((u) => ({ value: u, label: u, selected: unidad === u }))}
                    onPress={setUnidad}
                  />
                </View>
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>Precio pagado</Text>
                <TextInput
                  style={styles.input}
                  value={precioTexto}
                  onChangeText={setPrecioTexto}
                  placeholder="$ 0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button title="Guardar" onPress={handleConfirmarRenovacion} loading={guardando} disabled={guardando} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 12,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -4,
  },
  botonesFila: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  botonMitad: {
    flex: 1,
  },
  campo: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  capacidadFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 50,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
  },
});
