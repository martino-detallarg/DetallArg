import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import EstadoCarga from "../components/EstadoCarga";
import { useCatalogo, construirOrdenCompletoCatalogo } from "../data/CatalogoContext";
import { useServicios } from "../data/ServicioContext";
import { useTaller } from "../data/TallerContext";
import { PLANTILLAS_CATALOGO } from "../data/plantillasCatalogo";
import { construirHtmlCatalogoCompleto, construirHtmlFicha, generarYCompartirPdf } from "../utils/catalogoPdf";
import { formatearPesos, formatearDuracion } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Confirmación envuelta en Promise para poder "esperar" a que el usuario
// toque "Elegir foto" antes de abrir la galería, mismo criterio que un
// window.confirm pero con el Alert nativo de RN.
function confirmarConAlert(titulo, mensaje) {
  return new Promise((resolve) => {
    Alert.alert(titulo, mensaje, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Elegir foto", onPress: () => resolve(true) },
    ]);
  });
}

// Plantilla base del estilo elegido en el Editor de Catálogo con el acento
// que el taller haya tocado en la paleta pisado encima (spread simple, el
// resto de la plantilla queda igual) — un solo estilo para todo el
// catálogo y cada ficha individual, ya no uno por servicio.
function obtenerPlantillaActiva(configuracionCatalogo) {
  return { ...PLANTILLAS_CATALOGO[configuracionCatalogo.estiloBase], colorAcento: configuracionCatalogo.colorAcento };
}

function ItemCatalogoCard({ item, servicio, onQuitar, onAgregarFotos, onGenerarFicha, generando }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderTexto}>
          <Text style={styles.itemNombre} numberOfLines={1}>
            {servicio.nombre}
          </Text>
          <Text style={styles.itemPrecio}>
            {formatearPesos(servicio.precio)} · {formatearDuracion(servicio.duracionValor, servicio.duracionUnidad)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.quitarBoton}
          onPress={onQuitar}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>

      {item.fotos.length > 0 && (
        <Text style={styles.fotosContador}>
          {item.fotos.length} {item.fotos.length === 1 ? "par de fotos cargado" : "pares de fotos cargados"}
        </Text>
      )}

      <View style={styles.itemBotones}>
        <TouchableOpacity style={styles.fotosBoton} onPress={onAgregarFotos} activeOpacity={0.85}>
          <Ionicons name="images-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.fotosBotonTexto}>Agregar fotos antes/después</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemBotonGenerar}>
        <Button
          title="Generar ficha individual"
          variant="secondary"
          onPress={onGenerarFicha}
          loading={generando}
        />
      </View>
    </View>
  );
}

