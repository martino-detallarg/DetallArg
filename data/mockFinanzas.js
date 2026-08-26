// Categorías de costos fijos mensuales del taller.
export const CATEGORIAS_COSTOS_FIJOS = {
  alquiler: { etiqueta: "Alquiler", icono: "home-outline" },
  sueldos: { etiqueta: "Sueldos", icono: "people-outline" },
  servicios: { etiqueta: "Luz/Agua/Internet", icono: "flash-outline" },
  mantenimiento: { etiqueta: "Mantenimiento", icono: "construct-outline" },
  seguro: { etiqueta: "Seguro", icono: "shield-checkmark-outline" },
  otro: { etiqueta: "Otro", icono: "ellipsis-horizontal-outline" },
};

export const ORDEN_CATEGORIAS_COSTOS_FIJOS = Object.keys(CATEGORIAS_COSTOS_FIJOS);
