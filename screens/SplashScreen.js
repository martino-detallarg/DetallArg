import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Logo from "../components/Logo";
import { colors } from "../theme";

const DURACION_MS = 1500;

export default function SplashScreen({ onTerminar }) {
  useEffect(() => {
    const timer = setTimeout(onTerminar, DURACION_MS);
    return () => clearTimeout(timer);
  }, [onTerminar]);

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />
      <Logo size={96} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
