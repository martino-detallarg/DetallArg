import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { esMismoDia, formatearFechaDDMMAAAA, formatearMesAnio, parsearFechaDDMMAAAA } from "../utils/fecha";
import { calcularFechaEntrega, ESTADOS_CERRADOS } from "../utils/entregas";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const INICIALES_DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

// Alto de una fila de la grilla (círculo del día de 34 + el padding vertical
// de la celda). Se usa para fijar la altura total de la grilla siempre en 6
// filas, el máximo posible en un calendario mensual (hay meses que solo
// necesitan 5), así el header y todo lo que va debajo de la grilla no saltan
// de posición según el mes visible.
const ALTO_FILA = 42;
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
  const { getServicioById } = useServicios();
  const [mesVisible, setMesVisible] = useState(fechaInicial ?? new Date());

  // Cada apertura arranca mostrando el mes de la fecha vigente de la
  // Agenda, no el último mes que se haya navegado en una apertura anterior.
  useEffect(() => {
    if (visible) setMesVisible(fechaInicial ?? new Date());
  }, [visible, fechaInicial]);

  // "Con turnos": todo día con al menos una llegada agendada, sin importar
  // el estado. "Con entrega estimada": fecha de llegada + duración del
  // servicio, SOLO cuando la duración está cargada en días (si es en horas,
  // o no hay servicio/duración, la entrega es el mismo día de la llegada —
  // no amerita marca aparte, ya la cubre "con turnos") y el trabajo todavía
  // no se cerró (Finalizado/Entregado ya se entregó, no queda "pendiente").
  const { diasConTurno, diasConEntrega } = useMemo(() => {
    const conTurno = new Set();
    const conEntrega = new Set();
    for (const turno of turnos) {
      const fechaLlegada = parsearFechaDDMMAAAA(turno.fecha);
      if (!fechaLlegada) continue;
      conTurno.add(formatearFechaDDMMAAAA(fechaLlegada));

      if (ESTADOS_CERRADOS.has(turno.estado)) continue;

      const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
      const fechaEntrega = calcularFechaEntrega(fechaLlegada, servicio);
      if (fechaEntrega.getTime() !== fechaLlegada.getTime()) {
        conEntrega.add(formatearFechaDDMMAAAA(fechaEntrega));
      }
    }
    return { diasConTurno: conTurno, diasConEntrega: conEntrega };
  }, [turnos, getServicioById]);

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
              const clave = formatearFechaDDMMAAAA(dia);
              const tieneTurno = diasConTurno.has(clave);
              const tieneEntrega = diasConEntrega.has(clave);

              return (
                <TouchableOpacity
                  key={dia.toISOString()}
                  style={styles.celda}
                  onPress={() => onSeleccionarDia(dia)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.circuloDia,
                      // El estilo de "hoy" (fondo sólido) tiene prioridad
                      // visual: si coincide con turno/entrega, no se dibuja
                      // ningún anillo encima.
                      !esHoy && tieneTurno && styles.circuloDiaConTurno,
                      !esHoy && !tieneTurno && tieneEntrega && styles.circuloDiaConEntrega,
                      esHoy && styles.circuloDiaHoy,
                    ]}
                  >
                    <Text style={[styles.numeroDia, esHoy && styles.numeroDiaHoy]}>{dia.getDate()}</Text>
                    {!esHoy && tieneTurno && tieneEntrega && <View style={styles.puntoEntregaEsquina} />}
                  </View>
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
            <View style={styles.referenciaItem}>
              <View style={[styles.referenciaPunto, { backgroundColor: colors.amber }]} />
              <Text style={styles.referenciaTexto}>Entrega estimada</Text>
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
  // Anillo (borde + fondo tenue) para "con turnos" y "con entrega
  // estimada" — se aplican al mismo círculo del día en vez del punto chico
  // de abajo que había antes, así conviven con el número sin ensanchar la
  // celda.
  circuloDiaConTurno: {
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: colors.successTint,
  },
  circuloDiaConEntrega: {
    borderWidth: 1.5,
    borderColor: colors.amber,
    backgroundColor: colors.amberTint,
  },
  numeroDia: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  numeroDiaHoy: {
    color: colors.bg,
  },
  // Punto superpuesto en la esquina del anillo verde para el caso "también
  // hay una entrega ese día" — el borde en colors.surface lo separa del
  // anillo de abajo para que se lea como una marca aparte, no como un
  // recorte del círculo.
  puntoEntregaEsquina: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.amber,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  referencia: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    rowGap: 8,
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
