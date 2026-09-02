import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fonts } from "../theme";

// Chip individual: puramente presentacional, no sabe nada de selección —
// solo dibuja según `selected` y avisa el toque. No se exporta: ningún uso
// de hoy necesita un chip suelto fuera de un ChipGroup.
function Chip({ label, selected, onPress, selectedColor }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && { backgroundColor: selectedColor, borderColor: selectedColor }]}
      onPress={onPress}
    >
      <Text style={[styles.chipTexto, selected && styles.chipTextoSeleccionado]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Grupo de chips de selección — reemplaza el bloque de estilos
// chip/chipSeleccionado/chipTexto/chipTextoSeleccionado que estaba
// duplicado igual en TipoVehiculoStep, ServicioModal, DatosServicioStep,
// MisDatosScreen y PanelPruebasPlan.
//
// A propósito no hay ningún concepto de "selección única/múltiple" acá:
// cada `option` ya trae su propio `selected` calculado por quien llama
// (igual que antes de este componente), y `onPress` solo avisa qué `value`
// se tocó — quien llama decide qué significa eso (reemplazar la selección,
// togglear un array, o togglear a null). Así conviven sin fricción el caso
// de selección única (la mayoría) y el de multi-select real (empleados
// asignados en DatosServicioStep.js).
export default function ChipGroup({ options, onPress, selectedColor = colors.accent, style }) {
  return (
    <View style={[styles.chips, style]}>
      {options.map((opcion) => (
        <Chip
          key={opcion.value}
          label={opcion.label}
          selected={opcion.selected}
          onPress={() => onPress(opcion.value)}
          selectedColor={selectedColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
});
