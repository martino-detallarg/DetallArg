import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import Input from "../../components/Input";
import { useClientes } from "../../data/ClienteContext";
import { colors, continuousCorner, fonts, radii } from "../../theme";

export default function SeleccionarClienteStep({ titulo, paso, totalPasos, onAtras, onSeleccionar }) {
  const { clientes } = useClientes();
  const [busqueda, setBusqueda] = useState("");

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <View style={styles.pantalla}>
      <WizardHeader titulo={titulo} paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <View style={styles.buscadorWrap}>
        <Input
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const cantidadAutos = item.vehiculos.length;
          return (
            <TouchableOpacity
              style={styles.fila}
              onPress={() => onSeleccionar(item)}
              activeOpacity={0.8}
            >
              <View style={styles.filaIcono}>
                <Ionicons name="person-outline" size={20} color={colors.accentLight} />
              </View>
              <View style={styles.filaTexto}>
                <Text style={styles.filaNombre}>{item.nombre}</Text>
                <Text style={styles.filaSub}>
                  {item.telefono} · {cantidadAutos} vehículo{cantidadAutos === 1 ? "" : "s"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vacio}>No encontramos clientes con ese nombre.</Text>
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
  buscadorWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  lista: {
    paddingHorizontal: 20,
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
