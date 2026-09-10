import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { captureRef } from "react-native-view-shot";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Button from "../../components/Button";
import DiagramaDanios from "../../components/wizard/DiagramaDanios";
import MedicionMicronesModal, { resumenMedicionMicrones } from "../../components/wizard/MedicionMicronesModal";
import { PANEL_IDS as ZONAS_IDS, PANEL_LABELS as ZONAS_LABELS } from "../../components/wizard/DamageDiagram";
import TourAnchor from "../../components/tour/TourAnchor";
import { DIAGRAMAS_POR_TIPO_VEHICULO, obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const PADDING_PANTALLA = 20;

// Pantalla 2 de la inspección: un diagrama de daños por vista, a pantalla
// completa, navegado con swipe (mismo patrón de Mis Insumos/Finanzas). El
// botón de agregar foto y el de continuar quedan fijos abajo, visibles sin
// importar en qué vista del carrusel se esté parado.
export default function InspeccionVisualStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const { width } = useWindowDimensions();
  const [vistaActiva, setVistaActiva] = useState(0);
  const [capturando, setCapturando] = useState(false);
  const [modalMicronesVisible, setModalMicronesVisible] = useState(false);
  // Un ref por vista (no uno solo): el carrusel de abajo mantiene montadas
  // TODAS las páginas a la vez (ScrollView, a diferencia de FlatList, no
  // virtualiza), así que al tocar "Continuar" se puede capturar cada
  // diagrama sin importar cuál está visible en pantalla en ese momento.
  const refsDiagrama = useRef({});

  const anchoDiagrama = width - PADDING_PANTALLA * 2;
  const claveDiagrama = obtenerClaveDiagrama(datos);
  const diagramaVehiculo = DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama];
  // Las vistas del carrusel salen del registro de diagramas del vehículo
  // elegido (una página por vista real, ej. Frente/Atrás/Lateral/Cenital de
  // Auto Coupé). Si todavía no hay un diagrama específico para ese
  // vehículo, cae a una sola vista genérica (Frente) — el carrusel en sí ya
  // soporta cualquier cantidad de vistas, para sumar más alcanza con
  // registrarlas en components/diagrams/vehicles.
  const vistas = diagramaVehiculo
    ? Object.entries(diagramaVehiculo.vistas).map(([id, v]) => ({ id, etiqueta: v.etiqueta }))
    : [{ id: "frente", etiqueta: "Frente" }];
  const puedeAgregarFoto = Object.keys(datos.danios).length > 0;
  // Mismo dato de origen que DiagramaDanios.js usa por vista (panelIds/
  // panelLabels propios de la carrocería, o el genérico de DamageDiagram si
  // todavía no hay diagrama propio) — para la sección de espesor de pintura
  // "Por panel", ver MedicionMicronesModal.js.
  const panelesPorVista = vistas.map((vista) => {
    const diagramaVista = diagramaVehiculo?.vistas?.[vista.id];
    return {
      vistaId: vista.id,
      etiqueta: vista.etiqueta,
      panelIds: diagramaVista?.panelIds ?? ZONAS_IDS,
      panelLabels: diagramaVista?.panelLabels ?? ZONAS_LABELS,
    };
  });
  // Moto tiene subdivisiones que todavía no tienen diagrama propio
  // (Naked/Sport/Motocross, por ahora — ver components/diagrams/vehicles).
  // Para esas, en vez de caer al genérico de Frente (que tiene forma de
  // auto y quedaría roto), se muestra una tarjeta "Próximamente".
  const esMotoSinDiagrama = datos.tipoVehiculo === "moto" && !diagramaVehiculo;

  function handleCambiarZona(zonaId, datosZona) {
    const nuevos = { ...datos.danios };
    if (datosZona) {
      nuevos[zonaId] = datosZona;
    } else {
      delete nuevos[zonaId];
    }
    onCambiar({ danios: nuevos });
  }

  async function handleAgregarFotoDano() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!resultado.canceled) {
      const nuevasFotos = resultado.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType }));
      onCambiar({ fotosDano: [...datos.fotosDano, ...nuevasFotos] });
    }
  }

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setVistaActiva(indice);
  }

  // Convierte cada diagrama ya cargado a una imagen (para el PDF de
  // conformidad, ver FirmaConformidadStep.js) justo al avanzar — así queda
  // "tal como quedó cargada en el check-in", con los daños marcados en ese
  // momento. Si la captura de una vista puntual falla, esa vista sigue sin
  // imagen en el PDF (se ignora, no bloquea el check-in por un problema de
  // captura).
  async function handleContinuar() {
    setCapturando(true);
    const capturas = [];
    for (const vista of vistas) {
      const ref = refsDiagrama.current[vista.id];
      if (!ref) continue;
      try {
        const imagen = await captureRef(ref, { format: "png", quality: 0.9, result: "data-uri" });
        capturas.push({ vistaId: vista.id, etiqueta: vista.etiqueta, imagen });
      } catch (err) {
        // Sin imagen para esta vista puntual — utils/conformidadPdf.js
        // simplemente no dibuja el <img> si imagen es null.
      }
    }
    setCapturando(false);
    onContinuar(capturas);
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Inspección Visual" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      {/* El carrusel de vistas de abajo ya usa swipe horizontal para navegar
      entre Frente/Atrás/Lateral/etc — SwipeVolver comparte esa misma franja
      de gestos. En la práctica no debería notarse (el usuario arrastra desde
      el centro para pasar de vista, no desde el borde), pero si algún día se
      siente en conflicto en el borde izquierdo, achicar ANCHO_BORDE en
      SwipeVolver.js o sacarlo de este paso puntual. */}
      <SwipeVolver onAtras={onAtras}>
      <TourAnchor id="trabajoNuevo.inspeccionVisual">
        <View style={styles.diagramaArea}>
          {esMotoSinDiagrama ? (
            <View style={styles.proximamente}>
              <Text style={styles.proximamenteTitulo}>Próximamente</Text>
              <Text style={styles.proximamenteTexto}>
                Todavía estamos preparando el diagrama de esta categoría de moto. Mientras tanto podés sacarle una
                foto al daño y guardar el trabajo igual.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollFin}
                style={styles.pager}
              >
                {vistas.map((vista) => (
                  <ScrollView
                    key={vista.id}
                    style={{ width }}
                    contentContainerStyle={styles.pagina}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.vistaTitulo}>Vista: {vista.etiqueta}</Text>
                    <DiagramaDanios
                      claveVehiculo={claveDiagrama}
                      vista={vista.id}
                      danios={datos.danios}
                      onCambiarZona={handleCambiarZona}
                      ancho={anchoDiagrama}
                      tipoVehiculo={datos.tipoVehiculo}
                      diagramaRef={(el) => {
                        refsDiagrama.current[vista.id] = el;
                      }}
                    />
                  </ScrollView>
                ))}
              </ScrollView>

              <View style={styles.puntos}>
                {vistas.map((vista, indice) => (
                  <View key={vista.id} style={[styles.punto, indice === vistaActiva && styles.puntoActivo]} />
                ))}
              </View>
            </>
          )}
        </View>
      </TourAnchor>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={[styles.fotoDanoBox, !puedeAgregarFoto && styles.fotoDanoBoxDeshabilitado]}
          onPress={puedeAgregarFoto ? handleAgregarFotoDano : undefined}
          disabled={!puedeAgregarFoto}
          activeOpacity={0.8}
        >
          <Text style={[styles.fotoDanoTexto, !puedeAgregarFoto && styles.fotoDanoTextoDeshabilitado]}>
            + Agregar foto del daño
          </Text>
        </TouchableOpacity>

        {datos.fotosDano.length > 0 && (
          <Text style={styles.fotosContador}>
            {datos.fotosDano.length} foto{datos.fotosDano.length > 1 ? "s" : ""} agregada
            {datos.fotosDano.length > 1 ? "s" : ""}
          </Text>
        )}

        {/* Espesor de pintura (opcional): fila resumen que abre
        MedicionMicronesModal.js aparte — en modo "Por panel" la lista puede
        tener una fila por panel (12+ en algunas carrocerías), y esta franja
        fija de abajo no tiene scroll propio, así que no puede vivir inline. */}
        <TouchableOpacity
          style={styles.micronesFila}
          onPress={() => setModalMicronesVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.micronesTextos}>
            <Text style={styles.micronesTitulo}>Espesor de pintura (opcional)</Text>
            <Text style={styles.micronesSubtitulo}>{resumenMedicionMicrones(datos.medicionMicrones)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.boton}>
          <Button title="Continuar" onPress={handleContinuar} loading={capturando} disabled={capturando} />
        </View>
      </View>
      </SwipeVolver>

      <MedicionMicronesModal
        visible={modalMicronesVisible}
        panelesPorVista={panelesPorVista}
        medicion={datos.medicionMicrones}
        onCambiar={(medicionMicrones) => onCambiar({ medicionMicrones })}
        onCerrar={() => setModalMicronesVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  diagramaArea: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  pagina: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  vistaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  puntoActivo: {
    width: 18,
    backgroundColor: colors.accent,
  },
  proximamente: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: PADDING_PANTALLA + 20,
    paddingBottom: 40,
  },
  proximamenteTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  proximamenteTexto: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  acciones: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 20,
  },
  fotoDanoBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderAccent,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingVertical: 14,
    alignItems: "center",
  },
  fotoDanoBoxDeshabilitado: {
    borderColor: colors.borderSubtle,
    opacity: 0.5,
  },
  fotoDanoTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentLight,
  },
  fotoDanoTextoDeshabilitado: {
    color: colors.textMuted,
  },
  fotosContador: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  micronesFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
    marginTop: 12,
  },
  micronesTextos: {
    flex: 1,
  },
  micronesTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  micronesSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  boton: {
    marginTop: 14,
  },
});
