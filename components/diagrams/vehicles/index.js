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
import { CAMIONETA_DCC_VISTAS, VEHICLE_TYPE as CAMIONETA_DCC } from "./camionetaDobleCabinaChico";
import { CAMIONETA_DCM_VISTAS, VEHICLE_TYPE as CAMIONETA_DCM } from "./camionetaDobleCabinaMediano";
import { CAMIONETA_DCG_VISTAS, VEHICLE_TYPE as CAMIONETA_DCG } from "./camionetaDobleCabinaGrande";
import { UTILITARIO_CHICO_VISTAS, VEHICLE_TYPE as UTILITARIO_CHICO } from "./camionetaUtilitarioChico";
import { UTILITARIO_MEDIANO_VISTAS, VEHICLE_TYPE as UTILITARIO_MEDIANO } from "./camionetaUtilitarioMediano";
import { UTILITARIO_GRANDE_VISTAS, VEHICLE_TYPE as UTILITARIO_GRANDE } from "./camionetaUtilitarioGrande";
import { SUV_COMPACTO_VISTAS, VEHICLE_TYPE as SUV_COMPACTO } from "./suvCompacto";
import { SUV_GRANDE_VISTAS, VEHICLE_TYPE as SUV_GRANDE } from "./suvGrande";
import { MOTO_ENDURO_CALLE_VISTAS, VEHICLE_TYPE as MOTO_ENDURO_CALLE } from "./motoEnduroCalle";
import { MOTO_SCOOTER_VISTAS, VEHICLE_TYPE as MOTO_SCOOTER } from "./motoScooter";

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
  [CAMIONETA_DCC]: {
    vistas: CAMIONETA_DCC_VISTAS,
  },
  [CAMIONETA_DCM]: {
    vistas: CAMIONETA_DCM_VISTAS,
  },
  [CAMIONETA_DCG]: {
    vistas: CAMIONETA_DCG_VISTAS,
  },
  [UTILITARIO_CHICO]: {
    vistas: UTILITARIO_CHICO_VISTAS,
  },
  [UTILITARIO_MEDIANO]: {
    vistas: UTILITARIO_MEDIANO_VISTAS,
  },
  [UTILITARIO_GRANDE]: {
    vistas: UTILITARIO_GRANDE_VISTAS,
  },
  [SUV_COMPACTO]: {
    vistas: SUV_COMPACTO_VISTAS,
  },
  [SUV_GRANDE]: {
    vistas: SUV_GRANDE_VISTAS,
  },
  // Moto / Enduro-Calle: primera subdivisión de Moto con diagrama propio
  // (ver motoEnduroCalle.js) — una sola vista Lateral con 4 zonas, en vez
  // de las 4 vistas del resto de las familias.
  [MOTO_ENDURO_CALLE]: {
    vistas: MOTO_ENDURO_CALLE_VISTAS,
  },
  // Moto / Scooter: segunda subdivisión de Moto con diagrama propio (ver
  // motoScooter.js) — mismo criterio de una sola vista Lateral, 4 zonas.
  [MOTO_SCOOTER]: {
    vistas: MOTO_SCOOTER_VISTAS,
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
  // Camioneta / Doble cabina: las 3 subdivisiones (Chico, Mediano, Grande)
  // ya tienen diagrama real propio — familia completa.
  if (tipoVehiculo === "camioneta" && grupo === "Doble cabina" && subdivision === "Chico") {
    return CAMIONETA_DCC;
  }
  if (tipoVehiculo === "camioneta" && grupo === "Doble cabina" && subdivision === "Mediano") {
    return CAMIONETA_DCM;
  }
  if (tipoVehiculo === "camioneta" && grupo === "Doble cabina" && subdivision === "Grande") {
    return CAMIONETA_DCG;
  }
  // Camioneta / Utilitario acarrozado / Chico, Mediano y Grande ya tienen
  // diagrama real propio — primera familia de Camioneta con carrocería
  // cerrada (sin caja abierta), ver notas de criterio de zonas en
  // camionetaUtilitarioChico.js / camionetaUtilitarioMediano.js /
  // camionetaUtilitarioGrande.js.
  if (tipoVehiculo === "camioneta" && grupo === "Utilitario acarrozado" && subdivision === "Chico") {
    return UTILITARIO_CHICO;
  }
  if (tipoVehiculo === "camioneta" && grupo === "Utilitario acarrozado" && subdivision === "Mediano") {
    return UTILITARIO_MEDIANO;
  }
  if (tipoVehiculo === "camioneta" && grupo === "Utilitario acarrozado" && subdivision === "Grande") {
    return UTILITARIO_GRANDE;
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
  // SUV / Compacto y Grande ya tienen diagrama real propio — familia SUV
  // completa. Mismo criterio de zonas calcado de Auto Sedán/Familiar/
  // Hatchback (4 puertas, sin caja de carga) para las dos subdivisiones.
  if (tipoVehiculo === "suv" && subdivision === "Compacto") {
    return SUV_COMPACTO;
  }
  if (tipoVehiculo === "suv" && subdivision === "Grande") {
    return SUV_GRANDE;
  }
  // Moto / Enduro-Calle y Scooter ya tienen diagrama propio (ver
  // motoEnduroCalle.js / motoScooter.js — una sola vista Lateral, 4
  // zonas cada una). Naked, Sport y Motocross quedan deferidos a otra
  // etapa (pedido explícito de Augusto) y caen en el `return null` de más
  // abajo — TipoVehiculoStep/InspeccionVisualStep ya muestran una
  // nota/tarjeta "Próximamente" específica para Moto en ese caso, en vez
  // del diagrama genérico de auto.
  if (tipoVehiculo === "moto" && subdivision === "Enduro/Calle") {
    return MOTO_ENDURO_CALLE;
  }
  if (tipoVehiculo === "moto" && subdivision === "Scooter") {
    return MOTO_SCOOTER;
  }
  return null;
}
