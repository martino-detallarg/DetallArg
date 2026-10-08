import { useMemo } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useData } from "../../data/DataContext";
import { obtenerClavePpf, obtenerPanelesPpf, calcularPresupuestoPpf } from "../../utils/calculosPpf";
import { formatearPesos } from "../../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../../theme";

// Paso "Presupuesto PPF": desglose por panel (m² + costo), m² total con
// merma, costo de material y mano de obra (editable, sin tarifa automática
// por hora en esta v1 — mismo criterio que el resto de Finanzas), reusando
// calcularPresupuestoPpf (utils/calculosPpf.js) y el mismo patrón visual de
// tarjeta de resultado que ya tiene screens/PresupuestoScreen.js. El paso
// en sí no escribe nada: TrabajoNuevoWizard.js persiste en el turno el
// rollo de carrocería, el modo de corte, la mano de obra (solo informativa)
// y los insumos adicionales elegidos acá, y TurnoContext los usa al
// finalizar el trabajo para congelar el costo real del material en
// turno_receta_aplicada (ver alter_turnos_costo_ppf_finanzas.sql). El rollo
// de vidrio elegido NO se persiste (no tiene columna).
//
// Dos rollos posibles (carrocería y vidrio, ver data/ppfPanelMatrix.js): el
// selector de vidrio recién aparece si panelesElegidos incluye algún panel
// con material "vidrio" (hoy, el parabrisas) -- un trabajo que no lo toca no
// ve ningún campo nuevo, cero cambio respecto de antes de este agregado.
const MODOS_CORTE = [
  { valor: "manual", etiqueta: "Manual" },
  { valor: "laser", etiqueta: "Láser" },
];

