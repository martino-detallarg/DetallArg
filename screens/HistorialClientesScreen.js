import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import EstadoCarga from "../components/EstadoCarga";
import FiltroVehiculoModal from "../components/FiltroVehiculoModal";
import FiltroServicioModal from "../components/FiltroServicioModal";
import FiltroRangoFechaModal from "../components/FiltroRangoFechaModal";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import { useServicios } from "../data/ServicioContext";
import { formatearFechaDDMMAAAA, parsearFechaDDMMAAAA } from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Mismo criterio de color por estado que TurnoCard.js.
const COLOR_PUNTO_ESTADO = {
  Pendiente: colors.error,
  "En proceso": colors.amber,
  Finalizado: colors.success,
  Entregado: colors.success,
};

function FilaTurno({ turno, cliente, auto }) {
  const colorEstado = COLOR_PUNTO_ESTADO[turno.estado] ?? colors.textMuted;
  const vehiculoTexto = auto ? `${auto.marca} ${auto.modelo}` : "Auto sin datos";
  const subtitulo = turno.servicio ? `${vehiculoTexto} · ${turno.servicio}` : vehiculoTexto;

  return (
    <View style={styles.fila}>
      <View style={[styles.punto, { backgroundColor: colorEstado }]} />

      <View style={styles.filaInfo}>
        <Text style={styles.filaCliente} numberOfLines={1} ellipsizeMode="tail">
          {cliente?.nombre ?? "Cliente sin datos"}
        </Text>
        <Text style={styles.filaSub} numberOfLines={1} ellipsizeMode="tail">
          {subtitulo}
        </Text>
      </View>

      <Text style={styles.filaFecha} numberOfLines={1}>
        {turno.fecha || "Sin fecha"}
      </Text>
    </View>
  );
}

