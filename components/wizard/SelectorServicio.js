import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Input from "../Input";
import { useTurnos } from "../../data/TurnoContext";
import { formatearDuracion, formatearPesos } from "../../utils/formato";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../../theme";

// Campo tocable que abre/cierra un panel desplegable JUSTO DEBAJO (no un
// <Modal> de pantalla completa): al abrirse empuja el resto del paso hacia
// abajo, conviviendo con el ScrollView del wizard en vez de taparlo. No
// tiene "cerrar al tocar afuera" a propósito — eso necesitaría un backdrop
// a pantalla completa, que es justo lo que se pidió evitar; se cierra
// tocando el campo de nuevo o eligiendo un servicio.
export default function SelectorServicio({ servicios, servicioId, onSeleccionar, error }) {
  const { turnos } = useTurnos();
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const servicioSeleccionado = servicios.find((s) => s.id === servicioId);

  // "Más usado" = más apariciones de ese servicioId en el historial real de
  // turnos, no un contador propio — se cuenta una sola vez acá y se
  // reordena servicios encima, así el resto del componente no sabe nada de
  // este cálculo.
  const conteoPorServicio = useMemo(() => {
    const conteo = {};
    for (const turno of turnos) {
      if (!turno.servicioId) continue;
      conteo[turno.servicioId] = (conteo[turno.servicioId] ?? 0) + 1;
    }
    return conteo;
  }, [turnos]);

  const serviciosOrdenados = useMemo(() => {
    return [...servicios].sort((a, b) => {
      const usoA = conteoPorServicio[a.id] ?? 0;
      const usoB = conteoPorServicio[b.id] ?? 0;
      // Más usado primero; entre los que nunca se usaron (0 y 0), alfabético.
      if (usoA !== usoB) return usoB - usoA;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [servicios, conteoPorServicio]);

  const serviciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return serviciosOrdenados;
    return serviciosOrdenados.filter((s) => s.nombre.toLowerCase().includes(termino));
  }, [serviciosOrdenados, busqueda]);

  function handleSeleccionar(servicio) {
    onSeleccionar(servicio);
    setAbierto(false);
    setBusqueda("");
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.campo, error && styles.campoError]}
        onPress={() => setAbierto((a) => !a)}
        activeOpacity={0.8}
      >
        <Text
          style={servicioSeleccionado ? styles.campoTexto : styles.campoPlaceholder}
          numberOfLines={1}
        >
          {servicioSeleccionado ? servicioSeleccionado.nombre : "Elegí el servicio"}
        </Text>
        <Ionicons name={abierto ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {abierto && (
        <View style={styles.panel}>
          <Input
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar servicio..."
            autoCapitalize="none"
          />

          {serviciosFiltrados.length === 0 ? (
            <Text style={styles.panelVacio}>No encontramos servicios con ese nombre.</Text>
          ) : (
            serviciosFiltrados.map((s) => {
              const seleccionado = s.id === servicioId;
              const duracion = s.duracionValor ? formatearDuracion(s.duracionValor, s.duracionUnidad) : null;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.item, seleccionado && styles.itemSeleccionado]}
                  onPress={() => handleSeleccionar(s)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemTexto}>
                    <Text
                      style={[styles.itemNombre, seleccionado && styles.itemTextoSeleccionado]}
                      numberOfLines={1}
                    >
                      {s.nombre}
                    </Text>
                    <Text
                      style={[styles.itemSub, seleccionado && styles.itemTextoSeleccionado]}
                      numberOfLines={1}
                    >
                      {formatearPesos(s.precio)}
                      {duracion ? ` · ${duracion}` : ""}
                    </Text>
                  </View>
                  {seleccionado && <Ionicons name="checkmark" size={18} color={colors.bg} />}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 50,
    ...shadowSubtle,
  },
  campoError: {
    borderColor: colors.error,
  },
  campoTexto: {
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  campoPlaceholder: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 10,
    marginTop: 8,
  },
  panelVacio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
  },
  itemSeleccionado: {
    backgroundColor: colors.accent,
  },
  itemTexto: {
    flex: 1,
  },
  itemNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTextoSeleccionado: {
    color: colors.bg,
  },
});
