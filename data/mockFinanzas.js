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

// Costos fijos de ejemplo para mostrar el diseño de la pantalla con datos
// cargados desde el arranque.
export const costosFijosIniciales = [
  { id: "cf-alquiler", categoria: "alquiler", monto: 150000 },
  { id: "cf-sueldos", categoria: "sueldos", monto: 220000 },
  { id: "cf-servicios", categoria: "servicios", monto: 45000 },
];
