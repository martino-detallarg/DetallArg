import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import NotificacionStockBajoCard from "../components/NotificacionStockBajoCard";
import TrabajoPendienteCobroCard from "../components/TrabajoPendienteCobroCard";
import RecordatorioTratamientoCard from "../components/RecordatorioTratamientoCard";
import RegistrarCobroModal from "../components/RegistrarCobroModal";
import SolicitarPedidoModal from "../components/SolicitarPedidoModal";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { useClientes } from "../data/ClienteContext";
import { useServicios } from "../data/ServicioContext";
import { usePedido } from "../data/PedidoContext";
import { UMBRAL_STOCK_BAJO } from "../data/mockInsumos";
import { calcularRecordatoriosVencidos } from "../utils/recordatorios";
import { calcularSaldoPendienteTurno } from "../utils/calculosFinanzas";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const CANTIDAD_PAGINAS = 3;
// Página "Stock" (índice 1, ver el orden pedido: Clientes/Stock/Trabajos) —
// el botón flotante de "Solicitar pedido" solo tiene sentido ahí.
const PAGINA_STOCK = 1;
// Mismo criterio que TrabajoDetalleModal.js: un turno "pendiente de cobro"
// es uno que ya se dio por terminado pero todavía no tiene un cobro
// registrado (ver ESTADOS_QUE_PERMITEN_COBRO ahí).
const ESTADOS_QUE_PERMITEN_COBRO = ["Finalizado", "Entregado"];

export default function NotificacionesScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { misInsumos, cargandoInsumos, errorCargaInsumos } = useData();
  const { cobros, cargandoCobros, errorCargaCobros } = useFinanzas();
  const { turnos, cargandoTurnos, errorCargaTurnos } = useTurnos();
  const { getClienteById, getVehiculoById } = useClientes();
  const { servicios, cargandoServicios, errorCargaServicios } = useServicios();
  const { pedido } = usePedido();
  const [modalVisible, setModalVisible] = useState(false);
  const [turnoParaCobrar, setTurnoParaCobrar] = useState(null);
  const [paginaActiva, setPaginaActiva] = useState(0);
  const insumosStockBajo = misInsumos.filter((insumo) => insumo.nivel <= UMBRAL_STOCK_BAJO);
  const hayPedido = pedido.length > 0;

  // Mismo criterio que TrabajoDetalleModal.js: turnos ya Finalizado/Entregado
  // sin ningún cobro asociado todavía.
  const cargandoTrabajos = cargandoTurnos || cargandoCobros;
  const errorTrabajos = errorCargaTurnos || errorCargaCobros;
  const trabajosPendientesCobro = turnos.filter((turno) => {
    if (!ESTADOS_QUE_PERMITEN_COBRO.includes(turno.estado)) return false;
    const saldo = calcularSaldoPendienteTurno(turno, cobros);
    return saldo === null || saldo > 0;
  });

  const cargandoRecordatorios = cargandoTurnos || cargandoServicios;
  const errorRecordatorios = errorCargaTurnos || errorCargaServicios;
  const recordatoriosVencidos = calcularRecordatoriosVencidos(turnos, servicios, getClienteById, getVehiculoById);

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setPaginaActiva(indice);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <Text style={styles.titulo}>Notificaciones</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollFin}
        style={styles.pager}
      >
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {cargandoRecordatorios ? (
            <View style={styles.centroCarga}>
              <ActivityIndicator color={colors.accent} size="large" />
            </View>
          ) : errorRecordatorios ? (
            <Text style={styles.errorTexto}>{errorRecordatorios}</Text>
          ) : recordatoriosVencidos.length === 0 ? (
            <Text style={styles.vacio}>Por ahora no hay recordatorios vencidos.</Text>
          ) : (
            recordatoriosVencidos.map((recordatorio) => (
              <RecordatorioTratamientoCard
                key={`${recordatorio.turno.clienteId}-${recordatorio.turno.autoId}-${recordatorio.turno.servicioId}`}
                recordatorio={recordatorio}
              />
            ))
          )}
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {cargandoInsumos ? (
            <View style={styles.centroCarga}>
              <ActivityIndicator color={colors.accent} size="large" />
            </View>
          ) : errorCargaInsumos ? (
            <Text style={styles.errorTexto}>{errorCargaInsumos}</Text>
          ) : insumosStockBajo.length === 0 ? (
            <Text style={styles.vacio}>Por ahora no hay alertas de stock.</Text>
          ) : (
            insumosStockBajo.map((insumo) => (
              <NotificacionStockBajoCard key={insumo.id} insumo={insumo} />
            ))
          )}
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}
        >
          {cargandoTrabajos ? (
            <View style={styles.centroCarga}>
              <ActivityIndicator color={colors.accent} size="large" />
            </View>
          ) : errorTrabajos ? (
            <Text style={styles.errorTexto}>{errorTrabajos}</Text>
          ) : trabajosPendientesCobro.length === 0 ? (
            <Text style={styles.vacio}>No tenés trabajos pendientes de cobro.</Text>
          ) : (
            trabajosPendientesCobro.map((turno) => (
              <TrabajoPendienteCobroCard
                key={turno.id}
                turno={turno}
                cliente={getClienteById(turno.clienteId)}
                auto={getVehiculoById(turno.autoId)}
                saldo={calcularSaldoPendienteTurno(turno, cobros)}
                onPress={() => setTurnoParaCobrar(turno)}
              />
            ))
          )}
        </ScrollView>
      </ScrollView>

      {hayPedido && paginaActiva === PAGINA_STOCK && (
        <TouchableOpacity
          style={styles.botonPedido}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={18} color={colors.bg} />
          <Text style={styles.botonPedidoTexto}>Solicitar pedido ({pedido.length})</Text>
        </TouchableOpacity>
      )}

      <View style={styles.puntos}>
        {Array.from({ length: CANTIDAD_PAGINAS }).map((_, indice) => (
          <View key={indice} style={[styles.punto, indice === paginaActiva && styles.puntoActivo]} />
        ))}
      </View>

      <SolicitarPedidoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <RegistrarCobroModal
        visible={!!turnoParaCobrar}
        turno={turnoParaCobrar}
        saldoPendiente={turnoParaCobrar ? calcularSaldoPendienteTurno(turnoParaCobrar, cobros) : undefined}
        montoYaCobrado={
          turnoParaCobrar ? cobros.filter((c) => c.turnoId === turnoParaCobrar.id).reduce((suma, c) => suma + c.monto, 0) : undefined
        }
        onClose={() => setTurnoParaCobrar(null)}
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
  pager: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  centroCarga: {
    alignItems: "center",
    marginTop: 40,
  },
  errorTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginTop: 40,
  },
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  puntoActivo: {
    width: 18,
    backgroundColor: colors.accent,
  },
  botonPedido: {
    marginHorizontal: 20,
    marginTop: 10,
    height: 52,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...shadow,
  },
  botonPedidoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.bg,
  },
});
