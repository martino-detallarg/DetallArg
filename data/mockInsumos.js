// Catálogo de insumos de detailing: sirve para poblar el buscador de "Agregar
// Insumo". Todavía no tenemos fotos reales de los productos, así que cada
// categoría usa un ícono de @expo/vector-icons como placeholder. El día que
// haya fotos, alcanza con sumar un campo `imagen` (require de un asset o uri)
// a cada producto: las pantallas ya están preparadas para mostrar esa imagen
// en vez del ícono cuando esté presente.
export const CATEGORIAS = {
  desengrasantes: { etiqueta: "Desengrasantes", icono: "sync-outline" },
  shampoo: { etiqueta: "Shampoo", icono: "water-outline" },
  pulidores: { etiqueta: "Pulidores", icono: "disc-outline" },
  protecciones: { etiqueta: "Protecciones", icono: "shield-checkmark-outline" },
  interiores: { etiqueta: "Interiores", icono: "layers-outline" },
  rejuvenecedores: { etiqueta: "Rejuvenecedores", icono: "refresh-outline" },
};

// Orden y agrupación en 2 páginas para la estantería de "Mis Insumos".
export const ORDEN_CATEGORIAS = Object.keys(CATEGORIAS);
export const PAGINAS_ESTANTERIA = [
  ["desengrasantes", "shampoo", "interiores"],
  ["pulidores", "protecciones", "rejuvenecedores"],
];

// Umbral de stock bajo compartido entre el casillero de producto (franja
// roja) y las notificaciones de "quedan pocos usos".
export const UMBRAL_STOCK_BAJO = 25;

// Catálogo real e investigado. Protecciones, Interiores y Rejuvenecedores
// todavía no tienen productos investigados: usan un producto placeholder
// (marca "A definir") solo para que la categoría no se vea vacía mientras
// armamos la lista real. Reemplazar por productos investigados de verdad,
// como se hizo con las demás categorías.
// Los valores que no están confirmados por ficha técnica real se dejan en
// "N/D" a propósito, para no inventar datos técnicos.
export const catalogoInsumos = [
  // Desengrasantes
  {
    id: "carpro-iron-x",
    marca: "CarPro",
    nombre: "Iron X",
    categoria: "desengrasantes",
    ph: "Neutro",
    dilucion: "Se usa puro, sin diluir",
    rendimiento: "Actúa 2-3 min",
  },
  {
    id: "koch-green-star",
    marca: "Koch Chemie",
    nombre: "Green Star",
    categoria: "desengrasantes",
    ph: "Alcalino",
    dilucion: "Dilución variable: 1:20 interior liviano, 1:10 taller, 1:5 motor, 1:3 grasa pesada",
    rendimiento: "N/D",
  },
  {
    id: "sonax-wheel-cleaner-full-effect",
    marca: "Sonax",
    nombre: "Wheel Cleaner Full Effect",
    categoria: "desengrasantes",
    ph: "Neutro",
    dilucion: "Se usa puro",
    rendimiento: "Actúa 3-5 min",
  },
  // Shampoo
  {
    id: "vonixx-v-floc",
    marca: "Vonixx",
    nombre: "V-Floc",
    categoria: "shampoo",
    ph: "Neutro",
    dilucion: "Lavado 1:400, snow foam 1:20",
    rendimiento: "Rinde 500ml hasta 200L de solución",
  },
  {
    id: "carpro-reset",
    marca: "CarPro",
    nombre: "Reset",
    categoria: "shampoo",
    ph: "Neutro en solución",
    dilucion: "1:500 (40ml cada 20L)",
    rendimiento: "N/D",
  },
  {
    id: "sonax-xtreme-shampoo",
    marca: "Sonax",
    nombre: "Xtreme Shampoo 2 in 1",
    categoria: "shampoo",
    ph: "N/D",
    dilucion: "Según etiqueta",
    rendimiento: "N/D",
  },
  {
    id: "3d-wash-wax",
    marca: "3D",
    nombre: "Wash N Wax",
    categoria: "shampoo",
    ph: "Neutro",
    dilucion: "A confirmar",
    rendimiento: "N/D",
  },
  // Pulidores
  {
    id: "vonixx-v-cut",
    marca: "Vonixx",
    nombre: "V-Cut",
    categoria: "pulidores",
    ph: "N/D",
    dilucion: "Sin dilución, listo para usar",
    rendimiento: "N/D",
  },
  {
    id: "menzerna-fg400",
    marca: "Menzerna",
    nombre: "400 Fast Gloss",
    categoria: "pulidores",
    ph: "N/D",
    dilucion: "Sin dilución",
    rendimiento: "N/D",
  },
  // Protecciones (placeholder, a definir)
  {
    id: "placeholder-cera-carnauba",
    marca: "A definir",
    nombre: "Cera de Carnauba",
    categoria: "protecciones",
    ph: "N/D",
    dilucion: "N/D",
    rendimiento: "N/D",
  },
  // Interiores (placeholder, a definir)
  {
    id: "placeholder-protector-plasticos",
    marca: "A definir",
    nombre: "Protector de Plásticos",
    categoria: "interiores",
    ph: "N/D",
    dilucion: "N/D",
    rendimiento: "N/D",
  },
  // Rejuvenecedores (placeholder, a definir)
  {
    id: "placeholder-renovador-cuero",
    marca: "A definir",
    nombre: "Renovador de Cuero",
    categoria: "rejuvenecedores",
    ph: "N/D",
    dilucion: "N/D",
    rendimiento: "N/D",
  },
];

