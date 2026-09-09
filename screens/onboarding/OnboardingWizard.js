import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import Button from "../../components/Button";
import EditarTallerModal from "../../components/EditarTallerModal";
import AgregarInsumoModal from "../../components/AgregarInsumoModal";
import ServicioModal from "../../components/ServicioModal";
import { useTaller } from "../../data/TallerContext";
import { useTour } from "../../data/TourContext";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../../theme";

const TOTAL_PASOS = 5;

const TITULOS_PASO = {
  1: "Bienvenida",
  2: "Datos del taller",
  3: "Mis Insumos",
  4: "Mis Servicios",
  5: "Listo",
};

// Wizard de bienvenida para talleres nuevos, se muestra una sola vez (ver
// onboardingCompletado en TallerContext.js) apenas alguien confirma el
// email y entra por primera vez — no reemplaza ningún formulario propio,
// reusa EditarTallerModal/AgregarInsumoModal/ServicioModal tal cual están.
// Ningún paso es obligatorio: "Después lo hago" avanza exactamente igual
// que "Continuar".
//
// El paso 3 pide insumos (no un servicio directamente): un servicio arma su
// receta a partir de insumos ya cargados, así que sin al menos uno cargado
// no hay nada para elegir al crear un servicio después — de ahí que el
// paso 4 (Mis Servicios) venga recién después, ya con algo para elegir.
export default function OnboardingWizard({ onTerminar }) {
  const { marcarOnboardingCompletado } = useTaller();
  const { iniciarTour } = useTour();
  const [paso, setPaso] = useState(1);
  const [editarTallerVisible, setEditarTallerVisible] = useState(false);
  const [agregarInsumoVisible, setAgregarInsumoVisible] = useState(false);
  const [servicioModalVisible, setServicioModalVisible] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  function avanzar() {
    setPaso((p) => Math.min(TOTAL_PASOS, p + 1));
  }

  async function handleFinalizar() {
    setFinalizando(true);
    try {
      await marcarOnboardingCompletado();
      iniciarTour();
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
            <View style={styles.tarjetaBienvenida}>
              <View style={styles.iconoBienvenida}>
                <Ionicons name="sparkles-outline" size={44} color={colors.accent} />
              </View>
              <Text style={styles.tituloBienvenida}>¡Bienvenido a DetallArg!</Text>
              <Text style={styles.textoBienvenida}>
                Presupuestos en base a tus insumos, check-in con selección de daños previos y finanzas en base a
                tus movimientos reales: todo en un solo lugar, desde el celu.
              </Text>
            </View>
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
            <Text style={styles.titulo}>Mis Insumos</Text>
            <Text style={styles.texto}>
              Tus servicios arman su receta con insumos ya cargados: sin al menos uno, no vas a poder crear
              ningún servicio.
            </Text>
            <Text style={styles.tip}>
              Tip: cargá el insumo más básico para probar rápido, después sumás el resto con calma.
            </Text>
            <View style={styles.boton}>
              <Button
                title="Agregar mi primer insumo"
                variant="secondary"
                onPress={() => setAgregarInsumoVisible(true)}
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
            <Text style={styles.titulo}>Mis Servicios</Text>
            <Text style={styles.texto}>
              Armá tu primer servicio eligiendo insumos de la receta: el costo y el precio sugerido salen solos,
              y después cada Trabajo Nuevo arranca eligiendo entre los servicios que tengas acá.
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

        {paso === 5 && (
          <>
            <Text style={styles.titulo}>¡Listo!</Text>
            <Text style={styles.texto}>
              Ya podés empezar a usar DetallArg. Si saltaste algún paso, podés completarlo cuando quieras desde Mi
              Taller, Mis Insumos y Mis Servicios.
            </Text>
            <View style={styles.boton}>
              <Button title="Empezar a usar DetallArg" onPress={handleFinalizar} loading={finalizando} />
            </View>
          </>
        )}
      </ScrollView>

      <EditarTallerModal visible={editarTallerVisible} onClose={() => setEditarTallerVisible(false)} />
      <AgregarInsumoModal visible={agregarInsumoVisible} onClose={() => setAgregarInsumoVisible(false)} />
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
  tip: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: -16,
    marginBottom: 28,
  },
  boton: {
    marginBottom: 12,
  },
  tarjetaBienvenida: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    borderRadius: radii.card,
    ...continuousCorner,
    ...shadowSubtle,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 28,
  },
  iconoBienvenida: {
    width: 88,
    height: 88,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  tituloBienvenida: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  textoBienvenida: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 0,
  },
});
