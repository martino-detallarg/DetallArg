import { useCallback, useEffect, useRef, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import ScreenHeader from "../components/ScreenHeader";
import NotificacionStockBajoCard from "../components/NotificacionStockBajoCard";
import { useTourTarget } from "../data/TourTargetContext";
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

// Una pestaña por página del pager, mismo orden (índice = página).
const TITULOS_PESTANIAS = ["Clientes", "Stock", "Trabajos"];
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
  const pagerRef = useRef(null);
  const tourPestanias = useTourTarget("notificaciones.pestanias");
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

  // Contador por pestaña, en el orden de TITULOS_PESTANIAS. null mientras
  // esa pestaña carga o tiene error: ahí no se muestra ningún número (ni 0).
  const contadores = [
    cargandoRecordatorios || errorRecordatorios ? null : recordatoriosVencidos.length,
    cargandoInsumos || errorCargaInsumos ? null : insumosStockBajo.length,
    cargandoTrabajos || errorTrabajos ? null : trabajosPendientesCobro.length,
  ];
  const cargandoAlguna = cargandoRecordatorios || cargandoInsumos || cargandoTrabajos;

  // Se marca la pestaña al instante (sin esperar onMomentumScrollEnd);
  // handleScrollFin después confirma el mismo índice.
  function irAPagina(indice, animado) {
    setPaginaActiva(indice);
    pagerRef.current?.scrollTo({ x: indice * width, animated: animado });
  }

  // Auto-selección "abrir en la primera pestaña con alertas", una vez POR
  // VISITA: esta pantalla es un tab que queda montado entre visitas, así
  // que cada vez que gana foco se vuelve a armar (y se re-dispara el
  // efecto de abajo vía `visita`). Se cancela apenas el taller toca una
  // pestaña o empieza un swipe en esta visita, aunque los datos todavía
  // no hayan terminado de cargar.
  const autoSeleccionPendienteRef = useRef(true);
  const [visita, setVisita] = useState(0);

  useFocusEffect(
    useCallback(() => {
      autoSeleccionPendienteRef.current = true;
      setVisita((v) => v + 1);
    }, [])
  );

  function cancelarAutoSeleccion() {
    autoSeleccionPendienteRef.current = false;
  }

  useEffect(() => {
    if (!autoSeleccionPendienteRef.current || cargandoAlguna) return;
    autoSeleccionPendienteRef.current = false;
    const primeraConAlertas = contadores.findIndex((contador) => contador > 0);
    // Sin alertas en ninguna: Clientes (también pisa la pestaña que haya
    // quedado de una visita anterior).
    const destino = primeraConAlertas === -1 ? 0 : primeraConAlertas;
    // Un frame de margen para que el pager ya tenga layout la primera vez.
    requestAnimationFrame(() => irAPagina(destino, false));
    // Solo cuando terminan las cargas o arranca una visita nueva; los
    // contadores se leen del render actual a propósito.
  }, [cargandoAlguna, visita]);

  function handleTocarPestania(indice) {
    cancelarAutoSeleccion();
    irAPagina(indice, true);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.goBack()} />

      <Text style={styles.titulo}>Notificaciones</Text>

      {/* Target del paso "notificaciones" del tutorial relacional (ver
      data/TourManager.js): se resalta esta barra entera. */}
      <View
        ref={tourPestanias.ref}
        onLayout={tourPestanias.onLayout}
        collapsable={false}
        style={styles.pestanias}
        accessibilityRole="tablist"
      >
        {TITULOS_PESTANIAS.map((titulo, indice) => (
          <Pestania
            key={titulo}
            titulo={titulo}
            contador={contadores[indice]}
            seleccionada={indice === paginaActiva}
            onPress={() => handleTocarPestania(indice)}
          />
        ))}
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={cancelarAutoSeleccion}
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

function textoContador(contador) {
  return contador > 9 ? "9+" : String(contador);
}

function Pestania({ titulo, contador, seleccionada, onPress }) {
  const hayAlertas = contador !== null && contador > 0;
  const etiqueta =
    contador === null
      ? titulo
      : `${titulo}, ${contador === 0 ? "sin alertas" : `${contador} ${contador === 1 ? "alerta" : "alertas"}`}`;

  return (
    <TouchableOpacity
      style={[styles.pestania, seleccionada && styles.pestaniaActiva]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: seleccionada }}
      accessibilityLabel={etiqueta}
    >
      <Text style={[styles.pestaniaTexto, seleccionada && styles.pestaniaTextoActivo]} numberOfLines={1}>
        {titulo}
      </Text>
      {hayAlertas && (
        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>{textoContador(contador)}</Text>
        </View>
      )}
    </TouchableOpacity>
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
    marginBottom: 8,
  },
  pestanias: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  pestania: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    // Mismo alto de borde en activa e inactiva, para que el texto no salte
    // al cambiar de pestaña.
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  pestaniaActiva: {
    borderBottomColor: colors.accent,
  },
  pestaniaTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  pestaniaTextoActivo: {
    color: colors.textPrimary,
  },
  contador: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  contadorTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  pager: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 16,
    // El "+" central de la tab bar sobresale ~22px por encima de ella
    // (marginTop: -22 en DashboardNavigator.js): 40 deja la última card
    // scrolleable por encima del botón.
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
  botonPedido: {
    marginHorizontal: 20,
    marginTop: 10,
    // Sin los puntitos de abajo, este botón quedaría pegado a la tab bar y
    // el "+" central (sobresale ~22px) le taparía el centro.
    marginBottom: 32,
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
