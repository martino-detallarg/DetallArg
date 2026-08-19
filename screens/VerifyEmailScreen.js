import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function VerifyEmailScreen({ email, onIrALogin }) {
  const [reenviado, setReenviado] = useState(false);

  function handleReenviar() {
    setReenviado(true);
    setTimeout(() => setReenviado(false), 3000);
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
        Abrilo para activar tu cuenta.
      </Text>

      <Button
        title={reenviado ? "Email reenviado ✓" : "Reenviar email"}
        onPress={handleReenviar}
        variant="secondary"
        disabled={reenviado}
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
  linkLogin: {
    marginTop: 20,
  },
  textoLinkAccento: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentLight,
  },
});
