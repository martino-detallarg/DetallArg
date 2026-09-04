// Cálculos de margen/ganancia para la Fase B de Finanzas (FinanzasScreen.js).
// Centralizados acá (mismo espíritu que utils/formato.js/utils/fecha.js) en
// vez de inline en la pantalla, porque la tarjeta de ganancia neta, la de
// punto de equilibrio y el gráfico de "Trabajos del mes" comparten la misma
// lógica de margen por trabajo. Fórmulas confirmadas con el dueño del
// producto — no cambiar el criterio acá sin volver a confirmar.
import { diferenciaEnDias, formatearMesCorto, parsearFechaDDMMAAAA } from "./fecha";

// Costo total de insumos de un turno ya finalizado, a partir de su receta
// congelada (turno.recetaAplicada, ver TurnoContext.js). Un turno sin receta
// (servicio sin receta, o que nunca pasó a "Finalizado") cuesta 0 — no es
// "sin dato", es que ese trabajo no tuvo costo de insumos. `costoUnitarioSnapshot`
// (línea de catálogo) y `costoEstimado` (línea libre) pueden ser `null` si al
// finalizar el trabajo el insumo no tenía precio/capacidad cargados: se
// tratan como 0 en la suma, nunca propagan NaN.
export function costoInsumosTurno(turno) {
  if (!turno?.recetaAplicada) return 0;
  return turno.recetaAplicada.reduce((suma, linea) => {
    const costo = linea.libre ? linea.costoEstimado : linea.costoUnitarioSnapshot;
    return suma + (costo ?? 0);
  }, 0);
}

// Costo de insumos de la receta VIGENTE de un servicio (data/ServicioContext,
// `servicio.receta`), resuelta en vivo contra Mis Insumos — a diferencia de
// costoInsumosTurno, que lee un snapshot ya congelado de un trabajo real.
// Pensada para la Calculadora de Presupuesto (screens/PresupuestoScreen.js),
// donde todavía no existe ningún turno: es la MISMA fórmula que
// TurnoContext.actualizarEstadoTrabajo usa para congelar costoUnitarioSnapshot
// (precioCompra × cantidad/capacidadTotal) pero sin escribir nada a
// Supabase. Un insumo borrado o sin precioCompra/capacidadTotal cargados
// cuesta 0 en vez de romper la suma, mismo criterio que costoInsumosTurno.
export function costoInsumosServicio(servicio, getInsumoById) {
  if (!servicio?.receta?.length) return 0;
  return servicio.receta.reduce((suma, linea) => {
    if (linea.libre) return suma + (linea.costoEstimado ?? 0);
    const insumo = getInsumoById(linea.insumoId);
    const costo =
      insumo?.precioCompra != null && insumo?.capacidadTotal > 0
        ? insumo.precioCompra * (linea.cantidad / insumo.capacidadTotal)
        : 0;
    return suma + costo;
  }, 0);
}

// Margen bruto de un cobro puntual. `turno` puede ser `undefined`/`null`
// (cobro.turnoId nulo, o el turno original fue borrado): se trata el costo
// de insumos como 0 (el margen queda igual al monto cobrado completo) — no
// hay forma de reconstruir qué insumos se usaron en un trabajo que ya no
// existe, y es preferible a inventar un costo.
export function margenBrutoTrabajo(cobro, turno) {
  return cobro.monto - costoInsumosTurno(turno);
}

// Nombre a mostrar para el trabajo de un cobro, con el mismo fallback que
// margenBrutoTrabajo usa para el costo.
export function nombreTrabajoCobro(turno) {
  return turno?.servicio || "Trabajo eliminado";
}

