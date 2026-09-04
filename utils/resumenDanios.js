// Traduce el mapa `danios` del wizard de Trabajo Nuevo ({ zonaId: { tipos,
// nota } }, ver InspeccionVisualStep.js) a una lista legible por vista —
// mismos labels que usa DiagramaDanios.js para el selector y el resumen en
// pantalla — para reusarla tanto en FirmaConformidadStep.js (resumen en
// pantalla) como en utils/conformidadPdf.js (mismo resumen impreso).
import { DIAGRAMAS_POR_TIPO_VEHICULO } from "../components/diagrams/vehicles";
import { PANEL_LABELS as PANEL_LABELS_GENERICO } from "../components/wizard/DamageDiagram";
import { TIPOS_DANIO, TIPOS_DANIO_MOTO } from "../data/tiposDanio";

// Una vista es "de una sola zona genérica" cuando el vehículo todavía no
// tiene diagrama propio (ver obtenerClaveDiagrama en
// components/diagrams/vehicles/index.js) — en ese caso panelIds/panelLabels
// caen al fallback de DamageDiagram.js, igual que hace DiagramaDanios.js.
export function construirResumenDanios(danios, claveDiagrama, tipoVehiculo, vistaId) {
  const diagramaVehiculo = claveDiagrama ? DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama] : null;
  const diagramaVista = diagramaVehiculo?.vistas?.[vistaId];
  const panelIds = diagramaVista?.panelIds;
  const panelLabels = diagramaVista?.panelLabels ?? PANEL_LABELS_GENERICO;
  const tiposDanio = tipoVehiculo === "moto" ? TIPOS_DANIO_MOTO : TIPOS_DANIO;

  return Object.entries(danios)
    .filter(([zonaId, datosZona]) => {
      if (!datosZona?.tipos?.length) return false;
      // Sin panelIds propios (fallback genérico), cualquier zona con daño
      // cuenta; con panelIds propios, solo las de ESTA vista — así una
      // misma zonaId de otra vista no se mezcla acá (ver el comentario de
      // panelIds en components/diagrams/vehicles/index.js).
      return !panelIds || panelIds.includes(zonaId);
    })
    .map(([zonaId, datosZona]) => ({
      zona: panelLabels[zonaId] ?? zonaId,
      tipos: datosZona.tipos.map((tipoId) => ({
        etiqueta: tiposDanio[tipoId]?.etiqueta ?? tipoId,
        nota: tipoId === "otro" ? datosZona.nota : "",
      })),
    }));
}
