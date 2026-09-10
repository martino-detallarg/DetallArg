// utils/calculosPpf.js
//
// Calculo del presupuesto de un trabajo de PPF: paneles elegidos -> m2 de material necesario
// (ya con merma) -> costo de material segun el precio por m2 del rollo cargado en Mis Insumos.
// Mismo criterio de "se congela al momento de cobrar/completar el trabajo" que el resto de
// Finanzas (turno_receta_aplicada) -- este calculo alimenta el snapshot que se guarda en
// turno_ppf_paneles (turno_id, panel_id, vista, m2 congelado).

import { PPF_PANEL_MATRIX } from "../data/ppfPanelMatrix";

/**
 * Devuelve el objeto de paneles disponibles (con m2Referencia/complejidad/mermaPct/m2ConMerma)
 * para una subdivision de vehiculo puntual. null si no hay matriz cargada para esa combinacion
 * (ej. Moto, que no tiene PPF en esta v1).
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
 * costoPorM2Rollo: sale de dividir precioCompra / capacidadTotal del insumo PPF elegido
 * (categoria "ppf", capacidadUnidad "m2" -- el taller carga precio pagado + m2 reales del
 * rollo al agregarlo/reabastecerlo en Mis Insumos, mismo modal AgregarInsumoModal.js que ya
 * existe, sin columnas nuevas).
 *
 * panelesElegidos: array de keys de panel (ej. ["capot", "paragolpes_delantero", ...]) que el
 * taller tildo en el selector (reusa el mismo componente de diagramas del check-in visual).
 *
 * manoDeObraEstimada: opcional, monto fijo que el taller carga a mano (no hay tarifa por hora
 * definida todavia en el proyecto -- mismo criterio que el resto de Finanzas, sin mano de obra
 * por hora en v1).
 */
export function calcularPresupuestoPpf({
  tipoVehiculo,
  subdivision,
  panelesElegidos,
  costoPorM2Rollo,
  manoDeObraEstimada = 0,
}) {
  const paneles = obtenerPanelesPpf(tipoVehiculo, subdivision);
  if (!paneles) {
    return {
      error: "SIN_MATRIZ",
      mensaje: `No hay matriz de paneles PPF cargada para ${tipoVehiculo}/${subdivision}.`,
    };
  }

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
    return {
      panel: panelKey,
      m2Referencia: panel.m2Referencia,
      complejidad: panel.complejidad,
      mermaPct: panel.mermaPct,
      m2ConMerma: panel.m2ConMerma,
      costoPanel: Math.round(panel.m2ConMerma * costoPorM2Rollo * 100) / 100,
    };
  });

  const m2TotalConMerma = detalle.reduce((acc, p) => acc + (p.m2ConMerma || 0), 0);
  const costoMaterial = Math.round(m2TotalConMerma * costoPorM2Rollo * 100) / 100;
  const presupuestoTotal = Math.round((costoMaterial + manoDeObraEstimada) * 100) / 100;

  return {
    detalle,
    m2TotalConMerma: Math.round(m2TotalConMerma * 100) / 100,
    costoMaterial,
    manoDeObraEstimada,
    presupuestoTotal,
  };
}
