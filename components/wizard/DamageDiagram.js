import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, continuousCorner, fonts, radii } from "../../theme";

// Tipos de daño previo disponibles, cada uno con su color para identificarlo
// de un vistazo tanto en el diagrama como en la lista resumen.
export const TIPOS_DANIO = {
  rayon: { etiqueta: "Rayón", color: "#D9C441" },
  abolladura: { etiqueta: "Abolladura", color: "#D9843E" },
  oxido: { etiqueta: "Óxido", color: "#8A5A34" },
  repintado: { etiqueta: "Repintado", color: "#8B5FC4" },
};

const ZONAS = [
  { id: "frente", etiqueta: "Frente" },
  { id: "izquierdo", etiqueta: "Izq." },
  { id: "techo", etiqueta: "Techo" },
  { id: "derecho", etiqueta: "Der." },
  { id: "atras", etiqueta: "Atrás" },
];

// `danios` es un mapa { zonaId: tipoDanio }, no un array de zonas marcadas:
// así cada zona guarda qué tipo de daño tiene, no solo si tiene o no.
export default function DamageDiagram({ danios, onCambiarZona }) {
  const [zonaActiva, setZonaActiva] = useState(null);

  function handleTocarZona(id) {
    setZonaActiva((actual) => (actual === id ? null : id));
  }

  function handleElegirTipo(tipo) {
    onCambiarZona(zonaActiva, tipo);
    setZonaActiva(null);
  }

  const zonaActivaInfo = ZONAS.find((z) => z.id === zonaActiva);
  const zonasConDanio = ZONAS.filter((z) => danios[z.id]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.auto}>
        <Zona
          id="frente"
          etiqueta="Frente"
          tipo={danios.frente}
          onPress={handleTocarZona}
          style={styles.zonaFrente}
        />

        <View style={styles.filaMedia}>
          <Zona
            id="izquierdo"
            etiqueta="Izq."
            tipo={danios.izquierdo}
            onPress={handleTocarZona}
            style={styles.zonaLateral}
          />
          <Zona id="techo" etiqueta="Techo" tipo={danios.techo} onPress={handleTocarZona} style={styles.techo} />
          <Zona
            id="derecho"
            etiqueta="Der."
            tipo={danios.derecho}
            onPress={handleTocarZona}
            style={styles.zonaLateral}
          />
        </View>

        <Zona id="atras" etiqueta="Atrás" tipo={danios.atras} onPress={handleTocarZona} style={styles.zonaAtras} />
      </View>

      {zonaActiva ? (
        <View style={styles.selector}>
          <Text style={styles.selectorTitulo}>{zonaActivaInfo?.etiqueta} · elegí el tipo de daño</Text>
          <View style={styles.chips}>
            {Object.entries(TIPOS_DANIO).map(([id, tipo]) => {
              const activo = danios[zonaActiva] === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.chip, activo && { backgroundColor: tipo.color, borderColor: tipo.color }]}
                  onPress={() => handleElegirTipo(id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.chipPunto, { backgroundColor: tipo.color }]} />
                  <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>{tipo.etiqueta}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.chip, !danios[zonaActiva] && styles.chipSeleccionado]}
              onPress={() => handleElegirTipo(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTexto, !danios[zonaActiva] && styles.chipTextoSeleccionado]}>
                Sin daño
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.ayuda}>Tocá un sector para elegir el tipo de daño</Text>
      )}

      {zonasConDanio.length > 0 && (
        <View style={styles.resumen}>
          <Text style={styles.resumenTitulo}>Daños registrados</Text>
          {zonasConDanio.map((zona) => {
            const tipo = TIPOS_DANIO[danios[zona.id]];
            return (
              <View key={zona.id} style={styles.resumenFila}>
                <View style={[styles.resumenPunto, { backgroundColor: tipo.color }]} />
                <Text style={styles.resumenTexto}>
                  {zona.etiqueta} — {tipo.etiqueta}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Zona({ id, etiqueta, tipo, onPress, style }) {
  const info = tipo ? TIPOS_DANIO[tipo] : null;
  return (
    <TouchableOpacity
      style={[style, info && { backgroundColor: info.color, borderColor: info.color }]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.zonaTexto, info && styles.zonaTextoMarcado]}>{etiqueta}</Text>
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
  zonaTexto: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  zonaTextoMarcado: {
    fontFamily: fonts.monoMedium,
    color: colors.textPrimary,
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
  },
  selector: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 12,
  },
  selectorTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSeleccionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  resumen: {
    width: "100%",
    marginTop: 16,
  },
  resumenTitulo: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resumenFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
  },
  resumenPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resumenTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
