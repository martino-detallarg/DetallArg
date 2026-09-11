// Convertido de app.json a config dinámico (mismo contenido, sin cambios de
// comportamiento) para poder inyectar la Google Maps API key desde .env sin
// commitearla — ver el prompt "Ubicación del taller con Google Places +
// mapa", Fase 4. Expo CLI ya carga TODO `.env` a `process.env` para este
// archivo (no solo las variables EXPO_PUBLIC_, esas son las únicas que
// además se inlinean al bundle JS en runtime — acá estamos en config-time,
// Node puro, nunca llega al bundle) — no hace falta `dotenv` a mano.
//
// GOOGLE_MAPS_API_KEY es la key del SDK nativo de Maps (Android/iOS),
// DISTINTA de GOOGLE_PLACES_API_KEY (esa vive como secreto de
// supabase/functions/places-proxy, nunca acá): el SDK nativo sí se puede
// restringir por bundle id/package en Google Cloud Console, así que es
// aceptable que termine embebida en el binario compilado — no es lo mismo
// que las Web Service APIs (Autocomplete/Details) que usa places-proxy.
//
// react-native-maps (a diferencia de expo-maps, más nuevo) NO trae config
// plugin propio (confirmado corriendo `npx expo config`: "Unable to
// resolve a valid config plugin for react-native-maps") — la forma
// soportada de pasarle la key es vía los campos nativos ios.config /
// android.config de abajo, no un plugin en la lista de `plugins`.
module.exports = {
  expo: {
    name: "DetallArg",
    slug: "detallarg-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.detallarg.app",
      buildNumber: "1",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: "com.detallarg.app",
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/android-icon-foreground.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      permissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "DetallArg necesita acceder a tus fotos para adjuntarlas al cliente o al vehículo.",
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
      "@react-native-community/datetimepicker",
      "expo-file-system",
    ],
    extra: {
      eas: {
        projectId: "251b4120-eb61-437d-beef-820c8c0d0f11",
      },
    },
    owner: "rivernics-team",
  },
};
