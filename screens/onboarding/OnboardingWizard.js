import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import Button from "../../components/Button";
import EditarTallerModal from "../../components/EditarTallerModal";
import AgregarInsumoModal from "../../components/AgregarInsumoModal";
import ServicioModal from "../../components/ServicioModal";
import { useTaller } from "../../data/TallerContext";
import { useData } from "../../data/DataContext";
import { useServicios } from "../../data/ServicioContext";
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
// que "Continuar" (ver renderAccionesPaso) — la diferencia es solo qué se
// le muestra al taller: mientras no se hizo la acción, el botón principal
// de esa acción + un link de "Después lo hago"; apenas se hizo (dato real
// para insumos/servicios, o el estado local `tallerEditado` para el paso
// de Datos del taller), un texto de confirmación + un único "Continuar".
//
// El paso 3 pide insumos (no un servicio directamente): un servicio arma su
// receta a partir de insumos ya cargados, así que sin al menos uno cargado
// no hay nada para elegir al crear un servicio después — de ahí que el
// paso 4 (Mis Servicios) venga recién después, ya con algo para elegir.
export default function OnboardingWizard({ onTerminar }) {
  const { marcarOnboardingCompletado } = useTaller();
  const { misInsumos } = useData();
  const { servicios } = useServicios();
  const [paso, setPaso] = useState(1);
  const [editarTallerVisible, setEditarTallerVisible] = useState(false);
  const [agregarInsumoVisible, setAgregarInsumoVisible] = useState(false);
  const [servicioModalVisible, setServicioModalVisible] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  // Paso 2 (Datos del taller) no tiene un dato real tan directo como
  // misInsumos/servicios para saber si ya se hizo la acción -- se marca a
  // mano apenas se toca "Editar nombre y logo" (abrir el modal alcanza,
  // no hace falta esperar a que guarde de verdad: mismo criterio laxo que
  // el resto del wizard, ningún paso es obligatorio).
  const [tallerEditado, setTallerEditado] = useState(false);
  const hayInsumoCargado = misInsumos.length > 0;
  const hayServicioCargado = servicios.length > 0;

  function avanzar() {
    setPaso((p) => Math.min(TOTAL_PASOS, p + 1));
  }

  // Botones de los pasos 2/3/4 (Datos del taller / Mis Insumos / Mis
  // Servicios): patrón dinámico de 2 estados en vez de mostrar siempre los
  // tres botones de antes (acción + "Continuar" + "Después lo hago", donde
  // "Continuar" y "Después lo hago" hacían exactamente lo mismo). Si
  // `hecho` es false, solo el botón principal de la acción (variant
  // primario) + un link de "Después lo hago" (estilo de texto subrayado,
  // sin fondo ni borde) para saltear sin hacerla. Si
  // `hecho` es true (ya se cargó el dato real, o ya se tocó editar taller),
  // un texto chico de confirmación + un solo "Continuar" (también
  // primario) -- ambos casos terminan en `avanzar()`, la diferencia es
  // puramente de qué se le muestra al taller en cada momento.
  function renderAccionesPaso({ hecho, tituloAccion, onAccion, textoConfirmacion }) {
    if (hecho) {
      return (
        <>
          <Text style={styles.confirmacion}>{textoConfirmacion}</Text>
          <View style={styles.boton}>
            <Button title="Continuar" onPress={avanzar} />
          </View>
        </>
      );
    }
    return (
      <>
        <View style={styles.boton}>
          <Button title={tituloAccion} onPress={onAccion} />
        </View>
        <TouchableOpacity
          style={styles.despuesLinkContenedor}
          onPress={avanzar}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.despuesLinkTexto}>Después lo hago</Text>
        </TouchableOpacity>
      </>
    );
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
        disabled={finalizando}
      />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {paso === 1 && (
          <>
            <View style={styles.tarjetaBienvenida}>
              <View style={styles.iconoBienvenida}>
                <Ionicons name="sparkles-outline" size={44} color={colors.accent} />
              </View>
              <Text style={styles.tituloBienvenida}>¡Bienvenido a DetallArg!</Text>
              <Text style={styles.destacadoBienvenida}>Todo en un solo lugar, en tu celular.</Text>
              <Text style={styles.textoBienvenida}>
                Presupuestos en base a tus insumos, check-in con selección de daños previos y finanzas en base a
                tus movimientos reales.
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
            {renderAccionesPaso({
              hecho: tallerEditado,
              tituloAccion: "Editar nombre y logo",
              onAccion: () => {
                setEditarTallerVisible(true);
                setTallerEditado(true);
              },
              textoConfirmacion: "✓ Ya editaste los datos de tu taller",
            })}
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
            {renderAccionesPaso({
              hecho: hayInsumoCargado,
              tituloAccion: "Agregar mi primer insumo",
              onAccion: () => setAgregarInsumoVisible(true),
              textoConfirmacion: "✓ Ya cargaste un insumo",
            })}
          </>
        )}

        {paso === 4 && (
          <>
            <Text style={styles.titulo}>Mis Servicios</Text>
            <Text style={styles.texto}>
              Armá tu primer servicio eligiendo insumos de la receta: el costo y el precio sugerido salen solos,
              y después cada Trabajo Nuevo arranca eligiendo entre los servicios que tengas acá.
            </Text>
            {renderAccionesPaso({
              hecho: hayServicioCargado,
              tituloAccion: "Agregar mi primer servicio",
              onAccion: () => setServicioModalVisible(true),
              textoConfirmacion: "✓ Ya cargaste un servicio",
            })}
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
  confirmacion: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.success,
    marginBottom: 14,
  },
  despuesLinkContenedor: {
    alignItems: "center",
    marginTop: 4,
  },
  despuesLinkTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: "underline",
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
  destacadoBienvenida: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.accent,
    textAlign: "center",
    marginBottom: 10,
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
