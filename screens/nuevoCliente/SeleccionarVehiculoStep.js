import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import { colors, continuousCorner, fonts, radii } from "../../theme";

export default function SeleccionarVehiculoStep({ cliente, paso, totalPasos, onAtras, onSeleccionar }) {
  const vehiculos = cliente.vehiculos;

  return (
    <View style={styles.pantalla}>
      <WizardHeader
        titulo={`Vehículo de ${cliente.nombre}`}
        paso={paso}
        totalPasos={totalPasos}
        onAtras={onAtras}
      />

      <FlatList
        data={vehiculos}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fila}
            onPress={() => onSeleccionar(item)}
            activeOpacity={0.8}
          >
            <View style={styles.filaIcono}>
              <Ionicons name="car-outline" size={20} color={colors.accentLight} />
            </View>
            <View style={styles.filaTexto}>
              <Text style={styles.filaNombre}>
                {item.marca} {item.modelo}
              </Text>
              <Text style={styles.filaSub}>
                {item.patente} · {item.color || "sin color"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>Este cliente todavía no tiene vehículos cargados.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  lista: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginTop: 10,
  },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  filaTexto: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