// Chip de filtro genérico (Vehículo/Servicio/Fecha): sin contorno, fondo
// sólido que pasa a colors.accent cuando hay un valor elegido, con una "x"
// para limpiarlo sin tener que reabrir el selector y volver a elegir "Todos".
function FiltroChip({ icono, placeholder, textoActivo, activo, onPress, onLimpiar }) {
  return (
    <TouchableOpacity style={[styles.filtroChip, activo && styles.filtroChipActivo]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icono} size={14} color={activo ? colors.bg : colors.textMuted} />
      <Text style={[styles.filtroChipTexto, activo && styles.filtroChipTextoActivo]} numberOfLines={1}>
        {activo ? textoActivo : placeholder}
      </Text>
      {activo ? (
        <TouchableOpacity onPress={onLimpiar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={14} color={colors.bg} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

// Listado de TODOS los turnos (pasados y futuros, de todos los clientes),
// pantalla de solo lectura — no toca TurnoContext/ClienteContext/ServicioContext
// más allá de leerlos. Se llega acá desde Home (sin filtro), desde el menú de
// Mi Taller (sin filtro) o desde la ficha de un cliente (con su nombre ya
// cargado en el buscador, ver el efecto de abajo).
export default function HistorialClientesScreen({ navigation, route }) {
  const { turnos, cargandoTurnos, errorCargaTurnos, recargarTurnos } = useTurnos();
  const { clientes, getClienteById, getVehiculoById } = useClientes();
  const { servicios } = useServicios();

  const [busqueda, setBusqueda] = useState("");
  const [vehiculoFiltroId, setVehiculoFiltroId] = useState(null);
  const [servicioFiltroId, setServicioFiltroId] = useState(null);
  const [rangoFechaFiltro, setRangoFechaFiltro] = useState({ desde: null, hasta: null });

  const [vehiculoModalVisible, setVehiculoModalVisible] = useState(false);
  const [servicioModalVisible, setServicioModalVisible] = useState(false);
  const [rangoFechaModalVisible, setRangoFechaModalVisible] = useState(false);

  // Si se llega desde la ficha de un cliente (VehiculosClienteModal), el
  // filtro de cliente ya viene aplicado precargando el buscador con su
  // nombre — mismo mecanismo de búsqueda por nombre que si el usuario lo
  // hubiera tipeado a mano, así el usuario no tiene que volver a buscarlo.
  useEffect(() => {
    const clienteIdInicial = route.params?.clienteIdInicial;
    if (!clienteIdInicial) return;
    const cliente = getClienteById(clienteIdInicial);
    if (cliente) setBusqueda(cliente.nombre);
  }, [route.params?.clienteIdInicial]);

  const vehiculoFiltro = vehiculoFiltroId ? getVehiculoById(vehiculoFiltroId) : null;
  const servicioFiltro = servicioFiltroId ? servicios.find((s) => s.id === servicioFiltroId) : null;

  // Orden: más reciente/próximo primero, más antiguo al final (mismo helper
  // de parseo que usa Agenda) — los turnos sin fecha parseable se separan
  // en su propia sección al final, mismo criterio que AgendaScreen.js.
  const { turnosConFecha, turnosSinFecha } = useMemo(() => {
    const conFecha = [];
    const sinFecha = [];
    for (const turno of turnos) {
      const fechaParseada = parsearFechaDDMMAAAA(turno.fecha);
      if (fechaParseada) conFecha.push({ turno, fechaParseada });
      else sinFecha.push(turno);
    }
    conFecha.sort((a, b) => {
      const diferencia = b.fechaParseada.getTime() - a.fechaParseada.getTime();
      return diferencia !== 0 ? diferencia : b.turno.hora.localeCompare(a.turno.hora);
    });
    return { turnosConFecha: conFecha.map((x) => x.turno), turnosSinFecha: sinFecha };
  }, [turnos]);

  // Buscador (por nombre de cliente) y los tres filtros se combinan por
  // intersección, mismo criterio que el buscador+filtro de Agenda.
  const terminoBusqueda = busqueda.trim().toLowerCase();
  const { desde: fechaDesde, hasta: fechaHasta } = rangoFechaFiltro;
  const hayRangoFecha = !!fechaDesde && !!fechaHasta;

  function coincideConFiltros(turno) {
    if (terminoBusqueda) {
      const nombreCliente = getClienteById(turno.clienteId)?.nombre ?? "";
      if (!nombreCliente.toLowerCase().includes(terminoBusqueda)) return false;
    }
    if (vehiculoFiltroId && turno.autoId !== vehiculoFiltroId) return false;
    if (servicioFiltroId && turno.servicioId !== servicioFiltroId) return false;
    if (hayRangoFecha) {
      // Un turno sin fecha parseable nunca puede caer dentro de un rango.
      const fechaTurno = parsearFechaDDMMAAAA(turno.fecha);
      if (!fechaTurno) return false;
      if (fechaTurno.getTime() < fechaDesde.getTime() || fechaTurno.getTime() > fechaHasta.getTime()) return false;
    }
    return true;
  }

  const turnosConFechaFiltrados = turnosConFecha.filter(coincideConFiltros);
  const turnosSinFechaFiltrados = turnosSinFecha.filter(coincideConFiltros);
  const totalFiltrado = turnosConFechaFiltrados.length + turnosSinFechaFiltrados.length;

  function renderTurno(turno) {
    return (
      <FilaTurno
        key={turno.id}
        turno={turno}
        cliente={getClienteById(turno.clienteId)}
        auto={getVehiculoById(turno.autoId)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.goBack()} />

      <Text style={styles.titulo}>Historial de Clientes</Text>

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

      <View style={styles.filtrosFila}>
        <FiltroChip
          icono="car-outline"
          placeholder="Vehículo"
          textoActivo={vehiculoFiltro ? `${vehiculoFiltro.marca} ${vehiculoFiltro.modelo}` : "Vehículo"}
          activo={!!vehiculoFiltroId}
          onPress={() => setVehiculoModalVisible(true)}
          onLimpiar={() => setVehiculoFiltroId(null)}
        />
        <FiltroChip
          icono="construct-outline"
          placeholder="Servicio"
          textoActivo={servicioFiltro?.nombre ?? "Servicio"}
          activo={!!servicioFiltroId}
          onPress={() => setServicioModalVisible(true)}
          onLimpiar={() => setServicioFiltroId(null)}
        />
        <FiltroChip
          icono="calendar-outline"
          placeholder="Fecha"
          textoActivo={
            hayRangoFecha ? `${formatearFechaDDMMAAAA(fechaDesde)} - ${formatearFechaDDMMAAAA(fechaHasta)}` : "Fecha"
          }
          activo={hayRangoFecha}
          onPress={() => setRangoFechaModalVisible(true)}
          onLimpiar={() => setRangoFechaFiltro({ desde: null, hasta: null })}
        />
      </View>

      <EstadoCarga cargando={cargandoTurnos} error={errorCargaTurnos} onReintentar={recargarTurnos}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          {turnos.length === 0 ? (
            <Text style={styles.vacio}>Todavía no hay turnos cargados.</Text>
          ) : totalFiltrado === 0 ? (
            <Text style={styles.vacio}>No se encontraron turnos.</Text>
          ) : (
            <>
              {turnosConFechaFiltrados.map(renderTurno)}

              {turnosSinFechaFiltrados.length > 0 && (
                <>
                  <Text style={styles.seccionTitulo}>Sin fecha asignada</Text>
                  {turnosSinFechaFiltrados.map(renderTurno)}
                </>
              )}
            </>
          )}
        </ScrollView>
      </EstadoCarga>

      <FiltroVehiculoModal
        visible={vehiculoModalVisible}
        clientes={clientes}
        vehiculoSeleccionadoId={vehiculoFiltroId}
        onElegir={(id) => {
          setVehiculoFiltroId(id);
          setVehiculoModalVisible(false);
        }}
        onCerrar={() => setVehiculoModalVisible(false)}
      />

      <FiltroServicioModal
        visible={servicioModalVisible}
        servicios={servicios}
        servicioSeleccionadoId={servicioFiltroId}
        onElegir={(id) => {
          setServicioFiltroId(id);
          setServicioModalVisible(false);
        }}
        onCerrar={() => setServicioModalVisible(false)}
      />

      <FiltroRangoFechaModal
        visible={rangoFechaModalVisible}
        rangoInicial={rangoFechaFiltro}
        onConfirmar={(rango) => {
          setRangoFechaFiltro(rango);
          setRangoFechaModalVisible(false);
        }}
        onCerrar={() => setRangoFechaModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  buscadorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 20,
  },
  buscadorInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
    height: "100%",
  },
  filtrosFila: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  filtroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 170,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 12,
    height: 38,
  },
  filtroChipActivo: {
    backgroundColor: colors.accent,
  },
  filtroChipTexto: {
    flexShrink: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  filtroChipTextoActivo: {
    color: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 4,
  },
  vacio: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filaInfo: {
    flex: 1,
    minWidth: 0,
  },
  filaCliente: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  filaFecha: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
