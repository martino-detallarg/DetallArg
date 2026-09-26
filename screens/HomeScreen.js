import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";
import StatCard from "../components/StatCard";
import WidgetCalendarioHome from "../components/WidgetCalendarioHome";
import TurnoCard from "../components/TurnoCard";
import TrabajoDetalleModal from "../components/TrabajoDetalleModal";
import EstadoCarga from "../components/EstadoCarga";
import { useClientes } from "../data/ClienteContext";
import { useTurnos } from "../data/TurnoContext";
import { useServicios } from "../data/ServicioContext";
import { useTaller } from "../data/TallerContext";
import { calcularInstanteEntrega, obtenerInicioTurno } from "../utils/entregas";
import { sumarDias } from "../utils/fecha";
import { colors, fonts } from "../theme";

// Horizonte hacia adelante para turnos que todavía no están atrasados ni
// tienen el trabajo terminado (ver armarListaUrgencias) — más allá de esto
// no tiene sentido mostrarlos en Home, siguen visibles en Agenda. Los
// atrasados y los "Finalizado sin entregar" no respetan este límite: son
// urgentes sin importar cuán lejos haya quedado su fecha agendada original.
const HORIZONTE_DIAS = 7;

// Arma la lista de "Turnos activos" de Home: ya no es un filtro por fecha
// agendada, es una vista de urgencias. Se ignora el estado para el orden
// (Pendiente y En proceso se mezclan) y se arma en 3 grupos, en este orden:
//   1. Atrasados: cualquier turno activo cuya entrega estimada ya pasó,
//      incluido un Finalizado cuya hora prometida ya venció — el más
//      atrasado primero.
//   2. Finalizado sin entregar, pero todavía a tiempo (el auto está listo,
//      esperando al cliente).
//   3. El resto (Pendiente/En proceso, todavía a tiempo), de menor a mayor
//      según cuánto falta para la entrega estimada — pero solo si esa
//      entrega cae dentro de HORIZONTE_DIAS; si no, se excluye de Home.
// La "entrega estimada" es un instante real (fecha + hora de llegada +
// duración del servicio, con precisión de hora — ver utils/entregas.js), no
// la fecha en la que se agendó el turno. Un turno sin fecha/hora válida, o
// cuyo servicio no tiene duración cargada, no se puede ubicar con
// precisión: igual se muestra (nunca desaparece), pero al final de su
// grupo, sin orden preciso.
function armarListaUrgencias(turnos, getServicioById) {
  const ahora = new Date();
  const limiteHorizonte = sumarDias(ahora, HORIZONTE_DIAS);

  const atrasados = [];
  const finalizados = [];
  const resto = [];

  for (const turno of turnos) {
    if (turno.estado === "Entregado") continue;

    const servicio = turno.servicioId ? getServicioById(turno.servicioId) : null;
    const inicio = obtenerInicioTurno(turno);
    const instanteEntrega = calcularInstanteEntrega(inicio, servicio);
    const atrasado = instanteEntrega !== null && instanteEntrega.getTime() < ahora.getTime();
    const item = { turno, instanteEntrega };

    if (atrasado) {
      atrasados.push(item);
    } else if (turno.estado === "Finalizado") {
      finalizados.push(item);
    } else if (instanteEntrega === null || instanteEntrega.getTime() <= limiteHorizonte.getTime()) {
      resto.push(item);
    }
    // Pendiente/En proceso a tiempo pero fuera del horizonte: se excluye de
    // Home a propósito, sigue visible en Agenda.
  }

  // Sin instante calculable (null) siempre al final de su propio grupo:
  // Infinity nunca gana una comparación ascendente contra un timestamp real.
  const porCercania = (a, b) =>
    (a.instanteEntrega?.getTime() ?? Infinity) - (b.instanteEntrega?.getTime() ?? Infinity);

  atrasados.sort(porCercania); // más viejo (más atrasado) primero
  finalizados.sort(porCercania);
  resto.sort(porCercania);

  return [...atrasados, ...finalizados, ...resto].map((item) => item.turno);
}