// Cobros con turno resoluble (turnoId cargado y el turno todavía existe):
// son los únicos con un costo de insumos REAL, a diferencia de un cobro sin
// turno, cuyo margen "100%" (ver margenBrutoTrabajo) es una convención
// contable para no perder esa plata del total, no una medición real. Se usa
// este subconjunto para promediar el margen — si se promediara sobre todos
// los cobros, esos 100% artificiales inflarían el promedio que alimenta el
// punto de equilibrio.
export function cobrosConTurnoResoluble(cobros, getTurnoById) {
  return cobros
    .map((cobro) => ({ cobro, turno: cobro.turnoId ? getTurnoById(cobro.turnoId) : null }))
    .filter(({ turno }) => !!turno);
}

// { porcentual, absoluto } promediados sobre todos los cobros con turno
// resoluble (no solo el mes actual: con pocos trabajos por mes el dato sería
// demasiado ruidoso). `null` si todavía no hay ningún cobro con margen
// calculable — la UI debe mostrar un mensaje de fallback en vez de un
// número, nunca inventar uno.
export function calcularMargenPromedio(cobros, getTurnoById) {
  const resolubles = cobrosConTurnoResoluble(cobros, getTurnoById);
  if (resolubles.length === 0) return null;

  const margenes = resolubles.map(({ cobro, turno }) => margenBrutoTrabajo(cobro, turno));
  const porcentuales = resolubles.map(
    ({ cobro, turno }) => margenBrutoTrabajo(cobro, turno) / cobro.monto
  );

  return {
    absoluto: margenes.reduce((suma, m) => suma + m, 0) / margenes.length,
    porcentual: porcentuales.reduce((suma, p) => suma + p, 0) / porcentuales.length,
  };
}

// Punto de equilibrio del mes: cuánto hay que facturar (o cuántos trabajos
// hay que hacer) para cubrir los costos fijos, ajustado por el margen real
// promedio — no el total de costos fijos "en crudo". `null` si todavía no
// hay margen promedio calculable, o si da 0/negativo (facturar más no
// alcanzaría a cubrir costos con ese margen): la UI muestra el mismo mensaje
// de fallback que calcularMargenPromedio en vez de un número sin sentido
// (Infinity o negativo).
export function calcularPuntoEquilibrio(totalCostosFijos, margenPromedio) {
  if (!margenPromedio || margenPromedio.porcentual <= 0) return null;

  return {
    facturacion: totalCostosFijos / margenPromedio.porcentual,
    trabajos: Math.ceil(totalCostosFijos / margenPromedio.absoluto),
  };
}

// Cuánto falta para llegar al punto de equilibrio DESDE la ganancia neta ya
// acumulada este mes — a diferencia de calcularPuntoEquilibrio, que parte de
// cero, esto descuenta lo que ya se facturó y los gastos variables ya
// cargados. Es la cantidad que alimenta la alerta de "quedan pocos días y
// todavía no cubriste tus costos fijos" (ver FinanzasScreen.js). `null` si
// ya se llegó al punto de equilibrio (gananciaNetaDelMes >= 0) o si todavía
// no hay margen promedio calculable, mismo criterio de fallback que
// calcularPuntoEquilibrio.
export function calcularFaltanteParaEquilibrio(gananciaNetaDelMes, margenPromedio) {
  if (gananciaNetaDelMes >= 0) return null;
  if (!margenPromedio || margenPromedio.porcentual <= 0) return null;

  const faltante = -gananciaNetaDelMes;
  return {
    facturacion: faltante / margenPromedio.porcentual,
    trabajos: Math.ceil(faltante / margenPromedio.absoluto),
  };
}

// Clave "año-mes" (ej. "2026-7") para agrupar cobros/gastos variables por
// mes real de calendario.
export function claveMesDeFecha(fecha) {
  return `${fecha.getFullYear()}-${fecha.getMonth()}`;
}

// Misma clave a partir de una fecha "DD/MM/AAAA" (formato de cobro.fecha /
// gastoVariable.fecha). null si la fecha no es válida (best-effort, mismo
// criterio que el resto de utils/fecha.js).
export function claveMes(fechaDDMMAAAA) {
  const fecha = parsearFechaDDMMAAAA(fechaDDMMAAAA);
  return fecha ? claveMesDeFecha(fecha) : null;
}

