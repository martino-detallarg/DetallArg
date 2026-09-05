import { useCallback, useEffect, useState } from "react";
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
import { CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond";
import { Jost_400Regular } from "@expo-google-fonts/jost";
import { Manrope_400Regular, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import { Oswald_600SemiBold } from "@expo-google-fonts/oswald";
import { Barlow_400Regular } from "@expo-google-fonts/barlow";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import OlvidePasswordScreen from "./screens/OlvidePasswordScreen";
import RestablecerPasswordScreen from "./screens/RestablecerPasswordScreen";
import DashboardNavigator from "./navigation/DashboardNavigator";
import { AuthProvider, useAuth } from "./data/AuthContext";
import { DataProvider } from "./data/DataContext";
import { TallerProvider } from "./data/TallerContext";
import { PedidoProvider } from "./data/PedidoContext";
import { ClienteProvider } from "./data/ClienteContext";
import { TurnoProvider } from "./data/TurnoContext";
import { ServicioProvider } from "./data/ServicioContext";
import { EquipoProvider } from "./data/EquipoContext";
import { CatalogoProvider } from "./data/CatalogoContext";
import { FinanzasProvider } from "./data/FinanzasContext";
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
    // Solo para simular los 3 estilos del Catálogo dentro del Editor de
    // Catálogo (screens/EditorCatalogoScreen.js) — el PDF en sí carga estas
    // mismas familias por CDN, no desde estos assets nativos.
    CormorantGaramond_600SemiBold,
    Jost_400Regular,
    Manrope_400Regular,
    Manrope_800ExtraBold,
    Oswald_600SemiBold,
    Barlow_400Regular,
  });

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
          <AuthProvider>
            <FlujoApp />
          </AuthProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Splash (con su propio timer de 1.5s, ver SplashScreen.js) -> según haya
// o no una sesión real de Supabase (useAuth), entra directo a la app o al
// sub-flujo de login/signup/verify-email. `pantalla` acá solo maneja ESE
// sub-flujo: apenas `session` deja de ser null, este efecto pasa a "app"
// sin que ninguna pantalla lo pida a mano (cubre login, y también volver a
// la app después de confirmar el email y loguearse).
function FlujoApp() {
  const { session, cargando } = useAuth();
  const [splashTerminado, setSplashTerminado] = useState(false);
  const [pantalla, setPantalla] = useState("login");
  const [emailPendiente, setEmailPendiente] = useState("");
  const [emailRecuperacion, setEmailRecuperacion] = useState("");

  const listoParaDecidir = splashTerminado && !cargando;

  useEffect(() => {
    if (!listoParaDecidir) return;
    if (session) {
      setPantalla("app");
    } else {
      // No pisa "signup"/"verify-email" si el usuario está en medio de ese
      // sub-flujo sin sesión todavía (esperado: signUp() no da sesión hasta
      // confirmar el email). Solo fuerza "login" si veníamos de "app" (ej.
      // cerraste sesión o se venció el token).
      setPantalla((actual) => (actual === "app" ? "login" : actual));
    }
  }, [listoParaDecidir, session]);

  if (!listoParaDecidir) {
    return <SplashScreen onTerminar={() => setSplashTerminado(true)} />;
  }

  return (
    <>
      {pantalla === "login" && (
        <LoginScreen
          onIrARegistro={() => setPantalla("signup")}
          onIrAOlvidePassword={() => setPantalla("forgot-password")}
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
        <VerifyEmailScreen email={emailPendiente} onIrALogin={() => setPantalla("login")} />
      )}

      {pantalla === "forgot-password" && (
        <OlvidePasswordScreen
          onCodigoEnviado={(email) => {
            setEmailRecuperacion(email);
            setPantalla("reset-password");
          }}
          onIrALogin={() => setPantalla("login")}
        />
      )}

      {pantalla === "reset-password" && (
        <RestablecerPasswordScreen
          email={emailRecuperacion}
          onIrALogin={() => setPantalla("login")}
        />
      )}

      {pantalla === "app" && (
        <DataProvider>
          <ClienteProvider>
            <ServicioProvider>
              <TurnoProvider>
                <TallerProvider>
                  <PedidoProvider>
                    <EquipoProvider>
                      <CatalogoProvider>
                        <FinanzasProvider>
                          <NavigationContainer>
                            <DashboardNavigator />
                          </NavigationContainer>
                        </FinanzasProvider>
                      </CatalogoProvider>
                    </EquipoProvider>
                  </PedidoProvider>
                </TallerProvider>
              </TurnoProvider>
            </ServicioProvider>
          </ClienteProvider>
        </DataProvider>
      )}
    </>
  );
}
