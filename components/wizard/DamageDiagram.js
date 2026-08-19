import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, continuousCorner, fonts, radii } from "../../theme";

export default function DamageDiagram({ danios, onAlternar }) {
  const marcado = (id) => danios.includes(id);

  return (
    <View style={styles.contenedor}>
      <View style={styles.auto}>
        <Zona id="frente" etiqueta="Frente" marcado={marcado} onAlternar={onAlternar} style={styles.zonaFrente} />

        <View style={styles.filaMedia}>
          <Zona id="izquierdo" etiqueta="Izq." marcado={marcado} onAlternar={onAlternar} style={styles.zonaLateral} />
          <Zona id="techo" etiqueta="Techo" marcado={marcado} onAlternar={onAlternar} style={styles.techo} />
          <Zona id="derecho" etiqueta="Der." marcado={marcado} onAlternar={onAlternar} style={styles.zonaLateral} />
        </View>

        <Zona id="atras" etiqueta="Atrás" marcado={marcado} onAlternar={onAlternar} style={styles.zonaAtras} />
      </View>

      <Text style={styles.ayuda}>Tocá un sector para marcar un daño</Text>
    </View>
  );
}

function Zona({ id, etiqueta, marcado, onAlternar, style }) {
  const activo = marcado(id);
  return (
    <TouchableOpacity
      style={[style, activo && styles.zonaMarcada]}
      onPress={() => onAlternar(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.zonaTexto, activo && styles.zonaTextoMarcado]}>{etiqueta}</Text>
      {activo && <View style={styles.punto} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  auto: {
    width: 180,
    borderRadius: 32,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    overflow: "hidden",
  },
  filaMedia: {
    flexDirection: "row",
    height: 140,
  },
  zonaFrente: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
  },
  zonaAtras: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
  },
  zonaLateral: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 2,
    borderColor: "transparent",
  },
  techo: {
    flex: 1,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
  },
  zonaMarcada: {
    borderColor: colors.error,
  },
  zonaTexto: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  zonaTextoMarcado: {
    color: colors.error,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginTop: 4,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
  },
});
