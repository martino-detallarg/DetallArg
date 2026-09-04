import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useTaller } from "../../data/TallerContext";
import { obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { construirResumenDanios } from "../../utils/resumenDanios";
import { construirHtmlConformidad, generarYCompartirPdf } from "../../utils/conformidadPdf";
import { TEXTO_CLAUSULA_CONFORMIDAD } from "../../utils/textoLegalConformidad";
import { formatearFechaDDMMAAAA, formatearHoraHHMM } from "../../utils/fecha";
import { formatearPesos } from "../../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../../theme";

const ALTO_FIRMA = 200;

// CSS inyectado en la WebView de react-native-signature-canvas: oculta sus
// botones propios de "Borrar"/"Confirmar" (ver .m-signature-pad--footer en
// node_modules/react-native-signature-canvas/h5/html.js) porque acá se
// maneja todo desde botones nativos propios — "Borrar firma" llama
// ref.clearSignature() y el botón principal del paso llama
// ref.readSignature(), que dispara onOK/onEmpty de forma asíncrona.
const WEB_STYLE_FIRMA = `
  .m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
`;

// Último paso del wizard de Trabajo Nuevo: repasa lo cargado (cliente,
// vehículo, servicio, daños con la imagen del diagrama tal como quedó en
// Inspección Visual) y la cláusula de conformidad, captura la firma táctil
// del cliente + su aclaración, y recién ahí guarda el turno de verdad
// (`onFinalizar`, ver TrabajoNuevoWizard.js) y genera + comparte el PDF de
// consentimiento (utils/conformidadPdf.js). Si el guardado falla no se
// genera nada; si el guardado funciona pero el PDF falla, el trabajo queda
// guardado igual y se avisa aparte — no tiene sentido perder el turno por
// un problema de PDF/compartir.
export default function FirmaConformidadStep({
  cliente,
  auto,
  servicio,
  inspeccion,
  paso,
  totalPasos,
  onAtras,
  onFinalizar,
  onTerminar,
}) {
  const { nombreTaller, logoTaller, misDatos } = useTaller();
  const firmaRef = useRef(null);
  const [aclaracion, setAclaracion] = useState("");
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  const claveDiagrama = obtenerClaveDiagrama(inspeccion);
  const vistasConDanios = (inspeccion.imagenesDiagrama ?? []).map(({ vistaId, etiqueta, imagen }) => ({
    etiqueta,
    imagen,
    danios: construirResumenDanios(inspeccion.danios, claveDiagrama, inspeccion.tipoVehiculo, vistaId),
  }));

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

  // Una vez que el guardado del turno confirma, el check-in ya está hecho
  // — de acá en más SIEMPRE se avanza a "confirmación" (onTerminar), pase lo
  // que pase con el PDF. Si se dejara al usuario "reintentar" desde esta
  // misma pantalla después de un guardado exitoso, un back + reenvío
  // terminaría creando un turno duplicado (onFinalizar vuelve a insertar) —
  // por eso el PDF fallido se avisa con un Alert dismisseable en vez de un
  // error inline que invite a tocar el botón de nuevo.
  async function handleOK(firmaImagen) {
    setError(null);
    try {
      await onFinalizar();
    } catch (err) {
      setProcesando(false);
      setError("No se pudo guardar el trabajo. Probá de nuevo.");
      return;
    }

    try {
      const ahora = new Date();
      const html = construirHtmlConformidad({
        taller: { nombreTaller, logoTaller, misDatos },
        cliente,
        auto,
        kilometraje: inspeccion.kilometraje ? Number(inspeccion.kilometraje) : null,
        fecha: servicio.fecha,
        hora: servicio.hora,
        servicio,
        vistas: vistasConDanios,
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
        "El trabajo se guardó",
        "No pudimos generar el PDF de conformidad. El trabajo ya quedó guardado igual."
      );
    }
    onTerminar();
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
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <WizardHeader titulo="Conformidad y Firma" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo}>Cliente y vehículo</Text>
            <Text style={styles.filaTexto}>{cliente.nombre}</Text>
            {auto && (
              <Text style={styles.filaTextoSecundario}>
                {auto.marca} {auto.modelo}
                {auto.patente ? ` · ${auto.patente}` : ""}
              </Text>
            )}
            <View style={styles.separador} />
            <Text style={styles.filaTexto}>{servicio.tipo || "Servicio no especificado"}</Text>
            {!!servicio.precio && <Text style={styles.filaTextoSecundario}>{formatearPesos(servicio.precio)}</Text>}
          </View>

          {vistasConDanios.length > 0 ? (
            vistasConDanios.map((vista) => (
              <View key={vista.etiqueta} style={[styles.tarjeta, styles.tarjetaConMargen]}>
                <Text style={styles.tarjetaTitulo}>Vista: {vista.etiqueta}</Text>
                <View style={styles.vistaFila}>
                  {vista.imagen && <Image source={{ uri: vista.imagen }} style={styles.vistaImagen} resizeMode="contain" />}
                  <View style={styles.vistaDanios}>
                    {vista.danios.length > 0 ? (
                      vista.danios.map((d) => (
                        <Text key={d.zona} style={styles.danioTexto}>
                          <Text style={styles.danioZona}>{d.zona}: </Text>
                          {d.tipos.map((t) => (t.nota ? `${t.etiqueta} (${t.nota})` : t.etiqueta)).join(", ")}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.sinDanios}>Sin daños registrados en esta vista.</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.tarjeta, styles.tarjetaConMargen]}>
              <Text style={styles.sinDanios}>No hay un diagrama disponible para este vehículo todavía.</Text>
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
              title={procesando ? "Guardando..." : "Firmar y Guardar Trabajo"}
              onPress={handleConfirmar}
              loading={procesando}
              disabled={procesando}
            />
          </View>
        </ScrollView>
      </SwipeVolver>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
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
  vistaFila: {
    flexDirection: "row",
    gap: 12,
  },
  vistaImagen: {
    width: 110,
    height: 110,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.surface2,
  },
  vistaDanios: {
    flex: 1,
    justifyContent: "center",
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
  sinDanios: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
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
    marginTop: 16,
  },
});