export default function PresupuestoPpfStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const { misInsumos } = useData();
  const insumoPpfId = datos.insumoPpfId ?? null;
  const insumoPpfVidrioId = datos.insumoPpfVidrioId ?? null;
  const manoDeObraTexto = datos.manoDeObraTexto ?? "";
  const insumosAdicionalesTexto = datos.insumosAdicionalesTexto ?? "";
  const modoCorte = datos.modoCorte ?? "manual";

  // Dos rollos posibles, nunca mezclados (ver data/ppfPanelMatrix.js: cada
  // panel trae su propio `material`) -- el de carrocería siempre aplica, el
  // de vidrio solo si el taller elegió el parabrisas en el paso anterior
  // (SeleccionPanelesPpfStep.js).
  const rollosCarroceria = useMemo(
    () =>
      misInsumos.filter(
        (i) =>
          i.categoria === "ppf" &&
          i.materialPpf === "carroceria" &&
          i.capacidadUnidad === "m2" &&
          i.capacidadTotal > 0 &&
          i.precioCompra > 0
      ),
    [misInsumos]
  );
  const rollosVidrio = useMemo(
    () =>
      misInsumos.filter(
        (i) =>
          i.categoria === "ppf" &&
          i.materialPpf === "vidrio" &&
          i.capacidadUnidad === "m2" &&
          i.capacidadTotal > 0 &&
          i.precioCompra > 0
      ),
    [misInsumos]
  );

  const rolloElegido = rollosCarroceria.find((r) => r.id === insumoPpfId) ?? rollosCarroceria[0] ?? null;
  const costoPorM2RolloCarroceria = rolloElegido ? rolloElegido.precioCompra / rolloElegido.capacidadTotal : 0;
  const rolloVidrioElegido = rollosVidrio.find((r) => r.id === insumoPpfVidrioId) ?? rollosVidrio[0] ?? null;
  const costoPorM2RolloVidrio = rolloVidrioElegido
    ? rolloVidrioElegido.precioCompra / rolloVidrioElegido.capacidadTotal
    : undefined;
  const manoDeObraEstimada = Number(String(manoDeObraTexto).replace(",", ".")) || 0;
  const insumosAdicionalesEstimados = Number(String(insumosAdicionalesTexto).replace(",", ".")) || 0;

  const clavePpf = obtenerClavePpf(datos);
  const panelesElegidos = datos.panelesElegidos ?? [];
  const panelesMatriz = clavePpf ? obtenerPanelesPpf(clavePpf.tipoVehiculo, clavePpf.subdivision) : null;
  // Solo se le pide un segundo rollo al taller si de verdad eligió el
  // parabrisas -- un trabajo de PPF que no lo toca no debe sentir ninguna
  // fricción nueva (mismo criterio que el resto del wizard, nada obligatorio
  // que no aplique al trabajo puntual).
  const hayPanelVidrio = panelesMatriz
    ? panelesElegidos.some((panelKey) => panelesMatriz[panelKey]?.material === "vidrio")
    : false;

  const presupuesto = clavePpf
    ? calcularPresupuestoPpf({
        tipoVehiculo: clavePpf.tipoVehiculo,
        subdivision: clavePpf.subdivision,
        panelesElegidos,
        costoPorM2RolloCarroceria,
        costoPorM2RolloVidrio: hayPanelVidrio ? costoPorM2RolloVidrio : undefined,
        manoDeObraEstimada,
        insumosAdicionalesEstimados,
        modoCorte,
      })
    : null;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <WizardHeader titulo="Presupuesto PPF" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Modo de corte</Text>
          <View style={styles.chips}>
            {MODOS_CORTE.map((modo) => {
              const activo = modoCorte === modo.valor;
              return (
                <TouchableOpacity
                  key={modo.valor}
                  style={[styles.chip, activo && styles.chipActivo]}
                  onPress={() => onCambiar({ modoCorte: modo.valor })}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]} numberOfLines={1}>
                    {modo.etiqueta}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.ayuda}>
            Láser/plotter corta más ajustado al panel — menos merma de material que a cutter.
          </Text>

          {rollosCarroceria.length === 0 ? (
            <Text style={styles.vacio}>
              Todavía no cargaste ningún rollo de PPF de carrocería en Mis Insumos (categoría PPF,
              con m² y precio cargados) — el costo de material va a quedar en $0 hasta que
              cargues uno.
            </Text>
          ) : (
            <>
              <Text style={styles.label}>Rollo de carrocería a usar</Text>
              <View style={styles.chips}>
                {rollosCarroceria.map((rollo) => {
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
                Costo por m²: {formatearPesos(costoPorM2RolloCarroceria)} (precio de compra ÷ m²
                del rollo)
              </Text>
            </>
          )}

          {/* Solo aparece si de verdad se eligió el parabrisas en el paso
          anterior -- un trabajo de PPF que no lo toca sigue exactamente
          igual que antes de este cambio, sin ningún selector extra. */}
          {hayPanelVidrio && (
            <>
              {rollosVidrio.length === 0 ? (
                <Text style={styles.vacio}>
                  Elegiste el parabrisas pero todavía no cargaste ningún rollo de PPF de vidrio en
                  Mis Insumos (categoría PPF, marcado "Vidrio", con m² y precio cargados) — no se
                  puede calcular ese costo hasta que cargues uno.
                </Text>
              ) : (
                <>
                  <Text style={styles.label}>Rollo de vidrio a usar (parabrisas)</Text>
                  <View style={styles.chips}>
                    {rollosVidrio.map((rollo) => {
                      const activo = rolloVidrioElegido?.id === rollo.id;
                      return (
                        <TouchableOpacity
                          key={rollo.id}
                          style={[styles.chip, activo && styles.chipActivo]}
                          onPress={() => onCambiar({ insumoPpfVidrioId: rollo.id })}
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
                    Costo por m²: {formatearPesos(costoPorM2RolloVidrio ?? 0)} (precio de compra ÷
                    m² del rollo)
                  </Text>
                </>
              )}
            </>
          )}

          <Input
            label="Mano de obra estimada ($, opcional)"
            value={manoDeObraTexto}
            onChangeText={(v) => onCambiar({ manoDeObraTexto: v })}
            placeholder="Ej: 15000"
            keyboardType="numeric"
          />

          <Input
            label="Insumos adicionales estimados ($, opcional)"
            value={insumosAdicionalesTexto}
            onChangeText={(v) => onCambiar({ insumosAdicionalesTexto: v })}
            placeholder="Ej: 5000"
            keyboardType="numeric"
          />
          <Text style={styles.ayuda}>Líquido de instalación, lavado/descontaminado previo, etc.</Text>

          {!presupuesto ? (
            <Text style={styles.vacio}>No hay matriz de PPF cargada para esta carrocería.</Text>
          ) : presupuesto.error ? (
            <Text style={styles.vacio}>{presupuesto.mensaje}</Text>
          ) : (
            <View style={styles.resultadoTarjeta}>
              <Text style={styles.resultadoTitulo}>Desglose por panel</Text>
              {presupuesto.detalle.map((linea) => (
                <View key={linea.panel} style={styles.resultadoFila}>
                  <Text style={styles.resultadoLabel} numberOfLines={1}>
                    {linea.panel.split("__")[1] ?? linea.panel} · {linea.m2ConMerma} m²
                    {linea.material === "vidrio" ? " · vidrio" : ""}
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
                <Text style={styles.resultadoLabel}>Material carrocería</Text>
                <Text style={styles.resultadoValor}>{formatearPesos(presupuesto.costoMaterialCarroceria)}</Text>
              </View>
              {hayPanelVidrio && (
                <View style={styles.resultadoFila}>
                  <Text style={styles.resultadoLabel}>Material vidrio</Text>
                  <Text style={styles.resultadoValor}>{formatearPesos(presupuesto.costoMaterialVidrio)}</Text>
                </View>
              )}
              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Mano de obra</Text>
                <Text style={styles.resultadoValor}>{formatearPesos(presupuesto.manoDeObraEstimada)}</Text>
              </View>
              <View style={styles.resultadoFila}>
                <Text style={styles.resultadoLabel}>Insumos adicionales</Text>
                <Text style={styles.resultadoValor}>
                  {formatearPesos(presupuesto.insumosAdicionalesEstimados)}
                </Text>
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
