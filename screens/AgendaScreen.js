import { useMemo, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  diferenciaEnDias,
  esMismoDia,
  formatearDiaSemanaCorto,
  formatearFechaLarga,
  formatearMesAnio,
  parsearFechaDDMMAAAA,
  sumarDias,
} from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Ancho fijo de cada día de la rueda (incluye separación) y rango total de
// la tira continua (±1 año desde que se abre la pantalla, no hace falta
// más para una agenda de turnos de taller) — ver el mecanismo completo más
// abajo, en AgendaScreen.
const ANCHO_ITEM_DIA = 56;
const ANCHO_MARCO = 48;
const RANGO_DIAS_RUEDA = 365;

function obtenerLayoutItemDia(data, index) {
  return { length: ANCHO_ITEM_DIA, offset: ANCHO_ITEM_DIA * index, index };
}

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
  // Ancho medido del viewport de la rueda de días (entre las dos flechas):
  // centra el marco fijo y define el padding lateral que deja llegar al
  // centro incluso al primer/último día de la rueda.
  const [anchoTira, setAnchoTira] = useState(0);
  const ruedaRef = useRef(null);
  // Fecha ancla FIJA (no se recalcula en cada render): sobre ella se arma
  // el rango de la rueda una sola vez, en el primer render.
  const hoyBaseRef = useRef(new Date());
  // Estado del gesto para el feedback háptico (ver handleScrollRueda): en
  // refs, no en state, porque no deben disparar re-render — solo importan
  // como lectura/escritura imperativa mientras se procesan eventos de
  // scroll.
  const arrastrandoRuedaRef = useRef(false);

  const diasRueda = useMemo(() => {
    const base = hoyBaseRef.current;
    return Array.from({ length: RANGO_DIAS_RUEDA * 2 + 1 }, (_, i) => sumarDias(base, i - RANGO_DIAS_RUEDA));
  }, []);

  // Convierte una fecha en su índice dentro de diasRueda, recortado a los
  // bordes del rango — si viene una fecha muy lejana (ej. elegida a mano
  // desde AlmanaqueModal, que no tiene límite de meses), la rueda se
  // posiciona en el extremo más cercano en vez de romper; el día
  // seleccionado en sí (fechaSeleccionada) no se recorta, solo dónde cae la
  // rueda visualmente.
  function indiceDeFecha(fecha) {
    const indice = diferenciaEnDias(hoyBaseRef.current, fecha) + RANGO_DIAS_RUEDA;
    return Math.min(Math.max(indice, 0), diasRueda.length - 1);
  }

  // Solo importa el valor del primer render: initialScrollIndex de
  // FlatList no reacciona a cambios posteriores.
  const [indiceInicialRueda] = useState(() => indiceDeFecha(fechaSeleccionada));
  // Último índice para el que ya sonó un "click" háptico — arranca
  // sincronizado con la posición inicial para no vibrar de más en el
  // primer gesto.
  const indiceHapticoRef = useRef(indiceInicialRueda);

  function irAFecha(fecha, animado = true) {
    const indice = indiceDeFecha(fecha);
    setFechaSeleccionada(fecha);
    // Los saltos programáticos (Hoy/Almanaque/flechas/tap) no deben vibrar
    // — solo el arrastre real, ver handleScrollRueda — pero sí hay que
    // sincronizar la referencia para que el próximo arrastre arranque
    // desde la posición correcta.
    indiceHapticoRef.current = indice;
    ruedaRef.current?.scrollToOffset({ offset: indice * ANCHO_ITEM_DIA, animated: animado });
  }

  // Vibración táctil (haptics) al pasar de un día a otro mientras se
  // arrastra: solo entre onScrollBeginDrag y onMomentumScrollEnd (gesto
  // real del usuario), y solo cuando cambia el índice centrado — no en
  // cada frame de scroll, si no vibraría todo el tiempo mientras el dedo
  // sigue dentro del mismo día.
  function handleScrollRueda(evento) {
    if (!arrastrandoRuedaRef.current) return;
    const x = evento.nativeEvent.contentOffset.x;
    const indice = Math.min(Math.max(Math.round(x / ANCHO_ITEM_DIA), 0), diasRueda.length - 1);
    if (indice !== indiceHapticoRef.current) {
      indiceHapticoRef.current = indice;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

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

  // Al asentarse el scroll de la rueda (fin de inercia, o fin de un
  // arrastre sin inercia) el día que quedó bajo el marco fijo pasa a ser el
  // seleccionado. A propósito NO se actualiza en cada frame de arrastre:
  // fechaSeleccionada dispara el recálculo de turnosDelDia de abajo (ver
  // más abajo), y no tiene sentido recalcularlo mientras el usuario todavía
  // está deslizando — mismo criterio que ya usaba el carrusel semanal
  // anterior.
  function handleFinDeScrollRueda(evento) {
    const x = evento.nativeEvent.contentOffset.x;
    const indice = Math.min(Math.max(Math.round(x / ANCHO_ITEM_DIA), 0), diasRueda.length - 1);
    const fecha = diasRueda[indice];
    indiceHapticoRef.current = indice;
    if (!esMismoDia(fecha, fechaSeleccionada)) {
      setFechaSeleccionada(fecha);
    }
  }

  // La selección no se pinta por ítem (ni fondo ni color de texto propio):
  // el marco fijo de encima ya comunica solo con la posición cuál es el día
  // elegido, como en un selector de fecha tipo "rueda". Lo único que sigue
  // siendo una marca por ítem es "hoy", que no depende del scroll.
  function renderDiaRueda({ item: dia }) {
    const esHoyEsteDia = esMismoDia(dia, new Date());
    return (
      <TouchableOpacity style={styles.diaItem} onPress={() => irAFecha(dia)} activeOpacity={0.7}>
        <Text style={styles.diaLabel}>{formatearDiaSemanaCorto(dia)}</Text>
        <Text style={[styles.diaNumero, esHoyEsteDia && styles.diaNumeroHoy]}>{dia.getDate()}</Text>
      </TouchableOpacity>
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
          <TouchableOpacity style={styles.botonHoyChip} onPress={() => irAFecha(new Date())} activeOpacity={0.85}>
            <Text style={styles.botonHoyChipTexto}>Hoy</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.mesAnio}>{formatearMesAnio(fechaSeleccionada)}</Text>

      <View style={styles.selectorSemana}>
        <TouchableOpacity
          onPress={() => irAFecha(sumarDias(fechaSeleccionada, -7))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View
          style={styles.tiraContenedor}
          onLayout={(evento) => setAnchoTira(evento.nativeEvent.layout.width)}
        >
          {anchoTira > 0 && (
            <>
              {/* Marco fijo: no se mueve nunca, solo marca visualmente el
              centro. Se pinta ANTES que la FlatList (queda detrás) y es un
              contorno + fondo tenue, no un bloque sólido, para que el
              número que cae adentro se siga leyendo con claridad. La
              selección real la resuelve handleFinDeScrollRueda, no este
              overlay (por eso pointerEvents="none"). */}
              <View style={styles.marco} pointerEvents="none" />
              <FlatList
                ref={ruedaRef}
                data={diasRueda}
                keyExtractor={(dia) => dia.toISOString()}
                renderItem={renderDiaRueda}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ANCHO_ITEM_DIA}
                decelerationRate="fast"
                getItemLayout={obtenerLayoutItemDia}
                initialScrollIndex={indiceInicialRueda}
                contentContainerStyle={{ paddingHorizontal: Math.max(0, (anchoTira - ANCHO_ITEM_DIA) / 2) }}
                onScrollBeginDrag={() => {
                  arrastrandoRuedaRef.current = true;
                }}
                onScroll={handleScrollRueda}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(evento) => {
                  arrastrandoRuedaRef.current = false;
                  handleFinDeScrollRueda(evento);
                }}
                onScrollEndDrag={handleFinDeScrollRueda}
              />
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => irAFecha(sumarDias(fechaSeleccionada, 7))}
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

          <TouchableOpacity
            onPress={() => navigation.navigate("HistorialClientes")}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={styles.linkHistorialWrap}
          >
            <Text style={styles.linkHistorial}>Ver historial de clientes</Text>
          </TouchableOpacity>
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
          irAFecha(dia);
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
    fontFamily: fonts.bodySemiBold,
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
  diaItem: {
    width: ANCHO_ITEM_DIA,
    paddingVertical: 8,
    alignItems: "center",
  },
  diaLabel: {
    fontFamily: fonts.bodySemiBold,
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
  marco: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: ANCHO_MARCO,
    marginLeft: -ANCHO_MARCO / 2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint,
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
  linkHistorialWrap: {
    alignItems: "center",
    marginTop: 20,
  },
  linkHistorial: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: "underline",
  },
});
