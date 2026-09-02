import { useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { colors, fonts } from "../theme";

// Mismo patrón de feedback de copiado que SolicitarPedidoModal.js (ícono
// que cambia a check por un rato, sin toast — no hay ese componente en la
// app todavía).
const DURACION_CONFIRMACION_COPIADO = 2000;
const HITSLOP = { top: 8, bottom: 8, left: 8, right: 8 };

// Número de teléfono + copiar/llamar, para no duplicar esta lógica en cada
// pantalla que lo muestra (TrabajoDetalleModal, VehiculosClienteModal...).
// Si no hay teléfono cargado, no renderiza nada — ni el texto ni los
// botones — la pantalla que llama decide qué mostrar en ese caso (un "-",
// nada, etc.) sin que este componente se meta.
export default function TelefonoConAcciones({ telefono, textStyle, style }) {
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  if (!telefono?.trim()) return null;

  async function handleCopiar() {
    await Clipboard.setStringAsync(telefono);
    setCopiado(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiado(false), DURACION_CONFIRMACION_COPIADO);
  }

  function handleLlamar() {
    Linking.openURL(`tel:${telefono}`);
  }

  return (
    <View style={[styles.contenedor, style]}>
      <Text style={[styles.telefono, textStyle]} numberOfLines={1} ellipsizeMode="tail">
        {telefono}
      </Text>

      <TouchableOpacity onPress={handleCopiar} hitSlop={HITSLOP} style={styles.boton} activeOpacity={0.7}>
        <Ionicons
          name={copiado ? "checkmark" : "copy-outline"}
          size={15}
          color={copiado ? colors.success : colors.textMuted}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLlamar} hitSlop={HITSLOP} style={styles.boton} activeOpacity={0.7}>
        <Ionicons name="call-outline" size={15} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  telefono: {
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  boton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
});
