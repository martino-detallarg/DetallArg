import { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const { width: ANCHO_PANTALLA } = Dimensions.get("window");

function Opcion({ icono, titulo, descripcion, onPress }) {
  return (
    <TouchableOpacity style={styles.opcion} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.opcionIcono}>
        <Ionicons name={icono} size={22} color={colors.accentLight} />
      </View>
      <View style={styles.opcionTexto}>
        <Text style={styles.opcionTitulo}>{titulo}</Text>
        <Text style={styles.opcionDescripcion}>{descripcion}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ClienteNuevoSubmenu({ visible, onClose, onVolver, onClienteNuevo, onVehiculoNuevo }) {
  const desplazamiento = useRef(new Animated.Value(ANCHO_PANTALLA)).current;

  // A diferencia de OpcionesNuevoModal (slide clásico desde abajo), este
  // paso entra deslizándose desde la derecha — para que se lea como "avancé
  // un paso" dentro del flujo "Cliente nuevo" y no como una pantalla nueva
  // sin relación con la anterior (bug del "combo de transición").
  useEffect(() => {
    if (visible) {
      desplazamiento.setValue(ANCHO_PANTALLA);
      Animated.timing(desplazamiento, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <Animated.View style={[styles.contenedor, { transform: [{ translateX: desplazamiento }] }]}>
          <View style={styles.migas}>
            <TouchableOpacity onPress={onVolver} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.migasTexto}>Nuevo › Cliente nuevo</Text>
          </View>

          <Text style={styles.titulo}>Cliente nuevo</Text>
          <Text style={styles.subtitulo}>¿Es un cliente nuevo o le sumás un vehículo a uno existente?</Text>

          <Opcion
            icono="person-circle-outline"
            titulo="Todavía no lo tengo cargado"
            descripcion="Cargar sus datos y los de su primer vehículo"
            onPress={onClienteNuevo}
          />
          <Opcion
            icono="car-outline"
            titulo="Vehículo nuevo"
            descripcion="Sumarle un vehículo a un cliente que ya tenés cargado"
            onPress={onVehiculoNuevo}
          />

          <Button title="Cancelar" variant="secondary" onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 12,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  migas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  migasTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 12,
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
    flex: 1,
  },
  opcionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  opcionDescripcion: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
