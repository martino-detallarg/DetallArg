import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Input from "../../components/Input";
import Button from "../../components/Button";
import SelectorFechaModal from "../../components/wizard/SelectorFechaModal";
import SelectorHoraModal from "../../components/SelectorHoraModal";
import {
  formatearFechaDDMMAAAA,
  formatearHoraHHMM,
  obtenerDiaSemanaHorario,
  parsearFechaDDMMAAAA,
  parsearHoraHHMM,
} from "../../utils/fecha";
import { useServicios } from "../../data/ServicioContext";
import { useTaller } from "../../data/TallerContext";
import { useEquipo } from "../../data/EquipoContext";
import { formatearPesos } from "../../utils/formato";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../../theme";

export default function DatosServicioStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const { servicios } = useServicios();
  const { horarios, limiteEmpleados } = useTaller();
  const { empleados } = useEquipo();
  const empleadosActivos = empleados.filter((e) => e.activo);
  const [errores, setErrores] = useState({});
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [mostrarPickerHora, setMostrarPickerHora] = useState(false);

  function obtenerFechaInicialPicker() {
    return parsearFechaDDMMAAAA(datos.fecha) || new Date();
  }

  function obtenerHoraInicialPicker() {
    return parsearHoraHHMM(datos.hora) || new Date();
  }

  // Cruza fecha + hora contra TallerContext.horarios. Se recalcula en cada
  // render (no solo al tocar "Continuar") a propósito: a diferencia de los
  // demás campos, acá no alcanza con ver el picker para darse cuenta de que
  // el valor elegido es inválido — hace falta cruzarlo contra un dato
  // externo (el horario de atención), así que el aviso tiene que aparecer
  // apenas se elige la combinación, no recién al intentar continuar.
  function obtenerErrorHorario() {
    const fechaObj = parsearFechaDDMMAAAA(datos.fecha);
    if (!fechaObj || !datos.hora.trim()) return null;

    const diaSemana = obtenerDiaSemanaHorario(fechaObj);
    const horario = horarios.find((h) => h.dia === diaSemana);
    if (!horario) return null;

    if (!horario.abierto) {
      return `Los ${diaSemana.toLowerCase()} el taller está cerrado`;
    }
    if (datos.hora < horario.horaApertura || datos.hora >= horario.horaCierre) {
      return `Ese día atendés de ${horario.horaApertura} a ${horario.horaCierre}`;
    }
    return null;
  }

  const errorHorario = obtenerErrorHorario();

  function validar() {
    const nuevosErrores = {};
    if (!datos.servicioId) nuevosErrores.tipo = "Elegí un servicio";
    if (!datos.fecha.trim()) nuevosErrores.fecha = "Ingresá la fecha";
    if (!datos.hora.trim()) nuevosErrores.hora = "Ingresá la hora";
    else if (errorHorario) nuevosErrores.hora = errorHorario;
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleContinuar() {
    if (validar()) onContinuar();
  }

  function seleccionarServicio(servicio) {
    onCambiar({ tipo: servicio.nombre, servicioId: servicio.id, precio: servicio.precio });
  }

  function toggleEmpleado(empleado) {
    const asignadosActuales = datos.empleadosAsignados ?? [];
    const yaAsignado = asignadosActuales.some((e) => e.empleadoId === empleado.id);
    const empleadosAsignados = yaAsignado
      ? asignadosActuales.filter((e) => e.empleadoId !== empleado.id)
      : [...asignadosActuales, { empleadoId: empleado.id, nombreEmpleado: empleado.nombre }];
    onCambiar({ empleadosAsignados });
  }

  const esValido =
    !!datos.servicioId &&
    datos.fecha.trim() !== "" &&
    datos.hora.trim() !== "" &&
    !errorHorario;

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <WizardHeader titulo="Datos del Servicio" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Servicio</Text>
        {servicios.length === 0 ? (
          <Text style={styles.vacioAviso}>
            Todavía no cargaste servicios en Mis Servicios. Cargalos desde Mi Taller para poder elegirlos acá.
          </Text>
        ) : (
          <View style={styles.chips}>
            {servicios.map((s) => {
              const activo = datos.servicioId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, activo && styles.chipSeleccionado]}
                  onPress={() => seleccionarServicio(s)}
                >
                  <Text style={[styles.chipTexto, activo && styles.chipTextoSeleccionado]}>
                    {s.nombre} · {formatearPesos(s.precio)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {errores.tipo && <Text style={styles.error}>{errores.tipo}</Text>}

        {limiteEmpleados === 0 ? (
          <View style={styles.empleadosBloqueado}>
            <View style={styles.empleadosBloqueadoTitulo}>
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              <Text style={styles.empleadosBloqueadoTexto}>Empleados asignados</Text>
            </View>
            <Text style={styles.empleadosBloqueadoAyuda}>Disponible en el plan Intermedio o PRO.</Text>
          </View>
        ) : (
          empleadosActivos.length > 0 && (
            <View style={styles.empleadosContenedor}>
              <Text style={styles.label}>Empleados asignados</Text>
              <View style={styles.chips}>
                {empleadosActivos.map((empleado) => {
                  const asignado = (datos.empleadosAsignados ?? []).some(
                    (e) => e.empleadoId === empleado.id
                  );
                  return (
                    <TouchableOpacity
                      key={empleado.id}
                      style={[styles.chip, asignado && styles.chipSeleccionado]}
                      onPress={() => toggleEmpleado(empleado)}
                    >
                      <Text style={[styles.chipTexto, asignado && styles.chipTextoSeleccionado]}>
                        {empleado.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )
        )}

        <View style={styles.fechaContenedor}>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity
            style={[styles.fechaWrapper, errores.fecha && styles.fechaWrapperError]}
            onPress={() => setMostrarPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={datos.fecha ? styles.fechaTexto : styles.fechaPlaceholder}>
              {datos.fecha || "Elegí una fecha"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {errores.fecha && <Text style={styles.error}>{errores.fecha}</Text>}
        </View>

        {Platform.OS === "android" && mostrarPicker && (
          <DateTimePicker
            value={obtenerFechaInicialPicker()}
            mode="date"
            display="default"
            onChange={(event, fechaElegida) => {
              setMostrarPicker(false);
              if (event.type === "set" && fechaElegida) {
                onCambiar({ fecha: formatearFechaDDMMAAAA(fechaElegida) });
              }
            }}
          />
        )}

        {Platform.OS === "ios" && (
          <SelectorFechaModal
            visible={mostrarPicker}
            fechaInicial={obtenerFechaInicialPicker()}
            onConfirmar={(fecha) => {
              onCambiar({ fecha: formatearFechaDDMMAAAA(fecha) });
              setMostrarPicker(false);
            }}
            onCancelar={() => setMostrarPicker(false)}
          />
        )}

        <View style={styles.fechaContenedor}>
          <Text style={styles.label}>Hora de llegada</Text>
          <TouchableOpacity
            style={[styles.fechaWrapper, (errores.hora || errorHorario) && styles.fechaWrapperError]}
            onPress={() => setMostrarPickerHora(true)}
            activeOpacity={0.8}
          >
            <Text style={datos.hora ? styles.fechaTexto : styles.fechaPlaceholder}>
              {datos.hora || "Elegí una hora"}
            </Text>
            <Ionicons name="time-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {(errores.hora || errorHorario) && (
            <Text style={styles.error}>{errores.hora || errorHorario}</Text>
          )}
        </View>

        {Platform.OS === "android" && mostrarPickerHora && (
          <DateTimePicker
            value={obtenerHoraInicialPicker()}
            mode="time"
            display="default"
            is24Hour
            onChange={(event, horaElegida) => {
              setMostrarPickerHora(false);
              if (event.type === "set" && horaElegida) {
                onCambiar({ hora: formatearHoraHHMM(horaElegida) });
              }
            }}
          />
        )}

        {Platform.OS === "ios" && (
          <SelectorHoraModal
            visible={mostrarPickerHora}
            horaInicial={obtenerHoraInicialPicker()}
            onConfirmar={(hora) => {
              onCambiar({ hora: formatearHoraHHMM(hora) });
              setMostrarPickerHora(false);
            }}
            onCancelar={() => setMostrarPickerHora(false)}
          />
        )}

        <Input
          label="Tiempo estimado de trabajo (opcional)"
          value={datos.tiempoEstimado}
          onChangeText={(v) => onCambiar({ tiempoEstimado: v })}
          placeholder="Ej: 2 horas"
        />
        <Input
          label="Observaciones (opcional)"
          value={datos.observaciones}
          onChangeText={(v) => onCambiar({ observaciones: v })}
          placeholder="Detalles a tener en cuenta..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.boton}>
          <Button title="Continuar a Inspección" onPress={handleContinuar} disabled={!esValido} />
        </View>
      </ScrollView>
      </SwipeVolver>
    </KeyboardAvoidingView>
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
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipSeleccionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.bg,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
  vacioAviso: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  empleadosBloqueado: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 14,
    marginBottom: 16,
  },
  empleadosBloqueadoTitulo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  empleadosBloqueadoTexto: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  empleadosBloqueadoAyuda: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  empleadosContenedor: {
    marginBottom: 16,
  },
  fechaContenedor: {
    marginBottom: 16,
  },
  fechaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 50,
    ...shadowSubtle,
  },
  fechaWrapperError: {
    borderColor: colors.error,
  },
  fechaTexto: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  fechaPlaceholder: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  boton: {
    marginTop: 12,
  },
});
