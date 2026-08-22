import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import WizardHeader from "../../components/wizard/WizardHeader";
import Button from "../../components/Button";
import DiagramaDanios from "../../components/wizard/DiagramaDanios";
import { DIAGRAMAS_POR_TIPO_VEHICULO, obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const PADDING_PANTALLA = 20;

// Pantalla 2 de la inspección: un diagrama de daños por vista, a pantalla
// completa, navegado con swipe (mismo patrón de Mis Insumos/Finanzas). El
// botón de agregar foto y el de guardar quedan fijos abajo, visibles sin
// importar en qué vista del carrusel se esté parado.
export default function InspeccionVisualStep({ datos, paso, totalPasos, onCambiar, onAtras, onFinalizar }) {
  const { width } = useWindowDimensions();
  const [vistaActiva, setVistaActiva] = useState(0);

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
    <View style={styles.pantalla}>
      <WizardHeader titulo="Inspección Visual" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

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
            />
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.puntos}>
        {vistas.map((vista, indice) => (
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
    </View>
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
