import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";
import { colors, continuousCorner, fonts, radii } from "../theme";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OlvidePasswordScreen({ onIrALogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  function handleEnviar() {
    if (!email.trim()) {
      setError("Ingresá tu email");
      return;
    }
    if (!REGEX_EMAIL.test(email.trim())) {
      setError("El email no es válido");
      return;
    }
    setError(null);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <View style={styles.pantalla}>
        <StatusBar style="light" />
        <View style={styles.icono}>
          <Ionicons name="mail-outline" size={40} color={colors.accent} />
        </View>

        <Text style={[styles.titulo, styles.tituloSinMargen]}>Revisá tu email</Text>
        <Text style={styles.texto}>
          Si el email existe en nuestra base, vas a recibir instrucciones para
          restablecer tu contraseña.
        </Text>

        <Button title="Volver al login" onPress={onIrALogin} variant="secondary" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={48} />
          <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitulo}>
            Ingresá tu email y te mandamos instrucciones para restablecerla
          </Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
        />

        <Button title="Enviar instrucciones" onPress={handleEnviar} />

        <TouchableOpacity style={styles.linkLogin} onPress={onIrALogin}>
          <Text style={styles.textoLinkAccento}>Volver al login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  icono: {
    width: 72,
    height: 72,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 14,
    textAlign: "center",
  },
  tituloSinMargen: {
    marginTop: 0,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 28,
  },
  linkLogin: {
    alignSelf: "center",
    marginTop: 20,
  },
  textoLinkAccento: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentLight,
  },
});
