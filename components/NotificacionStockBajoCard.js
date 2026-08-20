import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTaller } from "../data/TallerContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Aproximación temporal: asumimos que un insumo lleno rinde esta cantidad de
// usos típicos y estimamos los usos restantes en proporción al nivel de
// stock. Todavía no hay un cálculo real de consumo por trabajo — cuando
// exista, reemplazar esta fórmula por ese consumo real.
const USOS_ESTIMADOS_PRODUCTO_LLENO = 20;

function calcularUsosRestantes(nivel) {
  return Math.max(1, Math.round((nivel / 100) * USOS_ESTIMADOS_PRODUCTO_LLENO));
}

const DURACION_CONFIRMACION_COPIADO = 2000;

export default function NotificacionStockBajoCard({ insumo }) {
  const { nombreTaller } = useTaller();
  const [respuesta, setRespuesta] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const usosRestantes = calcularUsosRestantes(insumo.nivel);
  const mensaje = `Hola buenas, le hablamos de ${nombreTaller} de detailing. Queremos consultar si ${insumo.nombre} está en stock y en qué valor. ¡Gracias!`;

  async function handleCopiar() {
    await Clipboard.setStringAsync(mensaje);
    setCopiado(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiado(false), DURACION_CONFIRMACION_COPIADO);
  }

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.texto}>
        Quedan {usosRestantes} usos de {insumo.nombre}. Se acabará pronto. ¿Desea pedirlo a su
        proveedor?
      </Text>

      <View style={styles.opciones}>
        <TouchableOpacity
          style={[styles.opcion, respuesta === "si" && styles.opcionSeleccionada]}
          onPress={() => setRespuesta("si")}
          activeOpacity={0.8}
        >
          <Text style={[styles.opcionTexto, respuesta === "si" && styles.opcionTextoSeleccionado]}>
            Sí
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opcion, respuesta === "no" && styles.opcionSeleccionada]}
          onPress={() => setRespuesta("no")}
          activeOpacity={0.8}
        >
          <Text style={[styles.opcionTexto, respuesta === "no" && styles.opcionTextoSeleccionado]}>
            No
          </Text>
        </TouchableOpacity>
      </View>

      {respuesta === "si" && (
        <View style={styles.mensajeFila}>
          <Text style={styles.mensajeTexto}>{mensaje}</Text>
          <TouchableOpacity style={styles.copiarBoton} onPress={handleCopiar} activeOpacity={0.8}>
            <Ionicons
              name={copiado ? "checkmark" : "copy-outline"}
              size={16}
              color={copiado ? colors.accentLight : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  opciones: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  opcion: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  opcionSeleccionada: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  opcionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  opcionTextoSeleccionado: {
    color: colors.bg,
  },
  mensajeFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
  },
  mensajeTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  copiarBoton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
});
