import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const OPCIONES = [
  { id: "hombre", etiqueta: "Hombre", icono: "man-outline" },
  { id: "mujer", etiqueta: "Mujer", icono: "woman-outline" },
];

// Mapeo { hombre: "man-outline", mujer: "woman-outline" } — reusado por
// EmpleadoModal.js y MiEquipoScreen.js para pintar el avatar guardado. Sin
// avatar elegido (null), ambos usan "person-outline" como default neutro.
export const ICONOS_SILUETA = Object.fromEntries(OPCIONES.map((o) => [o.id, o.icono]));

// Selector puramente visual del avatar de EmpleadoModal — no representa un
// dato guardado (ver el comentario en EquipoContext.js sobre por qué no hay
// campo de género). Mismo patrón de bottom-sheet que SelectorHoraModal.js.
export default function SelectorSiluetaModal({ visible, onElegir, onCerrar }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        {/* Zona "tocar afuera para cerrar", como sibling de la tarjeta (no
        como wrapper de ella) — evita anidar dos TouchableOpacity uno
        dentro del otro, que en la práctica podía robarle el toque a las
        opciones de adentro en vez de dejarlo pasar. */}
        <TouchableOpacity style={styles.fondoToque} activeOpacity={1} onPress={onCerrar} />

        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Elegir avatar</Text>

          {OPCIONES.map((opcion) => (
            <TouchableOpacity
              key={opcion.id}
              style={styles.opcion}
              onPress={() => onElegir(opcion.id)}
              activeOpacity={0.8}
            >
              <View style={styles.opcionIcono}>
                <Ionicons name={opcion.icono} size={24} color={colors.accentLight} />
              </View>
              <Text style={styles.opcionTexto}>{opcion.etiqueta}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
  },
  fondoToque: {
    flex: 1,
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    paddingBottom: 32,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 10,
  },
  opcionIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
