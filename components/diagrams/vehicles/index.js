import PickupCabinaSimpleDiagram, {
  VEHICLE_TYPE as PICKUP_CABINA_SIMPLE,
  PANEL_IDS as PICKUP_CABINA_SIMPLE_PANEL_IDS,
  PANEL_LABELS as PICKUP_CABINA_SIMPLE_PANEL_LABELS,
} from "./PickupCabinaSimpleDiagram";
import { AUTO_COUPE_VISTAS, VEHICLE_TYPE as AUTO_COUPE } from "./autoCoupe";
import { AUTO_SEDAN_VISTAS, VEHICLE_TYPE as AUTO_SEDAN } from "./autoSedan";
import { AUTO_DESCAPOTABLE_VISTAS, VEHICLE_TYPE as AUTO_DESCAPOTABLE } from "./autoDescapotable";
import { AUTO_FAMILIAR_VISTAS, VEHICLE_TYPE as AUTO_FAMILIAR } from "./autoFamiliar";
import { AUTO_HATCHBACK_VISTAS, VEHICLE_TYPE as AUTO_HATCHBACK } from "./autoHatchback";
import { CAMIONETA_CSC_VISTAS, VEHICLE_TYPE as CAMIONETA_CSC } from "./camionetaCabinaSimpleChico";
import { CAMIONETA_CSM_VISTAS, VEHICLE_TYPE as CAMIONETA_CSM } from "./camionetaCabinaSimpleMediano";

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
// La Pickup Cabina Simple (el viejo SVG de un solo panel, 5 vistas
// apiladas) ya no representa a ninguna subdivisión real por defecto —
// Chico y Mediano tienen ambas su diagrama propio (ver más abajo). Queda
// registrada solo como resguardo: si `grupo` ya es "Cabina simple" pero
// todavía no se eligió Chico/Mediano, se usa como vista previa genérica
// mientras tanto (ver `obtenerClaveDiagrama`).
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
  [AUTO_DESCAPOTABLE]: {
    vistas: AUTO_DESCAPOTABLE_VISTAS,
  },
  [AUTO_FAMILIAR]: {
    vistas: AUTO_FAMILIAR_VISTAS,
  },
  [AUTO_HATCHBACK]: {
    vistas: AUTO_HATCHBACK_VISTAS,
  },
  [CAMIONETA_CSC]: {
    vistas: CAMIONETA_CSC_VISTAS,
  },
  [CAMIONETA_CSM]: {
    vistas: CAMIONETA_CSM_VISTAS,
  },
};

// Resuelve la clave de este registro a partir de los datos de "Tipo de
// vehículo" del wizard de Trabajo Nuevo (tipoVehiculo + grupo + subdivision
// elegidos en TipoVehiculoStep). Vive acá para que tanto TipoVehiculoStep
// (arma la nota de qué diagrama vas a ver) como InspeccionVisualStep (arma
// el carrusel y lo renderiza) usen siempre la misma lógica.
export function obtenerClaveDiagrama({ tipoVehiculo, grupo, subdivision }) {
  // Camioneta / Cabina simple ya tiene diagrama real propio para las dos
  // subdivisiones — se chequean antes del catch-all genérico de más abajo,
  // que ahora es solo resguardo por si `grupo` ya está elegido pero
  // `subdivision` todavía no (Chico/Mediano sin definir).
  if (tipoVehiculo === "camioneta" && grupo === "Cabina simple" && subdivision === "Chico") {
    return CAMIONETA_CSC;
  }
  if (tipoVehiculo === "camioneta" && grupo === "Cabina simple" && subdivision === "Mediano") {
    return CAMIONETA_CSM;
  }
  if (tipoVehiculo === "camioneta" && grupo === "Cabina simple") {
    return PICKUP_CABINA_SIMPLE;
  }
  if (tipoVehiculo === "auto" && subdivision === "Coupé") {
    return AUTO_COUPE;
  }
  if (tipoVehiculo === "auto" && subdivision === "Sedán") {
    return AUTO_SEDAN;
  }
  if (tipoVehiculo === "auto" && subdivision === "Descapotable") {
    return AUTO_DESCAPOTABLE;
  }
  if (tipoVehiculo === "auto" && subdivision === "Familiar") {
    return AUTO_FAMILIAR;
  }
  if (tipoVehiculo === "auto" && subdivision === "Hatchback") {
    return AUTO_HATCHBACK;
  }
  return null;
}
