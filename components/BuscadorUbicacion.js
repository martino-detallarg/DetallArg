import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../theme";

const DEBOUNCE_MS = 350;

// Un id casero por "sesión de búsqueda" (autocomplete + el details que la
// termina) — Google factura las sesiones de Autocomplete completas más
// barato que llamadas sueltas, y `places-proxy` ya reenvía este
// `sessionToken` a ambos endpoints (ver supabase/functions/places-proxy).
// No hace falta un UUID real, solo que sea único por sesión.
function generarSessionToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Buscador con autocompletado de direcciones (Google Places), reemplazando
// el viejo campo de texto libre de "Ubicación" en MisDatosScreen.js. Llama
// a la Edge Function `places-proxy` (ver supabase/functions/places-proxy)
// en vez de pegarle directo a Google desde el cliente: esa función existe
// específicamente para que la GOOGLE_PLACES_API_KEY nunca viaje en el
// bundle de la app (las Web Service APIs de Google no se pueden restringir
// por bundle id, a diferencia del SDK nativo de Maps).
//
// Totalmente controlado desde afuera (`valor` = el texto actual de
// `ubicacion`, sin estado propio del texto) para que tipear a mano y elegir
// una sugerencia terminen escribiendo por el mismo camino en
// MisDatosScreen.js — `onCambiarTexto` en cada tecla (texto libre, sin
// coordenadas todavía) y `onSeleccionar` solo cuando se elige una
// sugerencia real (trae `ubicacion`/`ubicacionPlaceId`/`ubicacionLat`/
// `ubicacionLng` ya resueltos con Place Details).
export default function BuscadorUbicacion({ valor, onCambiarTexto, onSeleccionar }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const sessionTokenRef = useRef(generarSessionToken());
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleCambiarTexto(nuevoTexto) {
    onCambiarTexto(nuevoTexto);
    setMostrarSugerencias(true);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!nuevoTexto.trim()) {
      setSugerencias([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const { data, error: errorFuncion } = await supabase.functions.invoke("places-proxy", {
          body: { action: "autocomplete", input: nuevoTexto, sessionToken: sessionTokenRef.current },
        });
        if (errorFuncion) throw errorFuncion;
        if (data?.error) throw new Error(data.error);
        setSugerencias(data?.predictions ?? []);
      } catch (err) {
        setError("No se pudo buscar direcciones. Probá de nuevo.");
        setSugerencias([]);
      } finally {
        setBuscando(false);
      }
    }, DEBOUNCE_MS);
  }

  async function handleElegirSugerencia(prediccion) {
    setMostrarSugerencias(false);
    setSugerencias([]);
    setCargandoDetalle(true);
    setError(null);
    try {
      const { data, error: errorFuncion } = await supabase.functions.invoke("places-proxy", {
        body: { action: "details", placeId: prediccion.placeId, sessionToken: sessionTokenRef.current },
      });
      if (errorFuncion) throw errorFuncion;
      if (data?.error) throw new Error(data.error);

      onSeleccionar({
        ubicacion: data.formattedAddress,
        ubicacionPlaceId: data.placeId,
        ubicacionLat: data.lat,
        ubicacionLng: data.lng,
      });
      // Sesión de facturación nueva para la próxima búsqueda — no se reusa
      // un sessionToken después de un `details` exitoso (criterio de
      // Google Places).
      sessionTokenRef.current = generarSessionToken();
    } catch (err) {
      setError("No se pudo cargar el detalle de esa dirección. Probá de nuevo.");
    } finally {
      setCargandoDetalle(false);
    }
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.label}>Ubicación</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={handleCambiarTexto}
          onFocus={() => setMostrarSugerencias(true)}
          placeholder="Buscá la dirección del taller"
          placeholderTextColor={colors.textMuted}
        />
        {(buscando || cargandoDetalle) && <ActivityIndicator size="small" color={colors.accent} />}
      </View>
      <Text style={styles.ayuda}>Elegí una sugerencia de la lista para poder ajustar el pin en el mapa.</Text>

      {mostrarSugerencias && sugerencias.length > 0 && (
        <View style={styles.listaSugerencias}>
          {sugerencias.map((s) => (
            <TouchableOpacity
              key={s.placeId}
              style={styles.sugerenciaFila}
              onPress={() => handleElegirSugerencia(s)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={styles.sugerenciaTexto} numberOfLines={2}>
                {s.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 50,
    ...shadowSubtle,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    height: "100%",
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  listaSugerencias: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 8,
    overflow: "hidden",
  },
  sugerenciaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sugerenciaTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
});
