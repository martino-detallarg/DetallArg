import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Lista de ranking genérica (Servicios más rentables / Clientes que más
// aportan en FinanzasScreen.js): posición, nombre, una cantidad chica de
// contexto (ej. "8 ventas") y un monto total — mismo shape para los dos
// rankings (ver rankingServiciosPorGanancia/rankingClientesPorFacturacion en
// utils/calculosFinanzas.js), solo cambian las etiquetas. `item.alerta` +
// `item.alertaTexto` son opcionales (solo el ranking de servicios los arma,
// ver FEATURE 9 en FinanzasScreen.js) — sin ellos la fila se ve exactamente
// igual que antes.
export default function RankingLista({ items, etiquetaCantidad, vacioTexto }) {
  if (items.length === 0) {
    return <Text style={styles.vacio}>{vacioTexto}</Text>;
  }

  return (
    <View style={styles.lista}>
      {items.map((item, indice) => (
        <View key={item.id} style={styles.fila}>
          <Text style={styles.posicion}>{indice + 1}</Text>
          <View style={styles.filaTexto}>
            <Text style={styles.nombre} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={styles.detalle}>
              {item.cantidad} {etiquetaCantidad}
            </Text>
            {item.alerta && (
              <View style={styles.alertaFila}>
                <Ionicons name="warning" size={12} color={colors.amber} />
                <Text style={styles.alertaTexto}>{item.alertaTexto}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.monto, item.alerta && styles.montoAlerta]}>{formatearPesos(item.monto)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: 8,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  posicion: {
    width: 20,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.accentLight,
    textAlign: "center",
  },
  filaTexto: {
    flex: 1,
  },
  nombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  detalle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  alertaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  alertaTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.amber,
  },
  monto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  montoAlerta: {
    color: colors.amber,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
});
