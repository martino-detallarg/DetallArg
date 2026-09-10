import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SignatureCanvas from "react-native-signature-canvas";
import WizardHeader from "./wizard/WizardHeader";
import Input from "./Input";
import Button from "./Button";
import { useTaller } from "../data/TallerContext";
import { useTurnos } from "../data/TurnoContext";
import { DIAGRAMAS_POR_TIPO_VEHICULO, obtenerClaveDiagrama } from "./diagrams/vehicles";
import { construirResumenDanios } from "../utils/resumenDanios";
import { construirHtmlConformidad, generarYCompartirPdf } from "../utils/conformidadPdf";
import { TEXTO_CLAUSULA_CONFORMIDAD } from "../utils/textoLegalConformidad";
import { formatearFechaDDMMAAAA, formatearHoraHHMM } from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Mismo CSS que FirmaConformidadStep.js — ver el comentario ahí.
const WEB_STYLE_FIRMA = `
  .m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
`;

const ALTO_FIRMA = 200;

// Completa la conformidad de un turno creado con "Firmar después" (ver
// FirmaConformidadStep.js/TrabajoNuevoWizard.js) — típicamente al retirar
// el vehículo, con el cliente ya presente en persona. Se abre desde
// TrabajoDetalleModal.js cuando turno.conformidadEstado === 'pendiente'.
//
// A diferencia de FirmaConformidadStep (paso del wizard, que CREA el
// turno), este componente actualiza uno YA EXISTENTE: mismo texto legal y
// mismo PDF, pero los daños van en TEXTO (construirResumenDanios, ya
// existe) en un solo bloque, sin las miniaturas del diagrama por vista —
// esas capturas (react-native-view-shot) nunca se persistieron, solo
// vivieron en el estado del wizard mientras se creaba el turno (ver
// alter_turnos_conformidad_estado.sql).
export default function CompletarFirmaModal({ visible, turno, cliente, auto, onClose }) {
  const { nombreTaller, logoTaller, misDatos } = useTaller();
  const { actualizarTurno } = useTurnos();
  const firmaRef = useRef(null);
  const [aclaracion, setAclaracion] = useState("");
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setAclaracion("");
      setFirmaVacia(true);
      setProcesando(false);
      setError(null);
    }
  }, [visible, turno?.id]);

  if (!turno) return null;

  const claveDiagrama = obtenerClaveDiagrama({
    tipoVehiculo: turno.tipoVehiculo,
    grupo: turno.grupoVehiculo,
    subdivision: turno.subdivisionVehiculo,
  });
  const diagramaVehiculo = claveDiagrama ? DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama] : null;
  // Un solo bloque con TODOS los daños (no uno por vista, como el wizard):
  // sin las capturas del diagrama no hay una imagen puntual a la que
  // anclar cada vista por separado.
  const idsVistas = diagramaVehiculo ? Object.keys(diagramaVehiculo.vistas) : [undefined];
  const danios = idsVistas.flatMap((vistaId) =>
    construirResumenDanios(turno.danios ?? {}, claveDiagrama, turno.tipoVehiculo, vistaId)
  );
  const vistas = danios.length > 0 ? [{ etiqueta: "Daños registrados en el check-in", imagen: null, danios }] : [];

  function handleEmpty() {
    setProcesando(false);
    setError("Falta la firma del cliente.");
  }

  function handleClear() {
    setFirmaVacia(true);
  }

  function handleBegin() {
    setFirmaVacia(false);
  }

  // Mismo criterio que FirmaConformidadStep.js: una vez que
  // actualizarTurno confirma, la conformidad ya quedó firmada — de acá en
  // más siempre se cierra el modal, pase lo que pase con el PDF.
  async function handleOK(firmaImagen) {
    setError(null);
    try {
      await actualizarTurno(turno.id, { conformidadEstado: "firmada" });
    } catch (err) {
      setProcesando(false);
      setError("No se pudo actualizar el trabajo. Probá de nuevo.");
      return;
    }

    try {
      const ahora = new Date();
      const html = construirHtmlConformidad({
        taller: { nombreTaller, logoTaller, misDatos },
        cliente,
        auto,
        kilometraje: turno.kilometraje,
        fecha: turno.fecha,
        hora: turno.hora,
        servicio: { tipo: turno.servicio, precio: turno.precio, observaciones: turno.observaciones },
        vistas,
        firma: {
          imagen: firmaImagen,
          aclaracion: aclaracion.trim(),
          fecha: formatearFechaDDMMAAAA(ahora),
          hora: formatearHoraHHMM(ahora),
        },
      });
      await generarYCompartirPdf(html, `Conformidad - ${cliente.nombre}.pdf`);
    } catch (err) {
      Alert.alert(
        "Conformidad registrada",
        "No pudimos generar el PDF de conformidad. La conformidad ya quedó marcada como firmada igual."
      );
    }
    setProcesando(false);
    onClose();
  }

  function handleConfirmar() {
    if (!aclaracion.trim()) {
      setError("Ingresá el nombre y apellido de quien firma.");
      return;
    }
    if (firmaVacia) {
      setError("Falta la firma del cliente.");
      return;
    }
    setError(null);
    setProcesando(true);
    firmaRef.current?.readSignature();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.pantalla} edges={["top", "bottom"]}>
          <KeyboardAvoidingView style={styles.flexUno} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <WizardHeader titulo="Completar Firma" paso={1} totalPasos={1} onAtras={onClose} />

            <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
              <View style={styles.tarjeta}>
                <Text style={styles.tarjetaTitulo}>Cliente y vehículo</Text>
                <Text style={styles.filaTexto}>{cliente?.nombre}</Text>
                {auto && (
                  <Text style={styles.filaTextoSecundario}>
                    {auto.marca} {auto.modelo}
                    {auto.patente ? ` · ${auto.patente}` : ""}
                  </Text>
                )}
                <View style={styles.separador} />
                <Text style={styles.filaTexto}>{turno.servicio || "Servicio no especificado"}</Text>
              </View>

              {vistas.length > 0 && (
                <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
                  <Text style={styles.tarjetaTitulo}>{vistas[0].etiqueta}</Text>
                  {vistas[0].danios.map((d) => (
                    <Text key={d.zona} style={styles.danioTexto}>
                      <Text style={styles.danioZona}>{d.zona}: </Text>
                      {d.tipos.map((t) => (t.nota ? `${t.etiqueta} (${t.nota})` : t.etiqueta)).join(", ")}
                    </Text>
                  ))}
                </View>
              )}

              <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
                <Text style={styles.tarjetaTitulo}>Cláusula de conformidad</Text>
                <Text style={styles.clausulaTexto}>{TEXTO_CLAUSULA_CONFORMIDAD}</Text>
              </View>

              <Input
                label="Aclaración (nombre y apellido de quien firma)"
                value={aclaracion}
                onChangeText={setAclaracion}
                placeholder="Ej: Juan Pérez"
              />

              <View style={styles.firmaHeaderFila}>
                <Text style={styles.firmaLabel}>Firma del cliente</Text>
                <TouchableOpacity
                  onPress={() => firmaRef.current?.clearSignature()}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.borrarFirmaTexto}>Borrar firma</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.firmaContenedor}>
                <SignatureCanvas
                  ref={firmaRef}
                  onOK={handleOK}
                  onEmpty={handleEmpty}
                  onClear={handleClear}
                  onBegin={handleBegin}
                  webStyle={WEB_STYLE_FIRMA}
                  backgroundColor="#FFFFFF"
                  penColor={colors.bg}
                  descriptionText=""
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.boton}>
                <Button
                  title={procesando ? "Guardando..." : "Firmar"}
                  onPress={handleConfirmar}
                  loading={procesando}
                  disabled={procesando}
                />
              </View>
              <View style={styles.boton}>
                <Button title="Cancelar" variant="secondary" onPress={onClose} disabled={procesando} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flexUno: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  tarjetaConMargen: {
    marginTop: 12,
  },
  tarjetaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filaTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filaTextoSecundario: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 10,
  },
  danioTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  danioZona: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
  clausulaTexto: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  firmaHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  firmaLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  borrarFirmaTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.accentLight,
  },
  firmaContenedor: {
    height: ALTO_FIRMA,
    borderRadius: radii.card,
    ...continuousCorner,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginTop: 14,
  },
  boton: {
    marginTop: 12,
  },
});
