// Calcula qué combinaciones cliente+vehículo+servicio ya tienen vencido el
// recordatorio de tratamiento (servicios.tieneRecordatorio) — usado por la
// pestaña "Clientes" de Notificaciones. No dispara nada por sí solo, es un
// cálculo en memoria a partir de lo que ya está cargado (mismo criterio que
// utils/calculosFinanzas.js).
import { parsearFechaDDMMAAAA } from "./fecha";

const ESTADOS_TRABAJO_REALIZADO = ["Finalizado", "Entregado"];

function sumarMeses(fecha, meses) {
  const resultado = new Date(fecha);
  const entero = Math.trunc(meses);
  const fraccion = meses - entero;
  resultado.setMonth(resultado.getMonth() + entero);
  if (fraccion !== 0) resultado.setDate(resultado.getDate() + Math.round(fraccion * 30));
  return resultado;
}

// Por cada cliente+vehículo+servicio con recordatorio, usa el turno YA
// REALIZADO (Finalizado/Entregado) más reciente de esa combinación como
// base del cálculo — un tratamiento nuevo "reinicia el reloj" del anterior.
export function calcularRecordatoriosVencidos(turnos, servicios, getClienteById, getVehiculoById) {
  const hoy = new Date();
  const serviciosConRecordatorio = new Map(
    servicios.filter((s) => s.tieneRecordatorio && s.duraMeses != null && s.recordarCadaMeses != null).map((s) => [s.id, s])
  );
  if (serviciosConRecordatorio.size === 0) return [];

  const masReciente = new Map();
  for (const turno of turnos) {
    if (!ESTADOS_TRABAJO_REALIZADO.includes(turno.estado)) continue;
    const servicio = serviciosConRecordatorio.get(turno.servicioId);
    if (!servicio) continue;
    const fechaTurno = parsearFechaDDMMAAAA(turno.fecha);
    if (!fechaTurno) continue;

    const clave = `${turno.clienteId}-${turno.autoId}-${turno.servicioId}`;
    const actual = masReciente.get(clave);
    if (!actual || fechaTurno > actual.fecha) {
      masReciente.set(clave, { turno, servicio, fecha: fechaTurno });
    }
  }

  const vencidos = [];
  for (const { turno, servicio, fecha } of masReciente.values()) {
    let vencimiento = sumarMeses(fecha, servicio.duraMeses);
    if (hoy < vencimiento) continue;

    while (sumarMeses(vencimiento, servicio.recordarCadaMeses) <= hoy) {
      vencimiento = sumarMeses(vencimiento, servicio.recordarCadaMeses);
    }

    vencidos.push({
      turno,
      servicio,
      vencimiento,
      cliente: getClienteById(turno.clienteId),
      vehiculo: getVehiculoById(turno.autoId),
    });
  }

  return vencidos.sort((a, b) => a.vencimiento - b.vencimiento);
}