// Estantería inicial mock para poder ver el diseño de "Mis Insumos" con
// datos de ejemplo (niveles de stock variados, alguna categoría con más de
// 3 productos). Protecciones, Interiores y Rejuvenecedores muestran su
// producto placeholder hasta que investiguemos productos reales para esas
// categorías.
function buscarProducto(id) {
  const producto = catalogoInsumos.find((p) => p.id === id);
  return { ...producto };
}

export const misInsumosIniciales = [
  { ...buscarProducto("carpro-iron-x"), id: "mi-iron-x", productoId: "carpro-iron-x", nivel: 80, imagen: null },
  { ...buscarProducto("koch-green-star"), id: "mi-green-star", productoId: "koch-green-star", nivel: 15, imagen: null },
  {
    ...buscarProducto("sonax-wheel-cleaner-full-effect"),
    id: "mi-wheel-cleaner-full-effect",
    productoId: "sonax-wheel-cleaner-full-effect",
    nivel: 55,
    imagen: null,
  },
  { ...buscarProducto("vonixx-v-floc"), id: "mi-v-floc", productoId: "vonixx-v-floc", nivel: 90, imagen: null },
  { ...buscarProducto("carpro-reset"), id: "mi-reset", productoId: "carpro-reset", nivel: 20, imagen: null },
  { ...buscarProducto("sonax-xtreme-shampoo"), id: "mi-xtreme-shampoo", productoId: "sonax-xtreme-shampoo", nivel: 45, imagen: null },
  { ...buscarProducto("3d-wash-wax"), id: "mi-wash-wax", productoId: "3d-wash-wax", nivel: 60, imagen: null },
  { ...buscarProducto("vonixx-v-cut"), id: "mi-v-cut", productoId: "vonixx-v-cut", nivel: 70, imagen: null },
  { ...buscarProducto("menzerna-fg400"), id: "mi-fg400", productoId: "menzerna-fg400", nivel: 10, imagen: null },
  {
    ...buscarProducto("placeholder-cera-carnauba"),
    id: "mi-cera-carnauba",
    productoId: "placeholder-cera-carnauba",
    nivel: 100,
    imagen: null,
  },
  {
    ...buscarProducto("placeholder-protector-plasticos"),
    id: "mi-protector-plasticos",
    productoId: "placeholder-protector-plasticos",
    nivel: 100,
    imagen: null,
  },
  {
    ...buscarProducto("placeholder-renovador-cuero"),
    id: "mi-renovador-cuero",
    productoId: "placeholder-renovador-cuero",
    nivel: 100,
    imagen: null,
  },
];
