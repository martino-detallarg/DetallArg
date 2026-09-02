import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { colors, continuousCorner, fonts, radii } from "../theme";

const MAIL_SOPORTE = "soporte@detallarg.com";

// Todavía no tenemos el número real de WhatsApp de soporte: este es un
// placeholder para que la pantalla funcione. Reemplazar cuando llegue el
// número definitivo (ver AGENTS.md / CLAUDE.md para el resto del contexto).
const WHATSAPP_NUMERO = "5491155667788";
const WHATSAPP_ETIQUETA = "+54 9 11 5566-7788";

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: "¿Cómo agrego un cliente nuevo?",
    respuesta: "Entrá a Clientes desde el menú y tocá el botón + para cargar sus datos y los de su vehículo.",
  },
  {
    pregunta: "¿Cómo veo los turnos del día?",
    respuesta: "En Agenda podés ver los turnos organizados por día.",
  },
  {
    pregunta: "¿Cómo cargo mis servicios o insumos?",
    respuesta: "Desde Mi Taller entrá a Mis Servicios o Mis Insumos y tocá el botón + para agregar uno nuevo.",
  },
  {
    pregunta: "¿Cómo edito los datos de mi taller?",
    respuesta: "Andá a Mi Taller > Mis Datos para actualizar tu información personal y de contacto.",
  },
  {
    pregunta: "¿Por qué no puedo agregar más empleados o servicios?",
    respuesta: "Algunas secciones tienen un límite según tu plan actual. Podés revisar tu plan y su límite desde Mi Taller.",
  },
];

function abrirWhatsApp() {
  Linking.openURL(`https://wa.me/${WHATSAPP_NUMERO}`);
}

function abrirMail(asunto) {
  Linking.openURL(`mailto:${MAIL_SOPORTE}?subject=${encodeURIComponent(asunto)}`);
}

export default function SoporteScreen({ navigation }) {
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  function alternarPregunta(indice) {
    setPreguntaAbierta((actual) => (actual === indice ? null : indice));
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Soporte</Text>

        <Text style={styles.seccionLabel}>Contacto</Text>
        <View style={styles.tarjeta}>
          <TouchableOpacity style={styles.fila} onPress={abrirWhatsApp} activeOpacity={0.8}>
            <View style={styles.filaIcono}>
              <Ionicons name="logo-whatsapp" size={20} color={colors.accentLight} />
            </View>
            <View style={styles.filaTexto}>
              <Text style={styles.filaTitulo}>WhatsApp</Text>
              <Text style={styles.filaSubtitulo}>{WHATSAPP_ETIQUETA}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.separador} />

          <TouchableOpacity
            style={styles.fila}
            onPress={() => abrirMail("Consulta - DetallArg")}
            activeOpacity={0.8}
          >
            <View style={styles.filaIcono}>
              <Ionicons name="mail-outline" size={20} color={colors.accentLight} />
            </View>
            <View style={styles.filaTexto}>
              <Text style={styles.filaTitulo}>Mail</Text>
              <Text style={styles.filaSubtitulo}>{MAIL_SOPORTE}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.seccionLabel}>Preguntas frecuentes</Text>
        <View style={styles.tarjeta}>
          {PREGUNTAS_FRECUENTES.map((item, indice) => {
            const abierta = preguntaAbierta === indice;
            return (
              <View key={item.pregunta}>
                {indice > 0 && <View style={styles.separador} />}
                <TouchableOpacity
                  style={styles.faqFila}
                  onPress={() => alternarPregunta(indice)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqPregunta}>{item.pregunta}</Text>
                  <Ionicons
                    name={abierta ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
                {abierta && <Text style={styles.faqRespuesta}>{item.respuesta}</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.seccionLabel}>Reportar un problema</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.reportarTexto}>
            Contanos qué pasó y te respondemos por mail. Se va a abrir tu app de correo con un
            mensaje prellenado a {MAIL_SOPORTE}.
          </Text>
          <View style={styles.reportarBoton}>
            <Button
              title="Reportar problema"
              variant="secondary"
              onPress={() => abrirMail("Reporte de problema - DetallArg")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 16,
  },
  seccionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 24,
    overflow: "hidden",
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 14,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
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
  filaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  faqFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
  },
  faqPregunta: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  faqRespuesta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  reportarTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    padding: 14,
    paddingBottom: 0,
  },
  reportarBoton: {
    padding: 14,
  },
});
