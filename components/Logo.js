import { Image } from "react-native";

const LOGO_BLANCO = require("../assets/logo_siete_corte_diagonal - BLANCO.png");
const ASPECT_RATIO = 2720 / 1280;

export default function Logo({ size = 72 }) {
  return (
    <Image
      source={LOGO_BLANCO}
      style={{ height: size, width: size * ASPECT_RATIO }}
      resizeMode="contain"
    />
  );
}
