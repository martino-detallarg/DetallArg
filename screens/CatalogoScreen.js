import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import ScreenHeader from "../components/ScreenHeader";
import Input from "../components/Input";
import { useServicios } from "../data/ServicioContext";
import { useCatalogo } from "../data/CatalogoContext";
import { useTaller } from "../data/TallerContext";
import { PLANTILLAS_CATALOGO } from "../data/plantillasCatalogo";
import { formatearDuracion } from "../utils/formato";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../theme";

function formatearNumero(numero) {
  return Math.round(numero || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Pide una foto de la librería del celu y la devuelve como data URI en
// base64 — así queda embebida directo en el HTML del PDF sin depender de
// que el file:// local siga siendo accesible más adelante.
async function elegirFotoBase64() {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) return null;

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.5,
    base64: true,
  });

  if (resultado.canceled) return null;
  const asset = resultado.assets[0];
  if (!asset.base64) return null;
  return `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;
}

function armarHtmlServicio({ servicio, plantilla, fotos, taller }) {
  const paleta = PLANTILLAS_CATALOGO[plantilla] ?? PLANTILLAS_CATALOGO.plantilla1;
  const contacto = [taller.correo, taller.telefono, taller.web].filter(Boolean).join(" &middot; ") || "No especificado";

  const fotosHtml = fotos
    .map(
      (par) => `
        <div class="par-fotos">
          <div class="foto"><span>Antes</span>${par.antes ? `<img src="${par.antes}" />` : ""}</div>
          <div class="foto"><span>Después</span>${par.despues ? `<img src="${par.despues}" />` : ""}</div>
        </div>
      `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; background: ${paleta.colorFondo}; color: ${paleta.colorTexto}; margin: 0; padding: 36px; }
          .logo { width: 72px; height: 72px; border-radius: 36px; object-fit: cover; margin-bottom: 12px; }
          h1 { color: ${paleta.colorPrimario}; margin: 0 0 4px; font-size: 24px; }
          .ubicacion { color: ${paleta.colorTexto}; opacity: 0.7; margin: 0 0 24px; font-size: 13px; }
          h2 { color: ${paleta.colorPrimario}; font-size: 19px; margin: 0 0 8px; border-bottom: 2px solid ${paleta.colorPrimario}; padding-bottom: 8px; }
          .descripcion { font-size: 14px; line-height: 1.5; margin: 12px 0; }
          .datos { margin-top: 20px; font-size: 13px; line-height: 1.9; }
          .datos strong { color: ${paleta.colorPrimario}; }
          .par-fotos { display: flex; gap: 12px; margin-top: 16px; }
          .foto { flex: 1; }
          .foto span { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; margin-bottom: 6px; }
          .foto img { width: 100%; border-radius: 8px; }
        </style>
      </head>
      <body>
        ${taller.logo ? `<img class="logo" src="${taller.logo}" />` : ""}
        <h1>${taller.nombre}</h1>
        <p class="ubicacion">${taller.ubicacion || "Ubicación no cargada"}</p>

        <h2>${servicio.nombre}</h2>
        <p class="descripcion">${servicio.descripcion || ""}</p>

        <div class="datos">
          <p><strong>Tiempo estimado:</strong> ${formatearDuracion(servicio.duracionValor, servicio.duracionUnidad)}</p>
          <p><strong>Precio:</strong> ${taller.monedaCobro} ${formatearNumero(servicio.precio)}</p>
          <p><strong>Forma de trabajo:</strong> ${taller.formaTrabajo || "No especificado"}</p>
          <p><strong>Contacto:</strong> ${contacto}</p>
        </div>

        ${fotosHtml}
      </body>
    </html>
  `;
}

