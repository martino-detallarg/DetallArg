// Tipos de daño previo que se pueden marcar en cualquier diagrama de
// check-in visual (el genérico de Frente o los diagramas de paneles reales
// por tipo de carrocería en components/diagrams/vehicles), cada uno con su
// color para identificarlo de un vistazo en la lista resumen "Daños
// registrados" (el diagrama en sí ya no se pinta con este color: como una
// zona puede tener varios tipos a la vez, solo se resalta con un borde
// neutro — ver DamageDiagram / PickupCabinaSimpleDiagram).
//
// "otro" es distinto de los demás: en vez de ser un daño predefinido, al
// activarse habilita un campo de texto libre (`notaLibre: true`) para
// describir algo que no entra en ninguna de las otras categorías.
export const TIPOS_DANIO = {
  rayon: { etiqueta: "Rayón", color: "#D9C441" },
  abolladura: { etiqueta: "Abolladura", color: "#D9843E" },
  oxido: { etiqueta: "Óxido", color: "#8A5A34" },
  repintado: { etiqueta: "Repintado", color: "#8B5FC4" },
  trizadura: { etiqueta: "Trizadura", color: "#4FB8B0" },
  excremento_ave: { etiqueta: "Excremento de ave", color: "#A8C43E" },
  laca_quemada: { etiqueta: "Laca quemada", color: "#A85040" },
  rasgada: { etiqueta: "Rasgada", color: "#5C7CBF" },
  otro: { etiqueta: "Otro", color: "#6B7785", notaLibre: true },
};

// Set de tipos de daño propio de Moto (agregado 24 agosto 2026, a pedido
// de Augusto): más chico y específico que el de Auto/Camioneta/SUV — no
// tiene sentido "Abolladura" o "Excremento de ave" en una moto, y sí hace
// falta "Grasa" (motor/cadena). Elegido por DiagramaDanios según
// `tipoVehiculo === "moto"` (ver ese componente) — no confundir con
// TIPOS_DANIO de arriba, que sigue siendo el de siempre para el resto de
// las familias.
export const TIPOS_DANIO_MOTO = {
  rayon: { etiqueta: "Rayón", color: "#D9C441" },
  oxido: { etiqueta: "Óxido", color: "#8A5A34" },
  grasa: { etiqueta: "Grasa", color: "#4A3B2A" },
  quemado: { etiqueta: "Quemado", color: "#A85040" },
  trizado: { etiqueta: "Trizado", color: "#4FB8B0" },
};
