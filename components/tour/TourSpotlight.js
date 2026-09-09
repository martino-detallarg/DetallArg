import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import Button from "../Button";
import { useTour } from "../../data/TourContext";
import { colors, continuousCorner, fonts, radii, shadow } from "../../theme";

const PADDING_RESALTADO = 8;
const MARGEN_GLOBITO = 16;

// Overlay del tutorial guiado (ver TourAnchor.js/TourContext.js): recorta el
// área de `rect` (coordenadas de ventana, de measureInWindow) con 4
// rectángulos opacos alrededor -- más simple que una máscara SVG para un
// único agujero rectangular -- más un marco de acento sobre el límite real,
// y el globito con título/texto del paso. El globito se ubica arriba o abajo
// del área resaltada según en qué mitad de la pantalla caiga, para no
// superponerse nunca con lo que se está señalando.
export default function TourSpotlight({ rect, paso }) {
  const { avanzarTour, saltearTour } = useTour();
  const { height: altoPantalla } = useWindowDimensions();

  const area = {
    left: Math.max(0, rect.x - PADDING_RESALTADO),
    top: Math.max(0, rect.y - PADDING_RESALTADO),
    width: rect.width + PADDING_RESALTADO * 2,
    height: rect.height + PADDING_RESALTADO * 2,
  };

  const centroY = area.top + area.height / 2;
  const globitoVaArriba = centroY >= altoPantalla / 2;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => {}}>
      <View style={styles.fondo} pointerEvents="box-none">
        <View style={[styles.opaco, { top: 0, left: 0, right: 0, height: area.top }]} />
        <View style={[styles.opaco, { top: area.top + area.height, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.opaco, { top: area.top, height: area.height, left: 0, width: area.left }]} />
        <View
          style={[
            styles.opaco,
            { top: area.top, height: area.height, left: area.left + area.width, right: 0 },
          ]}
        />

        <View
          pointerEvents="none"
          style={[styles.marco, { left: area.left, top: area.top, width: area.width, height: area.height }]}
        />

        <View
          style={[
            styles.globito,
            globitoVaArriba
              ? { bottom: altoPantalla - area.top + MARGEN_GLOBITO }
              : { top: area.top + area.height + MARGEN_GLOBITO },
          ]}
        >
          <Text style={styles.globitoTitulo}>{paso.titulo}</Text>
          <Text style={styles.globitoTexto}>{paso.texto}</Text>
          <View style={styles.globitoBotones}>
            <TouchableOpacity onPress={saltearTour} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.saltarTexto}>Saltar tutorial</Text>
            </TouchableOpacity>
            <View style={styles.botonSiguiente}>
              <Button title={paso.ultimo ? "Entendido" : "Siguiente"} onPress={avanzarTour} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
  },
  opaco: {
    position: "absolute",
    backgroundColor: "rgba(4, 3, 3, 0.82)",
  },
  marco: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radii.button,
  },
  globito: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 18,
    gap: 12,
    ...shadow,
  },
  globitoTitulo: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.textPrimary,
  },
  globitoTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  globitoBotones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  saltarTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: "underline",
  },
  botonSiguiente: {
    minWidth: 140,
  },
});
