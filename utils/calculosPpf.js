// utils/calculosPpf.js
//
// Calculo del presupuesto de un trabajo de PPF: paneles elegidos -> m2 de material necesario
// (ya con merma) -> costo de material segun el precio por m2 del rollo cargado en Mis Insumos.
// Puede haber DOS rollos distintos en el mismo trabajo (carrocería y vidrio, ver el campo
// `material` de cada panel en data/ppfPanelMatrix.js) -- cada panel usa el costo por m² que le
// corresponde según su propio material, nunca el de carrocería para todos. Mismo criterio de "se
// congela al momento de cobrar/completar el trabajo" que el resto de Finanzas
// (turno_receta_aplicada) -- este calculo alimenta el snapshot que se guarda en turno_ppf_paneles
// (turno_id, panel_id, vista, m2 congelado, y ahora también el costo por m² que le correspondió a
// ESE panel puntual -- ver TurnoContext.actualizarEstadoTrabajo).

import { PPF_PANEL_MATRIX, MERMA_POR_MODO } from "../data/ppfPanelMatrix";

/**
 * Devuelve el objeto de paneles disponibles (con m2Referencia/complejidad -- la merma NO vive
 * acá, ver MERMA_POR_MODO) para una subdivision de vehiculo puntual. null si no hay matriz
 * cargada para esa combinacion (ej. Moto, que no tiene PPF en esta v1).
 */
export function obtenerPanelesPpf(tipoVehiculo, subdivision) {
  const tipo = PPF_PANEL_MATRIX[tipoVehiculo];
  if (!tipo) return null;
  const sub = tipo[subdivision];
  if (!sub) return null;
  return sub.paneles;
}

// Traduce { tipoVehiculo, grupo, subdivision } -- las mismas etiquetas que arma
// TipoVehiculoStep.js (screens/trabajoNuevo/TipoVehiculoStep.js: TIPOS_VEHICULO) -- a la
// combinacion { tipoVehiculo, subdivision } que espera PPF_PANEL_MATRIX/obtenerPanelesPpf.
// Vive acá (no en components/diagrams/vehicles/index.js) porque es un mapeo propio de PPF, no del
// registro de diagramas de daños: usa las mismas etiquetas de entrada que obtenerClaveDiagrama,
// pero devuelve una clave distinta (la de la matriz de m2, no la del diagrama).
//
// null cuando la combinación todavía no tiene matriz de PPF cargada -- Moto entera, y "Camioneta /
// Utilitario acarrozado / Chico" (tiene diagrama de daños propio, pero esta v1 de PPF no llegó a
// cubrirlo, ver el comentario de data/ppfPanelMatrix.js). El wizard debe tratar este caso con el
// mismo criterio "Próximamente" que ya usa InspeccionVisualStep para Moto sin diagrama.
export function obtenerClavePpf({ tipoVehiculo, grupo, subdivision }) {
  if (tipoVehiculo === "auto") {
    const subs = { Coupé: "coupe", Sedán: "sedan", Hatchback: "hatchback", Familiar: "familiar", Descapotable: "descapotable" };
    return subs[subdivision] ? { tipoVehiculo: "auto", subdivision: subs[subdivision] } : null;
  }
  if (tipoVehiculo === "suv") {
    const subs = { Compacto: "compacto", Grande: "grande" };
    return subs[subdivision] ? { tipoVehiculo: "suv", subdivision: subs[subdivision] } : null;
  }
  if (tipoVehiculo === "camioneta") {
    if (grupo === "Cabina simple" && subdivision === "Chico") return { tipoVehiculo: "camioneta", subdivision: "cabina_simple_chico" };
    if (grupo === "Cabina simple" && subdivision === "Mediano") return { tipoVehiculo: "camioneta", subdivision: "cabina_simple_mediano" };
    if (grupo === "Doble cabina" && subdivision === "Chico") return { tipoVehiculo: "camioneta", subdivision: "doble_cabina_chico" };
    if (grupo === "Doble cabina" && subdivision === "Mediano") return { tipoVehiculo: "camioneta", subdivision: "doble_cabina_mediano" };
    if (grupo === "Doble cabina" && subdivision === "Grande") return { tipoVehiculo: "camioneta", subdivision: "doble_cabina_grande" };
    if (grupo === "Utilitario acarrozado" && subdivision === "Mediano") return { tipoVehiculo: "camioneta", subdivision: "utilitario_acarrozado_mediano" };
    if (grupo === "Utilitario acarrozado" && subdivision === "Grande") return { tipoVehiculo: "camioneta", subdivision: "utilitario_acarrozado_grande" };
    return null;
  }
  return null;
}

