import { useCallback, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreenNativo from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Archivo_800ExtraBold,
  Archivo_900Black,
} from "@expo-google-fonts/archivo";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import DashboardNavigator from "./navigation/DashboardNavigator";
import { DataProvider } from "./data/DataContext";
import { colors } from "./theme";

SplashScreenNativo.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Archivo_800ExtraBold,
    Archivo_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [pantalla, setPantalla] = useState("splash");
  const [emailPendiente, setEmailPendiente] = useState("");

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreenNativo.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayoutRootView}>
          {pantalla === "splash" && (
            <SplashScreen onTerminar={() => setPantalla("login")} />
          )}

          {pantalla === "login" && (
            <LoginScreen
              onLoginExitoso={() => setPantalla("app")}
              onIrARegistro={() => setPantalla("signup")}
            />
          )}

          {pantalla === "signup" && (
            <SignupScreen
              onCuentaCreada={(email) => {
                setEmailPendiente(email);
                setPantalla("verify-email");
              }}
              onIrALogin={() => setPantalla("login")}
            />
          )}

          {pantalla === "verify-email" && (
            <VerifyEmailScreen
              email={emailPendiente}
              onIrALogin={() => setPantalla("login")}
            />
          )}

          {pantalla === "app" && (
            <DataProvider>
              <NavigationContainer>
                <DashboardNavigator onLogout={() => setPantalla("login")} />
              </NavigationContainer>
            </DataProvider>
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
