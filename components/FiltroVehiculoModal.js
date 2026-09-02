import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

function coincide(campo, termino) {
  return (campo ?? "").toLowerCase().includes(termino);
}

// Bottom-sheet para elegir "Todos los vehículos" o uno puntual de cualquier
// cliente, para filtrar el Historial de Clientes. Mismo patrón que
// FiltroEmpleadoModal.js (usado en Agenda), pero cada opción suma la patente
// y el cliente dueño del vehículo como subtítulo, porque acá los vehículos
// vienen de todos los clientes mezclados (no de un solo cliente a la vez).
// El buscador de arriba filtra por marca/modelo/patente, ya que con todos
// los clientes mezclados la lista puede ser larga.
export default function FiltroVehiculoModal({ visible, clientes, vehiculoSeleccionadoId, onElegir, onCerrar }) {
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (visible) setBusqueda("");
  }, [visible]);

  const vehiculos = clientes.flatMap((cliente) =>
    cliente.vehiculos.map((vehiculo) => ({ ...vehiculo, clienteNombre: cliente.nombre }))
  );

  const termino = busqueda.trim().toLowerCase();
  const vehiculosFiltrados =
    termino === ""
      ? vehiculos
      : vehiculos.filter(
          (v) => coincide(v.marca, termino) || coincide(v.modelo, termino) || coincide(v.patente, termino)
        );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <TouchableOpacity style={styles.fondoToque} activeOpacity={1} onPress={onCerrar} />

        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Filtrar por vehículo</Text>

          <View style={styles.buscadorWrap}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.buscadorInput}
              placeholder="Buscar por marca, modelo o patente..."
              placeholderTextColor={colors.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.opcion, vehiculoSeleccionadoId === null && styles.opcionSeleccionada]}
              onPress={() => onElegir(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.opcionTexto, vehiculoSeleccionadoId === null && styles.opcionTextoSeleccionado]}
              >
                Todos los vehículos
              </Text>
              {vehiculoSeleccionadoId === null && (
                <Ionicons name="checkmark" size={18} color={colors.accentLight} />
              )}
            </TouchableOpacity>

            {vehiculos.length === 0 ? (
              <Text style={styles.vacio}>Todavía no hay vehículos cargados.</Text>
            ) : vehiculosFiltrados.length === 0 ? (
              <Text style={styles.vacio}>No se encontraron vehículos.</Text>
            ) : (
              vehiculosFiltrados.map((vehiculo) => {
                const seleccionado = vehiculoSeleccionadoId === vehiculo.id;
                return (
                  <TouchableOpacity
                    key={vehiculo.id}
                    style={[styles.opcion, seleccionado && styles.opcionSeleccionada]}
                    onPress={() => onElegir(vehiculo.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.opcionTextos}>
                      <Text
                        style={[styles.opcionTexto, seleccionado && styles.opcionTextoSeleccionado]}
                        numberOfLines={1}
                      >
                        {vehiculo.marca} {vehiculo.modelo}
                      </Text>
                      <Text style={styles.opcionSubtexto} numberOfLines={1}>
                        {vehiculo.patente || "Sin patente"} · {vehiculo.clienteNombre}
                      </Text>
                    </View>
                    {seleccionado && <Ionicons name="checkmark" size={18} color={colors.accentLight} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
  },
  fondoToque: {
    flex: 1,
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "70%",
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  buscadorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 6,
  },
  buscadorInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
    height: "100%",
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 10,
  },
  opcionSeleccionada: {
    borderColor: colors.accent,
  },
  opcionTextos: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  opcionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  opcionTextoSeleccionado: {
    color: colors.accentLight,
  },
  opcionSubtexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  vacio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 14,
    textAlign: "center",
  },
});
