import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { colors, continuousCorner, fonts, radii } from "../theme";

const ALTO_MAPA = 200;
const DELTA_INICIAL = 0.01;

// Mapa para ajustar el pin de "Ubicación" (MisDatosScreen.js), con un
// marcador arrastrable — para el caso de talleres en zonas industriales o
// sin numeración clara, donde la dirección que devuelve Google no cae
// exacto en la entrada real. Solo tiene sentido mostrarlo cuando ya hay
// lat/lng resueltos (ver BuscadorUbicacion.js): sin eso no hay ningún
// centro válido para el mapa — MisDatosScreen.js decide cuándo montarlo.
//
// PROVIDER_GOOGLE (mismo mapa en Android e iOS, en vez del nativo de Apple
// por default en iOS) necesita un Development Build — no funciona en Expo
// Go estándar. La API key sale de app.config.js (ios.config.googleMapsApiKey
// / android.config.googleMaps.apiKey), leída de GOOGLE_MAPS_API_KEY en
// .env — mismo prerequisito de Augusto de Google Cloud Console.
export default function MapaUbicacion({ lat, lng, onArrastrarPin }) {
  return (
    <View style={styles.contenedor}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.mapa}
        region={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: DELTA_INICIAL,
          longitudeDelta: DELTA_INICIAL,
        }}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
          draggable
          onDragEnd={(evento) => {
            const { latitude, longitude } = evento.nativeEvent.coordinate;
            onArrastrarPin(latitude, longitude);
          }}
        />
      </MapView>
      <Text style={styles.ayuda}>Arrastrá el pin si la dirección no cayó exacta en la entrada del taller.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  mapa: {
    height: ALTO_MAPA,
    borderRadius: radii.card,
    ...continuousCorner,
    overflow: "hidden",
  },
  ayuda: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
});
