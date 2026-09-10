// Traduce `medicionMicrones` del wizard de Trabajo Nuevo ({ modo, promedio,
// porPanel }, ver components/wizard/MedicionMicronesModal.js) a una forma
// legible para el PDF de conformidad (utils/conformidadPdf.js) — mismo
// criterio que utils/resumenDanios.js: resuelve panel_id a un label legible
// por vista usando el mismo registro de diagramas que ya usa Inspección
// Visual. `null` si no hay ningún valor numérico válido cargado (la
// sección del PDF, en ese caso, no se muestra).
import { DIAGRAMAS_POR_TIPO_VEHICULO } from "../components/diagrams/vehicles";
import { PANEL_LABELS as PANEL_LABELS_GENERICO } from "../components/wizard/DamageDiagram";

function valorValido(texto) {
  if (!texto?.trim()) return null;
  const numero = Number(texto.replace(",", "."));
  return !Number.isNaN(numero) && numero > 0 ? numero : null;
}

// Devuelve { modo: "promedio", promedio: numero } o { modo: "panel",
// porPanel: [{ vista, panel, micrones }] }, o `null` si no hay nada
// cargado (modo sin elegir, o elegido pero sin ningún valor válido).
export function construirResumenMicrones(medicionMicrones, claveDiagrama) {
  if (medicionMicrones?.modo === "promedio") {
    const valor = valorValido(medicionMicrones.promedio);
    return valor != null ? { modo: "promedio", promedio: valor } : null;
  }

  if (medicionMicrones?.modo === "panel") {
    const diagramaVehiculo = claveDiagrama ? DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama] : null;
    const filas = [];
    for (const [vistaId, panelesMap] of Object.entries(medicionMicrones.porPanel ?? {})) {
      const diagramaVista = diagramaVehiculo?.vistas?.[vistaId];
      const panelLabels = diagramaVista?.panelLabels ?? PANEL_LABELS_GENERICO;
      const vistaEtiqueta = diagramaVista?.etiqueta ?? vistaId;
      for (const [panelId, texto] of Object.entries(panelesMap ?? {})) {
        const valor = valorValido(texto);
        if (valor != null) filas.push({ vista: vistaEtiqueta, panel: panelLabels[panelId] ?? panelId, micrones: valor });
      }
    }
    return filas.length > 0 ? { modo: "panel", porPanel: filas } : null;
  }

  return null;
}