export default function HomeScreen({ navigation, onAbrirNotificaciones }) {
  const { getClienteById, getVehiculoById } = useClientes();
  const { turnos, cargandoTurnos, errorCargaTurnos, recargarTurnos, actualizarEstadoTrabajo, eliminarTurno } =
    useTurnos();
  const { getServicioById } = useServicios();
  const { misDatos } = useTaller();
  const [turnoSeleccionadoId, setTurnoSeleccionadoId] = useState(null);
  // Cambia cada vez que Home gana/pierde foco: se usa como `key` del anillo
  // de progreso para forzar su remount (y que la animación de llenado se
  // repita) cada vez que se vuelve a esta pantalla, no solo al abrir la app.
  const estaEnfocada = useIsFocused();

  const turnosOrdenados = useMemo(
    () => armarListaUrgencias(turnos, getServicioById),
    [turnos, getServicioById]
  );
  const turnoSeleccionado = turnos.find((t) => t.id === turnoSeleccionadoId) ?? null;

  // Solo para el anillo de progreso de la card "Turnos activos": cuántos ya
  // están Finalizado (a entregar) sobre el total — Entregado no puede
  // aparecer acá (armarListaUrgencias ya los excluye). Es un cálculo
  // derivado nada más para mostrar en el anillo, no cambia el dato ni el
  // flujo de estados del turno.
  const turnosCompletados = turnosOrdenados.filter((t) => t.estado === "Finalizado").length;
  const progresoTurnosHoy = turnosOrdenados.length > 0 ? turnosCompletados / turnosOrdenados.length : 0;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirNotificaciones={onAbrirNotificaciones} />

      <EstadoCarga cargando={cargandoTurnos} error={errorCargaTurnos} onReintentar={recargarTurnos}>
        <FlatList
          data={turnosOrdenados}
          keyExtractor={(turno) => turno.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <>
              <Text style={styles.saludo}>Hola{misDatos.nombrePersonal ? `, ${misDatos.nombrePersonal}` : ""} 👋</Text>

              <View style={styles.stats}>
                <View style={styles.statAnillo}>
                  <StatCard
                    key={estaEnfocada}
                    label="Turnos activos"
                    valor={turnosOrdenados.length}
                    progreso={progresoTurnosHoy}
                    tamano={110}
                    onPress={() => navigation.navigate("Agenda")}
                  />
                </View>
                <View style={styles.statWidget}>
                  <WidgetCalendarioHome onPress={() => navigation.navigate("Agenda")} />
                </View>
              </View>

              <Text style={styles.seccionTitulo}>Turnos activos</Text>
            </>
          }
          renderItem={({ item }) => (
            <TurnoCard
              turno={item}
              cliente={getClienteById(item.clienteId)}
              auto={getVehiculoById(item.autoId)}
              onPress={() => setTurnoSeleccionadoId(item.id)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.vacio}>No tenés turnos activos en este momento.</Text>
          }
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => navigation.navigate("HistorialClientes")}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.linkHistorialWrap}
            >
              <Text style={styles.linkHistorial}>Ver historial de clientes</Text>
            </TouchableOpacity>
          }
        />
      </EstadoCarga>

      <TrabajoDetalleModal
        visible={turnoSeleccionado !== null}
        turno={turnoSeleccionado}
        cliente={turnoSeleccionado ? getClienteById(turnoSeleccionado.clienteId) : null}
        auto={turnoSeleccionado ? getVehiculoById(turnoSeleccionado.autoId) : null}
        onCambiarEstado={(nuevoEstado, opciones) =>
          actualizarEstadoTrabajo(turnoSeleccionado.id, nuevoEstado, opciones)
        }
        onEliminar={async () => {
          await eliminarTurno(turnoSeleccionado.id);
          setTurnoSeleccionadoId(null);
        }}
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
  lista: {
    paddingBottom: 100,
  },
  saludo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statAnillo: {
    flex: 1,
    alignItems: "center",
  },
  statWidget: {
    flex: 1,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 4,
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
  vacio: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
  },
});