export default function CatalogoScreen({ navigation }) {
  const {
    itemsCatalogo,
    tallerFormaTrabajo,
    tallerMonedaCobro,
    configuracionCatalogo,
    quitarDelCatalogo,
    actualizarItemCatalogo,
    actualizarDatosOperativos,
  } = useCatalogo();
  const { servicios, cargandoServicios, errorCargaServicios, recargarServicios, getServicioById } = useServicios();
  const { nombreTaller, logoTaller, misDatos } = useTaller();

  // "completo" mientras se genera el catálogo entero, o el servicioId de la
  // ficha individual que se está generando — así cada botón muestra su
  // propio loading sin bloquear el resto de la pantalla.
  const [generando, setGenerando] = useState(null);

  const taller = { nombreTaller, logoTaller, misDatos };
  const datosOperativos = { formaTrabajo: tallerFormaTrabajo, monedaCobro: tallerMonedaCobro };

  async function handleAgregarFotos(servicioId) {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;

    const quiereAntes = await confirmarConAlert("Foto de ANTES", "Elegí la foto que muestra el estado ANTES del servicio.");
    if (!quiereAntes) return;
    const resultadoAntes = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (resultadoAntes.canceled) return;

    const quiereDespues = await confirmarConAlert("Foto de DESPUÉS", "Ahora elegí la foto del estado DESPUÉS del servicio.");
    if (!quiereDespues) return;
    const resultadoDespues = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (resultadoDespues.canceled) return;

    const item = itemsCatalogo.find((i) => i.servicioId === servicioId);
    const fotos = [
      ...(item?.fotos ?? []),
      { antes: resultadoAntes.assets[0].uri, despues: resultadoDespues.assets[0].uri },
    ];
    actualizarItemCatalogo(servicioId, { fotos });
  }

  async function handleGenerarFicha(item, servicio) {
    setGenerando(servicio.id);
    try {
      const html = construirHtmlFicha(servicio, taller, datosOperativos, obtenerPlantillaActiva(configuracionCatalogo), item.fotos);
      await generarYCompartirPdf(html, `${servicio.nombre} - Ficha.pdf`);
    } catch (err) {
      Alert.alert("No se pudo generar el PDF", "Probá de nuevo en unos segundos.");
    } finally {
      setGenerando(null);
    }
  }

  async function handleGenerarCatalogoCompleto() {
    setGenerando("completo");
    try {
      // Filtrado por serviciosOcultos y orden por ordenServicios ANTES de
      // pasarlo a construirHtmlCatalogoCompleto — a propósito acá y no
      // adentro de catalogoPdf.js, que no debe conocer configuracionCatalogo.
      const idsVisiblesOrdenados = construirOrdenCompletoCatalogo(
        itemsCatalogo,
        configuracionCatalogo.ordenServicios
      ).filter((servicioId) => !configuracionCatalogo.serviciosOcultos.includes(servicioId));
      const itemsParaPdf = idsVisiblesOrdenados
        .map((servicioId) => itemsCatalogo.find((item) => item.servicioId === servicioId))
        .filter(Boolean);

      const html = construirHtmlCatalogoCompleto(
        itemsParaPdf,
        servicios,
        taller,
        datosOperativos,
        obtenerPlantillaActiva(configuracionCatalogo),
        {
          fotoPortada: configuracionCatalogo.fotoPortada,
          textoLibre1: configuracionCatalogo.textoLibre1,
          textoLibre2: configuracionCatalogo.textoLibre2,
        }
      );
      await generarYCompartirPdf(html, `${nombreTaller} - Catálogo.pdf`);
    } catch (err) {
      Alert.alert("No se pudo generar el PDF", "Probá de nuevo en unos segundos.");
    } finally {
      setGenerando(null);
    }
  }

  const itemsConServicio = itemsCatalogo
    .map((item) => ({ item, servicio: getServicioById(item.servicioId) }))
    .filter(({ servicio }) => !!servicio);

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <EstadoCarga cargando={cargandoServicios} error={errorCargaServicios} onReintentar={recargarServicios}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>Catálogo</Text>

          <View style={styles.miniForm}>
            <Input
              label="Forma de trabajo"
              value={tallerFormaTrabajo}
              onChangeText={(v) => actualizarDatosOperativos({ formaTrabajo: v })}
              placeholder="Ej: A domicilio y en el local"
            />
            <Input
              label="Moneda de cobro"
              value={tallerMonedaCobro}
              onChangeText={(v) => actualizarDatosOperativos({ monedaCobro: v })}
              placeholder="Ej: ARS $"
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={styles.personalizarBoton}
            onPress={() => navigation.navigate("EditorCatalogo")}
            activeOpacity={0.85}
          >
            <View style={[styles.personalizarSwatch, { backgroundColor: obtenerPlantillaActiva(configuracionCatalogo).colorAcento }]} />
            <View style={styles.personalizarTextos}>
              <Text style={styles.personalizarTitulo}>Personalizar catálogo</Text>
              <Text style={styles.personalizarSubtitulo}>
                {PLANTILLAS_CATALOGO[configuracionCatalogo.estiloBase].nombre}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.botonCompleto}>
            <Button
              title="Generar catálogo completo"
              onPress={handleGenerarCatalogoCompleto}
              disabled={itemsCatalogo.length === 0}
              loading={generando === "completo"}
            />
          </View>

          <View style={styles.separador} />

          {itemsConServicio.length === 0 ? (
            <Text style={styles.vacio}>Todavía no exportaste ningún servicio desde Mis Servicios.</Text>
          ) : (
            itemsConServicio.map(({ item, servicio }) => (
              <ItemCatalogoCard
                key={item.servicioId}
                item={item}
                servicio={servicio}
                onQuitar={() => quitarDelCatalogo(item.servicioId)}
                onAgregarFotos={() => handleAgregarFotos(item.servicioId)}
                onGenerarFicha={() => handleGenerarFicha(item, servicio)}
                generando={generando === servicio.id}
              />
            ))
          )}
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
  miniForm: {
    marginBottom: 4,
  },
  personalizarBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  personalizarSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  personalizarTextos: {
    flex: 1,
  },
  personalizarTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  personalizarSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  botonCompleto: {
    marginBottom: 8,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 24,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 14,
    ...shadow,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  itemHeaderTexto: {
    flex: 1,
  },
  itemNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemPrecio: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  quitarBoton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  fotosContador: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.accentLight,
    marginBottom: 10,
  },
  itemBotones: {
    marginBottom: 12,
  },
  fotosBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  fotosBotonTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  itemBotonGenerar: {},
});
