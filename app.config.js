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
        usesNonExemptEncryption: false,
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
    updates: {
      url: "https://u.expo.dev/251b4120-eb61-437d-beef-820c8c0d0f11",
    },
    runtimeVersion: {
      policy: "appVersion",
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
      "./plugins/withDeploymentTarget",
    ],
    extra: {
      eas: {
        projectId: "251b4120-eb61-437d-beef-820c8c0d0f11",
      },
    },
    owner: "rivernics-team",
  },
};
