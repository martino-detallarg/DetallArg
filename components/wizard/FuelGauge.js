import { useEffect, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
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
  const contenedorRef = useRef(null);
  const origenPantalla = useRef({ x: 0, y: 0 });
  // Ancho medido del track en píxeles: hace falta para traducir la
  // posición X del toque a un porcentaje (el relleno/thumb en sí se
  // posicionan con "%", no necesitan este valor para renderizar).
  const anchoBarraRef = useRef(0);

  // Estado propio mientras se arrastra: `onCambiar` (que sube hasta el
  // estado raíz del wizard, TrabajoNuevoWizard) recién se llama una vez, al
  // soltar — no en cada pixel de movimiento. Antes cada onPanResponderMove
  // disparaba un re-render de TODO TipoVehiculoStep (grilla de tipos, chips
  // de subdivisión, etc.), no solo del gauge, y se sentía como que "toda la
  // pantalla se movía" al arrastrar.
  const [nivelInterno, setNivelInterno] = useState(nivel);
  // Refleja `nivelInterno` para que el handler de soltar (armado una sola
  // vez más abajo, ver comentario de `responder`) siempre lea el valor más
  // reciente en vez de quedar atado al que existía cuando se creó.
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

  function medirOrigen() {
    contenedorRef.current?.measure((_x, _y, w, _h, pageX, pageY) => {
      origenPantalla.current = { x: pageX, y: pageY };
      anchoBarraRef.current = w;
    });
  }

  // Armado una sola vez (useRef solo se queda con el valor de la primera
  // evaluación): por eso `manejarToque`/`manejarSoltar` no pueden confiar en
  // sus propios closures para leer el `nivel`/`onCambiar` más recientes —
  // usan los refs de arriba en su lugar.
  const responder = useRef(
    PanResponder.create({
      // onStart/onMoveShouldSetPanResponderCapture (true) hace que este
      // componente capture el toque ANTES de que el ScrollView padre lo
      // interprete como un gesto de scroll, y onPanResponderTerminationRequest
      // (false) evita que el ScrollView se lo robe a mitad del arrastre.
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: manejarToque,
      onPanResponderMove: manejarToque,
      // Release cubre soltar el dedo normalmente; Terminate cubre que el
      // sistema interrumpa el gesto a la fuerza (una llamada entrante, un
      // permiso) — sin este último, un arrastre interrumpido así perdería
      // el valor en silencio en vez de confirmarlo.
      onPanResponderRelease: manejarSoltar,
      onPanResponderTerminate: manejarSoltar,
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // Encastra en la posición fija más cercana ya en vivo (mientras se
  // arrastra), no solo al soltar — se siente más parecido a un selector de
  // "click-stops" real que esperar a la suelta para recién ahí saltar.
  function manejarToque(_evt, gestureState) {
    const touchX = gestureState.moveX || gestureState.x0;
    const x = touchX - origenPantalla.current.x;
    const ancho = anchoBarraRef.current || 1;

    const crudo = Math.max(0, Math.min(100, (x / ancho) * 100));
    const nuevoPorcentaje = posicionMasCercana(crudo);
    nivelArrastreRef.current = nuevoPorcentaje;
    setNivelInterno(nuevoPorcentaje);
  }

  function manejarSoltar() {
    onCambiarRef.current(nivelArrastreRef.current);
  }

  return (
    <View style={styles.contenedor}>
      <View ref={contenedorRef} onLayout={medirOrigen} style={styles.barraTrack} {...responder.panHandlers}>
        <View style={[styles.barraRelleno, { width: `${nivelInterno}%` }]} />
        <View style={[styles.thumb, { left: `${nivelInterno}%`, marginLeft: -DIAMETRO_THUMB / 2 }]} />
      </View>

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
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  posicionTextoSeleccionado: {
    fontFamily: fonts.monoMedium,
    color: colors.accent,
  },
});