function ItemCatalogo({ item, servicio, taller, onActualizar }) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);

  async function handleAgregarFotos() {
    const antes = await elegirFotoBase64();
    if (!antes) return;
    const despues = await elegirFotoBase64();
    if (!despues) return;
    onActualizar({ fotos: [...item.fotos, { antes, despues }] });
  }

  async function handleGenerarPdf() {
    setError(null);
    setGenerando(true);
    try {
      const html = armarHtmlServicio({
        servicio,
        plantilla: item.plantilla ?? "plantilla1",
        fotos: item.fotos,
        taller,
      });
      const { uri } = await Print.printToFileAsync({ html });
      const disponible = await Sharing.isAvailableAsync();
      if (disponible) {
        await Sharing.shareAsync(uri);
      }
    } catch (err) {
      setError("No se pudo generar el PDF. Probá de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <View style={styles.item}>
      <Text style={styles.itemNombre}>{servicio.nombre}</Text>
      <Text style={styles.itemPrecio}>
        {taller.monedaCobro} {formatearNumero(servicio.precio)} · {formatearDuracion(servicio.duracionValor, servicio.duracionUnidad)}
      </Text>

      <Text style={styles.itemLabel}>Plantilla</Text>
      <View style={styles.plantillaChips}>
        {Object.entries(PLANTILLAS_CATALOGO).map(([clave, datos]) => {
          const activa = (item.plantilla ?? "plantilla1") === clave;
          return (
            <TouchableOpacity
              key={clave}
              style={[styles.plantillaChip, activa && styles.plantillaChipActiva]}
              onPress={() => onActualizar({ plantilla: clave })}
              activeOpacity={0.85}
            >
              <View style={[styles.swatch, { backgroundColor: datos.colorPrimario }]} />
              <Text style={[styles.plantillaChipTexto, activa && styles.plantillaChipTextoActiva]}>
                {datos.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.fotosBoton} onPress={handleAgregarFotos} activeOpacity={0.85}>
        <Ionicons name="images-outline" size={16} color={colors.accentLight} />
        <Text style={styles.fotosBotonTexto}>
          Agregar fotos antes/después {item.fotos.length > 0 ? `(${item.fotos.length})` : ""}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.pdfBoton, generando && styles.pdfBotonDeshabilitado]}
        onPress={handleGenerarPdf}
        disabled={generando}
        activeOpacity={0.85}
      >
        <Ionicons name="document-text-outline" size={16} color={colors.bg} />
        <Text style={styles.pdfBotonTexto}>{generando ? "Generando..." : "Generar PDF"}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CatalogoScreen({ navigation }) {
  const { getServicioById } = useServicios();
  const { itemsCatalogo, actualizarItemCatalogo, tallerFormaTrabajo, tallerMonedaCobro, actualizarDatosOperativos } =
    useCatalogo();
  const { nombreTaller, logoTaller, misDatos } = useTaller();

  const taller = {
    nombre: nombreTaller,
    logo: logoTaller,
    ubicacion: misDatos.ubicacion,
    correo: misDatos.correo,
    telefono: misDatos.telefono,
    web: misDatos.web,
    formaTrabajo: tallerFormaTrabajo,
    monedaCobro: tallerMonedaCobro,
  };

  const itemsConServicio = itemsCatalogo
    .map((item) => ({ item, servicio: getServicioById(item.servicioId) }))
    .filter(({ servicio }) => servicio);

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Catálogo</Text>

        <View style={styles.datosOperativos}>
          <Input
            label="Forma de trabajo"
            value={tallerFormaTrabajo}
            onChangeText={(texto) => actualizarDatosOperativos({ formaTrabajo: texto })}
            placeholder="Ej: En el taller / A domicilio / Ambos"
          />
          <Input
            label="Moneda de cobro"
            value={tallerMonedaCobro}
            onChangeText={(texto) => actualizarDatosOperativos({ monedaCobro: texto })}
            placeholder="Ej: ARS $"
          />
        </View>

        {itemsConServicio.length === 0 ? (
          <Text style={styles.vacio}>Todavía no exportaste ningún servicio desde Mis Servicios.</Text>
        ) : (
          itemsConServicio.map(({ item, servicio }) => (
            <ItemCatalogo
              key={item.servicioId}
              item={item}
              servicio={servicio}
              taller={taller}
              onActualizar={(cambios) => actualizarItemCatalogo(item.servicioId, cambios)}
            />
          ))
        )}
      </ScrollView>
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
    paddingBottom: 60,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  datosOperativos: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 20,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    marginBottom: 14,
  },
  itemNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  itemPrecio: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  itemLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  plantillaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  plantillaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  plantillaChipActiva: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDark,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  plantillaChipTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  plantillaChipTextoActiva: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
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
    backgroundColor: colors.surface2,
    marginBottom: 10,
    ...shadowSubtle,
  },
  fotosBotonTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accentLight,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginBottom: 8,
    textAlign: "center",
  },
  pdfBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accent,
  },
  pdfBotonDeshabilitado: {
    backgroundColor: colors.accentDark,
  },
  pdfBotonTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.bg,
  },
});
