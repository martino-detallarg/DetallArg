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
import { useAuth } from "../data/AuthContext";
import { mensajeErrorAuth } from "../utils/auth";
import { colors, fonts } from "../theme";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OlvidePasswordScreen({ onCodigoEnviado, onIrALogin }) {
  const { solicitarRecuperacion } = useAuth();
  const [email, setEmail] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  function validar() {
    const nuevosErrores = {};
    if (!email.trim()) {
      nuevosErrores.email = "Ingresá tu email";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      nuevosErrores.email = "El email no es válido";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleEnviarCodigo() {
    if (!validar()) return;
    setCargando(true);
    try {
      await solicitarRecuperacion(email.trim());
      onCodigoEnviado(email.trim());
    } catch (error) {
      setErrores({ general: mensajeErrorAuth(error) });
    } finally {
      setCargando(false);
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
          <Logo size={48} />
          <Text style={styles.titulo}>Recuperar contraseña</Text>
          <Text style={styles.subtitulo}>
            Te vamos a enviar un código de 6 dígitos a tu email
          </Text>
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

        {errores.general && <Text style={styles.errorGeneral}>{errores.general}</Text>}

        <Button title="Enviar código" onPress={handleEnviarCodigo} loading={cargando} />

        <TouchableOpacity style={styles.linkLogin} onPress={onIrALogin}>
          <Text style={styles.textoLinkAccento}>Volver a iniciar sesión</Text>
        </TouchableOpacity>
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
    marginBottom: 28,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 14,
    textAlign: "center",
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  errorGeneral: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 12,
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
