import { Alert } from "react-native";
import { useClientes } from "../data/ClienteContext";
import { useTurnos } from "../data/TurnoContext";
import { useFinanzas } from "../data/FinanzasContext";
import { formatearPesos } from "../utils/formato";

// Borrar un cliente ahora borra en cascada sus turnos y, con ellos, sus
// cobros (ver supabase/alter_cliente_borrado_cascada.sql -- antes
// turnos.cliente_id/cobros.turno_id eran ON DELETE SET NULL, a propósito
// para no tocar Finanzas de un mes ya cerrado; para cliente -> turno ->
// cobro se cambió puntualmente a CASCADE, pedido explícito de Augusto).
//
// Este hook es el ÚNICO lugar que tiene que llamar a eliminarCliente: cruza
// turnos por clienteId y cobros por esos turnoId para saber cuánto se va a
// perder, y solo pregunta si hay algo que perder -- un cliente sin trabajos
// se sigue borrando directo, sin cartel de más (mismo comportamiento rápido
// de siempre). Cualquier botón nuevo de "eliminar cliente" que se agregue en
// otra pantalla tiene que usar confirmarYEliminarCliente de acá, nunca
// eliminarCliente (data/ClienteContext.js) directo -- así no hay forma de
// esquivar la confirmación agregando un botón en otro lado.
//
// Vive en un hook aparte y no adentro de ClienteContext.js porque necesita
// useTurnos()/useFinanzas(), y ClienteProvider está MÁS ARRIBA que
// TurnoProvider/FinanzasProvider en App.js -- el flujo de un Context de
// React es hacia abajo, nunca hacia un ancestro, así que esos dos Contexts
// no existen todavía dentro del cuerpo de ClienteProvider. eliminarCliente
// en sí sigue siendo el primitivo de borrado sin confirmar, sin cambios.
export function useConfirmarYEliminarCliente() {
  const { eliminarCliente } = useClientes();
  const { turnos } = useTurnos();
  const { cobros } = useFinanzas();

  // Devuelve una Promise que resuelve en `true` si el cliente se borró de
  // verdad, o `false` si el taller canceló desde el cartel (sin ningún
  // cambio) -- así el caller sigue pudiendo usar su propio async/await +
  // try/catch + finally de siempre (mismo patrón que ClienteModal.js ya
  // tenía para eliminarCliente directo), sin aprender un patrón de
  // callback nuevo. Si eliminarCliente tira, la Promise rechaza igual.
  function confirmarYEliminarCliente(cliente) {
    const turnosDelCliente = turnos.filter((t) => t.clienteId === cliente.id);

    if (turnosDelCliente.length === 0) {
      return eliminarCliente(cliente.id).then(() => true);
    }

    const idsTurnosDelCliente = new Set(turnosDelCliente.map((t) => t.id));
    const totalCobrado = cobros
      .filter((c) => idsTurnosDelCliente.has(c.turnoId))
      .reduce((suma, c) => suma + c.monto, 0);

    return new Promise((resolve, reject) => {
      Alert.alert(
        "Eliminar cliente",
        `Este cliente tiene ${turnosDelCliente.length} trabajo${turnosDelCliente.length === 1 ? "" : "s"} y ${formatearPesos(totalCobrado)} cobrados — se van a borrar para siempre. ¿Eliminar igual?`,
        [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              eliminarCliente(cliente.id).then(() => resolve(true)).catch(reject);
            },
          },
        ]
      );
    });
  }

  return { confirmarYEliminarCliente };
}
