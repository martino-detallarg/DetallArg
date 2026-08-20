import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import WizardHeader from "./wizard/WizardHeader";
import { usePedido } from "../data/PedidoContext";
import { useTaller } from "../data/TallerContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

const DURACION_CONFIRMACION_COPIADO = 2000;

function FilaPedido({ item, onQuitar }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaNombre} numberOfLines={2}>
        {item.nombre}
      </Text>
      <TouchableOpacity
        style={styles.quitarBoton}
        onPress={onQuitar}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

export default function SolicitarPedidoModal({ visible, onClose }) {
  const { pedido, quitarDelPedido } = usePedido();
  const { nombreTaller } = useTaller();
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const mensaje = `Hola buenas, le hablamos de ${nombreTaller} de detailing. Queremos consultar si tienen stock y precio de: ${pedido
    .map((item) => item.nombre)
    .join(", ")}. ¡Gracias!`;

  async function handleCopiar() {
    await Clipboard.setStringAsync(mensaje);
    setCopiado(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiado(false), DURACION_CONFIRMACION_COPIADO);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader titulo="Pedido a proveedor" paso={1} totalPasos={1} onAtras={onClose} />

          <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
            {pedido.length === 0 ? (
              <Text style={styles.vacio}>No quedan productos en el pedido.</Text>
            ) : (
              <>
                <View style={styles.lista}>
                  {pedido.map((item) => (
                    <FilaPedido key={item.id} item={item} onQuitar={() => quitarDelPedido(item.id)} />
                  ))}
                </View>

                <Text style={styles.mensajeLabel}>Mensaje para el proveedor</Text>
                <View style={styles.mensajeCaja}>
                  <Text style={styles.mensajeTexto}>{mensaje}</Text>
                </View>

                <TouchableOpacity style={styles.copiarBoton} onPress={handleCopiar} activeOpacity={0.85}>
                  <Ionicons name={copiado ? "checkmark" : "copy-outline"} size={16} color={colors.bg} />
                  <Text style={styles.copiarBotonTexto}>{copiado ? "Copiado" : "Copiar"}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  lista: {
    marginBottom: 24,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 10,
  },
  filaNombre: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  quitarBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  mensajeLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mensajeCaja: {
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 14,
  },
  mensajeTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  copiarBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accent,
  },
  copiarBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.bg,
  },
});
