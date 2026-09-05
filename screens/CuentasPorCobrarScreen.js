import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import EstadoCarga from "../components/EstadoCarga";
import RegistrarCobroModal from "../components/RegistrarCobroModal";
import { useTurnos } from "../data/TurnoContext";
import { useFinanzas } from "../data/FinanzasContext";
import { useClientes } from "../data/ClienteContext";
import { calcularCuentasPorCobrar } from "../utils/calculosFinanzas";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../theme";

// Turnos ya Finalizado/Entregado con saldo pendiente (sin cobro, o con un
// pago parcial que todavía no cubre el precio) — ver "Cuentas por Cobrar"
// en FinanzasScreen.js y calcularCuentasPorCobrar en utils/calculosFinanzas.js.
// Mismo patrón visual que CostosFijosScreen.js (lista + EstadoCarga).
export default function CuentasPorCobrarScreen({ navigation }) {
  const { turnos, cargandoTurnos, errorCargaTurnos, recargarTurnos } = useTurnos();
  const { cobros, cargandoCobros, errorCargaCobros, recargarCobros } = useFinanzas();
  const { getClienteById, getVehiculoById } = useClientes();
  const [itemParaCobrar, setItemParaCobrar] = useState(null);

  const cargando = cargandoTurnos || cargandoCobros;
  const error = errorCargaTurnos || errorCargaCobros;

  function recargar() {
    recargarTurnos();
    recargarCobros();
  }

  const cuentasPorCobrar = calcularCuentasPorCobrar(turnos, cobros, getClienteById, getVehiculoById);

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("Finanzas")} />

      <Text style={styles.titulo}>Cuentas por Cobrar</Text>

      <EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          {cuentasPorCobrar.length === 0 ? (
            <Text style={styles.vacio}>No tenés cuentas pendientes de cobro.</Text>
          ) : (
            cuentasPorCobrar.map((item) => {
              const detalleVehiculo = item.vehiculo
                ? item.vehiculo.patente || `${item.vehiculo.marca} ${item.vehiculo.modelo}`
                : "Vehículo sin datos";
              return (
                <TouchableOpacity
                  key={item.turno.id}
                  style={styles.fila}
                  onPress={() => setItemParaCobrar(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.filaIcono}>
                    <Ionicons name="time-outline" size={20} color={colors.accentLight} />
                  </View>
                  <View style={styles.filaTexto}>
                    <Text style={styles.filaNombre} numberOfLines={1}>
                      {item.cliente?.nombre ?? "Cliente sin datos"}
                    </Text>
                    <Text style={styles.filaSub} numberOfLines={1}>
                      {detalleVehiculo} · {item.turno.servicio?.trim() || "Servicio no especificado"}
                    </Text>
                  </View>
                  <Text style={styles.filaSaldo}>
                    {item.saldo === null ? "Sin precio cargado" : formatearPesos(item.saldo)}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </EstadoCarga>

      <RegistrarCobroModal
        visible={!!itemParaCobrar}
        turno={itemParaCobrar?.turno ?? null}
        saldoPendiente={itemParaCobrar?.saldo ?? undefined}
        montoYaCobrado={
          itemParaCobrar && itemParaCobrar.saldo !== null ? itemParaCobrar.turno.precio - itemParaCobrar.saldo : undefined
        }
        onClose={() => setItemParaCobrar(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  vacio: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 10,
  },
  filaIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.button,
    ...continuousCorner,
    backgroundColor: colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },
  filaTexto: {
    flex: 1,
  },
  filaNombre: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filaSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  filaSaldo: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.accentLight,
  },
});
