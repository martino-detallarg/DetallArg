import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import { formatearFechaDDMMAAAA, formatearMesAnio } from "../utils/fecha";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const INICIALES_DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];
// Mismo criterio que AlmanaqueModal.js: 6 filas fijas para que el calendario
// no salte de alto según el mes visible tenga 5 o 6 semanas.
const ALTO_FILA = 44;
const FILAS_MAXIMAS_MES = 6;

// Réplica de obtenerCeldasDelMes de AlmanaqueModal.js — se duplica acá (en
// vez de importarla) porque este calendario no depende de TurnoContext ni
// del resto del armado de Agenda, es un selector de rango genérico.
function obtenerCeldasDelMes(mesVisible) {
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();
  const diaSemanaPrimerDia = new Date(anio, mes, 1).getDay();
  const celdasVacias = diaSemanaPrimerDia === 0 ? 6 : diaSemanaPrimerDia - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const celdas = Array.from({ length: celdasVacias }, () => null);
  for (let dia = 1; dia <= diasEnMes; dia++) celdas.push(new Date(anio, mes, dia));
  return celdas;
}

function esMismoDia(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Calendario mensual (mismo look que AlmanaqueModal.js de Agenda) pero para
// elegir un RANGO desde/hasta en vez de un solo día: el primer toque marca
// el "desde" (se resalta solo), el segundo toque posterior marca el "hasta"
// (se resalta el rango completo, con los días intermedios en un tono más
// tenue). Tocar antes del "desde" actual reinicia el rango desde ese día;
// tocar de nuevo con el rango ya completo también arranca uno nuevo.
export default function FiltroRangoFechaModal({ visible, rangoInicial, onConfirmar, onCerrar }) {
  const [mesVisible, setMesVisible] = useState(rangoInicial?.desde ?? new Date());
  const [desdeTemp, setDesdeTemp] = useState(rangoInicial?.desde ?? null);
  const [hastaTemp, setHastaTemp] = useState(rangoInicial?.hasta ?? null);

  // Cada apertura arranca desde el rango vigente del filtro (o vacío/mes
  // actual si todavía no hay ninguno), no desde una selección a medio hacer
  // de una apertura anterior que se haya cancelado.
  useEffect(() => {
    if (visible) {
      setMesVisible(rangoInicial?.desde ?? new Date());
      setDesdeTemp(rangoInicial?.desde ?? null);
      setHastaTemp(rangoInicial?.hasta ?? null);
    }
  }, [visible, rangoInicial]);

  const celdas = useMemo(() => obtenerCeldasDelMes(mesVisible), [mesVisible]);

  function irAMesAnterior() {
    setMesVisible((f) => new Date(f.getFullYear(), f.getMonth() - 1, 1));
  }

  function irAMesSiguiente() {
    setMesVisible((f) => new Date(f.getFullYear(), f.getMonth() + 1, 1));
  }

  function tocarDia(dia) {
    if (!desdeTemp || hastaTemp) {
      // Sin selección, o rango ya completo: arranca una selección nueva.
      setDesdeTemp(dia);
      setHastaTemp(null);
      return;
    }
    if (dia.getTime() < desdeTemp.getTime()) {
      setDesdeTemp(dia);
    } else {
      setHastaTemp(dia);
    }
  }

  function handleLimpiar() {
    onConfirmar({ desde: null, hasta: null });
  }

  function handleAplicar() {
    if (desdeTemp && hastaTemp) onConfirmar({ desde: desdeTemp, hasta: hastaTemp });
  }

  let tituloRango = "Elegí la fecha desde";
  if (desdeTemp && hastaTemp) {
    tituloRango = `${formatearFechaDDMMAAAA(desdeTemp)} — ${formatearFechaDDMMAAAA(hastaTemp)}`;
  } else if (desdeTemp) {
    tituloRango = `Desde ${formatearFechaDDMMAAAA(desdeTemp)} · elegí el hasta`;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <View style={styles.filaCerrar}>
            <TouchableOpacity onPress={onCerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.tituloRango}>{tituloRango}</Text>

          <View style={styles.header}>
            <TouchableOpacity onPress={irAMesAnterior} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.tituloMes}>{formatearMesAnio(mesVisible)}</Text>
            <TouchableOpacity onPress={irAMesSiguiente} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filaIniciales}>
            {INICIALES_DIAS_SEMANA.map((inicial, indice) => (
              <Text key={indice} style={styles.inicialDia}>
                {inicial}
              </Text>
            ))}
          </View>

          <View style={styles.grilla}>
            {celdas.map((dia, indice) => {
              if (!dia) return <View key={`vacia-${indice}`} style={styles.celda} />;

              const esDesde = esMismoDia(dia, desdeTemp);
              const esHasta = esMismoDia(dia, hastaTemp);
              const esPunta = esDesde || esHasta;
              const enRango =
                !!desdeTemp &&
                !!hastaTemp &&
                dia.getTime() > desdeTemp.getTime() &&
                dia.getTime() < hastaTemp.getTime();

              return (
                <TouchableOpacity
                  key={dia.toISOString()}
                  style={styles.celda}
                  onPress={() => tocarDia(dia)}
                  activeOpacity={0.7}
                >
                  <View style={styles.celdaInner}>
                    {enRango && <View style={styles.bandaCompleta} />}
                    {esDesde && hastaTemp && <View style={styles.bandaMitadDerecha} />}
                    {esHasta && desdeTemp && <View style={styles.bandaMitadIzquierda} />}
                    <View style={[styles.circuloDia, esPunta && styles.circuloDiaSeleccionado]}>
                      <Text style={[styles.numeroDia, esPunta && styles.numeroDiaSeleccionado]}>
                        {dia.getDate()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.botones}>
            <View style={styles.boton}>
              <Button title="Limpiar" variant="secondary" onPress={handleLimpiar} />
            </View>
            <View style={styles.boton}>
              <Button title="Aplicar" onPress={handleAplicar} disabled={!desdeTemp || !hastaTemp} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  filaCerrar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  tituloRango: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.accentLight,
    textAlign: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  tituloMes: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  filaIniciales: {
    flexDirection: "row",
  },
  inicialDia: {
    width: "14.2857%",
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    marginTop: 6,
    height: ALTO_FILA * FILAS_MAXIMAS_MES,
  },
  celda: {
    width: "14.2857%",
    height: ALTO_FILA,
  },
  celdaInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bandaCompleta: {
    position: "absolute",
    top: 5,
    bottom: 5,
    left: 0,
    right: 0,
    backgroundColor: colors.accentDark,
  },
  bandaMitadDerecha: {
    position: "absolute",
    top: 5,
    bottom: 5,
    left: "50%",
    right: 0,
    backgroundColor: colors.accentDark,
  },
  bandaMitadIzquierda: {
    position: "absolute",
    top: 5,
    bottom: 5,
    left: 0,
    right: "50%",
    backgroundColor: colors.accentDark,
  },
  circuloDia: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  circuloDiaSeleccionado: {
    backgroundColor: colors.accent,
  },
  numeroDia: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  numeroDiaSeleccionado: {
    color: colors.bg,
  },
  botones: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  boton: {
    flex: 1,
  },
});