/**
 * costoPorM2RolloCarroceria: sale de dividir precioCompra / capacidadTotal del insumo PPF de
 * carrocería elegido (categoria "ppf", materialPpf "carroceria", capacidadUnidad "m2" -- el
 * taller carga precio pagado + m2 reales del rollo al agregarlo/reabastecerlo en Mis Insumos,
 * ver AgregarInsumoModal.js). SIEMPRE requerido: todo trabajo de PPF tiene al menos un panel de
 * carrocería.
 *
 * costoPorM2RolloVidrio: mismo cálculo, pero del insumo PPF con materialPpf "vidrio" (una lámina
 * distinta, pensada para vidrio curvo -- ver data/ppfPanelMatrix.js). Opcional: solo hace falta
 * si algún panel de panelesElegidos tiene material: "vidrio" (hoy, el parabrisas). Si falta y
 * hace falta, se devuelve un error en vez de calcular con un costo faltante (ver más abajo).
 *
 * panelesElegidos: array de keys de panel (ej. ["capot", "paragolpes_delantero", ...]) que el
 * taller tildo en el selector (reusa el mismo componente de diagramas del check-in visual).
 *
 * manoDeObraEstimada: opcional, monto fijo que el taller carga a mano (no hay tarifa por hora
 * definida todavia en el proyecto -- mismo criterio que el resto de Finanzas, sin mano de obra
 * por hora en v1).
 *
 * insumosAdicionalesEstimados: opcional, monto fijo que el taller carga a mano para lo que no es
 * el rollo en sí (líquido de instalación, lavado/descontaminado previo) -- mismo criterio y mismo
 * patrón que manoDeObraEstimada, sin desglose propio en v1.
 *
 * modoCorte: "manual" (default, cutter a mano) o "laser" (laser/plotter) -- define que fila de
 * MERMA_POR_MODO (data/ppfPanelMatrix.js) se usa para calcular mermaPct/m2ConMerma de cada panel
 * al vuelo, ya que la matriz de paneles dejó de traer esos dos valores fijos (ver el comentario
 * de cabecera de ppfPanelMatrix.js). Misma merma para carrocería y vidrio -- el método de corte
 * no cambia según el material, solo el costo por m² del rollo.
 */
export function calcularPresupuestoPpf({
  tipoVehiculo,
  subdivision,
  panelesElegidos,
  costoPorM2RolloCarroceria,
  costoPorM2RolloVidrio,
  manoDeObraEstimada = 0,
  insumosAdicionalesEstimados = 0,
  modoCorte = "manual",
}) {
  const paneles = obtenerPanelesPpf(tipoVehiculo, subdivision);
  if (!paneles) {
    return {
      error: "SIN_MATRIZ",
      mensaje: `No hay matriz de paneles PPF cargada para ${tipoVehiculo}/${subdivision}.`,
    };
  }

  // Si algún panel elegido es de vidrio pero no vino el costo del rollo de vidrio, no hay con qué
  // calcular ESE costoPanel -- mismo patrón que SIN_MATRIZ arriba, error explícito en vez de
  // calcular con costoPorM2RolloVidrio undefined (que daría NaN silencioso).
  const hayPanelVidrio = panelesElegidos.some((panelKey) => paneles[panelKey]?.material === "vidrio");
  if (hayPanelVidrio && !(costoPorM2RolloVidrio > 0)) {
    return {
      error: "SIN_ROLLO_VIDRIO",
      mensaje: "Elegiste un panel de vidrio pero no hay un rollo de vidrio cargado (o sin precio/m² válidos) para calcular su costo.",
    };
  }

  const mermaPorComplejidad = MERMA_POR_MODO[modoCorte] ?? MERMA_POR_MODO.manual;

  const detalle = panelesElegidos.map((panelKey) => {
    const panel = paneles[panelKey];
    if (!panel) {
      // TODO: hoy esta rama es inalcanzable (SelectorPanelesPpf.js filtra
      // contra panelesDisponibles antes de togglear, así que panelesElegidos
      // nunca trae una key que no exista en la matriz actual). Si algún día
      // ppfPanelMatrix.js cambia y deja "huérfano" un panel ya elegido en un
      // turno viejo, esta fila le va a faltar m2ConMerma/costoPanel — falta
      // decidir cómo se muestra en PresupuestoPpfStep.js antes de completarla
      // (¿fila de aviso? ¿excluirla del total?).
      return { panel: panelKey, error: "PANEL_DESCONOCIDO" };
    }
    const mermaPct = mermaPorComplejidad[panel.complejidad];
    const m2ConMerma = Math.round(panel.m2Referencia * (1 + mermaPct) * 100) / 100;
    const costoPorM2 = panel.material === "vidrio" ? costoPorM2RolloVidrio : costoPorM2RolloCarroceria;
    return {
      panel: panelKey,
      m2Referencia: panel.m2Referencia,
      complejidad: panel.complejidad,
      material: panel.material,
      mermaPct,
      m2ConMerma,
      costoPanel: Math.round(m2ConMerma * costoPorM2 * 100) / 100,
    };
  });

  const detalleValido = detalle.filter((d) => !d.error);
  const m2TotalConMerma = detalleValido.reduce((acc, p) => acc + (p.m2ConMerma || 0), 0);
  const costoMaterialCarroceria = Math.round(
    detalleValido.filter((p) => p.material !== "vidrio").reduce((acc, p) => acc + p.costoPanel, 0) * 100
  ) / 100;
  const costoMaterialVidrio = Math.round(
    detalleValido.filter((p) => p.material === "vidrio").reduce((acc, p) => acc + p.costoPanel, 0) * 100
  ) / 100;
  const costoMaterial = Math.round((costoMaterialCarroceria + costoMaterialVidrio) * 100) / 100;
  const presupuestoTotal =
    Math.round((costoMaterial + manoDeObraEstimada + insumosAdicionalesEstimados) * 100) / 100;

  return {
    detalle,
    m2TotalConMerma: Math.round(m2TotalConMerma * 100) / 100,
    costoMaterialCarroceria,
    costoMaterialVidrio,
    costoMaterial,
    manoDeObraEstimada,
    insumosAdicionalesEstimados,
    presupuestoTotal,
  };
}