// Los últimos `cantidad` meses, terminando en el actual, con su clave de
// agrupación y una etiqueta corta para el eje de un gráfico.
export function obtenerUltimosMeses(cantidad) {
  const ahora = new Date();
  return Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (cantidad - 1 - i), 1);
    return { clave: claveMesDeFecha(fecha), etiqueta: formatearMesCorto(fecha) };
  });
}

// Ganancia neta de un mes puntual: ganancia bruta de los cobros de ese mes
// (mismo margen por trabajo que el resto de este archivo, incluidos los
// cobros sin turno resoluble — ver margenBrutoTrabajo) menos costos fijos
// vigentes (constante: no hay historial mes a mes de costos_fijos, se aplica
// el total actual a cada mes, igual que gananciaNetaDelMes en
// FinanzasScreen.js) menos gastos variables reales de ese mes.
export function calcularGananciaNetaMes(clave, cobros, gastosVariables, totalCostosFijos, getTurnoById) {
  const gananciaBruta = cobros
    .filter((c) => claveMes(c.fecha) === clave)
    .reduce((suma, c) => suma + margenBrutoTrabajo(c, c.turnoId ? getTurnoById(c.turnoId) : null), 0);
  const gastosDelMes = gastosVariables
    .filter((g) => claveMes(g.fecha) === clave)
    .reduce((suma, g) => suma + g.monto, 0);
  return gananciaBruta - totalCostosFijos - gastosDelMes;
}

// Ganancia neta de los últimos `cantidad` meses (el actual + anteriores),
// una entrada por mes con su etiqueta para el eje de un gráfico — 0 en vez
// de romper si ese mes no tuvo cobros ni gastos.
export function calcularTendenciaGananciaNeta(cantidad, cobros, gastosVariables, totalCostosFijos, getTurnoById) {
  return obtenerUltimosMeses(cantidad).map(({ clave, etiqueta }) => ({
    etiqueta,
    valor: calcularGananciaNetaMes(clave, cobros, gastosVariables, totalCostosFijos, getTurnoById),
  }));
}

