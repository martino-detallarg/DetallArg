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

// Categorías de gastos variables (Fase A de Finanzas: FinanzasContext).
export const CATEGORIAS_GASTOS_VARIABLES = {
  personal_comisiones: { etiqueta: "Personal/Comisiones", icono: "people-outline" },
  otro: { etiqueta: "Otro", icono: "ellipsis-horizontal-outline" },
};

export const ORDEN_CATEGORIAS_GASTOS_VARIABLES = Object.keys(CATEGORIAS_GASTOS_VARIABLES);

// Formas de pago de un cobro (RegistrarCobroModal).
export const FORMAS_PAGO = {
  efectivo: { etiqueta: "Efectivo", icono: "cash-outline" },
  transferencia: { etiqueta: "Transferencia", icono: "swap-horizontal-outline" },
  tarjeta: { etiqueta: "Tarjeta", icono: "card-outline" },
  otro: { etiqueta: "Otro", icono: "ellipsis-horizontal-outline" },
};

export const ORDEN_FORMAS_PAGO = Object.keys(FORMAS_PAGO);
