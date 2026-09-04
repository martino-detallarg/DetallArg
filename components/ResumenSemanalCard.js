import { StyleSheet, Text, View } from "react-native";
import { formatearFechaDDMMAAAA } from "../utils/fecha";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Tarjeta informativa de Notificaciones — mismo patrón visual que
// NotificacionStockBajoCard.js. No es una notificación real ni se guarda en
// ningún lado: NotificacionesScreen.js la recalcula desde cero cada vez que
// se entra a la pantalla (ver calcularResumenPeriodo + obtenerSemanaAnterior).
export default function ResumenSemanalCard({ desde, hasta, facturacion, gananciaNeta }) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>Resumen de la semana pasada</Text>
      <Text style={styles.periodo}>
        {formatearFechaDDMMAAAA(desde)} al {formatearFechaDDMMAAAA(hasta)}
      </Text>

      <View style={styles.fila}>
        <View style={styles.dato}>
          <Text style={styles.datoLabel}>Facturación</Text>
          <Text style={styles.datoValor}>{formatearPesos(facturacion)}</Text>
        </View>
        <View style={styles.dato}>
          <Text style={styles.datoLabel}>Ganancia neta</Text>
          <Text style={[styles.datoValor, gananciaNeta < 0 && styles.datoValorNegativo]}>
            {formatearPesos(gananciaNeta)}
          </Text>
        </View>
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
    marginBottom: 16,
  },
  titulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  periodo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  fila: {
    flexDirection: "row",
    gap: 12,
  },
  dato: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  datoValor: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  datoValorNegativo: {
    color: colors.error,
  },
});
