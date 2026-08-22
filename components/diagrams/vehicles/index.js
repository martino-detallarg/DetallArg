import PickupCabinaSimpleDiagram, {
  VEHICLE_TYPE as PICKUP_CABINA_SIMPLE,
  PANEL_IDS as PICKUP_CABINA_SIMPLE_PANEL_IDS,
  PANEL_LABELS as PICKUP_CABINA_SIMPLE_PANEL_LABELS,
} from "./PickupCabinaSimpleDiagram";
import { AUTO_COUPE_VISTAS, VEHICLE_TYPE as AUTO_COUPE } from "./autoCoupe";
import { AUTO_SEDAN_VISTAS, VEHICLE_TYPE as AUTO_SEDAN } from "./autoSedan";

// Mapeo tipoDeVehiculo -> diagramas de paneles reales, para no tener que
// rehacer el selector de estado de DiagramaDanios ni el carrusel de
// InspeccionVisualStep cada vez que se sume una carrocería nueva.
//
// Cada entrada tiene un mapa `vistas` (una por ángulo — frente/atras/
// lateral/cenital, lo que corresponda) con el contrato:
//   etiqueta: nombre de la vista para el carrusel de InspeccionVisualStep.
//   Componente: recibe { danios, onPanelPress, width } y pinta cada panel
//     de panelIds con un borde resaltado cuando tiene uno o más daños
//     cargados (el color por tipo vive en la lista resumen, no acá).
//   panelIds: ids tocables de ESA vista, en el orden del resumen.
//   panelLabels: id -> etiqueta legible, para el selector y el resumen.
//
// La Pickup Cabina Simple todavía es un solo SVG con las 5 vistas apiladas
// (no separadas por ángulo), así que por ahora queda registrada como una
// única "vista" — el día que se separe en ángulos reales, alcanza con
// agregar las demás entradas acá, sin tocar DiagramaDanios ni el carrusel.
//
// Si un tipo de vehículo no tiene entrada acá, InspeccionVisualStep usa una
// sola vista genérica (el diagrama de Frente de
// components/wizard/DamageDiagram.js) como fallback.
export const DIAGRAMAS_POR_TIPO_VEHICULO = {
  [PICKUP_CABINA_SIMPLE]: {
    vistas: {
      frente: {
        etiqueta: "Frente",
        Componente: PickupCabinaSimpleDiagram,
        panelIds: PICKUP_CABINA_SIMPLE_PANEL_IDS,
        panelLabels: PICKUP_CABINA_SIMPLE_PANEL_LABELS,
      },
    },
  },
  [AUTO_COUPE]: {
    vistas: AUTO_COUPE_VISTAS,
  },
  [AUTO_SEDAN]: {
    vistas: AUTO_SEDAN_VISTAS,
  },
};

// Resuelve la clave de este registro a partir de los datos de "Tipo de
// vehículo" del wizard de Trabajo Nuevo (tipoVehiculo + grupo + subdivision
// elegidos en TipoVehiculoStep). Vive acá para que tanto TipoVehiculoStep
// (arma la nota de qué diagrama vas a ver) como InspeccionVisualStep (arma
// el carrusel y lo renderiza) usen siempre la misma lógica.
export function obtenerClaveDiagrama({ tipoVehiculo, grupo, subdivision }) {
  if (tipoVehiculo === "camioneta" && grupo === "Cabina simple") {
    return PICKUP_CABINA_SIMPLE;
  }
  if (tipoVehiculo === "auto" && subdivision === "Coupé") {
    return AUTO_COUPE;
  }
  if (tipoVehiculo === "auto" && subdivision === "Sedán") {
    return AUTO_SEDAN;
  }
  return null;
}
