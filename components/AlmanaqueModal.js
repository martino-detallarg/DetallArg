import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTurnos } from "../data/TurnoContext";
import {
  esMismoDia,
  formatearFechaDDMMAAAA,
  formatearMesAnio,
  parsearFechaDDMMAAAA,
} from "../utils/fecha";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const INICIALES_DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

// Alto de una fila de la grilla (círculo del día de 34 + el espacio del
// punto de "con turnos" + el padding vertical de la celda). Se usa para fijar
// la altura total de la grilla siempre en 6 filas, el máximo posible en un
// calendario mensual (hay meses que solo necesitan 5), así el header y todo
// lo que va debajo de la grilla no saltan de posición según el mes visible.
const ALTO_FILA = 52;
const FILAS_MAXIMAS_MES = 6;

// Todas las celdas del mes de `mesVisible`, con `null` antes del día 1 para
// que la grilla arranque alineada al día de la semana real (la semana
// empieza en lunes, mismo criterio que obtenerDiasDeLaSemana en fecha.js).
function obtenerCeldasDelMes(mesVisible) {
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();
  const diaSemanaPrimerDia = new Date(anio, mes, 1).getDay(); // 0 = domingo
  const celdasVacias = diaSemanaPrimerDia === 0 ? 6 : diaSemanaPrimerDia - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const celdas = Array.from({ length: celdasVacias }, () => null);
  for (let dia = 1; dia <= diasEnMes; dia++) celdas.push(new Date(anio, mes, dia));
  return celdas;
}

// Almanaque mensual: se abre desde el ícono de calendario del header de
// Agenda. Tocar un día navega la Agenda a la semana que lo contiene con ese
// día seleccionado (mismo comportamiento que tocar un día en la tira
// semanal) y cierra el modal — lo resuelve el padre vía onSeleccionarDia.
export default function AlmanaqueModal({ visible, fechaInicial, onSeleccionarDia, onClose }) {
  const { turnos } = useTurnos();
  const [mesVisible, setMesVisible] = useState(fechaInicial ?? new Date());

  // Cada apertura arranca mostrando el mes de la fecha vigente de la
  // Agenda, no el último mes que se haya navegado en una apertura anterior.
  useEffect(() => {
    if (visible) setMesVisible(fechaInicial ?? new Date());
  }, [visible, fechaInicial]);

  const diasConTurno = useMemo(() => {
    const set = new Set();
    for (const turno of turnos) {
      const fechaParseada = parsearFechaDDMMAAAA(turno.fecha);
      if (fechaParseada) set.add(formatearFechaDDMMAAAA(fechaParseada));
    }
    return set;
  }, [turnos]);

  const celdas = useMemo(() => obtenerCeldasDelMes(mesVisible), [mesVisible]);

  function irAMesAnterior() {
    setMesVisible((f) => new Date(f.getFullYear(), f.getMonth() - 1, 1));
  }

  function irAMesSiguiente() {
    setMesVisible((f) => new Date(f.getFullYear(), f.getMonth() + 1, 1));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <View style={styles.filaCerrar}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

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

              const esHoy = esMismoDia(dia, new Date());
              const tieneTurno = diasConTurno.has(formatearFechaDDMMAAAA(dia));

              return (
                <TouchableOpacity
                  key={dia.toISOString()}
                  style={styles.celda}
                  onPress={() => onSeleccionarDia(dia)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.circuloDia, esHoy && styles.circuloDiaHoy]}>
                    <Text style={[styles.numeroDia, esHoy && styles.numeroDiaHoy]}>{dia.getDate()}</Text>
                  </View>
                  <View style={styles.puntoWrap}>{tieneTurno && <View style={styles.puntoTurno} />}</View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.referencia}>
            <View style={styles.referenciaItem}>
              <View style={[styles.referenciaPunto, { backgroundColor: colors.accent }]} />
              <Text style={styles.referenciaTexto}>Hoy</Text>
            </View>
            <View style={styles.referenciaItem}>
              <View style={[styles.referenciaPunto, { backgroundColor: colors.success }]} />
              <Text style={styles.referenciaTexto}>Con turnos</Text>
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
    alignItems: "center",
    paddingVertical: 4,
  },
  circuloDia: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  circuloDiaHoy: {
    backgroundColor: colors.accent,
  },
  numeroDia: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  numeroDiaHoy: {
    color: colors.bg,
  },
  puntoWrap: {
    height: 8,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  puntoTurno: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.success,
  },
  referencia: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 16,
  },
  referenciaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  referenciaPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  referenciaTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
