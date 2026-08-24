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

export default function RestablecerPasswordScreen({ email, onIrALogin }) {
  const { confirmarRecuperacion } = useAuth();
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  function validar() {
    const nuevosErrores = {};
    if (!codigo.trim()) {
      nuevosErrores.codigo = "Ingresá el código que te enviamos";
    } else if (!/^\d{6}$/.test(codigo.trim())) {
      nuevosErrores.codigo = "El código tiene 6 dígitos";
    }
    if (!password) {
      nuevosErrores.password = "Ingresá una contraseña nueva";
    } else if (password.length < 6) {
      nuevosErrores.password = "Mínimo 6 caracteres";
    }
    if (!confirmarPassword) {
      nuevosErrores.confirmarPassword = "Confirmá tu contraseña nueva";
    } else if (confirmarPassword !== password) {
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleRestablecer() {
    if (!validar()) return;
    setCargando(true);
    try {
      await confirmarRecuperacion({
        email,
        codigo: codigo.trim(),
        nuevaPassword: password,
      });
      // No hace falta navegar: al verificar el código queda una sesión
      // activa y FlujoApp (App.js) pasa solo a "app" apenas la detecta.
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
          <Text style={styles.titulo}>Ingresá el código</Text>
          <Text style={styles.subtitulo}>
            Te enviamos un código de 6 dígitos a{" "}
            <Text style={styles.textoDestacado}>{email || "tu email"}</Text>
          </Text>
        </View>

        <Input
          label="Código"
          value={codigo}
          onChangeText={setCodigo}
          placeholder="123456"
          keyboardType="number-pad"
          error={errores.codigo}
        />
        <Input
          label="Contraseña nueva"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          error={errores.password}
        />
        <Input
          label="Confirmar contraseña nueva"
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          error={errores.confirmarPassword}
        />

        {errores.general && <Text style={styles.errorGeneral}>{errores.general}</Text>}

        <Button title="Restablecer contraseña" onPress={handleRestablecer} loading={cargando} />

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
    lineHeight: 20,
  },
  textoDestacado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
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
