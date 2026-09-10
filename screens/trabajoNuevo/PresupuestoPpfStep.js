import { useMemo } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useData } from "../../data/DataContext";
import { obtenerClavePpf, calcularPresupuestoPpf } from "../../utils/calculosPpf";
import { formatearPesos } from "../../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../../theme";

// Paso "Presupuesto PPF": desglose por panel (m² + costo), m² total con
// merma, costo de material y mano de obra (editable, sin tarifa automática
// por hora en esta v1 — mismo criterio que el resto de Finanzas), reusando
// calcularPresupuestoPpf (utils/calculosPpf.js) y el mismo patrón visual de
// tarjeta de resultado que ya tiene screens/PresupuestoScreen.js. Es solo
// informativo para el taller al cargar el trabajo — no se persiste nada de
// acá: lo único que se guarda del paso anterior (panelesElegidos) es lo que
// después se congela en turno_ppf_paneles al finalizar el trabajo.
export default function PresupuestoPpfStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const { misInsumos } = useData();
  const insumoPpfId = datos.insumoPpfId ?? null;
  const manoDeObraTexto = datos.manoDeObraTexto ?? "";

  const rollosPpf = useMemo(
    () =>
      misInsumos.filter(
        (i) => i.categoria === "ppf" && i.capacidadUnidad === "m2" && i.capacidadTotal > 0 && i.precioCompra > 0
      ),
    [misInsumos]
  );

  const rolloElegido = rollosPpf.find((r) => r.id === insumoPpfId) ?? rollosPpf[0] ?? null;
  const costoPorM2Rollo = rolloElegido ? rolloElegido.precioCompra / rolloElegido.capacidadTotal : 0;
  const manoDeObraEstimada = Number(String(manoDeObraTexto).replace(",", ".")) || 0;

  const clavePpf = obtenerClavePpf(datos);
  const panelesElegidos = datos.panelesElegidos ?? [];

  const presupuesto = clavePpf
    ? calcularPresupuestoPpf({
        tipoVehiculo: clavePpf.tipoVehiculo,
        subdivision: clavePpf.subdivision,
        panelesElegidos,
        costoPorM2Rollo,
        manoDeObraEstimada,
      })
    : null;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <WizardHeader titulo="Presupuesto PPF" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          {rollosPpf.length === 0 ? (
            <Text style={styles.vacio}>
              Todavía no cargaste ningún rollo de PPF en Mis Insumos (categoría PPF, con m² y
              precio cargados) — el costo de material va a quedar en $0 hasta que cargues uno.
            </Text>
          ) : (
            <>
              <Text style={styles.label}>Rollo a usar</Text>
              <View style={styles.chips}>
                {rollosPpf.map((rollo) => {
                  const activo = rolloElegido?.id === rollo.id;
                  return (
                    <TouchableOpacity
                      key={rollo.id}
                      style={[styles.chip, activo && styles.chipActivo]}
                      onPress={() => onCambiar({ insumoPpfId: rollo.id })}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]} numberOfLines={1}>
                        {rollo.marca} · {rollo.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.ayuda}>
                Costo por m²: {formatearPesos(costoPorM2Rollo)} (precio de compra ÷ m² del rollo)
              </Text>
            </>
          )}

          <Input
            label="Mano de obra estimada ($, opcional)"
            value={manoDeObraTexto}
            onChangeText={(v) => onCambiar({ manoDeObraTexto: v })}
            placeholder="Ej: 15000"
            keyboardType="numeric"
          />

          {!presupuesto ? (
            <Text style={styles.vacio}>No hay matriz de PPF cargada para esta carrocería.</Text>
          ) : (
            <View style={styles.resultadoTarjeta}>
              <Text style={styles.resultadoTitulo}>Desglose por panel</Text>
              {presupuesto.detalle.map((linea) => (
                <View key={linea.panel} style={styles.resultadoFila}>
                  <Text style={styles.resultadoLabel} numberOfLines={1}>
                    {linea.panel.split("__")[1] ?? linea.panel} · {linea.m2ConMerma} m²
                  </Text>
                  <Text style={styles.resultadoValor}>{formatearPesos(linea.costoPanel)}</Text>
                </View>
              ))}

              <View style={styles.separador} />

              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>m² total (con merma)</Text>
                <Text style={styles.resultadoValor}>{presupuesto.m2TotalConMerma} m²</Text>
              </View>
              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Costo de material</Text>
                <Text style={styles.resultadoValor}>{formatearPesos(presupuesto.costoMaterial)}</Text>
              </View>
              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Mano de obra</Text>
                <Text style={styles.resultadoValor}>{formatearPesos(presupuesto.manoDeObraEstimada)}</Text>
              </View>

              <View style={styles.separador} />

              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabelDestacado}>Presupuesto total</Text>
                <Text style={styles.resultadoValorGrande}>{formatearPesos(presupuesto.presupuestoTotal)}</Text>
              </View>
            </View>
          )}

          <View style={styles.boton}>
            <Button title="Continuar a Inspección" onPress={() => onContinuar()} />
          </View>
        </ScrollView>
      </SwipeVolver>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: "100%",
  },
  chipActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipTextoActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 16,
  },
  vacio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  resultadoTarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    marginTop: 12,
  },
  resultadoTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  resultadoFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 4,
  },
  resultadoLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  resultadoLabelDestacado: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  resultadoValor: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  resultadoValorGrande: {
    fontFamily: fonts.headingBlack,
    fontSize: 22,
    color: colors.textPrimary,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 8,
  },
  boton: {
    marginTop: 20,
  },
});
