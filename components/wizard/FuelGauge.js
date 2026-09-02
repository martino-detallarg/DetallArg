import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { colors, fonts, shadowSubtle } from "../../theme";

const ALTO_BARRA = 14;
const DIAMETRO_THUMB = 24;

// 5 posiciones fijas ("click-stops"), no porcentaje libre — el thumb solo
// puede encastrar en una de estas.
const POSICIONES_NAFTA = [
  { valor: 0, etiqueta: "R" },
  { valor: 25, etiqueta: "1/4" },
  { valor: 50, etiqueta: "1/2" },
  { valor: 75, etiqueta: "3/4" },
  { valor: 100, etiqueta: "Lleno" },
];

function posicionMasCercana(valorCrudo) {
  return POSICIONES_NAFTA.reduce((mejor, p) =>
    Math.abs(p.valor - valorCrudo) < Math.abs(mejor.valor - valorCrudo) ? p : mejor
  ).valor;
}

export default function FuelGauge({ nivel, onCambiar }) {
  // Ancho medido del track en píxeles: hace falta para traducir la
  // posición X del toque a un porcentaje (el relleno/thumb en sí se
  // posicionan con "%", no necesitan este valor para renderizar).
  const anchoBarraRef = useRef(0);

  // Estado propio mientras se arrastra: `onCambiar` (que sube hasta el
  // estado raíz del wizard, TrabajoNuevoWizard) recién se llama una vez, al
  // soltar — no en cada pixel de movimiento. Llamarlo en cada movimiento
  // dispararía un re-render de TODO TipoVehiculoStep (grilla de tipos,
  // chips de subdivisión, etc.), no solo del gauge, y se sentiría como que
  // "toda la pantalla se mueve" al arrastrar.
  const [nivelInterno, setNivelInterno] = useState(nivel);
  // Refleja `nivelInterno`, pero por ref: `manejarSoltar` (dentro de
  // onFinalize) necesita el valor más reciente en el momento exacto de
  // soltar el dedo, y confiar en el closure de `nivelInterno` corre el
  // riesgo de leer un valor de un render anterior si React todavía no
  // terminó de procesar el último `setNivelInterno` cuando el gesto
  // termina — la ref, en cambio, se actualiza en el momento (sin esperar
  // un re-render).
  const nivelArrastreRef = useRef(nivel);
  // Mismo motivo para `onCambiar`: puede ser una función nueva en cada
  // render del padre, y el handler de soltar necesita siempre la más nueva.
  const onCambiarRef = useRef(onCambiar);
  onCambiarRef.current = onCambiar;

  // Si `nivel` cambia desde afuera (ej. se reabre el wizard con otro valor),
  // resincroniza el estado local — sin esto, la barra quedaría pegada al
  // último valor arrastrado en vez de reflejar el dato real.
  useEffect(() => {
    setNivelInterno(nivel);
    nivelArrastreRef.current = nivel;
  }, [nivel]);

  // Encastra en la posición fija más cercana ya en vivo (mientras se
  // arrastra), no solo al soltar — se siente más parecido a un selector de
  // "click-stops" real que esperar a la suelta para recién ahí saltar.
  // Recibe `x` ya relativo al track (lo da directo el evento de
  // react-native-gesture-handler, a diferencia de PanResponder que solo
  // daba coordenadas absolutas de pantalla).
  function manejarToque(x) {
    const ancho = anchoBarraRef.current || 1;
    const crudo = Math.max(0, Math.min(100, (x / ancho) * 100));
    const nuevoPorcentaje = posicionMasCercana(crudo);
    nivelArrastreRef.current = nuevoPorcentaje;
    setNivelInterno(nuevoPorcentaje);
  }

  function manejarSoltar() {
    onCambiarRef.current(nivelArrastreRef.current);
  }

  // PanResponder (el que tenía este componente antes) no logra ganarle de
  // forma confiable al gesto nativo de scroll del ScrollView padre — es una
  // limitación conocida de React Native, no algo que se arregle con más
  // banderas de PanResponder. react-native-gesture-handler sí lo resuelve
  // (mismo criterio que SwipeVolver.js, que convive con este mismo
  // ScrollView un poco más arriba en el árbol): activeOffsetX reclama el
  // gesto apenas hay movimiento horizontal real, failOffsetY lo libera si
  // el dedo se mueve claramente en vertical, para que el ScrollView pueda
  // scrollear con normalidad si el toque arrancó sobre la barra mismo pero
  // el usuario en realidad quería scrollear.
  const gestoNafta = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .failOffsetY([-15, 15])
    .onBegin((evento) => runOnJS(manejarToque)(evento.x))
    .onUpdate((evento) => runOnJS(manejarToque)(evento.x))
    .onFinalize(() => runOnJS(manejarSoltar)());

  return (
    <View style={styles.contenedor}>
      <GestureDetector gesture={gestoNafta}>
        <View
          onLayout={(evento) => {
            anchoBarraRef.current = evento.nativeEvent.layout.width;
          }}
          style={styles.barraTrack}
        >
          <View style={[styles.barraRelleno, { width: `${nivelInterno}%` }]} />
          <View style={[styles.thumb, { left: `${nivelInterno}%`, marginLeft: -DIAMETRO_THUMB / 2 }]} />
        </View>
      </GestureDetector>

      <View style={styles.posiciones}>
        {POSICIONES_NAFTA.map((p) => {
          const seleccionada = nivelInterno === p.valor;
          return (
            <View key={p.valor} style={styles.posicion}>
              <View style={[styles.posicionPunto, seleccionada && styles.posicionPuntoSeleccionado]} />
              <Text style={[styles.posicionTexto, seleccionada && styles.posicionTextoSeleccionado]}>
                {p.etiqueta}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginTop: 12,
    marginBottom: 20,
  },
  barraTrack: {
    height: ALTO_BARRA,
    borderRadius: ALTO_BARRA / 2,
    backgroundColor: colors.surface2,
    // El thumb es más alto que el track y sobresale por arriba/abajo — hace
    // falta que este contenedor no recorte esos bordes. En los extremos
    // (0%/100%) sobresale medio thumb (12px) hacia los costados también,
    // pero el padding horizontal de 20px de la pantalla del wizard ya le
    // da lugar de sobra, no hace falta reservar margen acá.
    overflow: "visible",
  },
  barraRelleno: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: ALTO_BARRA / 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: "absolute",
    top: -(DIAMETRO_THUMB - ALTO_BARRA) / 2,
    width: DIAMETRO_THUMB,
    height: DIAMETRO_THUMB,
    borderRadius: DIAMETRO_THUMB / 2,
    backgroundColor: colors.textPrimary,
    ...shadowSubtle,
  },
  posiciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  posicion: {
    alignItems: "center",
    gap: 4,
  },
  posicionPunto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  posicionPuntoSeleccionado: {
    backgroundColor: colors.accent,
  },
  posicionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  posicionTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.accent,
  },
});
