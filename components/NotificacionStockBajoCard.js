import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePedido } from "../data/PedidoContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Aproximación temporal: asumimos que un insumo lleno rinde esta cantidad de
// usos típicos y estimamos los usos restantes en proporción al nivel de
// stock. Todavía no hay un cálculo real de consumo por trabajo — cuando
// exista, reemplazar esta fórmula por ese consumo real.
const USOS_ESTIMADOS_PRODUCTO_LLENO = 20;

function calcularUsosRestantes(nivel) {
  return Math.max(1, Math.round((nivel / 100) * USOS_ESTIMADOS_PRODUCTO_LLENO));
}

export default function NotificacionStockBajoCard({ insumo }) {
  const { agregarAlPedido } = usePedido();
  const [respuesta, setRespuesta] = useState(null);

  const usosRestantes = calcularUsosRestantes(insumo.nivel);

  function handleSi() {
    setRespuesta("si");
    agregarAlPedido({ id: insumo.id, nombre: insumo.nombre });
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
          onPress={handleSi}
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
});
