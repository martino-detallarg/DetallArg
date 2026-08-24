import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useTaller } from "../data/TallerContext";
import { colors, fonts } from "../theme";

const TAMANO_LOGO = 96;

export default function EditarTallerModal({ visible, onClose }) {
  const { nombreTaller, logoTaller, actualizarTaller } = useTaller();
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState(null);
  // Foto recién elegida en este modal (uri local + mimeType real, necesario
  // para decidir la extensión/contentType al subir) — null si no se tocó el
  // logo, para no volver a subir nada si el usuario solo edita el nombre.
  const [logoNuevo, setLogoNuevo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setNombre(nombreTaller);
      setLogo(logoTaller);
      setLogoNuevo(null);
      setError(null);
    }
  }, [visible, nombreTaller, logoTaller]);

  async function handleElegirLogo() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setLogo(asset.uri);
      setLogoNuevo({ uri: asset.uri, mimeType: asset.mimeType });
    }
  }

  async function handleGuardar() {
    setCargando(true);
    setError(null);
    try {
      const cambios = { nombre: nombre.trim() };
      if (logoNuevo) cambios.logo = logoNuevo;
      await actualizarTaller(cambios);
      onClose();
    } catch (err) {
      setError("No se pudieron guardar los cambios. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flexUno}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
          <WizardHeader titulo="Editar Mi Taller" paso={1} totalPasos={1} onAtras={onClose} />

          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.logoBox} onPress={handleElegirLogo} activeOpacity={0.8}>
              {logo ? (
                <Image source={{ uri: logo }} style={styles.logoImagen} resizeMode="cover" />
              ) : (
                <Ionicons name="storefront-outline" size={36} color={colors.accentLight} />
              )}
              <View style={styles.logoEditIcono}>
                <Ionicons name="camera-outline" size={16} color={colors.bg} />
              </View>
            </TouchableOpacity>
            <Text style={styles.logoAyuda}>Tocá el logo para cambiarlo</Text>

            <Input
              label="Nombre del taller"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: DetallArg Detailing"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.boton}>
              <Button
                title="Guardar cambios"
                onPress={handleGuardar}
                disabled={nombre.trim() === ""}
                loading={cargando}
              />
            </View>
            <View style={styles.botonCancelar}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
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
  flexUno: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoBox: {
    width: TAMANO_LOGO,
    height: TAMANO_LOGO,
    borderRadius: TAMANO_LOGO / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    overflow: "hidden",
  },
  logoImagen: {
    width: "100%",
    height: "100%",
  },
  logoEditIcono: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoAyuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
    marginBottom: 16,
  },
  error: {
    alignSelf: "stretch",
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginTop: 4,
  },
  boton: {
    alignSelf: "stretch",
    marginTop: 12,
  },
  botonCancelar: {
    alignSelf: "stretch",
    marginTop: 10,
  },
});
