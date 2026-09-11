import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../components/wizard/WizardHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import ChipGroup from "../components/ChipGroup";
import EstadoCarga from "../components/EstadoCarga";
import BuscadorUbicacion from "../components/BuscadorUbicacion";
import MapaUbicacion from "../components/MapaUbicacion";
import { useTaller } from "../data/TallerContext";
import { SITUACIONES_FISCALES } from "../data/mockTaller";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function MisDatosScreen({ navigation }) {
  const { misDatos, actualizarMisDatos, cargandoTaller, errorCargaTaller, recargarTaller } = useTaller();
  const [datos, setDatos] = useState(misDatos);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const webRef = useRef(null);
  const correoRef = useRef(null);
  const telefonoRef = useRef(null);

  // `misDatos` llega vacío al montar y se llena recién cuando termina el
  // fetch inicial de TallerContext (asíncrono) — sin este efecto, si el
  // usuario entra a esta pantalla antes de que eso termine, `datos` queda
  // pegado al valor vacío del `useState(misDatos)` de arriba para siempre
  // (el initializer de useState solo corre una vez, al montar).
  useEffect(() => {
    if (!cargandoTaller) setDatos(misDatos);
  }, [cargandoTaller]);

  function cambiar(campo, valor) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
  }

  // Tipear a mano en el buscador (sin elegir ninguna sugerencia todavía):
  // se guarda como texto libre, mismo comportamiento que el campo de antes,
  // pero SIN coordenadas — si ya había una ubicación resuelta por Google (o
  // el pin ya se había arrastrado a mano) y el taller edita el texto a
  // mano, esas coordenadas quedarían desactualizadas respecto del texto
  // nuevo, así que se limpian acá: el mapa/botón "Cómo llegar" vuelven a
  // aparecer recién cuando se elija una sugerencia de nuevo (ver
  // BuscadorUbicacion.js).
  function cambiarTextoUbicacion(texto) {
    setDatos((actuales) => ({
      ...actuales,
      ubicacion: texto,
      ubicacionPlaceId: null,
      ubicacionLat: null,
      ubicacionLng: null,
    }));
  }

  // Se eligió una sugerencia real del buscador: pisa ubicación + coordenadas
  // juntas (ver BuscadorUbicacion.js/places-proxy).
  function elegirUbicacion(cambios) {
    setDatos((actuales) => ({ ...actuales, ...cambios }));
  }

  // Se arrastró el pin del mapa a mano (ver MapaUbicacion.js) — solo toca
  // las coordenadas, el texto de la dirección queda como lo devolvió Google
  // (la corrección es del PIN, no de la dirección formateada).
  function arrastrarPinUbicacion(lat, lng) {
    setDatos((actuales) => ({ ...actuales, ubicacionLat: lat, ubicacionLng: lng }));
  }

  // Mismo esquema de link que usa utils/catalogoPdf.js — no depende de
  // tener Google/Apple Maps instalada de una forma específica, el sistema
  // resuelve el link a lo que tenga disponible.
  function handleComoLlegar() {
    if (datos.ubicacionLat == null || datos.ubicacionLng == null) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${datos.ubicacionLat},${datos.ubicacionLng}`);
  }

  function elegirSituacionFiscal(opcion) {
    setDatos((actuales) => ({
      ...actuales,
      situacionFiscal: actuales.situacionFiscal === opcion ? null : opcion,
    }));
  }

  async function handleGuardar() {
    setCargando(true);
    setError(null);
    try {
      await actualizarMisDatos({
        nombrePersonal: datos.nombrePersonal.trim(),
        web: datos.web.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono.trim(),
        ubicacion: datos.ubicacion.trim(),
        ubicacionPlaceId: datos.ubicacionPlaceId,
        ubicacionLat: datos.ubicacionLat,
        ubicacionLng: datos.ubicacionLng,
        situacionFiscal: datos.situacionFiscal,
      });
      navigation.navigate("MiTaller");
    } catch (err) {
      setError("No se pudieron guardar los cambios. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <WizardHeader titulo="Mis Datos" paso={1} totalPasos={1} onAtras={() => navigation.navigate("MiTaller")} />

        <EstadoCarga cargando={cargandoTaller} error={errorCargaTaller} onReintentar={recargarTaller}>
          <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
            <Input
              label="Nombre personal"
              value={datos.nombrePersonal}
              onChangeText={(v) => cambiar("nombrePersonal", v)}
              placeholder="Ej: Martino Fernández"
              returnKeyType="next"
              onSubmitEditing={() => webRef.current?.focus()}
            />
            <Input
              ref={webRef}
              label="Link de página web"
              value={datos.web}
              onChangeText={(v) => cambiar("web", v)}
              placeholder="Ej: www.mitaller.com"
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="next"
              onSubmitEditing={() => correoRef.current?.focus()}
            />
            <Input
              ref={correoRef}
              label="Correo"
              value={datos.correo}
              onChangeText={(v) => cambiar("correo", v)}
              placeholder="Ej: contacto@mitaller.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => telefonoRef.current?.focus()}
            />
            <Input
              ref={telefonoRef}
              label="Teléfono"
              value={datos.telefono}
              onChangeText={(v) => cambiar("telefono", v)}
              placeholder="Ej: 11 5555-5555"
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <BuscadorUbicacion
              valor={datos.ubicacion}
              onCambiarTexto={cambiarTextoUbicacion}
              onSeleccionar={elegirUbicacion}
            />

            {/* Solo con coordenadas reales (elegidas del buscador, o ya
            cargadas de antes) — un taller con `ubicacion` vieja como texto
            libre sin resolver contra Google no tiene centro válido para el
            mapa todavía. */}
            {datos.ubicacionLat != null && datos.ubicacionLng != null && (
              <>
                <MapaUbicacion
                  lat={datos.ubicacionLat}
                  lng={datos.ubicacionLng}
                  onArrastrarPin={arrastrarPinUbicacion}
                />
                <TouchableOpacity style={styles.comoLlegarBoton} onPress={handleComoLlegar} activeOpacity={0.85}>
                  <Ionicons name="navigate-outline" size={16} color={colors.accentLight} />
                  <Text style={styles.comoLlegarTexto}>Cómo llegar</Text>
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.label}>Situación fiscal (opcional)</Text>
            <ChipGroup
              options={SITUACIONES_FISCALES.map((opcion) => ({
                value: opcion,
                label: opcion,
                selected: datos.situacionFiscal === opcion,
              }))}
              onPress={elegirSituacionFiscal}
              style={styles.chips}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.boton}>
              <Button title="Guardar cambios" onPress={handleGuardar} loading={cargando} />
            </View>
          </ScrollView>
        </EstadoCarga>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flexContainer: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    marginBottom: 16,
  },
  comoLlegarBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    marginBottom: 16,
  },
  comoLlegarTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accentLight,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 4,
  },
  boton: {
    marginTop: 12,
  },
});
