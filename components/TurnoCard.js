import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORES_ESTADO = {
  Pendiente: "#F59E0B",
  "En proceso": "#3B82F6",
  Terminado: "#10B981",
};

export default function TurnoCard({ turno, cliente, auto, onPress }) {
  const colorEstado = COLORES_ESTADO[turno.estado] ?? "#9CA3AF";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.hora}>
        <Text style={styles.horaTexto}>{turno.hora}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.cliente}>{cliente?.nombre ?? "Cliente sin datos"}</Text>
        <Text style={styles.auto}>
          {auto ? `${auto.marca} ${auto.modelo} · ${auto.patente}` : "Auto sin datos"}
        </Text>
        <Text style={styles.servicio}>{turno.servicio}</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: colorEstado }]}>
        <Text style={styles.badgeTexto}>{turno.estado}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hora: {
    width: 56,
  },
  horaTexto: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  info: {
    flex: 1,
  },
  cliente: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  auto: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  servicio: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
