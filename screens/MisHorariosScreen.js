import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenHeader from "../components/ScreenHeader";
import SelectorHoraModal from "../components/SelectorHoraModal";
import EstadoCarga from "../components/EstadoCarga";
import { useTaller } from "../data/TallerContext";
import { formatearHoraHHMM, parsearHoraHHMM } from "../utils/fecha";
import { colors, continuousCorner, fonts, radii } from "../theme";

export default function MisHorariosScreen({ navigation }) {
  const { horarios, actualizarHorario, cargandoHorarios, errorCargaHorarios, recargarHorarios } = useTaller();
  const [editando, setEditando] = useState(null); // { dia, campo: "horaApertura" | "horaCierre" }
  const [diaGuardando, setDiaGuardando] = useState(null);
  const [error, setError] = useState(null);

  function abrirPicker(dia, campo) {
    setEditando({ dia, campo });
  }

  async function guardarCambio(dia, cambios) {
    setDiaGuardando(dia);
    setError(null);
    try {
      await actualizarHorario(dia, cambios);
    } catch (err) {
      setError("No se pudo guardar el cambio. Probá de nuevo.");
    } finally {
      setDiaGuardando(null);
    }
  }

  async function seleccionarHora(hora) {
    if (!editando) return;
    const { dia, campo } = editando;
    setEditando(null);
    await guardarCambio(dia, { [campo]: formatearHoraHHMM(hora) });
  }

  const horarioEditando = horarios.find((h) => h.dia === editando?.dia);
  const horaInicialPicker =
    (horarioEditando && parsearHoraHHMM(horarioEditando[editando.campo])) || new Date();

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <View style={styles.encabezadoFijo}>
        <Text style={styles.titulo}>Mis Horarios</Text>
        <Text style={styles.subtitulo}>
          Horario de atención de referencia. Todavía no restringe qué horas se pueden elegir al
          cargar un turno nuevo.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <EstadoCarga cargando={cargandoHorarios} error={errorCargaHorarios} onReintentar={recargarHorarios}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          {horarios.map((item) => {
            const guardandoEsteDia = diaGuardando === item.dia;
            return (
              <View key={item.dia} style={styles.tarjeta}>
                <View style={styles.filaSuperior}>
                  <Text style={styles.dia}>{item.dia}</Text>
                  <Switch
                    value={item.abierto}
                    onValueChange={(valor) => guardarCambio(item.dia, { abierto: valor })}
                    disabled={guardandoEsteDia}
                    trackColor={{ false: colors.surface2, true: colors.accentDark }}
                    thumbColor={item.abierto ? colors.accent : colors.textMuted}
                  />
                </View>

                {item.abierto ? (
                  <View style={styles.horas}>
                    <TouchableOpacity
                      style={styles.horaBoton}
                      onPress={() => abrirPicker(item.dia, "horaApertura")}
                      disabled={guardandoEsteDia}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.horaLabel}>Desde</Text>
                      <Text style={styles.horaValor}>{item.horaApertura}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.horaBoton}
                      onPress={() => abrirPicker(item.dia, "horaCierre")}
                      disabled={guardandoEsteDia}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.horaLabel}>Hasta</Text>
                      <Text style={styles.horaValor}>{item.horaCierre}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.cerrado}>Cerrado</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </EstadoCarga>

      {Platform.OS === "android" && editando && (
        <DateTimePicker
          value={horaInicialPicker}
          mode="time"
          display="default"
          is24Hour
          onChange={(event, hora) => {
            if (event.type === "set" && hora) {
              seleccionarHora(hora);
            } else {
              setEditando(null);
            }
          }}
        />
      )}

      {Platform.OS === "ios" && (
        <SelectorHoraModal
          visible={!!editando}
          horaInicial={horaInicialPicker}
          onConfirmar={seleccionarHora}
          onCancelar={() => setEditando(null)}
        />
      )}
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
  encabezadoFijo: {
    paddingHorizontal: 20,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 6,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    marginBottom: 10,
  },
  filaSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dia: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  horas: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  horaBoton: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  horaLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  horaValor: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cerrado: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
  },
});
