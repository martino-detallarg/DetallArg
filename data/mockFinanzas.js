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
