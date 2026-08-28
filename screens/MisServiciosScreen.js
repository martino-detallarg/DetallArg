import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import ServicioModal from "../components/ServicioModal";
import EstadoCarga from "../components/EstadoCarga";
import { useServicios } from "../data/ServicioContext";
import { useCatalogo } from "../data/CatalogoContext";
import { formatearPesos, formatearDuracion } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLUMNAS = 2;
const PADDING_GRILLA = 20;
const ESPACIO_TARJETA = 12;

function TarjetaServicio({ servicio, ancho, enCatalogo, onEditar, onEliminar, onToggleCatalogo }) {
  return (
    <TouchableOpacity
      style={[styles.tarjeta, { width: ancho }]}
      onPress={() => onEditar(servicio)}
      activeOpacity={0.85}
    >
      <TouchableOpacity
        style={styles.catalogoBoton}
        onPress={() => onToggleCatalogo(servicio.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Ionicons
          name={enCatalogo ? "albums" : "albums-outline"}
          size={14}
          color={enCatalogo ? colors.accentLight : colors.textMuted}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quitarBoton}
        onPress={() => onEliminar(servicio.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={14} color={colors.error} />
      </TouchableOpacity>

      <Text style={styles.tarjetaNombre} numberOfLines={2}>
        {servicio.nombre}
      </Text>
      <Text style={styles.tarjetaPrecio}>{formatearPesos(servicio.precio)}</Text>
      <Text style={styles.tarjetaDuracion}>
        {formatearDuracion(servicio.duracionValor, servicio.duracionUnidad)}
      </Text>
    </TouchableOpacity>
  );
}

export default function MisServiciosScreen({ navigation }) {
  const { servicios, cargandoServicios, errorCargaServicios, recargarServicios, eliminarServicio } = useServicios();
  const { estaEnCatalogo, agregarAlCatalogo, quitarDelCatalogo } = useCatalogo();
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);

  const anchoTarjeta = (width - PADDING_GRILLA * 2 - ESPACIO_TARJETA * (COLUMNAS - 1)) / COLUMNAS;

  function handleAgregar() {
    setItemEditando(null);
    setModalVisible(true);
  }

  function handleEditar(item) {
    setItemEditando(item);
    setModalVisible(true);
  }

  function handleToggleCatalogo(id) {
    if (estaEnCatalogo(id)) {
      quitarDelCatalogo(id);
    } else {
      agregarAlCatalogo(id);
    }
  }

  async function handleEliminar(id) {
    setError(null);
    try {
      await eliminarServicio(id);
    } catch (err) {
      setError("No se pudo eliminar el servicio. Probá de nuevo.");
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <EstadoCarga cargando={cargandoServicios} error={errorCargaServicios} onReintentar={recargarServicios}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>Mis Servicios</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          {servicios.length === 0 ? (
            <Text style={styles.vacio}>Todavía no cargaste servicios.</Text>
          ) : (
            <View style={styles.grilla}>
              {servicios.map((item) => (
                <TarjetaServicio
                  key={item.id}
                  servicio={item}
                  ancho={anchoTarjeta}
                  enCatalogo={estaEnCatalogo(item.id)}
                  onEditar={handleEditar}
                  onEliminar={handleEliminar}
                  onToggleCatalogo={handleToggleCatalogo}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </EstadoCarga>

      {!cargandoServicios && !errorCargaServicios && (
        <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
          <Text style={styles.fabTexto}>+</Text>
        </TouchableOpacity>
      )}

      <ServicioModal visible={modalVisible} item={itemEditando} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: PADDING_GRILLA,
    paddingBottom: 100,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACIO_TARJETA,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: ESPACIO_TARJETA,
  },
  catalogoBoton: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  quitarBoton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tarjetaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    paddingHorizontal: 30,
    minHeight: 36,
  },
  tarjetaPrecio: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.accentLight,
    marginTop: 8,
  },
  tarjetaDuracion: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  fabTexto: {
    color: colors.bg,
    fontSize: 30,
    fontWeight: "400",
    marginTop: -2,
  },
});
