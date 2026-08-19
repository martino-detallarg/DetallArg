import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useData } from "../data/DataContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function ClienteDetalleModal({ visible, cliente, onClose }) {
  const { getAutosByClienteId, actualizarCliente, actualizarAuto } = useData();
  const [datosCliente, setDatosCliente] = useState({ nombre: "", telefono: "", direccion: "" });
  const [datosAutos, setDatosAutos] = useState([]);

  useEffect(() => {
    if (visible && cliente) {
      setDatosCliente({
        nombre: cliente.nombre ?? "",
        telefono: cliente.telefono ?? "",
        direccion: cliente.direccion ?? "",
      });
      setDatosAutos(
        getAutosByClienteId(cliente.id).map((a) => ({
          id: a.id,
          marca: a.marca ?? "",
          modelo: a.modelo ?? "",
          patente: a.patente ?? "",
          color: a.color ?? "",
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, cliente?.id]);

  if (!cliente) return null;

  function actualizarCampoAuto(id, campo, valor) {
    setDatosAutos((actuales) =>
      actuales.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  }

  function handleGuardar() {
    actualizarCliente(cliente.id, {
      nombre: datosCliente.nombre.trim(),
      telefono: datosCliente.telefono.trim(),
      direccion: datosCliente.direccion.trim(),
    });
    datosAutos.forEach((a) => {
      actualizarAuto(a.id, {
        marca: a.marca.trim(),
        modelo: a.modelo.trim(),
        patente: a.patente.trim(),
        color: a.color.trim(),
      });
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <WizardHeader titulo="Editar Cliente" paso={1} totalPasos={1} onAtras={onClose} />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Text style={styles.seccion}>Datos del cliente</Text>
            <Input
              label="Nombre y apellido"
              value={datosCliente.nombre}
              onChangeText={(v) => setDatosCliente((d) => ({ ...d, nombre: v }))}
            />
            <Input
              label="Teléfono"
              value={datosCliente.telefono}
              onChangeText={(v) => setDatosCliente((d) => ({ ...d, telefono: v }))}
              keyboardType="phone-pad"
            />
            <Input
              label="Dirección"
              value={datosCliente.direccion}
              onChangeText={(v) => setDatosCliente((d) => ({ ...d, direccion: v }))}
            />

            <Text style={styles.seccion}>Vehículos ({datosAutos.length})</Text>
            {datosAutos.length === 0 && (
              <Text style={styles.vacio}>Este cliente todavía no tiene vehículos cargados.</Text>
            )}
            {datosAutos.map((auto, indice) => (
              <View key={auto.id} style={styles.tarjetaAuto}>
                <Text style={styles.tarjetaAutoTitulo}>Vehículo {indice + 1}</Text>
                <Input
                  label="Marca"
                  value={auto.marca}
                  onChangeText={(v) => actualizarCampoAuto(auto.id, "marca", v)}
                />
                <Input
                  label="Modelo"
                  value={auto.modelo}
                  onChangeText={(v) => actualizarCampoAuto(auto.id, "modelo", v)}
                />
                <Input
                  label="Patente"
                  value={auto.patente}
                  onChangeText={(v) => actualizarCampoAuto(auto.id, "patente", v)}
                  autoCapitalize="characters"
                />
                <Input
                  label="Color"
                  value={auto.color}
                  onChangeText={(v) => actualizarCampoAuto(auto.id, "color", v)}
                />
              </View>
            ))}

            <View style={styles.boton}>
              <Button title="Guardar cambios" onPress={handleGuardar} />
            </View>
            <View style={styles.botonCancelar}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  seccion: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  vacio: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  tarjetaAuto: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
  },
  tarjetaAutoTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
    marginBottom: 10,
  },
  boton: {
    marginTop: 12,
  },
  botonCancelar: {
    marginTop: 10,
  },
});
