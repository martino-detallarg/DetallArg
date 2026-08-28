import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import RegistrarCobroModal from "./RegistrarCobroModal";
import { ESTADOS_TRABAJO } from "../data/mockData";
import { useFinanzas } from "../data/FinanzasContext";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const ESTADOS_QUE_PERMITEN_COBRO = ["Finalizado", "Entregado"];

// Detalle de solo lectura de un trabajo ya cargado (cliente, vehículo y
// datos del servicio), con un selector de estado debajo para ir avanzando
// (o volviendo) por las etapas del trabajo.
export default function TrabajoDetalleModal({ visible, turno, cliente, auto, onCambiarEstado, onEliminar, onClose }) {
  const { cobros } = useFinanzas();
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [modalCobroVisible, setModalCobroVisible] = useState(false);

  // Al pasar a "Finalizado", onCambiarEstado (TurnoContext.actualizarEstadoTrabajo)
  // ahora escribe de verdad en Supabase (descuenta insumos) y puede fallar —
  // se resetea el error al reabrir o cambiar de turno.
  useEffect(() => {
    if (visible) {
      setErrorEstado(null);
      setErrorEliminar(null);
    }
  }, [visible, turno?.id]);

  if (!turno || !cliente) return null;

  const vehiculosDelCliente = cliente.vehiculos;
  const cobro = cobros.find((c) => c.turnoId === turno.id);
  const puedeCobrar = ESTADOS_QUE_PERMITEN_COBRO.includes(turno.estado);

  async function handleCambiarEstado(estado) {
    setCambiandoEstado(true);
    setErrorEstado(null);
    try {
      await onCambiarEstado(estado);
    } catch (err) {
      setErrorEstado("No se pudo actualizar el estado del trabajo. Probá de nuevo.");
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function confirmarEliminar() {
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await onEliminar();
    } catch (err) {
      setErrorEliminar("No se pudo eliminar el turno. Probá de nuevo.");
      setEliminando(false);
    }
  }

  function handleEliminar() {
    Alert.alert(
      "Eliminar turno",
      "Esta acción no se puede deshacer. ¿Eliminar este turno?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: confirmarEliminar },
      ]
    );
  }

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.titulo}>Turno de las {turno.hora}</Text>
            <Text style={styles.servicio}>{turno.servicio}</Text>

            <Text style={styles.seccion}>Ficha del cliente</Text>
            <View style={styles.tarjeta}>
              <Text style={styles.filaLabel}>Nombre</Text>
              <Text style={styles.filaValor}>{cliente.nombre}</Text>
              <Text style={styles.filaLabel}>Teléfono</Text>
              <Text style={styles.filaValor}>{cliente.telefono}</Text>
              <Text style={styles.filaLabel}>Vehículos</Text>
              {vehiculosDelCliente.map((v) => (
                <Text key={v.id} style={styles.filaValor}>
                  · {v.marca} {v.modelo} ({v.patente})
                </Text>
              ))}
            </View>

            <Text style={styles.seccion}>Ficha del vehículo de este turno</Text>
            <View style={styles.tarjeta}>
              <Text style={styles.filaLabel}>Marca y modelo</Text>
              <Text style={styles.filaValor}>
                {auto ? `${auto.marca} ${auto.modelo}` : "-"}
              </Text>
              <Text style={styles.filaLabel}>Patente</Text>
              <Text style={styles.filaValor}>{auto?.patente ?? "-"}</Text>
              <Text style={styles.filaLabel}>Color</Text>
              <Text style={styles.filaValor}>{auto?.color ?? "-"}</Text>
              <Text style={styles.filaLabel}>Dueño</Text>
              <Text style={styles.filaValor}>{cliente.nombre}</Text>
            </View>

            <Text style={styles.seccion}>Datos del servicio</Text>
            <View style={styles.tarjeta}>
              <Text style={styles.filaLabel}>Fecha</Text>
              <Text style={styles.filaValor}>{turno.fecha || "-"}</Text>
              <Text style={styles.filaLabel}>Hora</Text>
              <Text style={styles.filaValor}>{turno.hora || "-"}</Text>
              <Text style={styles.filaLabel}>Tiempo estimado</Text>
              <Text style={styles.filaValor}>{turno.tiempoEstimado || "-"}</Text>
              <Text style={styles.filaLabel}>Observaciones</Text>
              <Text style={styles.filaValor}>{turno.observaciones || "Sin observaciones"}</Text>
            </View>

            {turno.empleadosAsignados?.length > 0 && (
              <>
                <Text style={styles.seccion}>Empleados asignados</Text>
                <View style={styles.tarjeta}>
                  {turno.empleadosAsignados.map((e) => (
                    <Text key={e.empleadoId} style={styles.filaValor}>
                      · {e.nombreEmpleado}
                    </Text>
                  ))}
                </View>
              </>
            )}

            {turno.recetaAplicada?.length > 0 && (
              <>
                <Text style={styles.seccion}>Insumos usados</Text>
                <View style={styles.tarjeta}>
                  {turno.recetaAplicada.map((linea) => (
                    <Text key={linea.insumoId} style={styles.filaValor}>
                      · {linea.nombreInsumo} — {linea.cantidad} {linea.unidad}
                    </Text>
                  ))}
                </View>
              </>
            )}

            {puedeCobrar && (
              <>
                <Text style={styles.seccion}>Cobro</Text>
                {cobro ? (
                  <View style={styles.tarjeta}>
                    <Text style={styles.filaLabel}>Monto cobrado</Text>
                    <Text style={styles.filaValor}>{formatearPesos(cobro.monto)}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.cobroBoton}
                    onPress={() => setModalCobroVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cash-outline" size={16} color={colors.bg} />
                    <Text style={styles.cobroBotonTexto}>Registrar cobro</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <Text style={styles.seccion}>Estado del trabajo</Text>
            <View style={styles.chips}>
              {ESTADOS_TRABAJO.map((estado) => {
                const activo = turno.estado === estado;
                return (
                  <TouchableOpacity
                    key={estado}
                    style={[styles.chip, activo && styles.chipSeleccionado]}
                    onPress={() => handleCambiarEstado(estado)}
                    disabled={activo || cambiandoEstado || eliminando}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                      {estado}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errorEstado && <Text style={styles.errorEstado}>{errorEstado}</Text>}

            {errorEliminar && <Text style={styles.errorEstado}>{errorEliminar}</Text>}

            <TouchableOpacity
              style={styles.eliminarBoton}
              onPress={handleEliminar}
              disabled={cambiandoEstado || eliminando}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={styles.eliminarBotonTexto}>{eliminando ? "Eliminando..." : "Eliminar turno"}</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.botonCerrar}>
            <Button title="Cerrar" variant="secondary" onPress={onClose} disabled={eliminando} />
          </View>
        </View>
      </View>
    </Modal>

    <RegistrarCobroModal visible={modalCobroVisible} turno={turno} onClose={() => setModalCobroVisible(false)} />
    </>
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
    maxHeight: "85%",
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  servicio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  seccion: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 10,
  },
  tarjeta: {
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
  },
  filaLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  filaValor: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
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
  errorEstado: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
  cobroBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accent,
    marginBottom: 12,
  },
  cobroBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.bg,
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
    marginTop: 16,
  },
  eliminarBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.error,
  },
  botonCerrar: {
    marginTop: 16,
  },
});
