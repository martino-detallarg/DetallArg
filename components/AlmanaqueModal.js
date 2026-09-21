import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { diferenciaEnDias, esMismoDia, formatearFechaDDMMAAAA, formatearMesAnio, sumarDias } from "../utils/fecha";
import { obtenerRangoTurno } from "../utils/entregas";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Prioridad visual de cada día de la grilla — mismo criterio que los 3
// baldes de "Turnos activos" en HomeScreen.js: un turno atrasado pesa más
// que uno Finalizado sin entregar, que a su vez pesa más que uno
// simplemente activo (recién llegado o en curso). Si varios turnos tocan el
// mismo día con niveles distintos, gana el más alto.
const NIVEL = { ATRASADO: 3, A_ENTREGAR: 2, ACTIVO: 1 };

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

  // Nivel de cada día del mes VISIBLE (clave "DD/MM/AAAA" -> NIVEL más alto
  // encontrado). Entregado queda afuera a propósito (mismo criterio que
  // AgendaScreen.js): es un registro histórico cerrado, no aporta urgencia.
  // Por cada turno activo se recorre solo la intersección de su rango
  // [inicio, entrega] con el mes visible — así un turno larguísimo (o una
  // duración mal cargada) nunca itera más de los ~31 días del mes, sin
  // importar cuánto abarque en total.
  const nivelPorDia = useMemo(() => {
    const mapa = new Map();
    const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const ultimoDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0);

    function marcar(dia, nivel) {
      const clave = formatearFechaDDMMAAAA(dia);
      if ((mapa.get(clave) ?? 0) < nivel) mapa.set(clave, nivel);
    }

    for (const turno of turnos) {
      if (turno.estado === "Entregado") continue;

      const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
      const rango = obtenerRangoTurno(turno, servicio);
      if (!rango) continue;

      const desde = rango.inicio.getTime() > primerDiaMes.getTime() ? rango.inicio : primerDiaMes;
      const hasta = rango.instanteEntrega.getTime() < ultimoDiaMes.getTime() ? rango.instanteEntrega : ultimoDiaMes;
      const cantidadDias = diferenciaEnDias(desde, hasta);
      if (cantidadDias < 0) continue; // el rango del turno no toca este mes

      for (let i = 0; i <= cantidadDias; i++) {
        const dia = sumarDias(desde, i);
        // "Atrasado" gana siempre, en cualquier día de su rango (mismo
        // criterio que TurnoCard.js). Si no, un Finalizado sin entregar
        // pesa como "a entregar" en TODOS sus días (ya terminó, está
        // esperando retiro, no tiene sentido marcarlo "en curso"). El resto
        // (Pendiente/En proceso a tiempo) solo pesa "a entregar" en su día
        // de entrega real; cualquier otro día de su rango es "activo".
        let nivel;
        if (rango.atrasado) {
          nivel = NIVEL.ATRASADO;
        } else if (turno.estado === "Finalizado" || diferenciaEnDias(dia, rango.instanteEntrega) === 0) {
          nivel = NIVEL.A_ENTREGAR;
        } else {
          nivel = NIVEL.ACTIVO;
        }
        marcar(dia, nivel);
      }
    }
    return mapa;
  }, [turnos, getServicioById, mesVisible]);

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
              const nivel = nivelPorDia.get(formatearFechaDDMMAAAA(dia)) ?? 0;

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
                      // visual: si coincide con algún nivel de urgencia, no
                      // se dibuja ningún anillo encima.
                      !esHoy && nivel === NIVEL.ATRASADO && styles.circuloDiaAtrasado,
                      !esHoy && nivel === NIVEL.A_ENTREGAR && styles.circuloDiaAEntregar,
                      !esHoy && nivel === NIVEL.ACTIVO && styles.circuloDiaActivo,
                      esHoy && styles.circuloDiaHoy,
                    ]}
                  >
                    <Text style={[styles.numeroDia, esHoy && styles.numeroDiaHoy]}>{dia.getDate()}</Text>
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
              <View style={[styles.referenciaPunto, { backgroundColor: colors.error }]} />
              <Text style={styles.referenciaTexto}>Atrasado</Text>
            </View>
            <View style={styles.referenciaItem}>
              <View style={[styles.referenciaPunto, { backgroundColor: colors.amber }]} />
              <Text style={styles.referenciaTexto}>A entregar</Text>
            </View>
            <View style={styles.referenciaItem}>
              <View style={[styles.referenciaPunto, { backgroundColor: colors.success }]} />
              <Text style={styles.referenciaTexto}>En curso</Text>
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
    fontFamily: fonts.bodySemiBold,
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
  // Anillo (borde + fondo tenue) según el nivel de urgencia del día — rojo
  // gana sobre amber, que gana sobre verde (ver NIVEL más arriba).
  circuloDiaAtrasado: {
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.errorTint,
  },
  circuloDiaAEntregar: {
    borderWidth: 1.5,
    borderColor: colors.amber,
    backgroundColor: colors.amberTint,
  },
  circuloDiaActivo: {
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: colors.successTint,
  },
  numeroDia: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  numeroDiaHoy: {
    color: colors.bg,
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
