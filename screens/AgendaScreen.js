import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import TurnoCard from "../components/TurnoCard";
import TrabajoDetalleModal from "../components/TrabajoDetalleModal";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import {
  esMismoDia,
  formatearDiaSemanaCorto,
  formatearFechaLarga,
  obtenerDiasDeLaSemana,
  parsearFechaDDMMAAAA,
  sumarDias,
} from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function AgendaScreen({ navigation }) {
  const { turnos, actualizarEstadoTrabajo } = useTurnos();
  const { getClienteById, getVehiculoById } = useClientes();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date());
  const [turnoSeleccionadoId, setTurnoSeleccionadoId] = useState(null);

  const diasSemana = useMemo(() => obtenerDiasDeLaSemana(fechaSeleccionada), [fechaSeleccionada]);

  const { turnosDelDia, turnosSinFecha } = useMemo(() => {
    const conFecha = [];
    const sinFecha = [];
    for (const turno of turnos) {
      const fechaParseada = parsearFechaDDMMAAAA(turno.fecha);
      if (fechaParseada && esMismoDia(fechaParseada, fechaSeleccionada)) {
        conFecha.push(turno);
      } else if (!fechaParseada) {
        sinFecha.push(turno);
      }
    }
    const porHora = (a, b) => a.hora.localeCompare(b.hora);
    return { turnosDelDia: conFecha.sort(porHora), turnosSinFecha: sinFecha.sort(porHora) };
  }, [turnos, fechaSeleccionada]);

  const turnoSeleccionado = turnos.find((t) => t.id === turnoSeleccionadoId) ?? null;
  const esHoy = esMismoDia(fechaSeleccionada, new Date());

  function renderTurno(turno) {
    return (
      <TurnoCard
        key={turno.id}
        turno={turno}
        cliente={getClienteById(turno.clienteId)}
        auto={getVehiculoById(turno.autoId)}
        onPress={() => setTurnoSeleccionadoId(turno.id)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <View style={styles.selectorSemana}>
        <TouchableOpacity
          onPress={() => setFechaSeleccionada((f) => sumarDias(f, -7))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.diasFila}>
          {diasSemana.map((dia) => {
            const seleccionado = esMismoDia(dia, fechaSeleccionada);
            const esHoyEsteDia = esMismoDia(dia, new Date());
            return (
              <TouchableOpacity
                key={dia.toISOString()}
                style={[styles.diaChip, seleccionado && styles.diaChipSeleccionado]}
                onPress={() => setFechaSeleccionada(dia)}
                activeOpacity={0.8}
              >
                <Text style={[styles.diaLabel, seleccionado && styles.diaTextoSeleccionado]}>
                  {formatearDiaSemanaCorto(dia)}
                </Text>
                <Text
                  style={[
                    styles.diaNumero,
                    esHoyEsteDia && !seleccionado && styles.diaNumeroHoy,
                    seleccionado && styles.diaTextoSeleccionado,
                  ]}
                >
                  {dia.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => setFechaSeleccionada((f) => sumarDias(f, 7))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.tituloFila}>
          <Text style={styles.tituloDia}>
            {esHoy ? "Hoy, " : ""}
            {formatearFechaLarga(fechaSeleccionada)}
          </Text>
          {!esHoy && (
            <TouchableOpacity onPress={() => setFechaSeleccionada(new Date())}>
              <Text style={styles.botonHoy}>Hoy</Text>
            </TouchableOpacity>
          )}
        </View>

        {turnosDelDia.length > 0 ? (
          turnosDelDia.map(renderTurno)
        ) : (
          <Text style={styles.vacio}>No hay turnos para este día.</Text>
        )}

        {turnosSinFecha.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Sin fecha asignada</Text>
            {turnosSinFecha.map(renderTurno)}
          </>
        )}
      </ScrollView>

      <TrabajoDetalleModal
        visible={turnoSeleccionado !== null}
        turno={turnoSeleccionado}
        cliente={turnoSeleccionado ? getClienteById(turnoSeleccionado.clienteId) : null}
        auto={turnoSeleccionado ? getVehiculoById(turnoSeleccionado.autoId) : null}
        onCambiarEstado={(nuevoEstado) => actualizarEstadoTrabajo(turnoSeleccionado.id, nuevoEstado)}
        onClose={() => setTurnoSeleccionadoId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  selectorSemana: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  diasFila: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  diaChip: {
    width: 40,
    paddingVertical: 8,
    borderRadius: radii.button,
    ...continuousCorner,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  diaChipSeleccionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  diaLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  diaNumero: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 2,
  },
  diaNumeroHoy: {
    color: colors.accentLight,
  },
  diaTextoSeleccionado: {
    color: colors.bg,
  },
  contenido: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  tituloFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  tituloDia: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    textTransform: "capitalize",
    flexShrink: 1,
  },
  botonHoy: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.accentLight,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 4,
  },
  vacio: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 24,
  },
});
