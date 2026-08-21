import PickupCabinaSimpleDiagram, {
  VEHICLE_TYPE as PICKUP_CABINA_SIMPLE,
  PANEL_IDS as PICKUP_CABINA_SIMPLE_PANEL_IDS,
  PANEL_LABELS as PICKUP_CABINA_SIMPLE_PANEL_LABELS,
} from "./PickupCabinaSimpleDiagram";

// Mapeo tipoDeVehiculo -> diagrama de paneles reales, para no tener que
// rehacer el selector de estado de DiagramaDanios cada vez que se sume un
// tipo de carrocería nuevo. Cada entrada expone el mismo contrato:
//   Componente: recibe { danios, onPanelPress, width, colors } y pinta cada
//     panel de PANEL_IDS con el color de TIPOS_DANIO cuando tiene un daño
//     cargado (o el color de fondo por defecto si no).
//   panelIds: ids tocables, en el orden en que se listan en el resumen.
//   panelLabels: id -> etiqueta legible, para el selector y el resumen.
//
// Si un tipo de vehículo no tiene entrada acá, DiagramaDanios usa el
// diagrama genérico de 5 zonas (components/wizard/DamageDiagram.js) como
// fallback.
export const DIAGRAMAS_POR_TIPO_VEHICULO = {
  [PICKUP_CABINA_SIMPLE]: {
    Componente: PickupCabinaSimpleDiagram,
    panelIds: PICKUP_CABINA_SIMPLE_PANEL_IDS,
    panelLabels: PICKUP_CABINA_SIMPLE_PANEL_LABELS,
  },
};

// Resuelve la clave de este registro a partir de los datos de "Tipo de
// vehículo" del wizard de Trabajo Nuevo (tipoVehiculo + grupo elegidos en
// TipoVehiculoStep). Vive acá para que tanto TipoVehiculoStep (arma la nota
// de qué diagrama vas a ver) como InspeccionVisualStep (lo renderiza) usen
// siempre la misma lógica.
export function obtenerClaveDiagrama({ tipoVehiculo, grupo }) {
  if (tipoVehiculo === "camioneta" && grupo === "Cabina simple") {
    return "pickup_cabina_simple";
  }
  return null;
}
