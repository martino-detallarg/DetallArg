import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIAS, UMBRAL_STOCK_BAJO } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Recuadro de producto reutilizado tanto en la grilla compacta de la
// estantería como en la pantalla de categoría completa. El relleno que sube
// desde abajo representa el nivel de stock; la franja de nombre es temporal
// hasta que tengamos fotos reales de los productos.
export default function ProductoCasillero({ producto, tamano }) {
  const categoria = CATEGORIAS[producto.categoria];
  const nivel = Math.max(0, Math.min(100, producto.nivel ?? 0));
  const stockBajo = nivel <= UMBRAL_STOCK_BAJO;

  return (
    <View style={[styles.casillero, { width: tamano, height: tamano }]}>
      <View style={[styles.relleno, { height: `${nivel}%` }]} />

      {producto.imagen ? (
        <Image source={producto.imagen} style={styles.imagenProducto} resizeMode="contain" />
      ) : (
        <Ionicons
          name={categoria?.icono ?? "cube-outline"}
          size={tamano * 0.36}
          color={colors.accentLight}
        />
      )}

      <View style={styles.porcentajeChip}>
        <Text style={[styles.porcentajeTexto, stockBajo && styles.porcentajeTextoBajo]}>
          {nivel}%
        </Text>
      </View>

      <View style={styles.franjaNombre}>
        <Text style={styles.nombreTexto} numberOfLines={2}>
          {producto.nombre}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  casillero: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  relleno: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accentDark,
  },
  imagenProducto: {
    width: "60%",
    height: "60%",
  },
  porcentajeChip: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(4, 3, 3, 0.55)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  porcentajeTexto: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    color: colors.textPrimary,
  },
  porcentajeTextoBajo: {
    color: colors.error,
  },
  franjaNombre: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(4, 3, 3, 0.72)",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  nombreTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9.5,
    color: colors.textPrimary,
    textAlign: "center",
  },
});
