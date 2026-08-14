import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { clientes, getAutosByClienteId } from "../data/mockData";

const ESTADOS = ["Pendiente", "En proceso", "Terminado"];

export default function NuevoTurnoModal({ visible, onClose, onGuardar }) {
  const [clienteId, setClienteId] = useState(null);
  const [autoId, setAutoId] = useState(null);
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [error, setError] = useState("");

  const autosDisponibles = clienteId ? getAutosByClienteId(clienteId) : [];

  function limpiarYcerrar() {
    setClienteId(null);
    setAutoId(null);
    setHora("");
    setServicio("");
    setEstado("Pendiente");
    setError("");
    onClose();
  }

  function handleGuardar() {
    if (!clienteId || !autoId || !hora.trim() || !servicio.trim()) {
      setError("Completá cliente, auto, hora y servicio antes de guardar.");
      return;
    }
    onGuardar({ clienteId, autoId, hora: hora.trim(), servicio: servicio.trim(), estado });
    limpiarYcerrar();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={limpiarYcerrar}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.titulo}>Nuevo turno</Text>

            <Text style={styles.label}>Cliente</Text>
            <View style={styles.chips}>
              {clientes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, clienteId === c.id && styles.chipSeleccionado]}
                  onPress={() => {
                    setClienteId(c.id);
                    setAutoId(null);
                  }}
                >
                  <Text style={[styles.chipTexto, clienteId === c.id && styles.chipTextoSeleccionado]}>
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {clienteId && (
              <>
                <Text style={styles.label}>Auto</Text>
                <View style={styles.chips}>
                  {autosDisponibles.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.chip, autoId === a.id && styles.chipSeleccionado]}
                      onPress={() => setAutoId(a.id)}
                    >
                      <Text style={[styles.chipTexto, autoId === a.id && styles.chipTextoSeleccionado]}>
                        {a.marca} {a.modelo} ({a.patente})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>Hora</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 14:30"
              value={hora}
              onChangeText={setHora}
            />

            <Text style={styles.label}>Servicio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Lavado + encerado"
              value={servicio}
              onChangeText={setServicio}
            />

            <Text style={styles.label}>Estado</Text>
            <View style={styles.chips}>
              {ESTADOS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, estado === e && styles.chipSeleccionado]}
                  onPress={() => setEstado(e)}
                >
                  <Text style={[styles.chipTexto, estado === e && styles.chipTextoSeleccionado]}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error !== "" && <Text style={styles.error}>{error}</Text>}
          </ScrollView>

          <View style={styles.botones}>
            <TouchableOpacity style={styles.botonCancelar} onPress={limpiarYcerrar}>
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
              <Text style={styles.botonGuardarTexto}>Guardar turno</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "88%",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginTop: 14,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSeleccionado: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  chipTexto: {
    fontSize: 13,
    color: "#374151",
  },
  chipTextoSeleccionado: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 14,
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonCancelarTexto: {
    color: "#374151",
    fontWeight: "700",
  },
  botonGuardar: {
    flex: 2,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  botonGuardarTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
