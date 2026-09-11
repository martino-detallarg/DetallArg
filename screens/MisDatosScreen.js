import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WizardHeader from "../components/wizard/WizardHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import ChipGroup from "../components/ChipGroup";
import EstadoCarga from "../components/EstadoCarga";
import { useTaller } from "../data/TallerContext";
import { SITUACIONES_FISCALES } from "../data/mockTaller";
import { ORDEN_CATEGORIAS_MONOTRIBUTO } from "../data/monotributoCategorias";
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

  // Google Places (BuscadorUbicacion/MapaUbicacion) queda pausado hasta que
  // se active la cuenta de facturación de Google Cloud — ver
  // guia_google_maps_api_key.md. Mientras tanto, "Ubicación" es un campo de
  // texto libre más, y "Cómo llegar" arma el link de búsqueda de Google Maps
  // a partir de ESE TEXTO (Google lo geocodifica gratis al abrir el link,
  // mismo esquema que ya usa utils/catalogoPdf.js) — sin key ni coordenadas.
  function handleComoLlegar() {
    if (!datos.ubicacion?.trim()) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(datos.ubicacion)}`);
  }

  function elegirSituacionFiscal(opcion) {
    setDatos((actuales) => ({
      ...actuales,
      situacionFiscal: actuales.situacionFiscal === opcion ? null : opcion,
    }));
  }

  // No borra categoriaMonotributo si el taller cambia a otra situación
  // fiscal: el dato queda guardado sin usarse (MisDatosScreen.js deja de
  // mostrar el selector, FinanzasScreen.js deja de mostrar el aviso), y si
  // vuelve a elegir "Monotributista" más tarde reaparece con la categoría
  // que ya tenía — no hace falta recargarla de cero.
  function elegirCategoriaMonotributo(opcion) {
    setDatos((actuales) => ({
      ...actuales,
      categoriaMonotributo: actuales.categoriaMonotributo === opcion ? null : opcion,
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
        categoriaMonotributo: datos.categoriaMonotributo,
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
            <Input
              label="Ubicación"
              value={datos.ubicacion}
              onChangeText={(v) => cambiar("ubicacion", v)}
              placeholder="Ej: Av. Rivadavia 1234, CABA"
            />

            {datos.ubicacion?.trim() && (
              <TouchableOpacity style={styles.comoLlegarBoton} onPress={handleComoLlegar} activeOpacity={0.85}>
                <Ionicons name="navigate-outline" size={16} color={colors.accentLight} />
                <Text style={styles.comoLlegarTexto}>Cómo llegar</Text>
              </TouchableOpacity>
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

            {datos.situacionFiscal === "Monotributista" && (
              <>
                <Text style={styles.label}>Categoría de Monotributo</Text>
                <ChipGroup
                  options={ORDEN_CATEGORIAS_MONOTRIBUTO.map((categoria) => ({
                    value: categoria,
                    label: categoria,
                    selected: datos.categoriaMonotributo === categoria,
                  }))}
                  onPress={elegirCategoriaMonotributo}
                  style={styles.chips}
                />
              </>
            )}

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
