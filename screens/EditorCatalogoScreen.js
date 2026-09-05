import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Input from "../components/Input";
import EstadoCarga from "../components/EstadoCarga";
import { useCatalogo, construirOrdenCompletoCatalogo } from "../data/CatalogoContext";
import { useServicios } from "../data/ServicioContext";
import { PLANTILLAS_CATALOGO } from "../data/plantillasCatalogo";
import { formatearPesos, formatearDuracion } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const CLAVES_ESTILOS = Object.keys(PLANTILLAS_CATALOGO);

// Familias nativas (registradas en App.js) para simular cada estilo DENTRO
// de esta pantalla — no tienen nada que ver con las fontTitulo/fontCuerpo de
// PLANTILLAS_CATALOGO, que son strings CSS para el PDF (ver utils/catalogoPdf.js).
const FUENTES_MUESTRA_NATIVA = {
  dark_luxury: { titulo: "CormorantGaramond_600SemiBold", cuerpo: "Jost_400Regular" },
  clean_apple: { titulo: "Manrope_800ExtraBold", cuerpo: "Manrope_400Regular" },
  sport_tecnico: { titulo: "Oswald_600SemiBold", cuerpo: "Barlow_400Regular" },
};

const LIMITE_TEXTO_LIBRE = 120;

function EstiloBaseCard({ plantilla, fuenteMuestra, activo, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.estiloCard, { backgroundColor: plantilla.colorFondo }, activo && styles.estiloCardActivo]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.estiloAcentoBarra, { backgroundColor: plantilla.colorAcento }]} />
      <Text
        style={[styles.estiloNombre, { color: plantilla.colorPrimario, fontFamily: fuenteMuestra.titulo }]}
        numberOfLines={1}
      >
        {plantilla.nombre}
      </Text>
      <Text
        style={[styles.estiloMuestra, { color: plantilla.colorTextoSecundario, fontFamily: fuenteMuestra.cuerpo }]}
        numberOfLines={1}
      >
        Aa · Catálogo de servicios
      </Text>
      {activo && (
        <View style={styles.estiloCheck}>
          <Ionicons name="checkmark-circle" size={20} color={plantilla.colorAcento} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function FilaServicioEditor({ servicio, oculto, esPrimero, esUltimo, onSubir, onBajar, onToggleOculto }) {
  return (
    <View style={[styles.filaServicio, oculto && styles.filaServicioOculta]}>
      <View style={styles.filaServicioInfo}>
        <Text style={styles.filaServicioNombre} numberOfLines={1}>
          {servicio.nombre}
        </Text>
        <Text style={styles.filaServicioDetalle} numberOfLines={1}>
          {formatearPesos(servicio.precio)} · {formatearDuracion(servicio.duracionValor, servicio.duracionUnidad)}
        </Text>
      </View>
      <View style={styles.filaServicioAcciones}>
        <TouchableOpacity onPress={onSubir} disabled={esPrimero} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-up" size={18} color={esPrimero ? colors.textMuted : colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBajar} disabled={esUltimo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-down" size={18} color={esUltimo ? colors.textMuted : colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleOculto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={oculto ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={oculto ? colors.textMuted : colors.accentLight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EditorCatalogoScreen({ navigation }) {
  const { itemsCatalogo, configuracionCatalogo, actualizarConfiguracionCatalogo } = useCatalogo();
  const { cargandoServicios, errorCargaServicios, recargarServicios, getServicioById } = useServicios();
  const [subiendoPortada, setSubiendoPortada] = useState(false);

  const { estiloBase, colorAcento, ordenServicios, serviciosOcultos, fotoPortada, textoLibre1, textoLibre2 } =
    configuracionCatalogo;
  const plantilla = PLANTILLAS_CATALOGO[estiloBase];

  const serviciosOrdenados = construirOrdenCompletoCatalogo(itemsCatalogo, ordenServicios)
    .map((servicioId) => getServicioById(servicioId))
    .filter(Boolean);

  function handleElegirEstilo(clave) {
    if (clave === estiloBase) return;
    actualizarConfiguracionCatalogo({ estiloBase: clave, colorAcento: PLANTILLAS_CATALOGO[clave].paletaColores[0] });
  }

  function handleMoverServicio(servicioId, direccion) {
    const ordenActual = serviciosOrdenados.map((servicio) => servicio.id);
    const indice = ordenActual.indexOf(servicioId);
    const nuevoIndice = indice + direccion;
    if (indice === -1 || nuevoIndice < 0 || nuevoIndice >= ordenActual.length) return;
    const nuevoOrden = [...ordenActual];
    [nuevoOrden[indice], nuevoOrden[nuevoIndice]] = [nuevoOrden[nuevoIndice], nuevoOrden[indice]];
    actualizarConfiguracionCatalogo({ ordenServicios: nuevoOrden });
  }

  function handleToggleOculto(servicioId) {
    const nuevo = serviciosOcultos.includes(servicioId)
      ? serviciosOcultos.filter((id) => id !== servicioId)
      : [...serviciosOcultos, servicioId];
    actualizarConfiguracionCatalogo({ serviciosOcultos: nuevo });
  }

  async function handleElegirFotoPortada() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;
    setSubiendoPortada(true);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
      if (resultado.canceled) return;
      actualizarConfiguracionCatalogo({ fotoPortada: resultado.assets[0].uri });
    } catch (err) {
      Alert.alert("No se pudo cargar la foto", "Probá de nuevo.");
    } finally {
      setSubiendoPortada(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.goBack()} />

      <EstadoCarga cargando={cargandoServicios} error={errorCargaServicios} onReintentar={recargarServicios}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>Editor de Catálogo</Text>

          <Text style={styles.label}>Estilo</Text>
          <View style={styles.estilosFila}>
            {CLAVES_ESTILOS.map((clave) => (
              <EstiloBaseCard
                key={clave}
                plantilla={PLANTILLAS_CATALOGO[clave]}
                fuenteMuestra={FUENTES_MUESTRA_NATIVA[clave]}
                activo={estiloBase === clave}
                onPress={() => handleElegirEstilo(clave)}
              />
            ))}
          </View>

          <Text style={styles.label}>Color de acento</Text>
          <View style={styles.acentoFila}>
            {plantilla.paletaColores.map((hex) => {
              const activo = colorAcento === hex;
              return (
                <TouchableOpacity
                  key={hex}
                  style={[styles.acentoSwatch, { backgroundColor: hex }, activo && styles.acentoSwatchActivo]}
                  onPress={() => actualizarConfiguracionCatalogo({ colorAcento: hex })}
                  activeOpacity={0.85}
                >
                  {activo && <Ionicons name="checkmark" size={18} color={plantilla.colorFondo} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Servicios en el catálogo</Text>
          {serviciosOrdenados.length === 0 ? (
            <Text style={styles.vacio}>Todavía no exportaste ningún servicio desde Mis Servicios.</Text>
          ) : (
            <View style={styles.serviciosLista}>
              {serviciosOrdenados.map((servicio, indice) => (
                <FilaServicioEditor
                  key={servicio.id}
                  servicio={servicio}
                  oculto={serviciosOcultos.includes(servicio.id)}
                  esPrimero={indice === 0}
                  esUltimo={indice === serviciosOrdenados.length - 1}
                  onSubir={() => handleMoverServicio(servicio.id, -1)}
                  onBajar={() => handleMoverServicio(servicio.id, 1)}
                  onToggleOculto={() => handleToggleOculto(servicio.id)}
                />
              ))}
            </View>
          )}

          <Text style={styles.label}>Foto de portada</Text>
          <View style={styles.portadaBloque}>
            {fotoPortada ? (
              <Image source={{ uri: fotoPortada }} style={styles.portadaPreview} resizeMode="cover" />
            ) : null}
            <View style={styles.portadaBotones}>
              <TouchableOpacity style={styles.portadaBoton} onPress={handleElegirFotoPortada} activeOpacity={0.85}>
                <Ionicons name="image-outline" size={16} color={colors.textPrimary} />
                <Text style={styles.portadaBotonTexto}>
                  {subiendoPortada ? "Cargando..." : fotoPortada ? "Cambiar foto" : "Elegir foto"}
                </Text>
              </TouchableOpacity>
              {fotoPortada ? (
                <TouchableOpacity
                  style={styles.portadaQuitar}
                  onPress={() => actualizarConfiguracionCatalogo({ fotoPortada: null })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <Input
            label="Frase de bienvenida"
            value={textoLibre1}
            onChangeText={(texto) => actualizarConfiguracionCatalogo({ textoLibre1: texto.slice(0, LIMITE_TEXTO_LIBRE) })}
            placeholder="Ej: Cuidamos tu auto como si fuera el nuestro"
            maxLength={LIMITE_TEXTO_LIBRE}
          />
          <Text style={styles.contador}>
            {textoLibre1.length}/{LIMITE_TEXTO_LIBRE}
          </Text>

          <Input
            label="Nota al pie"
            value={textoLibre2}
            onChangeText={(texto) => actualizarConfiguracionCatalogo({ textoLibre2: texto.slice(0, LIMITE_TEXTO_LIBRE) })}
            placeholder="Ej: Turnos con reserva previa"
            maxLength={LIMITE_TEXTO_LIBRE}
            multiline
          />
          <Text style={styles.contador}>
            {textoLibre2.length}/{LIMITE_TEXTO_LIBRE}
          </Text>
        </ScrollView>
      </EstadoCarga>
    </SafeAreaView>
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
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  estilosFila: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  estiloCard: {
    flex: 1,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 12,
    minHeight: 96,
    ...shadow,
  },
  estiloCardActivo: {
    borderColor: colors.accent,
  },
  estiloAcentoBarra: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  estiloNombre: {
    fontSize: 14,
    marginBottom: 4,
  },
  estiloMuestra: {
    fontSize: 11,
  },
  estiloCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  acentoFila: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  acentoSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  acentoSwatchActivo: {
    borderColor: colors.textPrimary,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: 20,
  },
  serviciosLista: {
    marginBottom: 20,
  },
  filaServicio: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  filaServicioOculta: {
    opacity: 0.5,
  },
  filaServicioInfo: {
    flex: 1,
    marginRight: 10,
  },
  filaServicioNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filaServicioDetalle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  filaServicioAcciones: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  portadaBloque: {
    marginBottom: 20,
  },
  portadaPreview: {
    width: "100%",
    height: 140,
    borderRadius: radii.card,
    ...continuousCorner,
    marginBottom: 10,
  },
  portadaBotones: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  portadaBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  portadaBotonTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  portadaQuitar: {
    width: 44,
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
  },
  contador: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: -10,
    marginBottom: 12,
  },
});
