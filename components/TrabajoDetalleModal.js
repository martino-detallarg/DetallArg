import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import { ESTADOS_TRABAJO } from "../data/mockData";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Mismo criterio de color por estado que TurnoCard.js.
const COLOR_ESTADO = {
  Pendiente: colors.error,
  "En proceso": colors.amber,
  Finalizado: colors.success,
  Entregado: colors.success,
};

// Detalle de solo lectura de un trabajo ya cargado (cliente, vehículo y
// datos del servicio), con un selector de estado debajo para ir avanzando
// (o volviendo) por las etapas del trabajo.
export default function TrabajoDetalleModal({ visible, turno, cliente, auto, onCambiarEstado, onEliminar, onClose }) {
  // Estado "de prueba": tocar un chip solo cambia esto, no el turno real.
  // Se resetea al estado real del turno cada vez que el modal se vuelve a
  // abrir, así cualquier chip probado sin guardar queda descartado.
  const [estadoLocal, setEstadoLocal] = useState(turno?.estado ?? null);

  useEffect(() => {
    if (visible) setEstadoLocal(turno?.estado ?? null);
  }, [visible, turno?.id, turno?.estado]);

  if (!turno || !cliente) return null;

  const hayCambioSinGuardar = estadoLocal !== turno.estado;

  function handleGuardarCambios() {
    if (!hayCambioSinGuardar) return;
    onCambiarEstado(estadoLocal);
    onClose();
  }

  function handleEliminar() {
    Alert.alert(
      "Eliminar turno",
      "Esta acción no se puede deshacer. ¿Eliminar este turno?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: onEliminar },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.titulo}>Turno de las {turno.hora}</Text>
            <Text style={styles.servicio}>{turno.servicio}</Text>

            <View style={styles.tarjetaSeccion}>
              <Text style={styles.tituloTarjeta}>Estado del trabajo</Text>
              <View style={styles.chips}>
                {ESTADOS_TRABAJO.map((estado) => {
                  const seleccionado = estadoLocal === estado;
                  const colorEstado = COLOR_ESTADO[estado];
                  return (
                    <TouchableOpacity
                      key={estado}
                      style={[styles.chip, seleccionado && { backgroundColor: colorEstado }]}
                      onPress={() => setEstadoLocal(estado)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.chipTexto, seleccionado && styles.chipTextoSeleccionado]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {estado}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.tarjetaSeccion}>
              <Text style={styles.tituloTarjeta}>Cliente y vehículo</Text>
              <View style={styles.grilla}>
                <View style={styles.celda}>
                  <Text style={styles.campoLabel}>Nombre</Text>
                  <Text style={styles.campoValor}>{cliente.nombre}</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.campoLabel}>Teléfono</Text>
                  <Text style={styles.campoValor}>{cliente.telefono}</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.campoLabel}>Vehículo</Text>
                  <Text style={styles.campoValor}>
                    {auto ? `${auto.marca} ${auto.modelo}` : "-"}
                  </Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.campoLabel}>Patente</Text>
                  <Text style={styles.campoValor}>{auto?.patente ?? "-"}</Text>
                </View>
                {auto?.color && (
                  <View style={styles.celda}>
                    <Text style={styles.campoLabel}>Color</Text>
                    <Text style={styles.campoValor}>{auto.color}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tarjetaSeccion}>
              <Text style={styles.tituloTarjeta}>Servicio</Text>
              <View style={styles.grilla}>
                <View style={styles.celda}>
                  <Text style={styles.campoLabel}>Fecha</Text>
                  <Text style={styles.campoValor}>{turno.fecha || "-"}</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.campoLabel}>Hora de llegada</Text>
                  <Text style={styles.campoValor}>{turno.hora || "-"}</Text>
                </View>
                {turno.tiempoEstimado && (
                  <View style={styles.celda}>
                    <Text style={styles.campoLabel}>Tiempo estimado</Text>
                    <Text style={styles.campoValor}>{turno.tiempoEstimado}</Text>
                  </View>
                )}
              </View>
              {turno.observaciones && (
                <View style={styles.observacionesContenedor}>
                  <Text style={styles.campoLabel}>Observaciones</Text>
                  <Text style={styles.campoValor}>{turno.observaciones}</Text>
                </View>
              )}
            </View>

            {turno.empleadosAsignados?.length > 0 && (
              <View style={styles.tarjetaSeccion}>
                <Text style={styles.tituloTarjeta}>Empleados asignados</Text>
                {turno.empleadosAsignados.map((e) => (
                  <Text key={e.empleadoId} style={styles.campoValor}>
                    · {e.nombreEmpleado}
                  </Text>
                ))}
              </View>
            )}

            {turno.recetaAplicada?.length > 0 && (
              <>
                <Text style={styles.seccion}>Insumos usados</Text>
                <View style={styles.tarjeta}>
                  {turno.recetaAplicada.map((linea) => (
                    <Text key={linea.libre ? linea.libreId : linea.insumoId} style={styles.filaValor}>
                      · {linea.nombreInsumo} —{" "}
                      {linea.libre ? formatearPesos(linea.costoEstimado) : `${linea.cantidad} ${linea.unidad}`}
                    </Text>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.eliminarBoton} onPress={handleEliminar} activeOpacity={0.85}>
              <Ionicons name="trash-outline" size={16} color={colors.textPrimary} />
              <Text style={styles.eliminarBotonTexto}>Eliminar turno</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.botonesFijos}>
            <Button title="Guardar cambios" onPress={handleGuardarCambios} disabled={!hayCambioSinGuardar} />
            <View style={styles.botonCerrar}>
              <Button title="Cerrar" variant="secondary" onPress={onClose} />
            </View>
          </View>
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
  filaValor: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tarjetaSeccion: {
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    padding: 14,
    marginBottom: 12,
  },
  tituloTarjeta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  celda: {
    width: "48%",
  },
  campoLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  campoValor: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  observacionesContenedor: {
    marginTop: 12,
  },
  chips: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 9,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
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
    backgroundColor: colors.error,
    marginTop: 16,
  },
  eliminarBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  botonesFijos: {
    marginTop: 16,
  },
  botonCerrar: {
    marginTop: 10,
  },
});
