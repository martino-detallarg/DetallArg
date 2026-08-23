import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAuth } from "../data/AuthContext";
import { mensajeErrorAuth } from "../utils/auth";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function VerifyEmailScreen({ email, onIrALogin }) {
  const { resendConfirmation } = useAuth();
  const [reenviado, setReenviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function handleReenviar() {
    if (!email) return;
    setCargando(true);
    setError(null);
    try {
      await resendConfirmation(email);
      setReenviado(true);
      setTimeout(() => setReenviado(false), 3000);
    } catch (err) {
      setError(mensajeErrorAuth(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />
      <View style={styles.icono}>
        <Ionicons name="mail-outline" size={40} color={colors.accent} />
      </View>

      <Text style={styles.titulo}>Verificá tu email</Text>
      <Text style={styles.texto}>
        Te enviamos un link de verificación a{" "}
        <Text style={styles.textoDestacado}>{email || "tu casilla de correo"}</Text>.
        Abrilo para activar tu cuenta y después volvé acá para iniciar sesión.
      </Text>

      {error && <Text style={styles.errorTexto}>{error}</Text>}

      <Button
        title={reenviado ? "Email reenviado ✓" : "Reenviar email"}
        onPress={handleReenviar}
        variant="secondary"
        disabled={reenviado}
        loading={cargando}
      />

      <TouchableOpacity style={styles.linkLogin} onPress={onIrALogin}>
        <Text style={styles.textoLinkAccento}>Volver a iniciar sesión</Text>
      </TouchableOpacity>
    </View>
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
  textoDestacado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
  errorTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  linkLogin: {
    marginTop: 20,
  },
  textoLinkAccento: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentLight,
  },
});
