// Categorías del catálogo de servicios de detailing: agrupan los ítems de
// "Mis Servicios" y eligen el ícono de cada fila del listado.
export const CATEGORIAS_SERVICIOS = {
  lavados: { etiqueta: "Lavados", icono: "water-outline" },
  interior: { etiqueta: "Interior y tapizados", icono: "layers-outline" },
  pintura: { etiqueta: "Exterior y pintura", icono: "color-palette-outline" },
  coating: { etiqueta: "Recubrimientos", icono: "shield-checkmark-outline" },
  tecnico: { etiqueta: "Detailing técnico", icono: "flask-outline" },
  paquetes: { etiqueta: "Paquetes", icono: "gift-outline" },
};

// Selección representativa del catálogo completo de detailing (dos por
// categoría), no todo el catálogo: así la lista de chips del wizard de
// Trabajo Nuevo queda manejable. El usuario puede sumar, editar o borrar
// servicios libremente desde "Mis Servicios".
export const serviciosIniciales = [
  { id: "sv1", nombre: "Lavado exterior", precio: 8000, categoria: "lavados" },
  { id: "sv2", nombre: "Lavado exterior + interior (completo)", precio: 14000, categoria: "lavados" },
  { id: "sv3", nombre: "Limpieza de tapizados en tela", precio: 12000, categoria: "interior" },
  { id: "sv4", nombre: "Limpieza y acondicionado de tapizados en cuero", precio: 18000, categoria: "interior" },
  { id: "sv5", nombre: "Pulido de mantenimiento (un paso)", precio: 20000, categoria: "pintura" },
  { id: "sv6", nombre: "Encerado", precio: 10000, categoria: "pintura" },
  { id: "sv7", nombre: "Ceramic coating básico (1 año)", precio: 60000, categoria: "coating" },
  { id: "sv8", nombre: "Ceramic coating premium (3-5 años)", precio: 120000, categoria: "coating" },
  { id: "sv9", nombre: "Vitrificado de vidrios", precio: 8000, categoria: "tecnico" },
  { id: "sv10", nombre: "Descontaminación férrica", precio: 10000, categoria: "tecnico" },
  { id: "sv11", nombre: "Detailing integral", precio: 55000, categoria: "paquetes" },
  { id: "sv12", nombre: "Preparación pre-venta", precio: 35000, categoria: "paquetes" },
];
