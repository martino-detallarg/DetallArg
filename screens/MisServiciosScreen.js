import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import ServicioModal from "../components/ServicioModal";
import { useServicios } from "../data/ServicioContext";
import { useCatalogo } from "../data/CatalogoContext";
import { formatearPesos, formatearDuracion } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const COLUMNAS = 2;
const PADDING_GRILLA = 20;
const ESPACIO_TARJETA = 12;

function TarjetaServicio({ servicio, ancho, onEditar, onEliminar, enCatalogo, onToggleCatalogo }) {
  return (
    <TouchableOpacity
      style={[styles.tarjeta, { width: ancho }]}
      onPress={() => onEditar(servicio)}
      activeOpacity={0.85}
    >
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

      <TouchableOpacity
        style={[styles.catalogoBoton, enCatalogo && styles.catalogoBotonActivo]}
        onPress={() => onToggleCatalogo(servicio.id)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={enCatalogo ? "checkmark-circle" : "add-circle-outline"}
          size={14}
          color={enCatalogo ? colors.bg : colors.accentLight}
        />
        <Text style={[styles.catalogoBotonTexto, enCatalogo && styles.catalogoBotonTextoActivo]} numberOfLines={1}>
          {enCatalogo ? "En el catálogo" : "Agregar al catálogo"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MisServiciosScreen({ navigation }) {
  const { servicios, eliminarServicio } = useServicios();
  const { estaEnCatalogo, agregarAlCatalogo, quitarDelCatalogo } = useCatalogo();
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const anchoTarjeta = (width - PADDING_GRILLA * 2 - ESPACIO_TARJETA * (COLUMNAS - 1)) / COLUMNAS;

  function handleAgregar() {
    setItemEditando(null);
    setModalVisible(true);
  }

  function handleEditar(item) {
    setItemEditando(item);
    setModalVisible(true);
  }

  function handleToggleCatalogo(servicioId) {
    if (estaEnCatalogo(servicioId)) {
      quitarDelCatalogo(servicioId);
    } else {
      agregarAlCatalogo(servicioId);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>Mis Servicios</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Catalogo")} activeOpacity={0.8}>
            <Text style={styles.verCatalogo}>Ver Catálogo →</Text>
          </TouchableOpacity>
        </View>

        {servicios.length === 0 ? (
          <Text style={styles.vacio}>Todavía no cargaste servicios.</Text>
        ) : (
          <View style={styles.grilla}>
            {servicios.map((item) => (
              <TarjetaServicio
                key={item.id}
                servicio={item}
                ancho={anchoTarjeta}
                onEditar={handleEditar}
                onEliminar={eliminarServicio}
                enCatalogo={estaEnCatalogo(item.id)}
                onToggleCatalogo={handleToggleCatalogo}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAgregar}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

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
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 16,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
  },
  verCatalogo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
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
    paddingRight: 30,
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
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  catalogoBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: colors.surface2,
  },
  catalogoBotonActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  catalogoBotonTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: colors.accentLight,
  },
  catalogoBotonTextoActivo: {
    color: colors.bg,
    fontFamily: fonts.bodySemiBold,
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
