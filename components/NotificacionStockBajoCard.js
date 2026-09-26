import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { usePedido } from "../data/PedidoContext";
import { useData } from "../data/DataContext";
import { colors, continuousCorner, fonts, radii } from "../theme";

const OPCIONES_CALIBRACION = [
  { id: "como_esperaba", etiqueta: "Como esperaba" },
  { id: "menos", etiqueta: "Menos" },
  { id: "mas", etiqueta: "Más" },
];

export default function NotificacionStockBajoCard({ insumo }) {
  const { agregarAlPedido, quitarDelPedido, estaEnPedido } = usePedido();
  const { recalibrarMlPorUso } = useData();
  // Si el taller ya había tocado "Sí" antes (ej. volvió a esta pantalla),
  // el chip lo refleja en vez de arrancar en blanco.
  const [respuesta, setRespuesta] = useState(() => (estaEnPedido(insumo.id) ? "si" : null));

  // mlPorUso (ver components/insumos/ConfiguracionConsumoInsumo.js) es el
  // único dato real de consumo por insumo -- null en insumos todavía sin
  // configurar (incluidos TODOS los cargados con el modelo viejo de
  // diluciones/rendimiento, ver supabase/alter_insumos_ml_por_uso.sql). Sin
  // ese dato no hay con qué calcular usos restantes: se invita a completar
  // la configuración en vez de mostrar un número inventado (antes había un
  // placeholder fijo, USOS_ESTIMADOS_PRODUCTO_LLENO = 20, sin relación con
  // el consumo real de ESTE insumo).
  const tieneMlPorUso = Number(insumo.mlPorUso) > 0;
  const usosRestantes = tieneMlPorUso ? Math.floor((insumo.cantidadActual ?? 0) / insumo.mlPorUso) : null;

  // Calibración: "¿te rindió como esperabas, o te rindió menos/más?". Solo
  // tiene sentido si ya hay una estimación (mlPorUso) contra la que
  // comparar -- un insumo sin configurar ya tiene su propio aviso arriba,
  // invitando a cargarlo desde Mis Insumos, no desde acá.
  const [calibracion, setCalibracion] = useState(null);
  const [usosRealesTexto, setUsosRealesTexto] = useState("");
  const [guardandoCalibracion, setGuardandoCalibracion] = useState(false);
  const [calibracionGuardada, setCalibracionGuardada] = useState(false);
  const [errorCalibracion, setErrorCalibracion] = useState(null);

  function handleSi() {
    setRespuesta("si");
    agregarAlPedido({ id: insumo.id, nombre: insumo.nombre });
  }

  // El Sí/No de esta tarjeta es la ÚNICA forma de decidir si el insumo entra
  // al mensaje para el proveedor (SolicitarPedidoModal.js ya no tiene un
  // botón de borrar aparte) — tocar "No" tiene que sacarlo del pedido si ya
  // se había agregado con un "Sí" previo, no solo marcar el chip local.
  function handleNo() {
    setRespuesta("no");
    quitarDelPedido(insumo.id);
  }

  function elegirCalibracion(id) {
    setCalibracion(id);
    setErrorCalibracion(null);
    if (id === "como_esperaba") setUsosRealesTexto("");
  }

  // Recalcula mlPorUso a partir de lo que el taller dice haber sacado de
  // ESTE envase hasta ahora (ver DataContext.recalibrarMlPorUso) -- ajusta
  // la estimación para adelante, no reescribe ningún consumo ya
  // descontado.
  async function handleGuardarCalibracion() {
    const usos = Number(usosRealesTexto);
    if (!(usos > 0)) return;
    setGuardandoCalibracion(true);
    setErrorCalibracion(null);
    try {
      await recalibrarMlPorUso(insumo.id, usos);
      setCalibracionGuardada(true);
    } catch (err) {
      setErrorCalibracion("No se pudo ajustar. Probá de nuevo.");
    } finally {
      setGuardandoCalibracion(false);
    }
  }

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.texto}>
        {tieneMlPorUso
          ? `Quedan ${usosRestantes} usos de ${insumo.nombre}. Se acabará pronto. ¿Desea pedirlo a su proveedor?`
          : `${insumo.nombre} tiene poco stock. Completá su configuración en Mis Insumos para saber cuántos usos te quedan. ¿Desea pedirlo a su proveedor?`}
      </Text>

      <View style={styles.opciones}>
        <TouchableOpacity
          style={[styles.opcion, respuesta === "si" && styles.opcionSeleccionada]}
          onPress={handleSi}
          activeOpacity={0.8}
        >
          <Text style={[styles.opcionTexto, respuesta === "si" && styles.opcionTextoSeleccionado]}>
            Sí
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opcion, respuesta === "no" && styles.opcionSeleccionada]}
          onPress={handleNo}
          activeOpacity={0.8}
        >
          <Text style={[styles.opcionTexto, respuesta === "no" && styles.opcionTextoSeleccionado]}>
            No
          </Text>
        </TouchableOpacity>
      </View>

      {tieneMlPorUso && !calibracionGuardada && (
        <View style={styles.calibracion}>
          <Text style={styles.calibracionPregunta}>
            ¿Te rindió como esperabas, o te rindió menos / más?
          </Text>
          <View style={styles.opciones}>
            {OPCIONES_CALIBRACION.map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={[styles.opcion, calibracion === opcion.id && styles.opcionSeleccionada]}
                onPress={() => elegirCalibracion(opcion.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.opcionTexto, calibracion === opcion.id && styles.opcionTextoSeleccionado]}
                >
                  {opcion.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(calibracion === "menos" || calibracion === "mas") && (
            <View style={styles.calibracionInputFila}>
              <TextInput
                style={styles.calibracionInput}
                value={usosRealesTexto}
                onChangeText={(texto) => setUsosRealesTexto(texto.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="Usos reales de este envase"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.calibracionBoton,
                  (!usosRealesTexto || guardandoCalibracion) && styles.calibracionBotonDeshabilitado,
                ]}
                onPress={handleGuardarCalibracion}
                disabled={!usosRealesTexto || guardandoCalibracion}
                activeOpacity={0.85}
              >
                <Text style={styles.calibracionBotonTexto}>
                  {guardandoCalibracion ? "Guardando..." : "Ajustar"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {errorCalibracion && <Text style={styles.calibracionError}>{errorCalibracion}</Text>}
        </View>
      )}

      {calibracionGuardada && (
        <Text style={styles.calibracionOk}>✓ Ajustamos la estimación de consumo para los próximos usos.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 12,
  },
  texto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  opciones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  opcion: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  opcionSeleccionada: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  opcionTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  opcionTextoSeleccionado: {
    color: colors.bg,
  },
  calibracion: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  calibracionPregunta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  calibracionInputFila: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    alignItems: "center",
  },
  calibracionInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  calibracionBoton: {
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  calibracionBotonDeshabilitado: {
    backgroundColor: colors.accentDark,
  },
  calibracionBotonTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.bg,
  },
  calibracionError: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
  },
  calibracionOk: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.success,
    marginTop: 12,
  },
});
