import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Logo from "./Logo";
import { colors } from "../theme";

const TAMANO_ICONO = 26;

// Si se pasa onVolver, el header muestra una flecha de volver (mismo ícono
// que WizardHeader) a la izquierda; si no, y se pasa onAbrirMenu, el ícono
// de hamburguesa de siempre. Si no se pasa ninguno de los dos (pantallas
// raíz de un tab, desde el rediseño a 5 tabs abajo — ya no hay drawer que
// abrir desde ahí) no se dibuja nada a la izquierda, solo un espacio en
// blanco del mismo ancho para que el Logo se mantenga centrado.
//
// onAbrirNotificaciones (opcional) agrega el ícono de campana arriba a la
// derecha — mismo criterio visual que Spotify/Pinterest/MercadoPago/
// MercadoLibre: las notificaciones ya no viven en el menú, van siempre
// visibles en el header.
export default function ScreenHeader({ onAbrirMenu, onVolver, onAbrirNotificaciones }) {
  const onPressIzquierda = onVolver ?? onAbrirMenu;

  return (
    <View style={styles.header}>
      <View style={styles.ladoIzquierdo}>
        {onPressIzquierda && (
          <TouchableOpacity onPress={onPressIzquierda} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={onVolver ? "chevron-back" : "menu-outline"}
              size={TAMANO_ICONO}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Logo size={26} />

      <View style={styles.ladoDerecho}>
        {onAbrirNotificaciones && (
          <TouchableOpacity onPress={onAbrirNotificaciones} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="notifications-outline" size={TAMANO_ICONO} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  ladoIzquierdo: {
    width: TAMANO_ICONO,
    alignItems: "flex-start",
  },
  ladoDerecho: {
    width: TAMANO_ICONO,
    alignItems: "flex-end",
  },
});
