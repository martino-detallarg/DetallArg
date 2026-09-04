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
import ResumenSemanalCard from "../components/ResumenSemanalCard";
import SolicitarPedidoModal from "../components/SolicitarPedidoModal";
import { useData } from "../data/DataContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useTurnos } from "../data/TurnoContext";
import { usePedido } from "../data/PedidoContext";
import { UMBRAL_STOCK_BAJO } from "../data/mockInsumos";
import { obtenerSemanaAnterior } from "../utils/fecha";
import { calcularResumenPeriodo } from "../utils/calculosFinanzas";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

const CANTIDAD_PAGINAS = 2;

export default function NotificacionesScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { misInsumos, cargandoInsumos, errorCargaInsumos, costosFijos, cargandoCostosFijos } = useData();
  const { cobros, cargandoCobros, gastosVariables, cargandoGastosVariables } = useFinanzas();
  const { cargandoTurnos, getTurnoById } = useTurnos();
  const { pedido } = usePedido();
  const [modalVisible, setModalVisible] = useState(false);
  const [paginaActiva, setPaginaActiva] = useState(0);
  const insumosStockBajo = misInsumos.filter((insumo) => insumo.nivel <= UMBRAL_STOCK_BAJO);
  const hayPedido = pedido.length > 0;

  // FEATURE 10: no es una notificación real ni se guarda en ningún lado —
  // se recalcula desde cero cada vez que se entra a esta pantalla, siempre
  // sobre la semana lunes-a-domingo INMEDIATAMENTE anterior a hoy (mismo
  // criterio de semana que el resto de la app, ver obtenerDiasDeLaSemana).
  // Mientras cargandoResumenSemanal, se omite la tarjeta en vez de mostrar
  // $0 de facturación/ganancia falsos — es informativa, no vale la pena
  // sumarle un spinner propio por un dato secundario.
  const cargandoResumenSemanal = cargandoCobros || cargandoGastosVariables || cargandoCostosFijos || cargandoTurnos;
  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);
  const { desde: desdeSemanaAnterior, hasta: hastaSemanaAnterior } = obtenerSemanaAnterior();
  const resumenSemanal = calcularResumenPeriodo(
    desdeSemanaAnterior,
    hastaSemanaAnterior,
    cobros,
    gastosVariables,
    totalCostosFijos,
    getTurnoById
  );

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setPaginaActiva(indice);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.openDrawer()} />

      <Text style={styles.titulo}>Notificaciones</Text>

      {!cargandoResumenSemanal && (
        <View style={styles.resumenSemanalContenedor}>
          <ResumenSemanalCard
            desde={desdeSemanaAnterior}
            hasta={hastaSemanaAnterior}
            facturacion={resumenSemanal.facturacion}
            gananciaNeta={resumenSemanal.gananciaNeta}
          />
        </View>
      )}

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

        <View style={[styles.paginaClientes, { width }]}>
          <View style={styles.clientesIcono}>
            <Ionicons name="notifications-outline" size={32} color={colors.accent} />
          </View>
          <Text style={styles.clientesTexto}>
            Acá vas a ver recordatorios para tus clientes, como renovación de tratamientos o
            aplicar booster.
          </Text>
        </View>
      </ScrollView>

      {hayPedido && paginaActiva === 0 && (
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
  resumenSemanalContenedor: {
    paddingHorizontal: 20,
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
  paginaClientes: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  clientesIcono: {
    width: 64,
    height: 64,
    borderRadius: radii.card,
    ...continuousCorner,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  clientesTexto: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
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
