import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../wizard/WizardHeader";
import Button from "../Button";
import { useData } from "../../data/DataContext";
import { CATEGORIAS } from "../../data/mockInsumos";
import { formatearPesos } from "../../utils/formato";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../../theme";

// Paso 2 de ServicioModal.js: marcar qué insumos usa el servicio y en qué
// cantidad. La receta se guarda como [{ insumoId, cantidad }] para líneas del
// catálogo de Mis Insumos (la unidad se resuelve siempre desde el insumo,
// capacidadUnidad, no se duplica acá) o [{ libre: true, libreId, nombre,
// costoEstimado }] para insumos "libres" que el taller usa pero no tiene
// cargados en Mis Insumos (sin ficha de rendimiento/precio de envase, se le
// pide directamente un costo estimado por uso).
export default function RecetaServicioStep({ receta, onCambiar, paso, totalPasos, onAtras, onGuardar, cargando, error }) {
  const { misInsumos } = useData();
  const [formularioLibreAbierto, setFormularioLibreAbierto] = useState(false);
  const [nombreLibre, setNombreLibre] = useState("");
  const [costoLibre, setCostoLibre] = useState("");

  const idsInsumosVivos = useMemo(() => new Set(misInsumos.map((i) => i.id)), [misInsumos]);
  // Líneas de una receta que ya se venía guardando y cuyo insumo fue borrado
  // de Mis Insumos: se muestran aparte, de solo lectura, para no perderlas
  // silenciosamente ni romper el resto de la pantalla.
  const lineasHuerfanas = useMemo(
    () => receta.filter((item) => !item.libre && !idsInsumosVivos.has(item.insumoId)),
    [receta, idsInsumosVivos]
  );
  const lineasLibres = useMemo(() => receta.filter((item) => item.libre), [receta]);

  function obtenerCantidad(insumoId) {
    return receta.find((item) => item.insumoId === insumoId)?.cantidad;
  }

  function toggleInsumo(insumoId) {
    const yaEsta = receta.some((item) => item.insumoId === insumoId);
    if (yaEsta) {
      onCambiar(receta.filter((item) => item.insumoId !== insumoId));
    } else {
      onCambiar([...receta, { insumoId, cantidad: "" }]);
    }
  }

  function cambiarCantidad(insumoId, cantidad) {
    onCambiar(receta.map((item) => (item.insumoId === insumoId ? { ...item, cantidad } : item)));
  }

  function quitarHuerfana(insumoId) {
    onCambiar(receta.filter((item) => item.insumoId !== insumoId));
  }

  function handleAgregarLibre() {
    if (nombreLibre.trim() === "" || costoLibre.trim() === "") return;
    onCambiar([
      ...receta,
      { libre: true, libreId: `libre${Date.now()}`, nombre: nombreLibre.trim(), costoEstimado: costoLibre },
    ]);
    setNombreLibre("");
    setCostoLibre("");
    setFormularioLibreAbierto(false);
  }

  function quitarLibre(libreId) {
    onCambiar(receta.filter((item) => item.libreId !== libreId));
  }

  return (
    <View style={styles.flexUno}>
      <WizardHeader titulo="Receta de insumos" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <FlatList
        data={misInsumos}
        keyExtractor={(insumo) => insumo.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Text style={styles.ayuda}>
              Marcá los insumos que usa este servicio y cuánto se consume en cada trabajo.
            </Text>

            {!formularioLibreAbierto ? (
              <TouchableOpacity
                style={styles.libreBanner}
                onPress={() => setFormularioLibreAbierto(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.accentLight} />
                <Text style={styles.libreBannerTexto}>Agregar insumo libre</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.libreFormulario}>
                <TextInput
                  style={styles.libreInput}
                  value={nombreLibre}
                  onChangeText={setNombreLibre}
                  placeholder="Nombre del insumo"
                  placeholderTextColor={colors.textMuted}
                />
                <TextInput
                  style={styles.libreInput}
                  value={costoLibre}
                  onChangeText={setCostoLibre}
                  placeholder="Costo estimado por uso ($)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
                <View style={styles.libreFormularioBotones}>
                  <TouchableOpacity
                    style={styles.libreCancelarBoton}
                    onPress={() => {
                      setFormularioLibreAbierto(false);
                      setNombreLibre("");
                      setCostoLibre("");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.libreCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.libreConfirmarBoton} onPress={handleAgregarLibre} activeOpacity={0.85}>
                    <Text style={styles.libreConfirmarTexto}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {lineasLibres.length > 0 && (
              <View style={styles.libresLista}>
                <Text style={styles.libresListaTitulo}>Insumos libres agregados</Text>
                {lineasLibres.map((linea) => (
                  <View key={linea.libreId} style={styles.libreFila}>
                    <Text style={styles.libreFilaNombre} numberOfLines={1}>
                      {linea.nombre}
                    </Text>
                    <Text style={styles.libreFilaCosto}>
                      {formatearPesos(Number(String(linea.costoEstimado).replace(",", ".")))}
                    </Text>
                    <TouchableOpacity
                      onPress={() => quitarLibre(linea.libreId)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        }
        renderItem={({ item: insumo }) => {
          const categoria = CATEGORIAS[insumo.categoria];
          const marcado = receta.some((r) => r.insumoId === insumo.id);
          const cantidad = obtenerCantidad(insumo.id);
          return (
            <View style={styles.fila}>
              <TouchableOpacity
                style={styles.filaPrincipal}
                onPress={() => toggleInsumo(insumo.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, marcado && styles.checkboxActivo]}>
                  {marcado && <Ionicons name="checkmark" size={14} color={colors.bg} />}
                </View>
                <Ionicons name={categoria?.icono ?? "cube-outline"} size={18} color={colors.accentLight} />
                <Text style={styles.filaNombre} numberOfLines={1}>
                  {insumo.nombre}
                </Text>
              </TouchableOpacity>

              {marcado && (
                <View style={styles.cantidadWrapper}>
                  <TextInput
                    style={styles.cantidadInput}
                    value={String(cantidad ?? "")}
                    onChangeText={(v) => cambiarCantidad(insumo.id, v)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={styles.cantidadUnidad}>{insumo.capacidadUnidad ?? ""}</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            Todavía no cargaste insumos en Mis Insumos. Podés guardar el servicio sin receta y sumarla más adelante.
          </Text>
        }
        ListFooterComponent={
          lineasHuerfanas.length > 0 ? (
            <View style={styles.huerfanas}>
              <Text style={styles.huerfanasTitulo}>Insumos eliminados en esta receta</Text>
              {lineasHuerfanas.map((item) => (
                <View key={item.insumoId} style={styles.huerfanaFila}>
                  <Text style={styles.huerfanaTexto}>Insumo eliminado · {item.cantidad}</Text>
                  <TouchableOpacity onPress={() => quitarHuerfana(item.insumoId)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null
        }
      />

      <View style={styles.boton}>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Guardar servicio" onPress={onGuardar} loading={cargando} disabled={cargando} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexUno: {
    flex: 1,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
  },
  libreBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    marginBottom: 14,
  },
  libreBannerTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accentLight,
  },
  libreFormulario: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  libreInput: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  libreFormularioBotones: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  libreCancelarBoton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  libreCancelarTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  libreConfirmarBoton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    ...continuousCorner,
  },
  libreConfirmarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.bg,
  },
  libresLista: {
    marginBottom: 14,
  },
  libresListaTitulo: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  libreFila: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  libreFilaNombre: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
  },
  libreFilaCosto: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  filaPrincipal: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filaNombre: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cantidadWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cantidadInput: {
    width: 56,
    textAlign: "center",
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 6,
    ...shadowSubtle,
  },
  cantidadUnidad: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    minWidth: 24,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  huerfanas: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  huerfanasTitulo: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  huerfanaFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  huerfanaTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  boton: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 8,
  },
});
