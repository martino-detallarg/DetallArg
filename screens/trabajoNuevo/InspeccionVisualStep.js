import { useState } from "react";
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
import WizardHeader from "../../components/wizard/WizardHeader";
import Button from "../../components/Button";
import DiagramaDanios from "../../components/wizard/DiagramaDanios";
import { obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const PADDING_PANTALLA = 20;

// Vistas del check-in visual, en el orden en que se muestran en el
// carrusel. Por ahora solo está lista "Frente" (el diagrama genérico o el
// de la carrocería específica, según corresponda); Techo/Izquierda/
// Derecha/Atrás se suman acá cuando estén sus diagramas — el carrusel de
// abajo (swipe + puntitos) ya está armado para cualquier cantidad de vistas.
const VISTAS_INSPECCION = [{ id: "frente", etiqueta: "Frente" }];

// Pantalla 2 de la inspección: un diagrama de daños por vista, a pantalla
// completa, navegado con swipe (mismo patrón de Mis Insumos/Finanzas). El
// botón de agregar foto y el de guardar quedan fijos abajo, visibles sin
// importar en qué vista del carrusel se esté parado.
export default function InspeccionVisualStep({ datos, paso, totalPasos, onCambiar, onAtras, onFinalizar }) {
  const { width } = useWindowDimensions();
  const [vistaActiva, setVistaActiva] = useState(0);

  const anchoDiagrama = width - PADDING_PANTALLA * 2;
  const claveDiagrama = obtenerClaveDiagrama(datos);
  const puedeAgregarFoto = Object.keys(datos.danios).length > 0;

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
      onCambiar({ fotosDano: [...datos.fotosDano, ...resultado.assets.map((a) => a.uri)] });
    }
  }

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setVistaActiva(indice);
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Inspección Visual" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollFin}
        style={styles.pager}
      >
        {VISTAS_INSPECCION.map((vista) => (
          <ScrollView
            key={vista.id}
            style={{ width }}
            contentContainerStyle={styles.pagina}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.vistaTitulo}>Vista: {vista.etiqueta}</Text>
            <DiagramaDanios
              claveVehiculo={claveDiagrama}
              danios={datos.danios}
              onCambiarZona={handleCambiarZona}
              ancho={anchoDiagrama}
            />
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.puntos}>
        {VISTAS_INSPECCION.map((vista, indice) => (
          <View key={vista.id} style={[styles.punto, indice === vistaActiva && styles.puntoActivo]} />
        ))}
      </View>

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

        <View style={styles.boton}>
          <Button title="Finalizar y Guardar Trabajo" onPress={onFinalizar} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
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
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  boton: {
    marginTop: 14,
  },
});
