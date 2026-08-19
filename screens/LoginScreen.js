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
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";
import { colors, fonts } from "../theme";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ onLoginExitoso, onIrARegistro }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});

  function validar() {
    const nuevosErrores = {};
    if (!email.trim()) {
      nuevosErrores.email = "Ingresá tu email";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      nuevosErrores.email = "El email no es válido";
    }
    if (!password) {
      nuevosErrores.password = "Ingresá tu contraseña";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleIniciarSesion() {
    if (validar()) {
      onLoginExitoso();
    }
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
          <Logo size={56} />
          <Text style={styles.titulo}>Bienvenido DetallArg</Text>
          <Text style={styles.subtitulo}>Iniciá sesión en tu cuenta</Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errores.email}
        />
        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          error={errores.password}
        />

        <Button title="Iniciar sesión" onPress={handleIniciarSesion} />

        <TouchableOpacity style={styles.linkOlvido}>
          <Text style={styles.textoLinkChico}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.textoMuted}>¿No tenés cuenta? </Text>
          <TouchableOpacity onPress={onIrARegistro}>
            <Text style={styles.textoLinkAccento}>Registrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: "center",
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  linkOlvido: {
    alignSelf: "center",
    marginTop: 18,
  },
  textoLinkChico: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  textoMuted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  textoLinkAccento: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentLight,
  },
});
