import { useMemo, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import TurnoCard from "../components/TurnoCard";
import TrabajoDetalleModal from "../components/TrabajoDetalleModal";
import AlmanaqueModal from "../components/AlmanaqueModal";
import FiltroEmpleadoModal from "../components/FiltroEmpleadoModal";
import EstadoCarga from "../components/EstadoCarga";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import { useEquipo } from "../data/EquipoContext";
import {
  esMismoDia,
  formatearDiaSemanaCorto,
  formatearFechaLarga,
  formatearMesAnio,
  obtenerDiasDeLaSemana,
  parsearFechaDDMMAAAA,
  sumarDias,
} from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function AgendaScreen({ navigation }) {
  const { turnos, cargandoTurnos, errorCargaTurnos, recargarTurnos, actualizarEstadoTrabajo, eliminarTurno } =
    useTurnos();
  const { getClienteById, getVehiculoById } = useClientes();
  const { empleados } = useEquipo();
  const empleadosActivos = empleados.filter((e) => e.activo);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date());
  const [turnoSeleccionadoId, setTurnoSeleccionadoId] = useState(null);
  const [almanaqueVisible, setAlmanaqueVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [empleadoFiltroId, setEmpleadoFiltroId] = useState(null);
  const [filtroEmpleadoVisible, setFiltroEmpleadoVisible] = useState(false);
  // Ancho medido de la tira de días (entre las dos flechas), para armar el
  // carrusel de 3 páginas (semana anterior/actual/siguiente) que permite
  // deslizar con el dedo — ver handleScrollEndTira.
  const [anchoTira, setAnchoTira] = useState(0);
  const scrollTiraRef = useRef(null);

  const diasSemana = useMemo(() => obtenerDiasDeLaSemana(fechaSeleccionada), [fechaSeleccionada]);
  const diasSemanaAnterior = useMemo(
    () => obtenerDiasDeLaSemana(sumarDias(fechaSeleccionada, -7)),
    [fechaSeleccionada]
  );
  const diasSemanaSiguiente = useMemo(
    () => obtenerDiasDeLaSemana(sumarDias(fechaSeleccionada, 7)),
    [fechaSeleccionada]
  );

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

  // Buscador (por nombre de cliente) y filtro por empleado se combinan por
  // intersección — no pisan la tira de días ni el almanaque, que siguen
  // calculándose sobre TODOS los turnos (turnosDelDia/turnosSinFecha de
  // arriba), esto solo recorta qué se lista debajo.
  const terminoBusqueda = busqueda.trim().toLowerCase();
  function coincideConFiltros(turno) {
    if (terminoBusqueda) {
      const nombreCliente = getClienteById(turno.clienteId)?.nombre ?? "";
      if (!nombreCliente.toLowerCase().includes(terminoBusqueda)) return false;
    }
    if (empleadoFiltroId) {
      const asignado = turno.empleadosAsignados?.some((e) => e.empleadoId === empleadoFiltroId);
      if (!asignado) return false;
    }
    return true;
  }
  const turnosDelDiaFiltrados = turnosDelDia.filter(coincideConFiltros);
  const turnosSinFechaFiltrados = turnosSinFecha.filter(coincideConFiltros);

  const empleadoFiltro = empleadosActivos.find((e) => e.id === empleadoFiltroId) ?? null;
  const turnoSeleccionado = turnos.find((t) => t.id === turnoSeleccionadoId) ?? null;
  const esHoy = esMismoDia(fechaSeleccionada, new Date());

  // La tira de días queda siempre "parqueada" en la página del medio cuando
  // no se está arrastrando: al terminar un swipe que aterriza en la página
  // izquierda/derecha, se avanza/retrocede la semana Y se reacomoda el
  // scroll de vuelta al medio en el mismo gesto, para que el próximo swipe
  // siga funcionando igual.
  function handleScrollEndTira(evento) {
    if (!anchoTira) return;
    const x = evento.nativeEvent.contentOffset.x;
    const pagina = Math.round(x / anchoTira);
    if (pagina === 1) return;

    scrollTiraRef.current?.scrollTo({ x: anchoTira, animated: false });
    if (pagina === 0) {
      setFechaSeleccionada((f) => sumarDias(f, -7));
    } else if (pagina === 2) {
      setFechaSeleccionada((f) => sumarDias(f, 7));
    }
  }

  function renderDiasFila(dias) {
    return (
      <View style={[styles.diasFila, { width: anchoTira }]}>
        {dias.map((dia) => {
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
    );
  }

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

      <View style={styles.encabezadoFila}>
        <Text style={styles.tituloAgenda}>Agenda</Text>
        {!esHoy && (
          <TouchableOpacity style={styles.botonHoyChip} onPress={() => setFechaSeleccionada(new Date())} activeOpacity={0.85}>
            <Text style={styles.botonHoyChipTexto}>Hoy</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.mesAnio}>{formatearMesAnio(diasSemana[0])}</Text>

      <View style={styles.selectorSemana}>
        <TouchableOpacity
          onPress={() => setFechaSeleccionada((f) => sumarDias(f, -7))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View
          style={styles.tiraContenedor}
          onLayout={(evento) => setAnchoTira(evento.nativeEvent.layout.width)}
        >
          {anchoTira > 0 && (
            <ScrollView
              ref={scrollTiraRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEndTira}
              contentOffset={{ x: anchoTira, y: 0 }}
            >
              {renderDiasFila(diasSemanaAnterior)}
              {renderDiasFila(diasSemana)}
              {renderDiasFila(diasSemanaSiguiente)}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setFechaSeleccionada((f) => sumarDias(f, 7))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonAlmanaque}
          onPress={() => setAlmanaqueVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosFila}>
        <View style={styles.buscadorWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.buscadorInput}
            placeholder="Buscar por cliente..."
            placeholderTextColor={colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {empleadosActivos.length > 0 && (
          <TouchableOpacity
            style={[styles.filtroEmpleadoChip, empleadoFiltroId && styles.filtroEmpleadoChipActivo]}
            onPress={() => setFiltroEmpleadoVisible(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.filtroEmpleadoTexto, empleadoFiltroId && styles.filtroEmpleadoTextoActivo]}
              numberOfLines={1}
            >
              {empleadoFiltro ? empleadoFiltro.nombre : "Todos los empleados"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={empleadoFiltroId ? colors.bg : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      <EstadoCarga cargando={cargandoTurnos} error={errorCargaTurnos} onReintentar={recargarTurnos}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <Text style={styles.tituloDia}>
            {esHoy ? "Hoy, " : ""}
            {formatearFechaLarga(fechaSeleccionada)}
          </Text>

          {turnosDelDia.length === 0 ? (
            <Text style={styles.vacio}>No hay turnos para este día.</Text>
          ) : turnosDelDiaFiltrados.length === 0 ? (
            <Text style={styles.vacio}>No se encontraron turnos.</Text>
          ) : (
            turnosDelDiaFiltrados.map(renderTurno)
          )}

          {turnosSinFechaFiltrados.length > 0 && (
            <>
              <Text style={styles.seccionTitulo}>Sin fecha asignada</Text>
              {turnosSinFechaFiltrados.map(renderTurno)}
            </>
          )}
        </ScrollView>
      </EstadoCarga>

      <TrabajoDetalleModal
        visible={turnoSeleccionado !== null}
        turno={turnoSeleccionado}
        cliente={turnoSeleccionado ? getClienteById(turnoSeleccionado.clienteId) : null}
        auto={turnoSeleccionado ? getVehiculoById(turnoSeleccionado.autoId) : null}
        onCambiarEstado={(nuevoEstado) => actualizarEstadoTrabajo(turnoSeleccionado.id, nuevoEstado)}
        onEliminar={async () => {
          await eliminarTurno(turnoSeleccionado.id);
          setTurnoSeleccionadoId(null);
        }}
        onClose={() => setTurnoSeleccionadoId(null)}
      />

      <AlmanaqueModal
        visible={almanaqueVisible}
        fechaInicial={fechaSeleccionada}
        onSeleccionarDia={(dia) => {
          setFechaSeleccionada(dia);
          setAlmanaqueVisible(false);
        }}
        onClose={() => setAlmanaqueVisible(false)}
      />

      <FiltroEmpleadoModal
        visible={filtroEmpleadoVisible}
        empleados={empleadosActivos}
        empleadoSeleccionadoId={empleadoFiltroId}
        onElegir={(id) => {
          setEmpleadoFiltroId(id);
          setFiltroEmpleadoVisible(false);
        }}
        onCerrar={() => setFiltroEmpleadoVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  encabezadoFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  tituloAgenda: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
  },
  botonHoyChip: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  botonHoyChipTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.bg,
  },
  mesAnio: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  selectorSemana: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  tiraContenedor: {
    flex: 1,
  },
  botonAlmanaque: {
    marginLeft: 10,
  },
  filtrosFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  buscadorWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 14,
    height: 44,
  },
  buscadorInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
    height: "100%",
  },
  filtroEmpleadoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 130,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 12,
    height: 44,
  },
  filtroEmpleadoChipActivo: {
    backgroundColor: colors.accent,
  },
  filtroEmpleadoTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  filtroEmpleadoTextoActivo: {
    color: colors.bg,
  },
  diasFila: {
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
  tituloDia: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    textTransform: "capitalize",
    paddingHorizontal: 20,
    marginBottom: 4,
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
