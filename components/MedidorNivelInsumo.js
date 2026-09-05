import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { ClipPath, Defs, G, Rect } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { formatearCantidadInsumo, formatearCapacidadLegible } from "../utils/formato";
import { colors, fonts } from "../theme";

// viewBox fijo de la silueta (bidón/botella genérico, mismo para cualquier
// insumo — no hace falta variar la forma por producto, ver el pedido).
const ANCHO_VB = 100;
const ALTO_VB = 160;
// Tamaño real en pantalla, misma proporción 100:160 que el viewBox.
const ANCHO_GAUGE = 110;
const ALTO_GAUGE = 176;

// 5 posiciones fijas ("click-stops"), mismo criterio que FuelGauge.js —
// el gesto encastra en una de estas al soltar, nunca queda en un valor
// intermedio.
const POSICIONES_NIVEL = [
  { valor: 0, etiqueta: "Vacío" },
  { valor: 25, etiqueta: "1/4" },
  { valor: 50, etiqueta: "1/2" },
  { valor: 75, etiqueta: "3/4" },
  { valor: 100, etiqueta: "Lleno" },
];

function posicionMasCercana(valorCrudo) {
  return POSICIONES_NIVEL.reduce((mejor, p) =>
    Math.abs(p.valor - valorCrudo) < Math.abs(mejor.valor - valorCrudo) ? p : mejor
  );
}

// Medidor visual de "cuánto queda" de un insumo, con forma de bidón/botella
// (silueta genérica en SVG) y gesto de arrastre vertical — mismo patrón de
// "estado interno mientras se arrastra + onCambiar recién al soltar" que
// FuelGauge.js, pero vertical (el relleno sube desde abajo) y con encastre
// en los mismos 5 valores fijos. Se usa desde MoverCategoriaModal.js, que
// vive dentro de un <Modal> nativo propio — por eso ese modal necesita su
// propio <GestureHandlerRootView> envolviendo el contenido (mismo detalle
// que TrabajoNuevoWizard.js con SwipeVolver/FuelGauge).
export default function MedidorNivelInsumo({ insumo, onCambiarNivel, deshabilitado }) {
  const altoTrackRef = useRef(0);
  const [nivelInterno, setNivelInterno] = useState(insumo.nivel ?? 0);
  const nivelArrastreRef = useRef(insumo.nivel ?? 0);
  const onCambiarRef = useRef(onCambiarNivel);
  onCambiarRef.current = onCambiarNivel;

  // Si cambia el insumo (o su nivel real cambió desde afuera, ej. otro
  // dispositivo lo consumió), resincroniza — sin esto el medidor quedaría
  // pegado al último valor arrastrado en esta sesión.
  useEffect(() => {
    setNivelInterno(insumo.nivel ?? 0);
    nivelArrastreRef.current = insumo.nivel ?? 0;
  }, [insumo.id, insumo.nivel]);

  function manejarToque(y) {
    const alto = altoTrackRef.current || 1;
    // y=0 es arriba del track; el bidón se llena desde abajo, por eso se
    // invierte (arriba = más lleno).
    const crudo = Math.max(0, Math.min(100, 100 - (y / alto) * 100));
    const posicion = posicionMasCercana(crudo);
    nivelArrastreRef.current = posicion.valor;
    setNivelInterno(posicion.valor);
  }

  function manejarSoltar() {
    onCambiarRef.current(nivelArrastreRef.current);
  }

  const gesto = Gesture.Pan()
    .enabled(!deshabilitado)
    .onBegin((evento) => runOnJS(manejarToque)(evento.y))
    .onUpdate((evento) => runOnJS(manejarToque)(evento.y))
    .onFinalize(() => runOnJS(manejarSoltar)());

  const alturaRelleno = (ALTO_VB * nivelInterno) / 100;
  const etiquetaFraccion = posicionMasCercana(nivelInterno).etiqueta;
  const tieneCapacidad = insumo.capacidadTotal > 0;
  const cantidadActual = tieneCapacidad ? insumo.capacidadTotal * (nivelInterno / 100) : null;

  return (
    <View style={styles.contenedor}>
      {tieneCapacidad && (
        <Text style={styles.textoEstado}>
          {nivelInterno}% · {formatearCantidadInsumo(cantidadActual, insumo.capacidadUnidad)} de{" "}
          {formatearCapacidadLegible(insumo.capacidadTotal, insumo.capacidadUnidad)} ({etiquetaFraccion})
        </Text>
      )}

      <GestureDetector gesture={gesto}>
        <View
          onLayout={(evento) => {
            altoTrackRef.current = evento.nativeEvent.layout.height;
          }}
          style={styles.gaugeTrack}
        >
          <Svg width={ANCHO_GAUGE} height={ALTO_GAUGE} viewBox={`0 0 ${ANCHO_VB} ${ALTO_VB}`}>
            <Defs>
              {/* Unión de las dos formas (cuello + cuerpo) como región de
              recorte — así el relleno de abajo nunca se sale de la silueta
              del bidón. */}
              <ClipPath id="clipBidon">
                <Rect x={30} y={0} width={40} height={22} rx={6} />
                <Rect x={8} y={18} width={84} height={142} rx={16} />
              </ClipPath>
            </Defs>

            {/* Silueta vacía de fondo */}
            <Rect x={30} y={0} width={40} height={22} rx={6} fill={colors.surface2} />
            <Rect x={8} y={18} width={84} height={142} rx={16} fill={colors.surface2} />

            {/* Relleno — mismo color que ProductoCasillero.js */}
            <G clipPath="url(#clipBidon)">
              <Rect
                x={0}
                y={ALTO_VB - alturaRelleno}
                width={ANCHO_VB}
                height={alturaRelleno}
                fill={colors.accentDark}
              />
            </G>

            {/* Contorno, encima del relleno */}
            <Rect x={30} y={0} width={40} height={22} rx={6} fill="none" stroke={colors.borderAccent} strokeWidth={2} />
            <Rect
              x={8}
              y={18}
              width={84}
              height={142}
              rx={16}
              fill="none"
              stroke={colors.borderAccent}
              strokeWidth={2}
            />
          </Svg>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    gap: 10,
  },
  textoEstado: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: "center",
  },
  gaugeTrack: {
    width: ANCHO_GAUGE,
    height: ALTO_GAUGE,
    alignItems: "center",
    justifyContent: "center",
  },
});
