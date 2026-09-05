import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import WizardHeader from "../../components/wizard/WizardHeader";
import Button from "../../components/Button";
import EditarTallerModal from "../../components/EditarTallerModal";
import ServicioModal from "../../components/ServicioModal";
import { useTaller } from "../../data/TallerContext";
import { colors, fonts } from "../../theme";

const TOTAL_PASOS = 4;

const TITULOS_PASO = {
  1: "Bienvenida",
  2: "Datos del taller",
  3: "Tu primer servicio",
  4: "Listo",
};

// Wizard de bienvenida para talleres nuevos, se muestra una sola vez (ver
// onboardingCompletado en TallerContext.js) apenas alguien confirma el
// email y entra por primera vez — no reemplaza ningún formulario propio,
// reusa EditarTallerModal/ServicioModal tal cual están. Ningún paso es
// obligatorio: "Después lo hago" avanza exactamente igual que "Continuar".
export default function OnboardingWizard({ onTerminar }) {
  const { marcarOnboardingCompletado } = useTaller();
  const [paso, setPaso] = useState(1);
  const [editarTallerVisible, setEditarTallerVisible] = useState(false);
  const [servicioModalVisible, setServicioModalVisible] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  function avanzar() {
    setPaso((p) => Math.min(TOTAL_PASOS, p + 1));
  }

  async function handleFinalizar() {
    setFinalizando(true);
    try {
      await marcarOnboardingCompletado();
      onTerminar();
    } catch (err) {
      Alert.alert("No se pudo continuar", "Probá de nuevo en unos segundos.");
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <WizardHeader
        titulo={TITULOS_PASO[paso]}
        paso={paso}
        totalPasos={TOTAL_PASOS}
        onAtras={() => setPaso((p) => Math.max(1, p - 1))}
      />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {paso === 1 && (
          <>
            <Text style={styles.titulo}>¡Bienvenido a DetallArg!</Text>
            <Text style={styles.texto}>
              DetallArg te ayuda a llevar los turnos, clientes, insumos y las finanzas de tu taller de detailing en
              un solo lugar. Para que puedas arrancar ya mismo, tu cuenta ya viene con un catálogo de referencia de
              489 insumos precargado en Mis Insumos, listo para usar.
            </Text>
            <View style={styles.boton}>
              <Button title="Continuar" onPress={avanzar} />
            </View>
          </>
        )}

        {paso === 2 && (
          <>
            <Text style={styles.titulo}>Tu taller</Text>
            <Text style={styles.texto}>
              Tu nombre y logo van a aparecer en los PDFs que le compartís a tus clientes (Catálogo, presupuestos).
            </Text>
            <View style={styles.boton}>
              <Button
                title="Editar nombre y logo"
                variant="secondary"
                onPress={() => setEditarTallerVisible(true)}
              />
            </View>
            <View style={styles.boton}>
              <Button title="Continuar" onPress={avanzar} />
            </View>
            <View style={styles.boton}>
              <Button title="Después lo hago" variant="secondary" onPress={avanzar} />
            </View>
          </>
        )}

        {paso === 3 && (
          <>
            <Text style={styles.titulo}>Tu primer servicio</Text>
            <Text style={styles.texto}>
              Sin al menos un servicio cargado no vas a poder armar un Trabajo Nuevo.
            </Text>
            <View style={styles.boton}>
              <Button
                title="Agregar mi primer servicio"
                variant="secondary"
                onPress={() => setServicioModalVisible(true)}
              />
            </View>
            <View style={styles.boton}>
              <Button title="Continuar" onPress={avanzar} />
            </View>
            <View style={styles.boton}>
              <Button title="Después lo hago" variant="secondary" onPress={avanzar} />
            </View>
          </>
        )}

        {paso === 4 && (
          <>
            <Text style={styles.titulo}>¡Listo!</Text>
            <Text style={styles.texto}>
              Ya podés empezar a usar DetallArg. Si saltaste algún paso, podés completarlo cuando quieras desde Mi
              Taller y Mis Servicios.
            </Text>
            <View style={styles.boton}>
              <Button title="Empezar a usar DetallArg" onPress={handleFinalizar} loading={finalizando} />
            </View>
          </>
        )}
      </ScrollView>

      <EditarTallerModal visible={editarTallerVisible} onClose={() => setEditarTallerVisible(false)} />
      <ServicioModal visible={servicioModalVisible} item={null} onClose={() => setServicioModalVisible(false)} />
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  boton: {
    marginBottom: 12,
  },
});
