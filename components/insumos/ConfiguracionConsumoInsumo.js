import { StyleSheet, Text, TextInput, View } from "react-native";
import ChipGroup from "../ChipGroup";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../../theme";

// Único dato real por insumo que el resto de la app necesita: cuántos ml de
// producto PURO se gastan en 1 uso/auto (mlPorUso). Reemplaza al viejo par
// "diluciones (por litro de mezcla)" + "rendimiento (texto libre)", que
// nunca daban ese número de verdad (ver el comentario de cabecera de
// AgregarInsumoModal.js y supabase/alter_insumos_ml_por_uso.sql).
//
// - Si se diluye: mlPorUso = envaseAplicadorMl / (dilucionX + 1) -- el
//   envase del aplicador (rociador, foam cannon, balde de lavado) es la
//   mezcla YA PREPARADA lista para usar, no el envase de compra del
//   producto puro (ese sigue siendo CamposStock, sin tocar acá).
// - Si no se diluye: mlPorUso es el número que carga el taller directo
//   ("¿Cuántos ml se usan por auto?"), sin ningún cálculo.
//
// null si todavía no hay dato suficiente para calcularlo -- el resto de la
// app (RecetaServicioStep.js, NotificacionStockBajoCard.js) tiene que
// manejar ese null sin romperse, nunca inventar un número.
export function calcularMlPorUso({ seDiluye, dilucionX, envaseAplicadorMl, mlPorAutoTexto }) {
  if (seDiluye) {
    const x = Number(String(dilucionX).replace(",", "."));
    const envase = Number(String(envaseAplicadorMl).replace(",", "."));
    if (!(x > 0) || !(envase > 0)) return null;
    return Math.round((envase / (x + 1)) * 100) / 100;
  }
  const ml = Number(String(mlPorAutoTexto).replace(",", "."));
  return ml > 0 ? ml : null;
}

// Bloque de formulario "¿se diluye? -> ratio 1:X + envase del aplicador, o
// ml directo por auto" -- compartido entre FilaProducto y
// FormularioPersonalizado (AgregarInsumoModal.js, alta de un insumo nuevo) y
// EditarConsumoInsumoModal.js (editar la configuración de uno ya cargado,
// desde MoverCategoriaModal.js) para no duplicar estos mismos 4 campos en
// tres lugares. Totalmente controlado: no calcula mlPorUso para guardar por
// su cuenta, cada caller usa `calcularMlPorUso` de acá con sus propios
// valores en el momento de confirmar.
export default function ConfiguracionConsumoInsumo({
  seDiluye,
  onCambiarSeDiluye,
  dilucionX,
  onCambiarDilucionX,
  envaseAplicadorMl,
  onCambiarEnvaseAplicadorMl,
  mlPorAutoTexto,
  onCambiarMlPorAutoTexto,
  dilucionesSugeridas,
  bloqueada = false,
}) {
  const mlPorUso = calcularMlPorUso({ seDiluye, dilucionX, envaseAplicadorMl, mlPorAutoTexto });

  return (
    <>
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>¿Se diluye?</Text>
        <ChipGroup
          disabled={bloqueada}
          options={[
            { value: true, label: "Sí", selected: seDiluye === true },
            { value: false, label: "No", selected: seDiluye === false },
          ]}
          onPress={onCambiarSeDiluye}
        />
      </View>

      {seDiluye ? (
        <>
          {dilucionesSugeridas && dilucionesSugeridas.length > 0 && (
            <Text style={styles.sugeridasTexto}>
              Diluciones sugeridas por la marca: {dilucionesSugeridas.join(" · ")}
            </Text>
          )}

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Dilución</Text>
            <View style={styles.dilucionRatioFila}>
              <Text style={styles.dilucionRatioPrefijo}>1 :</Text>
              <TextInput
                style={styles.dilucionRatioInput}
                value={dilucionX}
                onChangeText={(texto) => onCambiarDilucionX(texto.replace(/[^0-9]/g, "").slice(0, 3))}
                placeholder="200"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                editable={!bloqueada}
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Envase del aplicador (ml)</Text>
            <TextInput
              style={styles.campoInput}
              value={envaseAplicadorMl}
              onChangeText={(texto) => onCambiarEnvaseAplicadorMl(texto.replace(/[^0-9]/g, "").slice(0, 5))}
              placeholder="Ej. 500"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              editable={!bloqueada}
              returnKeyType="done"
            />
          </View>

          {mlPorUso != null && (
            <Text style={styles.calculoTexto}>≈ {mlPorUso} ml de producto puro por uso</Text>
          )}
        </>
      ) : (
        <View style={styles.campo}>
          <Text style={styles.campoPuroTexto}>Se utiliza puro</Text>
          <Text style={styles.campoLabel}>¿Cuántos ml se usan por auto?</Text>
          <TextInput
            style={styles.campoInput}
            value={mlPorAutoTexto}
            onChangeText={(texto) => onCambiarMlPorAutoTexto(texto.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="Ej. 30"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            editable={!bloqueada}
            returnKeyType="done"
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: 10,
  },
  campoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campoPuroTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.accentLight,
    marginBottom: 6,
  },
  campoInput: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...shadowSubtle,
  },
  sugeridasTexto: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  dilucionRatioFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dilucionRatioPrefijo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dilucionRatioInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  calculoTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.accentLight,
    marginTop: -4,
    marginBottom: 10,
  },
});
