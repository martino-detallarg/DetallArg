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

export default function SignupScreen({ onCuentaCreada, onIrALogin }) {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState("");
  const [nombreTaller, setNombreTaller] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  function validar() {
    const nuevosErrores = {};
    if (!nombre.trim()) {
      nuevosErrores.nombre = "Ingresá tu nombre y apellido";
    }
    if (!email.trim()) {
      nuevosErrores.email = "Ingresá tu email";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      nuevosErrores.email = "El email no es válido";
    }
    if (!telefono.trim()) {
      nuevosErrores.telefono = "Ingresá tu teléfono o WhatsApp";
    }
    if (!password) {
      nuevosErrores.password = "Ingresá una contraseña";
    } else if (password.length < 6) {
      nuevosErrores.password = "Mínimo 6 caracteres";
    }
    if (!confirmarPassword) {
      nuevosErrores.confirmarPassword = "Confirmá tu contraseña";
    } else if (confirmarPassword !== password) {
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleCrearCuenta() {
    if (!validar()) return;
    setCargando(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        nombreTaller: nombreTaller.trim(),
      });
      onCuentaCreada(email.trim());
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
          <Text style={styles.titulo}>Creá tu cuenta</Text>
          <Text style={styles.subtitulo}>Sumate a la comunidad DetallArg</Text>
        </View>

        <Input
          label="Nombre y apellido"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Juan Pérez"
          error={errores.nombre}
        />
        <Input
          label="Nombre del taller (opcional)"
          value={nombreTaller}
          onChangeText={setNombreTaller}
          placeholder="Ej: DetallArg Detailing"
        />
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
          label="Teléfono / WhatsApp"
          value={telefono}
          onChangeText={setTelefono}
          placeholder="+54 9 11 1234 5678"
          keyboardType="phone-pad"
          error={errores.telefono}
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
        <Input
          label="Confirmar contraseña"
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          error={errores.confirmarPassword}
        />

        {errores.general && <Text style={styles.errorGeneral}>{errores.general}</Text>}

        <Button title="Crear cuenta" onPress={handleCrearCuenta} loading={cargando} />

        <View style={styles.footer}>
          <Text style={styles.textoMuted}>¿Ya tenés cuenta? </Text>
          <TouchableOpacity onPress={onIrALogin}>
            <Text style={styles.textoLinkAccento}>Iniciá sesión</Text>
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
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