// Ganancia bruta total, cantidad de veces vendido y margen % promedio, por
// servicio, agrupando los cobros con turno resoluble de los últimos
// `cantidadMeses` (no solo el mes actual: con pocos trabajos por mes el
// ranking tendría muy poca diferencia entre servicios). Agrupa por
// turno.servicioId cuando existe (o por el nombre del servicio si el turno
// se cargó sin catálogo, para que esas líneas también se sumen entre sí) y
// usa turno.servicio — el nombre YA CONGELADO en el turno al crearlo, ver
// TurnoContext.js — para mostrarlo, así un servicio borrado o renombrado
// después sigue apareciendo con el nombre que tenía cuando se vendió.
// `margenPorcentaje` (margen total / facturado total de ESE servicio, no un
// promedio de porcentajes por trabajo) alimenta la alerta de "margen bajo"
// de FinanzasScreen.js — `null` si el servicio no facturó nada resoluble
// (no debería pasar dado el filtro de arriba, pero evita un 0/0). Ordenado
// de mayor a menor ganancia total, limitado a los primeros `limite`.
export function rankingServiciosPorGanancia(cobros, getTurnoById, cantidadMeses, limite = 5) {
  const clavesVigentes = new Set(obtenerUltimosMeses(cantidadMeses).map((m) => m.clave));
  const resolubles = cobrosConTurnoResoluble(cobros, getTurnoById).filter(({ cobro }) =>
    clavesVigentes.has(claveMes(cobro.fecha))
  );

  const porServicio = new Map();
  for (const { cobro, turno } of resolubles) {
    const clave = turno.servicioId ?? `nombre:${turno.servicio}`;
    const entrada =
      porServicio.get(clave) ?? { id: clave, nombre: nombreTrabajoCobro(turno), cantidad: 0, monto: 0, facturado: 0 };
    entrada.cantidad += 1;
    entrada.monto += margenBrutoTrabajo(cobro, turno);
    entrada.facturado += cobro.monto;
    porServicio.set(clave, entrada);
  }

  return Array.from(porServicio.values())
    .map(({ facturado, ...entrada }) => ({
      ...entrada,
      margenPorcentaje: facturado > 0 ? (entrada.monto / facturado) * 100 : null,
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, limite);
}

// Facturación total histórica (TODOS los cobros con turno resoluble, sin
// límite de tiempo — a diferencia del ranking de servicios, acá interesa
// saber quién le generó más ingresos al taller en total) y cantidad de
// trabajos cobrados, por cliente. Agrupa por turno.clienteId; a diferencia
// de servicios, un cliente no tiene un "nombre congelado" en el turno, así
// que se resuelve en vivo contra ClienteContext (`getClienteById`) — si el
// cliente fue borrado después, se muestra un fallback en vez de romper.
// Ordenado de mayor a menor facturación, limitado a los primeros `limite`.
export function rankingClientesPorFacturacion(cobros, getTurnoById, getClienteById, limite = 5) {
  const resolubles = cobrosConTurnoResoluble(cobros, getTurnoById);

  const porCliente = new Map();
  for (const { cobro, turno } of resolubles) {
    if (!turno.clienteId) continue;
    const entrada = porCliente.get(turno.clienteId) ?? { id: turno.clienteId, cantidad: 0, monto: 0 };
    entrada.cantidad += 1;
    entrada.monto += cobro.monto;
    porCliente.set(turno.clienteId, entrada);
  }

  return Array.from(porCliente.values())
    .map((entrada) => ({ ...entrada, nombre: getClienteById(entrada.id)?.nombre ?? "Cliente eliminado" }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, limite);
}

// Cuánto se "regaló" respecto del precio de lista en un conjunto de cobros
// (pensado para pasarle los cobros de un solo mes, ver FinanzasScreen.js):
// solo cuenta cuando se cobró MENOS que turno.precio — el precio de lista
// YA CONGELADO en el turno al crearlo (mismo criterio que turno.servicio,
// ver TrabajoNuevoWizard.js), no el precio actual del catálogo, que puede
// haber cambiado desde entonces y no es lo que se le cotizó a ese cliente.
// Si cobraron igual o más, esa línea no suma nada (nunca resta). Un turno
// sin precio cargado, o un cobro sin turno resoluble, se ignora — no hay
// con qué comparar, no es que se haya regalado $0.
export function calcularTotalDescontado(cobros, getTurnoById) {
  return cobrosConTurnoResoluble(cobros, getTurnoById)
    .filter(({ cobro, turno }) => turno.precio != null && cobro.monto < turno.precio)
    .reduce((suma, { cobro, turno }) => suma + (turno.precio - cobro.monto), 0);
}

// Debajo de este mínimo de días transcurridos, proyectar el cierre de mes
// da un número demasiado ruidoso (1 solo trabajo cobrado el día 2 "cerraría
// el mes" en 15x eso) — mejor no mostrar nada que mostrar un número
// engañoso, ver FinanzasScreen.js.
const MINIMO_DIAS_PARA_PROYECTAR = 5;

// Proyección de ganancia neta al cierre del mes en curso, a partir del
// ritmo de lo que se lleva facturado/gastado: escala linealmente ganancia
// bruta y gastos variables acumulados (facturación_acumulada / días
// transcurridos × días totales del mes, aplicado a ambos) y recién ahí
// resta los costos fijos SIN escalar — son un monto fijo del mes entero,
// no algo que se acumule día a día como lo anterior. `null` antes de
// MINIMO_DIAS_PARA_PROYECTAR o si `diasTranscurridos` es 0 (mes recién
// arrancando, ver diasTranscurridosDelMes en utils/fecha.js) — la UI debe
// mostrar una aclaración de "todavía no es confiable" en vez de este valor.
export function calcularProyeccionCierreMes(
  gananciaBrutaDelMes,
  totalGastosVariablesDelMes,
  totalCostosFijos,
  diasTranscurridos,
  diasTotalesDelMes
) {
  if (diasTranscurridos < MINIMO_DIAS_PARA_PROYECTAR) return null;

  const factor = diasTotalesDelMes / diasTranscurridos;
  const gananciaBrutaProyectada = gananciaBrutaDelMes * factor;
  const gastosVariablesProyectados = totalGastosVariablesDelMes * factor;
  return gananciaBrutaProyectada - totalCostosFijos - gastosVariablesProyectados;
}

// Costo de insumos consumidos como % de la facturación del mes — dato de
// EFICIENCIA (cuánto de lo que entra se va en insumos), no de ganancia, por
// eso vive aparte de gananciaNetaDelMes/margenPromedio en FinanzasScreen.js.
// `trabajosDelMes` ya trae costoInsumos y cobro.monto resueltos (ver el
// `.map` que arma trabajosDelMes en FinanzasScreen.js) — no hace falta
// volver a resolver turnos acá. `null` sin facturación ese mes (0/0).
export function calcularPorcentajeInsumosSobreFacturacion(trabajosDelMes) {
  const totalFacturado = trabajosDelMes.reduce((suma, t) => suma + t.cobro.monto, 0);
  if (totalFacturado <= 0) return null;

  const totalCostoInsumos = trabajosDelMes.reduce((suma, t) => suma + t.costoInsumos, 0);
  return (totalCostoInsumos / totalFacturado) * 100;
}

// Facturación y ganancia neta de un rango de fechas [desde, hasta] (ambos
// inclusive) — pensado para el resumen semanal de Notificaciones (ver
// obtenerSemanaAnterior en utils/fecha.js y ResumenSemanalCard.js), pero
// sirve para cualquier rango corto. Los costos fijos se prorratean por día
// usando el mes de `hasta` y la cantidad de días del rango — no hay forma
// de saber el costo fijo histórico real de cada semana (solo se guarda el
// total VIGENTE, ver DataContext.js), así que esto es una aproximación
// aceptable para una tarjeta informativa, no para el punto de equilibrio
// real del mes (ese sigue sin prorratear, ver calcularPuntoEquilibrio).
export function calcularResumenPeriodo(desde, hasta, cobros, gastosVariables, totalCostosFijos, getTurnoById) {
  const dentroDelRango = (fechaDDMMAAAA) => {
    const fecha = parsearFechaDDMMAAAA(fechaDDMMAAAA);
    return !!fecha && diferenciaEnDias(desde, fecha) >= 0 && diferenciaEnDias(fecha, hasta) >= 0;
  };

  const cobrosDelPeriodo = cobros.filter((c) => dentroDelRango(c.fecha));
  const facturacion = cobrosDelPeriodo.reduce((suma, c) => suma + c.monto, 0);
  const gananciaBruta = cobrosDelPeriodo.reduce(
    (suma, c) => suma + margenBrutoTrabajo(c, c.turnoId ? getTurnoById(c.turnoId) : null),
    0
  );
  const gastosDelPeriodo = gastosVariables.filter((g) => dentroDelRango(g.fecha)).reduce((suma, g) => suma + g.monto, 0);

  const diasDelRango = diferenciaEnDias(desde, hasta) + 1;
  const diasDelMes = new Date(hasta.getFullYear(), hasta.getMonth() + 1, 0).getDate();
  const costosFijosProrrateados = (totalCostosFijos / diasDelMes) * diasDelRango;

  return {
    facturacion,
    gananciaNeta: gananciaBruta - costosFijosProrrateados - gastosDelPeriodo,
  };
}
