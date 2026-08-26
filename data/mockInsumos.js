// Catálogo de referencia de insumos de detailing: la lista definitiva
// investigada marca por marca (Vonixx, Vintex, Sonax, Meguiar's, Soft99,
// Koch-Chemie, Chemical Guys, Menzerna, Gyeon — 478 productos), curada y
// aprobada por Augusto. Reemplaza la lista de fantasía anterior.
//
// IMPORTANTE — de dónde sale cada campo y cómo se usa:
// - `diluciones`: todas las opciones de dilución que publica la marca para
//   ese producto (["Puro"] si se usa sin diluir). `dilucionRecomendada` es
//   cuál de esas es la de uso general según la marca, o null si la marca no
//   recomienda ninguna en particular.
// - `rendimientoEstimado`: texto tal como lo publica la marca (ej. "Hasta 3
//   autos chicos"), o null si la marca no publica un rendimiento estimado.
//   NUNCA inventar un valor acá — si es null, mostrar "No publicado" o nada.
// - `tamanosEnvase`: los tamaños de envase en los que la marca vende el
//   producto, como texto de referencia (ej. "500ml", "1,5L", "5L"). Es
//   informativo/sugerido — el precio de compra NO se carga acá. Se carga en
//   la app cuando el taller agrega el insumo a su stock real (ver
//   AgregarInsumoModal) y confirma manualmente la capacidad y el precio del
//   envase que compró, sea uno de estos tamaños sugeridos u otro distinto.
// - `prioridadSugerida` ("Alta"/"Media"/null): sugerencia sobre qué tan
//   probable es que el taller use ese producto — no es un filtro, Augusto
//   decide qué cargar en su propio taller.
//
// Categorías normalizadas respecto de la planilla original: "Llantas",
// "Cubiertas/Neumáticos" y "Llantas y neumáticos" (3 variantes de la misma
// categoría en la planilla) se unificaron en una sola: `llantas_neumaticos`.
// El resto de las categorías se mantiene tal como las definió Augusto.
export const CATEGORIAS = {
  lavado_exterior: { etiqueta: "Lavado exterior", icono: "water-outline" },
  interior: { etiqueta: "Interior", icono: "layers-outline" },
  pulido_correccion: { etiqueta: "Pulido / Corrección", icono: "disc-outline" },
  proteccion_sellado: { etiqueta: "Protección / Sellado", icono: "shield-checkmark-outline" },
  accesorios_consumibles: { etiqueta: "Accesorios / Consumibles", icono: "cube-outline" },
  ceras: { etiqueta: "Ceras", icono: "sparkles-outline" },
  vidrios: { etiqueta: "Vidrios", icono: "aperture-outline" },
  llantas_neumaticos: { etiqueta: "Llantas y Neumáticos", icono: "ellipse-outline" },
  apc_desengrasante: { etiqueta: "APC / Desengrasante", icono: "sync-outline" },
  ceramicos: { etiqueta: "Cerámicos", icono: "diamond-outline" },
};

// Agrupación en 4 páginas para la estantería de "Mis Insumos" (antes eran 2
// páginas de 3 categorías fijas; con las 10 categorías reales de la lista
// definitiva no entran todas en 2 páginas). Agrupadas por afinidad temática:
// lavado, interior/protección, pulido/acabado, vidrios/llantas/accesorios.
// Reordenar acá no rompe nada — es solo agrupación visual.
export const PAGINAS_ESTANTERIA = [
  ["lavado_exterior", "apc_desengrasante"],
  ["interior", "proteccion_sellado"],
  ["pulido_correccion", "ceras", "ceramicos"],
  ["vidrios", "llantas_neumaticos", "accesorios_consumibles"],
];

export const ORDEN_CATEGORIAS = PAGINAS_ESTANTERIA.flat();

// Umbral de stock bajo compartido entre el casillero de producto (franja
// roja) y las notificaciones de "quedan pocos usos".
export const UMBRAL_STOCK_BAJO = 25;

// Unidades disponibles para `capacidadTotal` de un insumo (envase) y para
// la cantidad de una receta de servicio (ver ServicioContext.js). Nota: la
// lista de insumos incluye envases en litros/kg/oz — por ahora se siguen
// cargando en ml/g convertidos a mano por el taller al agregar el insumo,
// como ya funcionaba. Sumar "L" y "kg" acá es un cambio aparte a evaluar
// (afecta también las cantidades de receta en Mis Servicios).
export const UNIDADES_CAPACIDAD = ["ml", "g", "unidades"];

// Catálogo de referencia definitivo — 478 productos. Ver notas de campos
// arriba. Este catálogo alimenta el buscador de "Agregar Insumo"; lo que el
// taller efectivamente tiene en stock vive en `misInsumosIniciales` /
// `misInsumos` (DataContext), que arranca vacío: cada taller carga acá solo
// lo que realmente tiene, con su propio precio y tamaño de envase reales.
export const catalogoInsumos = [
  {
    "id": "vonixx-v-eco-fast",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "V-Eco Fast",
    "descripcion": "Lavado ecológico biodegradable con cera de carnaúba, da brillo y protección leve.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-citron",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Citron",
    "descripcion": "Desengrasante con solventes de cáscara de naranja, para lavado pesado (grasa, materia orgánica, ceras).",
    "diluciones": [
      "No publicada"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-floc",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "V-Floc",
    "descripcion": "Shampoo pH neutro, alta lubricación, reduce microrrayas y renueva brillo.",
    "diluciones": [
      "Snow Foam 1:20",
      "Balde 1:400"
    ],
    "dilucionRecomendada": "Balde 1:400",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "240ml",
      "500ml",
      "1",
      "5L",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-moto-v",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Moto-V",
    "descripcion": "Shampoo desengrasante para motos, seguro para motor/pintura/metal/plástico.",
    "diluciones": [
      "Hasta 1:10 (grasa/aceite)",
      "Hasta 1:200 (pintura diaria)",
      "Hasta 1:50 (barro/lodo)"
    ],
    "dilucionRecomendada": "Hasta 1:200 (pintura diaria)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-eco-pro",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "V-Eco Pro",
    "descripcion": "Lava a seco (waterless) concentrado y ecológico con cera de carnaúba.",
    "diluciones": [
      "1:15 (pesado)",
      "1:30 (convencional)",
      "1:50 (general/mantenimiento)"
    ],
    "dilucionRecomendada": "1:50 (general/mantenimiento)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-mol",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "V-Mol",
    "descripcion": "Lava autos biodegradable, pH levemente básico, para suciedad difícil.",
    "diluciones": [
      "1:100 (liviano)",
      "1:50 (medio, general)",
      "1:10 (pesado)"
    ],
    "dilucionRecomendada": "1:50 (medio, general)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-hydrox-wash",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Hydrox Wash",
    "descripcion": "Lava autos con protección SiO2 en un paso, hidrorrepelencia hasta 4 meses.",
    "diluciones": [
      "Cañón: 50-150ml por litro de agua",
      "Balde: 1:20 a 1:100 (rango, sin punto único recomendado)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-izer",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Izer",
    "descripcion": "Descontaminante ferroso pH neutro (llantas, pintura, cromados).",
    "diluciones": [
      "Puro",
      "Hasta 1:1 (opcional, en pintura)"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "3L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-prizm",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Prizm",
    "descripcion": "Restaurador de vidrios, remueve marcas de agua incrustada.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-revelax",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Revelax",
    "descripcion": "Revelador de holografías/swirls; también limpia vidrios/plásticos antes de vitrificar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-strike",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Strike",
    "descripcion": "Removedor de brea y residuos de pegamento/etiquetas, base solvente de naranja.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-lub",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "V-Lub",
    "descripcion": "Lubricante para barra descontaminante (clay bar) — no es limpiador.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "3L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-delet",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Delet",
    "descripcion": "Limpiador de neumáticos y gomas, alta performance.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-vexus",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Vexus",
    "descripcion": "Limpiador de alta performance para llantas y motor.",
    "diluciones": [
      "No publicada (se pulveriza directo)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-snow-foam-fast",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Snow Foam Fast",
    "descripcion": "Espuma de pre-lavado, rompe suciedad sin rayar.",
    "diluciones": [
      "No publicada (solo requisitos PSI/GPM del equipo)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-snow-foam-pro",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Snow Foam Pro",
    "descripcion": "Espuma de pre-lavado, desempeño superior.",
    "diluciones": [
      "No publicada"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-glazy",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Glazy",
    "descripcion": "Limpiador 4 en 1 para vidrios (limpia, protege, acondiciona, reduce rayas).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-impact",
    "marca": "Vonixx",
    "categoria": "lavado_exterior",
    "nombre": "Impact",
    "descripcion": "Multilimpiador para limpieza pesada, no corrosivo (uso general exterior/interior).",
    "diluciones": [
      "1:1 (incrustada)",
      "1:10 (pesada, general)",
      "1:30 (media)",
      "1:50 (mantenimiento)",
      "Hasta 1:60 (extractoras)",
      "Hasta 1:20 (tornador)"
    ],
    "dilucionRecomendada": "1:10 (pesada, general)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sintra-pro",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Sintra Pro",
    "descripcion": "Multilimpiador flotador bactericida/germicida, pH balanceado (paneles, cuero, alfombras, tapizados).",
    "diluciones": [
      "1:50 (general — paneles, puertas, cuero)",
      "1:5 (muy sucio)",
      "1:10 (alfombras, pesado)",
      "1:20 (alfombras, medio)",
      "1:30 (alfombras, liviano)",
      "Hasta 1:60 (extractoras)",
      "1:10 (tornador)"
    ],
    "dilucionRecomendada": "1:50 (general — paneles, puertas, cuero)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sintra-fast",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Sintra Fast",
    "descripcion": "Limpiador bactericida interior rápido, aroma fresco.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-leather",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "V-Leather",
    "descripcion": "Ceramic coating para cuero, película invisible que protege hasta 1 año (UV, hongos/bacterias, jean).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-hidracouro",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Hidracouro",
    "descripcion": "Hidratante de cuero a base de lanolina, previene el resecado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-higicouro",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Higicouro",
    "descripcion": "Limpiador de cuero, remueve impurezas sin agredir el material.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-restaurax",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Restaurax",
    "descripcion": "Restaurador de plásticos (paragolpes, paneles, laterales de puertas).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "240ml",
      "500ml",
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-verse",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Verse",
    "descripcion": "Renovador de plásticos a base de agua, protege contra rayos UV.",
    "diluciones": [
      "No publicada online — varía según superficie, solo en etiqueta física"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-plastic",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "V-Plastic",
    "descripcion": "Ceramic coating semipermanente para revitalizar plásticos, protección hasta 2 años.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "20ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-plastic-pro",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "V-Plastic Pro",
    "descripcion": "Ceramic coating premium para plástico, protección hasta 3 años.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 3 autos chicos",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sinergy-plastic",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Sinergy Plastic",
    "descripcion": "Protector Carbosiloxy para plásticos (interior/exterior), hasta 3 años interior / 5 meses exterior.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-flexus",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Flexus",
    "descripcion": "Limpiador y acondicionador 2 en 1 para plásticos internos, con SiO2, protección hasta 3 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-impermax",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Impermax",
    "descripcion": "Protector/impermeabilizante de tejidos, extiende vida útil de tapizados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-extractus-sensitive",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Extractus Sensitive",
    "descripcion": "Limpiador ultraconcentrado pH neutro para fibras naturales y tejidos delicados.",
    "diluciones": [
      "1:10 (pesada)",
      "1:30 (media)",
      "1:60 (leve)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "3L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-bactran",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Bactran",
    "descripcion": "Limpiador bactericida 7 en 1 para tapizados/alfombras (sangre, café, moho, bacterias/hongos).",
    "diluciones": [
      "1:2 (manchas localizadas)",
      "1:10 (pesada)",
      "1:30 (media)",
      "1:60 (leve)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sanitizante-finalizador",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Sanitizante Finalizador",
    "descripcion": "Sanitizante 4 en 1 en spray, último paso de limpieza de tapizados; efecto bacteriostático ~3 meses.",
    "diluciones": [
      "1:10 (única dilución indicada)"
    ],
    "dilucionRecomendada": "1:10 (única dilución indicada)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-extractus",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Extractus",
    "descripcion": "Limpiador ultraconcentrado para tapizados/alfombras, uso profesional (grasa, sudor, aceites).",
    "diluciones": [
      "1:10 (pesada)",
      "1:30 (media)",
      "1:60 (leve)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "3L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-vertex",
    "marca": "Vonixx",
    "categoria": "interior",
    "nombre": "Vertex",
    "descripcion": "Limpiador de tapizados (automotriz y hogar), alta concentración.",
    "diluciones": [
      "1:20 (pesada)",
      "1:40 (media)",
      "1:80 (leve)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v10",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V10",
    "descripcion": "Polidor de corte/refino inicial (línea asiática, barniz blando), remueve marcas de lija P1200-P1500.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v20",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V20",
    "descripcion": "Polidor de refino (línea asiática, barniz blando), remueve marcas de lija P2000-P2500.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v30",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V30",
    "descripcion": "Polidor de lustro (línea asiática, barniz blando), remueve holograma y marcas superficiales.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v40",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V40",
    "descripcion": "Polidor 4 en 1 (barniz asiático/blando), uso en 3 etapas cambiando boina.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-cut",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V-Cut",
    "descripcion": "Polidor de corte refinado (tecnología VHP, barnices duros), remueve marcas de lija 1200.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-polish",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V-Polish",
    "descripcion": "Polidor de refino (tecnología VHP), para todo tipo de barnices.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-finish",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "V-Finish",
    "descripcion": "Polidor de lustro (tecnología VHP), alta lubricación para barnices duros.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-all-in-one",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "Blend All in One",
    "descripcion": "Polidor 1 paso con protección (corte + cera carnaúba + cerámico SiO2).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-metal-polish",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "Blend Metal Polish",
    "descripcion": "Pulidor de metales (aluminio, hierro, acero inoxidable, cobre, bronce, cromo) con carnaúba + SiO2.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "150g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-opty",
    "marca": "Vonixx",
    "categoria": "pulido_correccion",
    "nombre": "Opty",
    "descripcion": "Compuesto pulidor para vidrios (no es limpiador líquido convencional).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "240ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-cleaner-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Blend Cleaner Wax",
    "descripcion": "Cera limpiadora 3 en 1 (limpieza, brillo, protección) con carnaúba tipo 1, SiO2 y microabrasivos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-cleaner-wax-black-edition",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Blend Cleaner Wax Black Edition",
    "descripcion": "Versión de la cera limpiadora 3 en 1 para autos oscuros, barrera UV y lluvia ácida.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-native-brazilian-carnauba-cleaner-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Native Brazilian Carnaúba Cleaner Wax",
    "descripcion": "Cera de carnaúba de alta gama, artesanal, del Ceará; brillo intenso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-makker-2-0",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Makker 2.0",
    "descripcion": "Maquillaje automotriz para rellenar pequeños defectos y renovar pinturas quemadas/desteñidas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Protección hasta 90 días",
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-carnauba-plus",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Carnaúba Plus",
    "descripcion": "Cera limpiadora y protectora con carnaúba cearense, brillo de alta profundidad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "3L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-spray-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Blend Spray Wax",
    "descripcion": "Cera híbrida en spray (SiO2 + carnaúba tipo 1), hidrorrepelencia hasta 4 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-spray-wax-black-edition",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Blend Spray Wax Black Edition",
    "descripcion": "Cera híbrida en spray para pinturas oscuras, protege hasta 4 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-native-brazilian-carnauba-spray-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Native Brazilian Carnaúba Spray Wax",
    "descripcion": "Cera de carnaúba en spray para mantenimiento post-lavado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-carnauba-tok-final",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Carnaúba Tok Final",
    "descripcion": "Cera de mantenimiento entre lavados (pintura, vidrios, paragolpes, gomas).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-ceramic-carnauba-paste-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Blend Ceramic & Carnaúba Paste Wax",
    "descripcion": "Cera híbrida en pasta (SiO2 + carnaúba tipo 1), hidrorrepelencia hasta 7 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 25 aplicaciones",
    "tamanosEnvase": [
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-blend-ceramic-carnauba-paste-wax-black-edition",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Blend Ceramic & Carnaúba Paste Wax — Black Edition",
    "descripcion": "Versión de la cera híbrida en pasta para autos oscuros/negros, protección hasta 7 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 25 aplicaciones",
    "tamanosEnvase": [
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-native-paste-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Native Paste Wax",
    "descripcion": "Cera de carnaúba en pasta artesanal del Ceará, brillo intenso y tacto aterciopelado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-native-paste-wax-black-edition",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Native Paste Wax Black Edition",
    "descripcion": "Cera de carnaúba en pasta, 100% brasileña, para restaurar brillo en autos oscuros/negros.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-carnauba-express-ultra",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Carnaúba Express Ultra",
    "descripcion": "Cera de carnaúba tipo 1 CONCENTRADA — se diluye para preparar cera lista para usar (no se aplica pura).",
    "diluciones": [
      "Concentrado — rinde hasta 75L de cera lista para uso"
    ],
    "dilucionRecomendada": "Concentrado — rinde hasta 75L de cera lista para uso",
    "rendimientoEstimado": "Hasta 300 autos chicos (con los 75L de producto listo)",
    "tamanosEnvase": [
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-carnauba-hybrid-wax",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Carnaúba Hybrid Wax",
    "descripcion": "Cera con carnaúba pura y polímeros, apta para cualquier color de pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 60 aplicaciones",
    "tamanosEnvase": [
      "120ml",
      "240ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v80",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "V80",
    "descripcion": "Sellante sintético, hidrofobicidad y brillo tipo \"wet look\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-spell-2-0",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Spell 2.0",
    "descripcion": "Sellante \"sin toque\" a base de sílice, hidrorrepelencia y brillo UV hasta 30 días.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sio2-pro",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "SiO2-Pro",
    "descripcion": "Sellante cerámico de mantenimiento, capa protectora UV/contaminación.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-energy",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "V-Energy",
    "descripcion": "Coating semipermanente SiO2 para motores, hasta 4 años de durabilidad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado (indica ~15ml por motor, uso medio)",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-paint-pro",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "V-Paint Pro",
    "descripcion": "Ceramic coating para pintura, durabilidad hasta 3 años.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "3 a 4 autos",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-paint",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "V-Paint",
    "descripcion": "Ceramic coating para pintura, durabilidad hasta 2 años.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "1 vehículo",
    "tamanosEnvase": [
      "20ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-hydrox-fast",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Hydrox Fast",
    "descripcion": "Coating cerámico hidrorreactivo (activado por agua), protección hasta 10 meses en pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-hydrox-pro",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Hydrox Pro",
    "descripcion": "Coating cerámico hidrorreactivo de alta concentración, protección hasta 10 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "240ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-light",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "V-Light",
    "descripcion": "Coating de dióxido de silicio para restaurar faros de policarbonato oxidados/amarillentos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 20 pares de faros y 2-3 parabrisas",
    "tamanosEnvase": [
      "20ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-v-light-pro",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "V-Light Pro",
    "descripcion": "Coating cerámico de alta performance para faros de policarbonato oxidados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 50 pares de faros",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sinergy-wheel",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Sinergy Wheel",
    "descripcion": "Coating spray Carbosiloxy para llantas, protección hasta 6 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-sinergy-paint",
    "marca": "Vonixx",
    "categoria": "proteccion_sellado",
    "nombre": "Sinergy Paint",
    "descripcion": "Coating spray Carbosiloxy para pintura, protección hasta 12 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 15 aplicaciones",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vonixx-microlav",
    "marca": "Vonixx",
    "categoria": "accesorios_consumibles",
    "nombre": "Microlav",
    "descripcion": "Shampoo limpiador/acondicionador para paños de microfibra y aplicadores de espuma.",
    "diluciones": [
      "30ml cada 4kg de microfibra seca (máquina, ciclo suave)",
      "30ml en 5L de agua, remojar 30 min (manual)"
    ],
    "dilucionRecomendada": "30ml cada 4kg de microfibra seca (máquina, ciclo suave)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "vintex-lava-autos",
    "marca": "Vintex",
    "categoria": "lavado_exterior",
    "nombre": "Lava Autos",
    "descripcion": "Shampoo pH neutro para lavado de vehículos.",
    "diluciones": [
      "100ml cada 5L de agua (única dilución indicada)"
    ],
    "dilucionRecomendada": "100ml cada 5L de agua (única dilución indicada)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L",
      "20L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-desengraxante-biodegradavel",
    "marca": "Vintex",
    "categoria": "lavado_exterior",
    "nombre": "Desengraxante Biodegradável",
    "descripcion": "Desengrasante multifuncional biodegradable.",
    "diluciones": [
      "Puro",
      "Hasta 1:5"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-removex",
    "marca": "Vintex",
    "categoria": "lavado_exterior",
    "nombre": "Removex",
    "descripcion": "Desengrasante/limpiador de chasis.",
    "diluciones": [
      "1:10 (de referencia)"
    ],
    "dilucionRecomendada": "1:10 (de referencia)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "5L",
      "20L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-removedor-de-cimento",
    "marca": "Vintex",
    "categoria": "lavado_exterior",
    "nombre": "Removedor de Cimento",
    "descripcion": "Remueve incrustaciones de cemento (uso en maquinaria pesada, aplicable a talleres que reciben mixers/hormigoneras).",
    "diluciones": [
      "Puro",
      "Hasta 1:5"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "vintex-limpa-vidros",
    "marca": "Vintex",
    "categoria": "interior",
    "nombre": "Limpa Vidros",
    "descripcion": "Limpiavidrios de uso general.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-limpa-vidros-pro",
    "marca": "Vintex",
    "categoria": "interior",
    "nombre": "Limpa Vidros Pro",
    "descripcion": "Limpiavidrios ultraconcentrado.",
    "diluciones": [
      "1:4 (única dilución)"
    ],
    "dilucionRecomendada": "1:4 (única dilución)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "vintex-limpador-multiacao",
    "marca": "Vintex",
    "categoria": "interior",
    "nombre": "Limpador Multiação",
    "descripcion": "Limpiador multiuso para interior.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-limpa-estofados",
    "marca": "Vintex",
    "categoria": "interior",
    "nombre": "Limpa Estofados",
    "descripcion": "Limpiador en seco de tapizados.",
    "diluciones": [
      "300ml en 5L de agua (única dilución indicada)"
    ],
    "dilucionRecomendada": "300ml en 5L de agua (única dilución indicada)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-pasta-multiacao",
    "marca": "Vintex",
    "categoria": "interior",
    "nombre": "Pasta Multiação",
    "descripcion": "Pasta de limpieza en seco multisuperficie.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500g"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "vintex-sanitizante",
    "marca": "Vintex",
    "categoria": "interior",
    "nombre": "Sanitizante",
    "descripcion": "Sanitizante 2 en 1 (amonio cuaternario), elimina 99,99% de bacterias. Vendido en 4 variantes de aroma (Frutal, Bom Ar, Carro Novo, Fresh) — misma fórmula, mismo modo de uso y envases, solo cambia el aroma.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-massa-de-polir",
    "marca": "Vintex",
    "categoria": "pulido_correccion",
    "nombre": "Massa de Polir",
    "descripcion": "Pasta pulidora, remueve rayas de lija P1200.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "600g",
      "1",
      "8L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-renova-plasticos",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Renova Plásticos",
    "descripcion": "Protector renovador de gomas y plásticos externos, no engrasa, mantiene brillo original.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "200g",
      "200ml",
      "500ml",
      "1",
      "5L",
      "3L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-rejuvex",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Rejuvex",
    "descripcion": "Revitalizador de plásticos externos (versión NO oscurecedora), sin silicona.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "400g"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-rejuvex-black",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Rejuvex Black",
    "descripcion": "Revitalizador de plásticos externos, oscurecedor, sin silicona, no se va con el agua.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "400g"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-darker",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Darker",
    "descripcion": "Renovador de brillo para neumáticos y gomas, se aplica con pincel.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-pneu-pretinho",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Pneu Pretinho",
    "descripcion": "Renovador de neumáticos súper concentrado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml",
      "1",
      "5L",
      "5L",
      "20L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-cera-express",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Cera Express",
    "descripcion": "Cera con silicona, protección y brillo rápido.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-super-cera-limpadora",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Super Cera Limpadora",
    "descripcion": "Cera limpiadora \"todo en uno\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "200ml",
      "500ml",
      "1",
      "5L",
      "3L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "vintex-silicone-liquido",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Silicone Líquido",
    "descripcion": "Brillo y protección para gomas y plásticos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1",
      "5L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "vintex-ecoblack",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Ecoblack",
    "descripcion": "Brillo para pasarruedas (caixas de roda), a base de agua, ecológico.",
    "diluciones": [
      "1:4 (acabado mate)",
      "Puro (acabado brillante)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1",
      "5L",
      "5L",
      "20L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "vintex-pulviflex",
    "marca": "Vintex",
    "categoria": "proteccion_sellado",
    "nombre": "Pulviflex",
    "descripcion": "Protector de chasis anticorrosivo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1",
      "5L",
      "5L",
      "20L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "vintex-barra-descontaminante",
    "marca": "Vintex",
    "categoria": "accesorios_consumibles",
    "nombre": "Barra Descontaminante",
    "descripcion": "Clay bar física para descontaminación de pintura — es un accesorio consumible, no un líquido.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "50g",
      "100g"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "sonax-profiline-np-03-06",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE NP 03-06",
    "descripcion": "Pulido sin silicona para pulido profesional de superficies opacas y rayadas, especial para pintura scratch-resistant, con pulidora (nano-abrasivos, sin holograma).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ex-04-06",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE EX 04-06",
    "descripcion": "Pulido de un paso y alto brillo sin silicona para pintura ligeramente deteriorada o lijada, con nanodispersión de óxido de aluminio; elimina marcas de lija hasta grano P2000.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-excut-05-05",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE ExCut 05-05",
    "descripcion": "Pasta abrasiva para pulidora orbital; procesa pintura rayada o lijada localmente, incluye daño por excremento de aves, insectos y savia. Corte 5, Brillo 5.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-cutmax",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE CutMax",
    "descripcion": "Pasta abrasiva de alto rendimiento para pulir pintura muy deteriorada o parcialmente lijada; suaviza rayas y abrasiones y remueve overspray de pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-perfect-finish",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE Perfect Finish",
    "descripcion": "Pulido de acabado sin silicona para pulir profesionalmente pintura lijada o pre-pulida con compound abrasivo; pensado como solución de un paso para talleres de pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "75ml",
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ultimate-cut",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE Ultimate Cut",
    "descripcion": "Pasta abrasiva de alto rendimiento para pulir pintura muy deteriorada o parcialmente lijada; corrige marcas de lija de grano P1000 con mínima generación de polvo. Corte 6, Brillo 3.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-sp-06-02",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE SP 06-02",
    "descripcion": "Pasta abrasiva sin silicona de alto contenido abrasivo, para lijar pintura deteriorada y rayada; remueve marcas de excremento de aves, insectos y savia. Corte 6, Brillo 2.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-fs-05-04",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE FS 05-04",
    "descripcion": "Pulido abrasivo de intensidad media para detailing de usados con pulidora de velocidad variable; ideal para restaurar pintura normalmente deteriorada y con rayas leves. Corte 5, Brillo 4.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-os-02-06",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE OS 02-06",
    "descripcion": "Pulido todo en uno suave con sellador de secado rápido, para aplicación manual o a máquina; remueve rayas leves, produce alto brillo sin holograma. Contiene silicona.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-os-04-05",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE OS 04-05",
    "descripcion": "Pulido rápido eficiente para cuidado de vehículos costo-efectivo; remueve marcas y rayas hasta profundidad de lija P2000 en una aplicación; sin silicona.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-cut-finish",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE Cut+Finish",
    "descripcion": "Pulido muy abrasivo de una sola etapa para remover rápidamente defectos como nibs, overspray de pintura y marcas de lija tras un repintado; elimina marcas de lija P1500. Corte 5, Brillo 5.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-glass-polish",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE Glass Polish",
    "descripcion": "Pulido profesional para vidrios; remueve rayas y marcas de limpiaparabrisas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-headlight-polish",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE Headlight Polish",
    "descripcion": "Pulido profesional para faros, usado en la restauración de ópticas opacas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-headlight-restoration-kit",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "PROFILINE Headlight Restoration Kit",
    "descripcion": "Kit profesional de restauración de faros (26 piezas: pulido, sellador y accesorios de lijado/pulido).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 26 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-headlight-restoration-kit",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Headlight Restoration Kit",
    "descripcion": "Set para restauración manual y económica de faros plásticos amarillentos/opacos por edad; incluye pulido, sellador, 8 discos de lija de grano 3000, 8 discos de lija de grano 5000, esponjas de pulido y soporte.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Rinde para 2 aplicaciones de 2 faros cada una (4 faros / 2 vehículos), según ficha oficial",
    "tamanosEnvase": [
      "Kit 28 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-car-polish",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Car Polish",
    "descripcion": "Pulido para pintura nueva, opaca y levemente deteriorada, estándar y metalizada; microabrasivos que limpian y eliminan imperfecciones menores, con cera de carnaúba para protección. Apto pulidora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-easy-shine",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Easy Shine",
    "descripcion": "Pulido para pintura nueva, opaca y levemente deteriorada, estándar y metalizada; microabrasivos con cera de carnaúba de alta calidad para protección duradera. Apto pulidora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-paintwork-cleaner",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Paintwork Cleaner",
    "descripcion": "Pulido potente para pintura opaca y muy deteriorada, color y metalizada; abrasivos especiales que limpian y remueven rayas finas, eliminan residuos de suciedad y manchas leves de brea.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-metallic-high-gloss",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Metallic High Gloss",
    "descripcion": "Pulido especial para pintura metalizada; limpia, pule y sella de forma particularmente suave, con cera de carnaúba. Apto manual y a máquina.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-polish-wax-color",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Polish+Wax Color",
    "descripcion": "Pulido medio para pintura como nueva o levemente opaca, con pigmentos de color y componentes de cera; alisa, pule y encera en un paso. Disponible en negro, azul, rojo, plata/gris y blanco.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-polish-wax-2",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "XTREME Polish+Wax 2",
    "descripcion": "Pulido suave de efecto medio para pintura nueva o levemente usada y mantenida regularmente; remueve rayas finas y opacidad, con Hybrid NetProtection Technology (efecto loto).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-polish-wax-3",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "XTREME Polish+Wax 3",
    "descripcion": "Pulido muy efectivo para pintura deteriorada y restauración de color opaco; polvo de óxido de aluminio ultrafino para rayas de lavadero y uso normal, con cera incorporada como protección básica.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-metal-polish",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "XTREME Metal Polish",
    "descripcion": "Abrasivo de óxido de aluminio alfa de alta eficacia; remueve suciedad, óxido y manchas de superficies metálicas (cromo, acero inoxidable, aluminio, cobre, latón) sin rayar, dejando película protectora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "150ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-chrome-alupaste",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Chrome+Alupaste",
    "descripcion": "Pasta abrasiva de cuidado para remover corrosión, opacidad y manchas en cromo, aluminio, latón, cobre y otros metales sin pintar; deja película protectora invisible.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "75ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-abrasive-paste",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Abrasive Paste",
    "descripcion": "Pasta abrasiva sin silicona de alto contenido abrasivo para lijar pintura deteriorada y rayada; remueve marcas de excremento de aves, insectos y savia.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "75ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-scratch-remover",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Scratch Remover",
    "descripcion": "Pulido de alto rendimiento para remover rayas de plásticos lisos y brillantes, acrílico y plexiglás (ventanillas de descapotable, embarcaciones, aeronaves, muebles de acrílico). Apto pulidora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "75ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-scratch-remover-paintwork-set",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Scratch Remover Paintwork Set",
    "descripcion": "Set para remoción manual y económica de rayas o marcas localizadas de la capa de laca transparente, siempre que no lleguen a la base; incluye pulido 1, finish 2, discos de lija, paños y taco de pulido.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 9 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-scratch-remover-set",
    "marca": "Sonax",
    "categoria": "pulido_correccion",
    "nombre": "Scratch Remover Set",
    "descripcion": "Kit de pulido para remover rayas y marcas de la laca transparente en 2-3 pasos, incluso rayas profundas que no lleguen a la base; incluye pulido 1, finish 2, discos de lija P5000, paños y taco de pulido.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 10 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramic-coating-cc36",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Ceramic Coating CC36",
    "descripcion": "Sellador cerámico de larga duración para pintura o partes plásticas pintadas; genera superficie superhidrofóbica y antisuciedad. Vida útil declarada de hasta 36 meses con service anual (basecoat + glosscoat, aplicación en 2 pasos).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit (basecoat 50ml/250ml + glosscoat 60ml/210ml + prepare 100ml)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramic-coating-glass",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Ceramic Coating Glass",
    "descripcion": "Sellado hidrofóbico de vidrios para uso profesional; repele agua y suciedad, mejora la visibilidad bajo lluvia porque el viento arrastra las gotas a mayor velocidad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 3 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramic-coating-cc-rim",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Ceramic Coating CC Rim",
    "descripcion": "Escudo protector invisible contra suciedad difícil y polvo de freno en llantas; acabado brillante duradero que reduce la adherencia de partículas de suciedad. Efectividad declarada de aproximadamente 12 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 6 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramiccoating-cc-one",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE CeramicCoating CC One",
    "descripcion": "Protección de largo plazo para pintura con tecnología Si-Carbon, un paso de aplicación, pensada para usuarios principiantes; superficie sedosa y repelente a la suciedad. Durabilidad declarada de hasta 3 años (versión de entrada de la línea CC).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 4 partes (incluye 2 esponjas aplicadoras)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramiccoating-cc-evo",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE CeramicCoating CC Evo",
    "descripcion": "Recubrimiento cerámico profesional de dos componentes (basecoat + glosscoat) de gama alta para pintura; mejor resistencia, aspecto y tacto. Durabilidad declarada de hasta 5 años.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 8 partes (basecoat + glosscoat + 4 aplicadores)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramiccoating-cc-pro",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE CeramicCoating CC Pro",
    "descripcion": "Recubrimiento cerámico para pintura con excelente durabilidad, hidrofobia y autolimpieza en una sola capa, pensado para usuarios experimentados/detailers profesionales, con tiempo de reacción reducido. Durabilidad declarada de hasta 4 años.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 6 partes (incluye 4 esponjas aplicadoras)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramic-coating-cc-plastic-rubber",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Ceramic Coating CC Plastic+Rubber",
    "descripcion": "Recubrimiento con tecnología Si-Carbon para renovar y proteger partes plásticas exteriores sin pintar (molduras, paragolpes); flexible, apto también para neumáticos, con protección UV contra decoloración.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 6 partes (incluye 4 almohadillas aplicadoras)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-ceramic-coating-vinyl-ppf",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Ceramic Coating Vinyl+PPF",
    "descripcion": "Recubrimiento de un paso y efecto de largo plazo para wraps de color y film de protección de pintura (PPF); estructura flexible que se adhiere al film, repelente al agua y la suciedad, profundiza el color en acabados brillantes y mates.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "50ml (incluye 4 almohadillas aplicadoras)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-headlight-coating",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Headlight Coating",
    "descripcion": "Sellado cerámico de largo plazo para faros plásticos; capa protectora a base de silicio-carbono resistente a lavados e influencias ambientales, protege contra el amarillamiento por UV. Durabilidad declarada de hasta 1 año.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Suficiente para 20 aplicaciones, según ficha oficial",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-polymernetshield",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE PolymerNetShield",
    "descripcion": "Sellador de pintura sin cera con protección híbrida de hasta 6 meses gracias a la tecnología Net Protection; capa protectora densa y duradera, restaura color y repele agua.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "340ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-hyper-coat",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Hyper Coat",
    "descripcion": "Sellador en mojado y auxiliar de secado para todas las superficies exteriores del vehículo; también apto para pintura mate y wraps/films. Restaura sellados existentes y da alto brillo con efecto repelente al agua y la suciedad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-spray-seal",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Spray+Seal",
    "descripcion": "Conservación en spray para detailing rápido durante el lavado; apto para pintura, plástico, metal y llantas. Restaura brillo y profundidad de color. Aplicar 4 a 6 pulsaciones por m² sobre superficie mojada (según ficha técnica).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-plastic-protectant-exterior",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Plastic Protectant Exterior",
    "descripcion": "Mantenimiento de plásticos exteriores sin pintar; da brillo fresco a paragolpes o molduras deteriorados e intensifica el color.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-fabric-coating",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PROFILINE Fabric Coating",
    "descripcion": "Recubrimiento/impregnación protectora profesional para tapizados textiles.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ceramic-tyre-rim-detailer",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Ceramic Tyre+Rim Detailer",
    "descripcion": "Penetra la superficie tratada dejando una capa protectora antimanchas y efecto hidrorrepelente; para todo tipo de neumático y llanta, restaura aspecto mate como nuevo y protege contra suciedad, envejecimiento prematuro y agrietamiento.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ceramic-plastic-coating",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Ceramic Plastic Coating",
    "descripcion": "Protege todas las partes plásticas exteriores (paragolpes, molduras, espejos) de influencias ambientales y clima por hasta 3 meses; restaura color en plásticos decolorados dejando aspecto sedoso mate y efecto de perlado de agua.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-ceramic-spray-coating",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Ceramic Spray Coating",
    "descripcion": "Protege la superficie tratada de suciedad, insectos y sal de camino, simplificando notablemente el lavado; tecnología Si-Carbon para superficie sedosa y brillo tipo espejo, refresca sellados cerámicos existentes. Protección declarada de hasta 4 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ceramic-ultra-slick-detailer",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Ceramic Ultra Slick Detailer",
    "descripcion": "Deja la pintura extremadamente suave con acabado espejo; remueve suciedad superficial leve (polvo, huellas) sin rayas, refresca sellados cerámicos existentes con efecto hidrorrepelente. Apto mate y vehículos con wrap.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ceramic-polish-all-in-one",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Ceramic Polish All-in-One",
    "descripcion": "Pule, alisa y sella la pintura en un solo paso; remueve rayas y opacidad dejando una capa antisuciedad, con tecnología Si-Carbon para brillo tipo espejo y efecto hidrorrepelente. Protección declarada de hasta 2 meses. Apto manual y a máquina.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ceramic-quick-glass-coating-2-in-1",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Ceramic Quick Glass Coating 2 in 1",
    "descripcion": "Recubrimiento de vidrios con efecto limpiador; mejora la visibilidad con lluvia y nieve dejando que las gotas escurran, limpia y sella vidrios y espejos simultáneamente. Durabilidad declarada de 4 a 6 semanas. Apto vidrios polarizados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-brilliant-wax-1",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Brilliant Wax 1",
    "descripcion": "Cera dura líquida sin abrasivos para pintura nueva, casi nueva y pre-tratada; brillo tipo espejo y sellado duradero mediante tecnología Hybrid NetProtection.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-high-speed-wax",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "High Speed Wax",
    "descripcion": "Emulsión limpiadora y conservadora con cera de carnaúba de alta calidad; sella la pintura por varias semanas, produce alto brillo sin rayas y restaura intensamente el color. Apto capotas de descapotable.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-super-liquid-wax",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Super Liquid Wax",
    "descripcion": "Cera dura líquida para pintura nueva y casi nueva, estándar y metalizada, con cera de carnaúba de alta calidad; remueve manchas de brea, intensifica colores y produce brillo tipo espejo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-wash-wax",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Wash+Wax",
    "descripcion": "Limpia y protege la pintura en un solo paso; remueve suciedad a fondo y cubre la pintura con una película protectora duradera de cera de carnaúba natural.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-premium-class-carnauba-care",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "PREMIUM CLASS Carnauba Care",
    "descripcion": "Cera dura sólida para pintura nueva y bien limpia, sin abrasivos; cera de carnaúba grado uno 100% sin blanquear y con certificación ecológica, con protección UV contra decoloración. Incluye 2 esponjas aplicadoras y un paño de microfibra.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit 4 partes"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-trim-protectant-glossy",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Trim Protectant Glossy",
    "descripcion": "Efecto limpiador profundo; produce una capa de mantenimiento brillante que protege plásticos y goma de la suciedad e influencias climáticas, especialmente contra rayos UV que decoloran.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "300ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-trim-protectant-matt",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Trim Protectant Matt",
    "descripcion": "Produce una capa de mantenimiento mate sedosa que protege plásticos y goma contra suciedad, rayos UV y daño climático; restaura color, repele agua y reduce reflejos en el parabrisas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "300ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-plastic-restorer-gel-exterior",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Plastic Restorer Gel Exterior",
    "descripcion": "Mantenimiento de partes plásticas exteriores sin pintar (paragolpes, molduras); penetra la superficie para proteger contra el clima y restaurar el color con brillo profundo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-rubber-restorer",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Rubber Restorer",
    "descripcion": "Limpia y mantiene todas las partes de goma del auto conservando su elasticidad; prolonga la vida útil de la goma y restaura el color. Previene que las juntas de puerta se congelen en invierno; también sirve para neumáticos y alfombras de piso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L",
      "60L",
      "200L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-rubber-protectant",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Rubber Protectant",
    "descripcion": "Limpia y mantiene todas las partes de goma del auto conservando su elasticidad; prolonga la vida útil de la goma y restaura el color; previene que las juntas de puerta se congelen en invierno. Incluye esponja aplicadora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "100ml",
      "300ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-tyre-gloss",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Tyre Gloss",
    "descripcion": "Brillo y cuidado para todo tipo de neumático; restaura el color rico original y un brillo perfecto en neumáticos deteriorados por el clima, mantiene la elasticidad de la goma. Solo aplicar en spray, sin enjuague.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-tyre-care",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Tyre Care",
    "descripcion": "Limpia neumáticos sucios restaurando el color original y brillo negro profundo en neumáticos deteriorados por el clima; espuma activa que disuelve la suciedad y se enjuaga sola al disiparse.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Rinde para tratar aproximadamente 24 neumáticos por envase, según ficha oficial",
    "tamanosEnvase": [
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-tyre-gloss-gel",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Tyre Gloss Gel",
    "descripcion": "Produce un acabado negro brillante tipo 'wet look' en todo tipo de neumático; fórmula en gel que mantiene y protege la goma contra agrietamiento y decoloración. Dura varias semanas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Suficiente para al menos 50 neumáticos, según ficha oficial",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-tyre-gloss-spray-wet-look",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME Tyre Gloss Spray Wet Look",
    "descripcion": "Brillo profundo y duradero tipo 'wet look' en spray; mantiene la goma y previene agrietamiento y decoloración con aplicación regular. Dura varias semanas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Suficiente para hasta 40 neumáticos, según ficha oficial",
    "tamanosEnvase": [
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-blackbeast-tyre-gloss",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "BlackBeast Tyre Gloss",
    "descripcion": "Produce un acabado negro brillante profundo en poco tiempo, sin agrietamiento, envejecimiento prematuro ni decoloración con uso regular; dura varias semanas. Solo aplicar en spray, dejar actuar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ppf-vinyl-detailer",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "XTREME PPF+Vinyl Detailer",
    "descripcion": "Detailer especial para el mantenimiento y protección de superficies decaladas brillantes y mate; intensifica la profundidad de color, remueve suciedad leve sin rayas ni marcas, deja propiedades hidrorrepelentes.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-brilliant-shine-detailer",
    "marca": "Sonax",
    "categoria": "proteccion_sellado",
    "nombre": "Brilliant Shine Detailer",
    "descripcion": "Spray conservador y realzador de brillo para el acabado de pintura más rápido; pensado para entrega de vehículos, desempolvado en showroom y acabado post-pulido. Restaura tratamientos de cera y realza la profundidad de color.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-multistar",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "MultiStar",
    "descripcion": "Limpiador multiuso profesional de alto rendimiento para todas las superficies dentro y fuera del auto; especialmente indicado para detailing de usados y limpieza de maquinaria pesada/agrícola. No usar sin diluir.",
    "diluciones": [
      "1:5 a 1:30 (limpieza exterior)",
      "1:10 a 1:50 (limpieza interior)"
    ],
    "dilucionRecomendada": "1:5 a 1:30 (limpieza exterior)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L",
      "10L",
      "25L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-multistar",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "PROFILINE MultiStar",
    "descripcion": "Versión PROFILINE del limpiador multiuso concentrado de alto rendimiento para todas las superficies dentro y fuera del auto.",
    "diluciones": [
      "1:5 a 1:30 (limpieza exterior)",
      "1:10 a 1:50 (limpieza interior)"
    ],
    "dilucionRecomendada": "1:5 a 1:30 (limpieza exterior)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-multiclean-alkaline",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "PROFILINE MultiClean alkaline",
    "descripcion": "Prelimpiador muy alcalino para el prelavado de autos y vehículos pesados; remueve incluso la suciedad más difícil como restos de insectos y depósitos pesados de polvo de freno.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-multiclean-acid",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "MultiClean acid",
    "descripcion": "Limpiador potente para suciedad soluble en ácido como óxido, restos de cemento o pintura de pared; remueve cal y marcas de agua. También usado para lavar sellados cerámicos contaminados con suciedad mineral de ruta.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-acrylic-glass-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Acrylic+Glass Cleaner",
    "descripcion": "Fórmula suave para limpiar y mantener superficies de acrílico y plexiglás; brillo sin rayas y transparencia duradera sin dañar el material. También apto para pantallas táctiles, vidrio y espejos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-actifoam-energy",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "ActiFoam Energy",
    "descripcion": "Limpiador de fuerte poder disolvente de suciedad, con excelente generación de espuma (snow foam) para lavar con cañón de espuma; apto también como shampoo, quitainsectos y limpiador de llantas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-black-streak-remover",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Black Streak Remover",
    "descripcion": "Limpiador intensivo abrasivo para remover marcas de escurrimiento de lluvia (rain streaks) en vidrio, pintura y superficies de fibra de vidrio, mediante acción quimio-mecánica.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "3L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-engine-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Engine Cleaner",
    "descripcion": "Limpiador a base de tensoactivos, soluble en agua, de acción rápida, para remover suciedad grasosa y aceitosa de piezas mecánicas, bahía de motor, transmisiones y herramientas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10L",
      "25L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-iron-rust-remover-acidic-power-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Iron+Rust Remover / Acidic Power Cleaner",
    "descripcion": "Limpiador ácido potente para remover a fondo óxido y residuos de polvo industrial de superficies pintadas y plásticos pintados; también elimina cal de pisos, cerámicos y plásticos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10L",
      "25L",
      "60L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-iron-fallout-remover",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Iron+Fallout Remover",
    "descripcion": "El especialista en manchas de óxido (rust bloom); remueve residuos agresivos de óxido y polvo industrial de toda la pintura y plásticos pintados. Fórmula pH neutro.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "750ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-car-wash-shampoo-concentrate",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Car Wash Shampoo Concentrate",
    "descripcion": "Shampoo concentrado para lavado de carrocería.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-gloss-shampoo-concentrate",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Gloss Shampoo Concentrate",
    "descripcion": "Penetra y disuelve la suciedad sin afectar la capa de cera protectora de la pintura; limpia pintura, goma, plástico, vinilo y vidrio con tensoactivos suaves. Libre de fosfatos, pH neutro para la piel. Dosis publicada (ficha AU): 50ml (2 tapas medidoras) en 10L de agua tibia.",
    "diluciones": [
      "1:200 (50ml en 10L de agua)"
    ],
    "dilucionRecomendada": "1:200 (50ml en 10L de agua)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L",
      "25L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-waterless-wash",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Waterless Wash",
    "descripcion": "Lavado en seco (sin agua) para el exterior del vehículo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-waterless-wash-winter",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Waterless Wash Winter",
    "descripcion": "Versión de invierno del lavado en seco (sin agua) para exterior.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "25L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-quickdetailer",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "QuickDetailer",
    "descripcion": "Cuidado rápido del vehículo para aplicar en spray; restaura colores y produce una suavidad destacada. Compatible con todo tipo de sellados y vehículos decalados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-rim-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Rim Cleaner",
    "descripcion": "Limpiador especial para suciedad difícil como polvo de freno incrustado, aceite y suciedad de ruta en llantas de acero y aleación; libre de ácido, no daña llantas ni bulones. Tiempo de actuación 2-4 minutos (indicado por cambio de color de transparente a rojo).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-rim-cleaner-red-max",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Rim Cleaner Red Max",
    "descripcion": "Versión de mayor potencia del limpiador de llantas de la línea PROFILINE.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-beast-wheel-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Beast Wheel Cleaner",
    "descripcion": "Limpiador de llantas para acero, aleación, pintadas, cromadas, pulidas o mate; formulado para ser suave con llantas y bulones, compatible con sensores TPMS, con indicador de actividad (cambia de color).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-wheel-cleaner-ecocert",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Wheel Cleaner Ecocert",
    "descripcion": "Remueve la suciedad típica causada por polvo de freno y suciedad de ruta; uso regular previene la acumulación de suciedad difícil. Compatible con plástico, pintura y metal, seguro con TPMS, certificación ECOCERT.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-wheel-rim-star",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Wheel Rim Star",
    "descripcion": "Limpiador de llantas autoactivo para acero y aluminio pintado; remueve al instante suciedad difícil como polvo de freno incrustado, residuos de goma y aceite. Compatible con plástico, pintura y metal, seguro con TPMS.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-wheel-cleaner-full-effect",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Wheel Cleaner full effect",
    "descripcion": "Limpiador especial muy efectivo para todas las llantas de acero y aleación ligera, incluidas pintadas, cromadas y pulidas; remueve suciedad difícil sin dañar llantas ni bulones.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-wheel-cleaner-plus",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Wheel Cleaner PLUS",
    "descripcion": "Limpiador especial potente que disuelve fácilmente incluso suciedad difícil como polvo de freno incrustado, aceite y residuos de goma; no ataca la superficie de la llanta ni los bulones, compatible con TPMS, indicador de actividad (cambia a rojo).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "750ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-insect-remover",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Insect Remover",
    "descripcion": "Limpiador especial para remover residuos de insectos de vidrio, pintura, cromo y superficies plásticas; penetra y disuelve residuos secos para una limpieza simple. Uso previo al lavado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-insect-star",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Insect Star",
    "descripcion": "Quitainsectos efectivo que remueve rápida y suavemente incluso los residuos de insectos más difíciles y secos de vidrio, pintura, cromo y plásticos sin atacar la superficie. Ideal antes de cada lavado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-tar-remover",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Tar Remover",
    "descripcion": "Disuelve suave y minuciosamente manchas de brea y aceite en pintura y cromo, así como otra suciedad difícil como residuos de adhesivo; también remueve salpicaduras de sellador de bajos rápida y completamente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "300ml",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-tree-sap-remover",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Tree Sap Remover",
    "descripcion": "Remueve rápida y fácilmente savia de árbol, excremento de aves y otros residuos orgánicos de pintura, vidrio, cromo y superficies plásticas; también formulado para faros de xenón de alta gama y difusores plásticos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-stain-ex",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "PROFILINE Stain Ex",
    "descripcion": "Limpiador de alto rendimiento a base de hidrocarburos; remueve al instante residuos de adhesivo, adhesivo en spray, overspray de pintura, grafiti, suciedad grasosa y aceitosa, silicona, brea y ceras. Seca sin dejar residuos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-all-purpose-cleaner-foam",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "PROFILINE All-Purpose-Cleaner Foam",
    "descripcion": "Limpiador en espuma muy activo para todo tipo de superficies: tapizados, alfombras, vidrio, pintura, goma y plásticos; ataca suciedad difícil como aceite, grasa, silicona, nicotina e insectos, sin dejar rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-waterspot-remover",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "PROFILINE Waterspot Remover",
    "descripcion": "Limpiador para remover cal/manchas de agua secas causadas por sales minerales en todas las superficies exteriores del vehículo, incluyendo wraps y pintura mate.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-soft-top-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "Soft Top Cleaner",
    "descripcion": "Limpiador especial para todas las capotas de descapotable de tela y plástico; remueve incluso suciedad difícil de forma rápida, minuciosa y particularmente suave. Apto para usar durante el lavado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-foamgiant-shampoo",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME FoamGiant Shampoo",
    "descripcion": "Usado con cañón de espuma o equipo HD, se transforma en una alfombra de espuma gigante, duradera y potente que disuelve la suciedad; fórmula suave y pH neutro, apta para vehículos con wrap y pintura mate.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-rich-foam-shampoo",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Rich Foam Shampoo",
    "descripcion": "Shampoo en espuma disolvente potente de suciedad para todo el vehículo, con fragancia frutal a berries; fórmula pH neutro apta para superficies enceradas y selladas, wraps y pintura mate. Uso con cañón de espuma, sprayer o lavado a mano.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L",
      "5L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-shampoo-2-in-1",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Shampoo 2 in 1",
    "descripcion": "Concentrado de alto rendimiento para limpiar pintura, metal, vidrio, plástico, goma y superficies con wrap, con ayuda de secado especial; limpieza manual activa seguida de autosecado por tensoactivos, sin necesidad de toalla.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ceramic-activeshampoo",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Ceramic ActiveShampoo",
    "descripcion": "Shampoo con efecto sellador para una limpieza a fondo y un vehículo bien cuidado; conservación duradera hidro y antisuciedad repelente mediante tecnología Si-Carbon, refresca sellados cerámicos existentes con efecto perlado.",
    "diluciones": [
      "1:200 (5ml por litro de agua, o 50ml cada 10L de agua tibia)"
    ],
    "dilucionRecomendada": "1:200 (5ml por litro de agua, o 50ml cada 10L de agua tibia)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-waterless-wash-shine",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Waterless Wash+Shine",
    "descripcion": "Fórmula muy efectiva que limpia rápida y fácilmente superficies levemente sucias sin rayar; realza la profundidad de color, restaura el brillo y deja protección hidrorrepelente. No requiere balde ni agua adicional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-ppf-vinyl-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME PPF+Vinyl Cleaner",
    "descripcion": "Limpiador potente para remover suciedad típica de ruta, residuos de insectos y excremento de aves de wraps sucios y pintura mate, sin atacar la superficie; combinación de tensoactivos microactivos, libre de solventes y ácidos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-tyre-plastic-cleaner",
    "marca": "Sonax",
    "categoria": "lavado_exterior",
    "nombre": "XTREME Tyre+Plastic Cleaner",
    "descripcion": "Limpiador especial de neumáticos y goma de fórmula potente; penetra la superficie y remueve rápida y minuciosamente suciedad acumulada como mugre de ruta, polvo de freno, aceite/grasa y aderezos viejos. Preparación previa a aplicar brillo nuevo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-plastic-care",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Plastic Care",
    "descripcion": "Cuidado de plásticos para uso profesional; renueva el color, da brillo base y remueve manchas opacas y rayas; libre de solventes.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-leather-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Leather Cleaner",
    "descripcion": "Limpiador profesional de cuero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-leather-care-foam",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Leather Care Foam",
    "descripcion": "Espuma limpiadora extra fuerte para tapizados de cuero liso pigmentado; remueve suciedad difícil sin desgastar ni atacar el cuero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-leather-protection",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Leather Protection",
    "descripcion": "Cuidado de cuero sin cera, con protección UV, para cuero liso; refresca el color y deja el cuero suave y agradable al tacto, sin efecto graso. Se recomienda limpiar antes con PROFILINE Leather Cleaner.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-interior-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Interior Cleaner",
    "descripcion": "Concentrado limpiador especial para todas las superficies del interior del vehículo; remueve suciedad de plásticos y textiles de forma profunda y suave.",
    "diluciones": [
      "1:5 (uso estándar)",
      "1:10 a 1:50 con agua tibia (superficies sensibles)"
    ],
    "dilucionRecomendada": "1:5 (uso estándar)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10L",
      "25L",
      "200L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-interior-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Interior Cleaner",
    "descripcion": "Limpiador especial para todo el interior del vehículo; remueve minuciosa y suavemente incluso suciedad difícil de superficies plásticas y textiles como revestimientos, asientos, fundas de tela y techo interior.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-glass-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Glass Cleaner",
    "descripcion": "Limpiavidrios profesional para limpieza de parabrisas y espejos sin residuos; seca sin dejar rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10L",
      "25L",
      "200L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-glass-detailer-concentrate",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Glass Detailer Concentrate",
    "descripcion": "Concentrado detailer profesional para vidrios de la línea PROFILINE.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-sensitive-surface-detailer",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Sensitive Surface Detailer",
    "descripcion": "Limpia y mantiene superficies plásticas del interior del vehículo; especialmente indicado para vehículos nuevos con guarniciones de estructura mate. Reduce la carga electrostática y crea una película antiestática que repele el polvo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-microfibre-wash",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PROFILINE Microfibre Wash",
    "descripcion": "Detergente profesional específico para lavar paños y bayetas de microfibra sin dañar sus fibras.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-clean-star-ecodetergent",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Clean star Ecodetergent",
    "descripcion": "Producto todoterreno para todo el interior del vehículo: vidrios, laca piano, tapizados, displays, plásticos, Alcantara y cuero; fórmula suave con los materiales, sin rayas, con certificación ECOCERT Greenlife como ecodetergente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml",
      "5L",
      "25L",
      "200L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-premium-class-leather-care-cream",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PREMIUM CLASS Leather Care Cream",
    "descripcion": "Cuidado intensivo de todo tipo de cuero liso, con fórmula humectante rica que penetra en profundidad; restaura el brillo, color y suavidad original del cuero, con filtros UV, aditivos anti-crujido y antioxidantes. Crea barrera hidrofóbica protectora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-premium-class-leather-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "PREMIUM CLASS Leather Cleaner",
    "descripcion": "Limpieza efectiva de todo tipo de cuero liso; acción rápida e intensiva con máxima compatibilidad de materiales, remueve suciedad difícil como grasa y manchas de jean sin dañar el cuero. Incluye aplicador de espuma.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-leather-care",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Leather Care",
    "descripcion": "Emulsión de limpieza y cuidado de alta calidad, suave, apta para cuero liso, sintético y vegano en todos los colores; remueve suciedad, aceite y grasa restaurando el color, con cera de abejas y aceites de silicona para mantener la flexibilidad, protección UV.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-leather-care-foam",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Leather Care Foam",
    "descripcion": "Producto especial sin silicona para limpiar y cuidar cuero genuino y sintético (también vegano); para asientos de auto, cueros de moto, bolsos, muebles. Contiene cera de carnaúba y cera de abejas real para resistencia al agua, con protección UV.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-interior-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Interior Cleaner",
    "descripcion": "Concentrado de alto rendimiento para limpiar pintura, metal, vidrio, plástico y goma; con ayuda de secado especial.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-interior-detailer",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Interior Detailer",
    "descripcion": "Remueve suave, rápida y fácilmente suciedad leve de displays, guarniciones interiores, tablero, asientos tapizados, techo interior, etc. sin dejar residuos; mantiene plástico, vinilo, cuero, goma y metal, elimina olores, antiestático, sin silicona.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-cockpit-cleaner-matt-finish",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Cockpit Cleaner matt finish",
    "descripcion": "Limpieza y cuidado de todas las superficies plásticas del interior del vehículo; sella las superficies mate y texturadas para conservar las texturas finas de los tableros modernos. Formulado para plásticos soft-touch y tableros de madera. Sin silicona ni solventes.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-plastic-detailer-interior-exterior",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Plastic Detailer Interior+Exterior",
    "descripcion": "Limpia, mantiene, protege y regenera todas las partes plásticas dando un brillo sutil y restauración intensiva de color; interior (tablero, consola, paneles) sin rayas, exterior (paragolpes, molduras) oculta rayas y opacidad, también en bahía de motor.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-cockpit-spray-vanilla-fresh",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Cockpit Spray Vanilla-fresh",
    "descripcion": "Limpia y mantiene todas las partes plásticas del auto; da brillo nuevo y fragancia fresca a vainilla al tablero. Repele polvo, antiestático, previene que el plástico se vuelva quebradizo, apto tableros de madera, sin silicona.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-cockpit-spray-matt-effect",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Cockpit Spray Matt effect",
    "descripcion": "Limpia y mantiene todas las partes plásticas del auto conservando el aspecto mate original, con fragancia Lemon Rocks; repele polvo, antiestático, apto tableros de madera, evita reflejos en el parabrisas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-cockpit-star",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Cockpit Star",
    "descripcion": "Limpia y mantiene todas las partes plásticas del auto dejando una fragancia fresca y moderna; fórmula antipolvo y antiestática que protege los plásticos contra la resuciedad. Especial para superficies mate y texturadas y tableros de madera.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-glass-cleaning-star",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Glass Cleaning Star",
    "descripcion": "Limpiador potente con fragancia frutal para parabrisas, faros y superficies reflectantes del vehículo; remueve insectos, aceite, silicona y depósitos de escape en el exterior, y nicotina/películas grasosas en el interior. Apto pantallas táctiles y espejos del hogar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "750ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-clear-glass",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Clear Glass",
    "descripcion": "Remueve confiablemente insectos, aceite, silicona, emisiones de escape y residuos de nicotina de todas las superficies de vidrio y plexiglás, interiores y exteriores, sin dejar residuos. Apto pantallas táctiles y espejos del hogar; también sirve como lubricante para arcilla descontaminante.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "5L",
      "10L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-glass-clear",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Glass Clear",
    "descripcion": "Con tecnología de agua pura, este limpiavidrios especialmente potente logra un mejor mojado de la superficie del vidrio; remueve películas grasosas y huellas y residuos de nicotina en interior, y aceite, hollín e insectos en exterior, sin rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-display-cleaner",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Display Cleaner",
    "descripcion": "Limpia rápida y minuciosamente pantallas sensibles de huellas, grasa y otra suciedad; formulado para ser suave con pantallas táctiles de sistemas multimedia del auto, celulares y tablets. También apto vidrio, espejos, plexiglás, acrílico y laca piano.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "300ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-smokeex",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "SmokeEx",
    "descripcion": "Remueve confiablemente olores desagradables como olor a mascotas, humo de cigarrillo y transpiración de cuero y textiles, tapizados, alfombras, telas, calzado y ropa; ingredientes neutralizantes de origen vegetal que se unen a las partículas causantes del olor.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-foam-upholstery-cleaner-sin-propelente",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Foam Upholstery Cleaner sin propelente",
    "descripcion": "Remueve minuciosamente suciedad difícil de tapizados, alfombras y otros textiles; restaura los colores sin dejar marcas de suciedad, se puede aspirar fácilmente, protege contra la resuciedad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "400ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-upholstery-alcantara-cleaner-sin-propelente",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Upholstery+Alcantara Cleaner sin propelente",
    "descripcion": "Limpia minuciosa y suavemente todos los textiles del interior del auto (asientos, tapizados, paneles, techo interior, alfombras, fundas protectoras) y superficies de Alcantara® sensibles; incluye neutralizador de olores y remueve manchas difíciles como chocolate y café.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "400ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-car-a-c-cleaner-airaid",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Car A/C Cleaner AirAid",
    "descripcion": "Asegura rápida y fácilmente una higiene del aire duradera y remueve olores desagradables mediante una fórmula innovadora que limpia el aire acondicionado, sistema de ventilación y evaporador. Listo el vehículo tras 10 minutos de aplicación.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-airventures",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "AirVentures",
    "descripcion": "Ambientador de auto con aceite de perfume de alta calidad para crear una atmósfera de fragancia única; neutraliza olores desagradables (humo, mascotas, transpiración). Disponible en 4 fragancias: Orange+Rosemary, Cherry Blossom+Green Tea, Croissant+Café au Lait, Leather+Wild Cactus.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "300ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-air-freshener-colgante",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Air Freshener colgante",
    "descripcion": "Ambientador colgante para ventilación con aceites de perfume de alta calidad, de fácil sujeción a las rejillas de ventilación; sensación de fragancia intensa y duradera. Disponible en 5 fragancias: Edeldark, Ice-fresh, Lemon Rocks, Ocean-fresh, Sweet Flamingo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1 unidad"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-xtreme-clear-view-concentrate",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "XTREME Clear View concentrate",
    "descripcion": "Concentrado limpiador potente con fragancia fresca para el lavaparabrisas en verano; remueve aceite, mugre, películas de silicona, suciedad de ruta y residuos de insectos. Compatible con pintura, goma y plásticos, seguro para faros de alta gama.",
    "diluciones": [
      "1:100"
    ],
    "dilucionRecomendada": "1:100",
    "rendimientoEstimado": "250ml de concentrado rinden 25L de líquido de lavado, según ficha oficial",
    "tamanosEnvase": [
      "250ml (concentrado)",
      "3L y 5",
      "02L (listo para usar)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-windscreen-wash-concentrate",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Windscreen Wash Concentrate",
    "descripcion": "Concentrado de limpieza para lavaparabrisas y lavafaros; visión clara en segundos, sin rayas ni manchas. Remueve películas de insectos, aceite y silicona; compatible con pintura, goma y plásticos, apto tecnologías de faros modernas (láser, LED matrix, xenón). Fragancias Lemon y Lemon Rocks.",
    "diluciones": [
      "Proporción no publicada por la marca"
    ],
    "dilucionRecomendada": "Proporción no publicada por la marca",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L",
      "3L",
      "25L",
      "60L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-windscreen-wash-listo-para-usar",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Windscreen Wash listo para usar",
    "descripcion": "Limpiador listo para usar (sin diluir) para lavaparabrisas y lavafaros; remueve suciedad de insectos, aceite y silicona sin rayas ni manchas, seguro para faros modernos (LED, láser matrix, xenón) y pinturas mate/reparadas. Disponible en 5 fragancias: Orange+Rosemary, Lemon Rocks, Ocean-fresh, Sweet Flamingo, y sin fragancia.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "3L",
      "5",
      "02L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-cockpit-care-wipes-matt-effect",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Cockpit Care Wipes matt effect",
    "descripcion": "Limpia, mantiene y protege plásticos, vinilo, madera y goma en un solo paso; conserva el aspecto mate del cockpit y evita reflejos en el parabrisas. Repele polvo y antiestático, sin silicona ni solventes, con protección UV. Fibras de origen natural.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10",
      "25 unidades"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-glass-cleaning-wipes",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Glass Cleaning Wipes",
    "descripcion": "Toallitas húmedas de alta calidad con componentes de limpieza especiales que aseguran limpieza sin rayas ni manchas; para vidrio y espejos del auto y del hogar, seguras para pantallas táctiles sensibles y vidrios polarizados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10",
      "25 unidades"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-interior-cleaning-wipes",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Interior Cleaning Wipes",
    "descripcion": "Toallitas húmedas de alta calidad que limpian rápida, fácil y minuciosamente todas las superficies del interior del auto: tablero, umbrales, techo interior, asientos, alfombras, tapizados, vidrios y cuero. Aptas para superficies de Alcantara®.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10",
      "25 unidades"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-leather-care-wipes",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Leather Care Wipes",
    "descripcion": "Toallitas antideslizantes de alta calidad que limpian, mantienen y preservan todas las superficies de cuero liso; incluyen aceite de jojoba nutritivo que da suavidad sin dejar resbaladizo. Aptas para volantes de cuero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "25 unidades"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-plastic-care-wipes",
    "marca": "Sonax",
    "categoria": "interior",
    "nombre": "Plastic Care Wipes",
    "descripcion": "Limpia, mantiene y protege plásticos, vinilo, madera y goma en un solo paso, devolviendo el brillo original; protección antipolvo y antiestática contra la resuciedad, con protección UV. Fibras de origen natural.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10",
      "25 unidades"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-clay",
    "marca": "Sonax",
    "categoria": "accesorios_consumibles",
    "nombre": "Clay",
    "descripcion": "Arcilla descontaminante suave para remover suciedad difícil de la pintura que no sale en el lavado (fallout industrial, savia de árbol, brea, residuos de insectos, polvo industrial, neblina de pintura en spray).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "200g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-clay-ball",
    "marca": "Sonax",
    "categoria": "accesorios_consumibles",
    "nombre": "Clay-Ball",
    "descripcion": "Para remover contaminación superficial como savia de árbol, manchas de óxido, residuos de insectos y brea de pintura y vidrio; almohadilla de arcilla removible y lavable con agua.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1 unidad"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "sonax-profiline-clay-disc",
    "marca": "Sonax",
    "categoria": "accesorios_consumibles",
    "nombre": "PROFILINE Clay Disc",
    "descripcion": "Disco de arcilla descontaminante de 150mm para uso con pulidora, como alternativa a la barra de arcilla tradicional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "150mm"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hybrid-ceramic-wash-wax-g240748",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Hybrid Ceramic Wash & Wax (G240748)",
    "descripcion": "Jabón de lavado 2 en 1 que limpia y potencia la pintura con protección de cera cerámica híbrida (tecnología SiO2).",
    "diluciones": [
      "No publicada"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "48oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hybrid-ceramic-liquid-wax-g200416",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hybrid Ceramic Liquid Wax (G200416)",
    "descripcion": "Cera líquida con tecnología híbrida SiO2 que da perlado de agua extremo y protección duradera; sin residuo blanco en plástico/goma.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hybrid-ceramic-detailer-g200526",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hybrid Ceramic Detailer (G200526)",
    "descripcion": "Spray detailer cerámico híbrido que limpia y protege entre lavados, reforzando la hidrofobia de la cera/sellador existente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "26oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-quik-wax-g200924",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Quik Wax (G200924)",
    "descripcion": "Cera en spray de polímeros hidrofóbicos que da brillo y protección duraderos en minutos, aplicable incluso a sol directo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-quik-detailer-g201024",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Quik Detailer (G201024)",
    "descripcion": "Detailer spray de mezcla de polímeros que facilita el proceso de rociar y limpiar, dejando un acabado más resbaladizo entre lavados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-liquid-wax-g210516",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Liquid Wax (G210516)",
    "descripcion": "Cera líquida sintética premium de aplicación fácil (a mano o con pulidora DA) que da brillo profundo y perlado de agua duradero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-paste-wax-g210608",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Paste Wax (G210608)",
    "descripcion": "Cera en pasta sintética premium que crea una barrera protectora duradera sobre el clear coat; incluye almohadilla y toalla.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-smooth-surface-clay-kit-g191700",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Smooth Surface Clay Kit (G191700)",
    "descripcion": "Kit de descontaminación con barra de arcilla no abrasiva que remueve overspray, fallout industrial, resina de árboles y alquitrán.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit: 3 barras de arcilla 60g + Quik Detailer spray 16oz + toalla de microfibra"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-shine-paint-glosser-g230316",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Insane Shine Paint Glosser (G230316)",
    "descripcion": "Potenciador de brillo en spray que nutre la pintura con aceites de pulido, aumentando brillo y profundidad y disimulando swirls leves.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-ceramic-coating-g240108",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Ceramic Coating (G240108)",
    "descripcion": "Recubrimiento cerámico premium de aplicación DIY que da protección de alta durabilidad, brillo intensificado y perlado de agua.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-soft-wash-gel-a2516-a2564",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Soft Wash Gel (A2516 / A2564)",
    "descripcion": "Gel de lavado pH balanceado que remueve suciedad, grime y excremento de aves sin dañar la protección de cera, con acabado libre de marcas.",
    "diluciones": [
      "No publicada"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz",
      "64oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hybrid-ceramic-waterless-wash-wax-g251024",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Hybrid Ceramic Waterless Wash & Wax (G251024)",
    "descripcion": "Lavado sin agua que limpia y protege en un paso con lubricidad alta y química cerámica; se rocía y se retira con toalla de microfibra, sin balde ni manguera.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-watermelon-bubblegum-wash-g250464",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Watermelon Bubblegum Wash (G250464)",
    "descripcion": "Shampoo automotriz concentrado con aroma a sandía/chicle, espuma abundante, pH neutro y compatible con sellador/cerámicos.",
    "diluciones": [
      "Balde: 1oz (30ml) por galón de agua (~1:128)",
      "Cañón de espuma: 1:5"
    ],
    "dilucionRecomendada": "Balde: 1oz (30ml) por galón de agua (~1:128)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "64oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-iron-remover-g250524",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Ultimate Iron Remover (G250524)",
    "descripcion": "Removedor de partículas de hierro y contaminación industrial incrustada en pintura, vidrio y cromados, listo para usar y balanceado en pH.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-rims-aluminum-wheel-cleaner-g14324",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Hot Rims Aluminum Wheel Cleaner (G14324)",
    "descripcion": "Gel espumante especializado para ruedas de aluminio sin recubrimiento y acabados sensibles.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-shine-high-gloss-tire-coating-g13815",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hot Shine High Gloss Tire Coating (G13815)",
    "descripcion": "Spray de brillo para neumáticos que da un acabado brillante y duradero, resistente a los elementos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "15oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-shine-tire-spray-g12024",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hot Shine Tire Spray (G12024)",
    "descripcion": "Dressing de neumáticos de brillo profundo tipo \"wet look\" con polímeros de silicona resistentes al agua, de fórmula autonivelante.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "15oz",
      "19oz",
      "24oz",
      "64oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-shine-tire-foam-g13919",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hot Shine Tire Foam (G13919)",
    "descripcion": "Espuma limpiadora y protectora de neumáticos que da brillo profundo y protección UV en un solo paso, sin necesidad de frotar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "15oz",
      "19oz",
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-rims-chrome-wheel-cleaner-g19124",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Hot Rims Chrome Wheel Cleaner (G19124)",
    "descripcion": "Gel espumante con tecnología Xtreme Cling que disuelve polvo de freno y suciedad en ruedas cromadas (no apto para PVD, aluminio sin recubrir ni motos).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-shine-reflect-tire-shine-g18715",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hot Shine Reflect Tire Shine (G18715)",
    "descripcion": "Dressing en aerosol con tecnología reflectante que da un negro profundo tipo \"wet look\" con brillo intenso bajo la luz.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "15oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-all-wheel-cleaner-g180124",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Ultimate All Wheel Cleaner (G180124)",
    "descripcion": "Gel limpiador que cambia a color púrpura al disolver polvo de freno; libre de ácido y balanceado en pH, apto para todos los acabados de rueda.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-tire-shine-g190315",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Insane Tire Shine (G190315)",
    "descripcion": "Recubrimiento de neumáticos en aerosol de la más alta gama de brillo, con química de polímero sintético avanzada y acabado \"wet look\" duradero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "15oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-shine-foam-g210419",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Insane Shine Foam (G210419)",
    "descripcion": "Limpiador y dressing de neumáticos 2 en 1 en espuma que limpia y da brillo alto en una sola aplicación, sin frotar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "19oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hybrid-ceramic-tire-shine-g230416",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Hybrid Ceramic Tire Shine (G230416)",
    "descripcion": "Dressing de neumáticos con tecnología híbrida SiO2, brillo alto y duradero, resistente al agua y con menor \"sling\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-rims-black-wheel-cleaner-g230524",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Hot Rims Black Wheel Cleaner (G230524)",
    "descripcion": "Gel espumante formulado para acabados de rueda negros sensibles (brillante, mate, satinado, black chrome), con acción de largo dwell time.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-hot-rims-foaming-wheel-tire-cleaner-g250320",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Hot Rims Foaming Wheel & Tire Cleaner (G250320)",
    "descripcion": "Limpiador espumante avanzado que remueve polvo de freno y grime de ruedas OEM con clear coat y neumáticos simultáneamente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "20oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-shine-tire-spray-g250816",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Insane Shine Tire Spray (G250816)",
    "descripcion": "Dressing de neumáticos en spray de brillo \"empapado\" y larga duración; en spray directo para brillo alto o con aplicador para brillo medio.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-shine-tire-trim-gel-g262016",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Insane Shine Tire & Trim Gel (G262016)",
    "descripcion": "Gel versátil de alto brillo para neumáticos y molduras plásticas exteriores, con protección UV duradera y acabado húmedo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz (473ml)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-black-chrome-air-refresher-trigger-g250708",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Black Chrome Air Refresher Trigger (G250708)",
    "descripcion": "Spray anti-olores premium que refresca el interior del auto con un aroma \"black chrome\" de larga duración.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-carpet-upholstery-cleaner-g191419",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Carpet & Upholstery Cleaner (G191419)",
    "descripcion": "Espuma activa que penetra y disuelve manchas de alfombras/tapizados desde el fondo, eliminando olores con un aroma fresco.",
    "diluciones": [
      "No publicada"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "19oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-leather-detailer-g201316",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Ultimate Leather Detailer (G201316)",
    "descripcion": "Detailer \"3 en 1\" que limpia, acondiciona y protege el cuero en un solo paso, con bloqueadores UV y acabado satinado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-whole-car-air-refresher-fiji-sunset-g201502",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Whole Car Air ReFresher — Fiji Sunset (G201502)",
    "descripcion": "Aerosol de un solo uso que elimina permanentemente olores del auto (circula por la ventilación, techo y rincones) y deja aroma tropical Fiji Sunset.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2oz (también en trigger 8oz en aromas seleccionados)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-whole-car-air-refresher-dubai-sands-g262402",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Whole Car Air ReFresher — Dubai Sands (G262402)",
    "descripcion": "Aerosol de un solo uso de la línea Whole Car Air ReFresher que elimina olores del auto y deja aroma Dubai Sands.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-whole-car-air-re-fresher-stargazer-g262702",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Whole Car Air Re-Fresher — Stargazer (G262702)",
    "descripcion": "Aerosol de un solo uso que elimina olores del vehículo e infunde el interior con aroma a piña, cereza y granada.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-whole-car-air-refresher-tropical-rainforest-g262602",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Whole Car Air ReFresher — Tropical Rainforest (G262602)",
    "descripcion": "Aerosol de un solo uso de la línea Whole Car Air ReFresher que elimina olores del auto y deja aroma Tropical Rainforest.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-whole-car-air-refresher-island-volcano-g262502",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Whole Car Air ReFresher — Island Volcano (G262502)",
    "descripcion": "Aerosol de un solo uso que combate olores del vehículo e infunde el interior con aroma cítrico, té blanco y madera a la deriva; dura varias semanas según la marca.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-shine-protectant-wipes-g220200",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Ultimate Insane Shine Protectant Wipes (G220200)",
    "descripcion": "Toallitas que limpian, dan brillo y protegen en un solo paso superficies de vinilo, plástico y goma (tablero, paneles, neumáticos, molduras).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "30 toallitas"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-insane-shine-protectant-g220216",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Ultimate Insane Shine Protectant (G220216)",
    "descripcion": "Spray premium que limpia, da brillo y protege con defensa UV superficies de vinilo, plástico y goma, sin dejar rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-all-surface-interior-cleaner-g240616",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "All Surface Interior Cleaner (G240616)",
    "descripcion": "Limpiador premium para todas las superficies del interior que remueve suciedad, grasa y manchas de forma segura, sin necesidad de dilución.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-paint-dash-glass-g250224",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Paint Dash & Glass (G250224)",
    "descripcion": "Spray detailer versátil con protección hidrofóbica para pintura, vidrio, cuero, vinilo y plástico, dentro y fuera del vehículo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-new-car-air-refresher-trigger-g250608",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "New Car Air Refresher Trigger (G250608)",
    "descripcion": "Spray anti-olores premium que elimina malos olores del interior y deja un aroma a \"auto nuevo\" duradero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-foaming-floor-mat-carpet-cleaner-g262816",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Foaming Floor Mat + Carpet Cleaner (G262816)",
    "descripcion": "Limpiador de alta espuma para alfombras y pisos que remueve suciedad, grasa y manchas con resultados profesionales.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-gold-class-luxury-matte-g262116",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Gold Class Luxury Matte (G262116)",
    "descripcion": "Protector avanzado de interior que cubre vinilo, goma, plástico y cuero sin dejar acabado grasoso ni resbaladizo, con look mate de lujo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-plastx-clear-plastic-cleaner-g12310",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "PlastX Clear Plastic Cleaner (G12310)",
    "descripcion": "Limpiador/pulidor de plástico transparente que mejora el desgaste a largo plazo de plásticos sin recubrimiento y restaura ópticas de faros dañadas por rayas y oxidación.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-black-plastic-restorer-g15812-g16910-g15816",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Black Plastic Restorer (G15812 / G16910 / G15816)",
    "descripcion": "Restaurador de plástico negro para molduras exteriores, con protección UV duradera; se aplica con esponja y seca rápido sin manchar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10oz",
      "12oz",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-perfect-clarity-glass-cleaner-g8224",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Perfect Clarity Glass Cleaner (G8224)",
    "descripcion": "Limpiador de vidrios automotriz sin amoníaco que da un acabado impecable y sin rayas en ventanas, parabrisas, espejos y techos solares.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-keep-clear-headlight-coating-g17804",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Keep Clear Headlight Coating (G17804)",
    "descripcion": "Recubrimiento en aerosol con protección UV que mantiene la claridad de los faros después de una restauración o en faros nuevos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 1 año de claridad, según la marca",
    "tamanosEnvase": [
      "4oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-bug-and-tar-remover-g180515",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Bug and Tar Remover (G180515)",
    "descripcion": "Limpiador especializado que elimina de forma segura insectos y alquitrán secos sobre la pintura; hace espuma para ablandar la contaminación sin fricción excesiva.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "15oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ultimate-glass-water-repellent-g240416",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ultimate Glass & Water Repellent (G240416)",
    "descripcion": "Limpiador de vidrios con tecnología hidrofóbica que repele el agua mientras limpia, dejando una capa de protección sin rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-ceramic-headlight-kit-g2990srp",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Ceramic Headlight Kit (G2990SRP)",
    "descripcion": "Kit de restauración de faros sin taladro con dos grados de disco de lijado (1000 y 3000), almohadilla, toallitas selladoras y guante; sella con protección cerámica.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Más de 18 meses de protección UV, según la marca",
    "tamanosEnvase": [
      "Kit completo (discos",
      "almohadilla",
      "2 toallitas sellador",
      "guante)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-heavy-duty-trim-kit-g250100",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Heavy Duty Trim Kit (G250100)",
    "descripcion": "Kit de dos pasos que restaura y protege molduras plásticas exteriores desvanecidas: solución limpiadora + protector \"Trim Shield\" con protección UV.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit: solución limpiadora + Trim Shield + almohadilla aplicadora"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-matte-vinyl-wrap-protection-detailer-g260724",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Matte & Vinyl Wrap Protection Detailer (G260724)",
    "descripcion": "Spray detailer avanzado que limpia sin dejar rayas y protege superficies satinadas, brillantes y con vinilo/wrap.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d110-hyper-wash",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D110 Hyper-Wash",
    "descripcion": "Jabón concentrado para cañón de espuma, línea profesional D-Series.",
    "diluciones": [
      "400:1"
    ],
    "dilucionRecomendada": "400:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d111-detailer-shampoo-plus",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D111 Detailer Shampoo Plus",
    "descripcion": "Jabón de lavado profesional de trabajo pesado, agresivo con la suciedad y suave con la pintura; agentes acondicionadores que potencian el brillo.",
    "diluciones": [
      "128:1"
    ],
    "dilucionRecomendada": "128:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d112-super-soap",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D112 Super Soap",
    "descripcion": "Shampoo profesional de espuma rica y lubricante para lavado a mano.",
    "diluciones": [
      "128:1"
    ],
    "dilucionRecomendada": "128:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d113-citrus-blast-wash-wax",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D113 Citrus Blast Wash & Wax",
    "descripcion": "Shampoo profesional con cera de carnaúba premium que lava y da brillo en un paso.",
    "diluciones": [
      "128:1"
    ],
    "dilucionRecomendada": "128:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d115-detailer-rinse-free-express-wash-wax",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D115 Detailer Rinse Free Express Wash & Wax",
    "descripcion": "Lavado \"sin enjuague\" profesional para lavar y encerar sin manguera ni balde.",
    "diluciones": [
      "4:1 a 20:1"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-g1915-ultimate-snow-foam",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional G1915 Ultimate Snow Foam",
    "descripcion": "Espuma gruesa de pre-lavado para cañón de espuma, línea profesional.",
    "diluciones": [
      "5:1"
    ],
    "dilucionRecomendada": "5:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d140-wheel-brightener",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D140 Wheel Brightener",
    "descripcion": "Limpiador profesional de ruedas que remueve polvo de freno de forma efectiva.",
    "diluciones": [
      "Hasta 4:1"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "55gal",
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d143-detailer-non-acid-wheel-tire-cleaner",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D143 Detailer Non-Acid Wheel & Tire Cleaner",
    "descripcion": "Limpiador de ruedas y neumáticos libre de ácido, para uso profesional.",
    "diluciones": [
      "Listo para usar (RTU)",
      "Hasta 2:1"
    ],
    "dilucionRecomendada": "Listo para usar (RTU)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal",
      "botella RTU 32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d1801-wheel-paint-iron-decon",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D1801 Wheel & Paint Iron Decon",
    "descripcion": "Removedor de hierro de cambio de color rápido (rojo/púrpura) para ruedas y pintura, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-drtu2002-iron-removing-spray-clay",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional DRTU2002 Iron Removing Spray \"Clay\"",
    "descripcion": "Spray descontaminante de hierro para preparación previa al uso de arcilla (clay), línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m39-heavy-duty-vinyl-rubber-cleaner",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional M39 Heavy Duty Vinyl & Rubber Cleaner",
    "descripcion": "Limpiador profesional de trabajo pesado para superficies de vinilo y goma exteriores.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d101-detailer-all-purpose-cleaner",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D101 Detailer All Purpose Cleaner",
    "descripcion": "Limpiador multiuso profesional ideal para todas las superficies interiores del vehículo, en forma concentrada.",
    "diluciones": [
      "4:1 (trabajo pesado)",
      "10:1 (trabajo liviano)"
    ],
    "dilucionRecomendada": "10:1 (trabajo liviano)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "55gal",
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d106-pro-fiber-rinse-tannin-stain-remover",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D106 Pro Fiber Rinse & Tannin Stain Remover",
    "descripcion": "Neutralizador de pH profesional para alfombras, remueve manchas de taninos.",
    "diluciones": [
      "RTU",
      "10:1",
      "20:1"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d107-citrus-power-cleaner-plus",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D107 Citrus Power Cleaner Plus",
    "descripcion": "Limpiador multiuso (APC) concentrado sin espuma, a base de cítricos, línea profesional.",
    "diluciones": [
      "RTU",
      "4:1",
      "10:1",
      "20:1"
    ],
    "dilucionRecomendada": "10:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal",
      "botella RTU 32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d108-detailer-super-degreaser",
    "marca": "Meguiar's",
    "categoria": "lavado_exterior",
    "nombre": "Professional D108 Detailer Super Degreaser",
    "descripcion": "Desengrasante profesional que rompe rápidamente la grasa más difícil (motor, chasis); se enjuaga fácil y evita manchas blancas.",
    "diluciones": [
      "4:1 (trabajo pesado)",
      "10:1 (trabajo liviano)"
    ],
    "dilucionRecomendada": "10:1 (trabajo liviano)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d120-glass-cleaner-concentrate",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D120 Glass Cleaner Concentrate",
    "descripcion": "Limpiador de vidrios profesional concentrado, sin amoníaco.",
    "diluciones": [
      "10:1"
    ],
    "dilucionRecomendada": "10:1",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d10219-carpet-upholstery-cleaner",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D10219 Carpet & Upholstery Cleaner",
    "descripcion": "Limpiador profesional que remueve manchas difíciles de alfombras y tapizados rápidamente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "19oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d116-pro-protein-stain-remover",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D116 Pro Protein Stain Remover",
    "descripcion": "Removedor profesional de manchas proteínicas (sangre, comida, orgánicas) en tapizados y alfombras.",
    "diluciones": [
      "RTU",
      "5:1"
    ],
    "dilucionRecomendada": "RTU",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d149-quik-interior-detailer",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D149 Quik Interior Detailer",
    "descripcion": "Detailer rápido de interior con protección UV, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d180-detailer-leather-cleaner-conditioner",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D180 Detailer Leather Cleaner & Conditioner",
    "descripcion": "Loción profesional gruesa y rica que limpia y acondiciona el cuero en un paso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d181-detailer-leather-cleaner",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional D181 Detailer Leather Cleaner",
    "descripcion": "Limpiador rápido de cuero para uso profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-g180724-carpet-cloth-re-fresher",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional G180724 Carpet & Cloth Re-Fresher",
    "descripcion": "Eliminador de olores persistentes para alfombras y telas, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "24oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-whole-car-air-re-fresher",
    "marca": "Meguiar's",
    "categoria": "interior",
    "nombre": "Professional Whole Car Air Re-Fresher",
    "descripcion": "Aerosol profesional que elimina olores del vehículo de forma permanente, disponible en varios aromas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "2oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d160-detailer-all-season-dressing",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D160 Detailer All Season Dressing",
    "descripcion": "Dressing profesional de brillo resistente al clima para gomas y plásticos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "55gal",
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d161-detailer-silicone-free-dressing",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D161 Detailer Silicone-Free Dressing",
    "descripcion": "Dressing profesional libre de silicona, brillo parejo y de alto brillo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d170-detailer-hyper-dressing",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D170 Detailer Hyper-Dressing",
    "descripcion": "Dressing profesional de máximo brillo posible, diluible según el acabado buscado.",
    "diluciones": [
      "RTU",
      "1:1",
      "2:1",
      "3:1",
      "4:1"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal",
      "botella RTU 32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d171-detailer-water-based-dressing",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D171 Detailer Water Based Dressing",
    "descripcion": "Dressing profesional a base de agua para gomas y plásticos.",
    "diluciones": [
      "RTU",
      "1:1"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "55gal",
      "5gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d4510-plastic-vinyl-coating",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D4510 Plastic & Vinyl Coating",
    "descripcion": "Recubrimiento profesional para vinilo y plástico exterior.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "10oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m40-vinyl-rubber-cleaner-conditioner",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M40 Vinyl & Rubber Cleaner/Conditioner",
    "descripcion": "Fórmula profesional compleja que limpia y restaura vinilo y goma en un paso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m01-medium-cut-cleaner",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M01 Medium Cut Cleaner",
    "descripcion": "Abrasivo profesional de corte moderado para defectos medios de pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m02-fine-cut-cleaner",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M02 Fine Cut Cleaner",
    "descripcion": "Abrasivo profesional suave para defectos leves de pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m04-heavy-cut-cleaner",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M04 Heavy Cut Cleaner",
    "descripcion": "Compuesto profesional que remueve rayones severos y oxidación.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m85-diamond-cut-compound-2-0",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M85 Diamond Cut Compound 2.0",
    "descripcion": "Compuesto profesional que corta rápido con arrugado mínimo (mínimo micro-marcado).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m100-pro-speed-compound",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M100 Pro Speed Compound",
    "descripcion": "Compuesto profesional de corte rápido para corrección de pintura.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m101-foam-cut-compound",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M101 Foam Cut Compound",
    "descripcion": "Compuesto profesional ultra rápido para marcas de lijado (sanding marks).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m105-ultra-cut-compound",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M105 Ultra Cut Compound",
    "descripcion": "Compuesto de corte profesional con tecnología exclusiva de micro-abrasivos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz",
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m110-ultra-pro-speed-compound",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M110 Ultra Pro Speed Compound",
    "descripcion": "Evolución profesional del compuesto de corte rápido M100.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m03-machine-glaze",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M03 Machine Glaze",
    "descripcion": "Glaze profesional super brillante para aplicación a máquina.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "64oz",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m07-show-car-glaze",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M07 Show Car Glaze",
    "descripcion": "Glaze profesional de brillo profundo y húmedo tipo \"show car\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m09-swirl-remover-2-0",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M09 Swirl Remover 2.0",
    "descripcion": "Pulido profesional limpiador que remueve swirls con brillo profundo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m82-swirl-free-polish",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M82 Swirl Free Polish",
    "descripcion": "Pulido profesional de alto rendimiento libre de swirls.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m83-dual-action-cleaner-polish",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M83 Dual Action Cleaner/Polish",
    "descripcion": "Combinación profesional de limpieza y pulido en un solo paso para pulidora DA.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m200-pro-speed-polish",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M200 Pro Speed Polish",
    "descripcion": "Pulido de acabado ultra fino profesional que remueve defectos leves y da brillo profundo, con mínimo empolvado y buen tiempo de trabajo (mano, DA o rotativa).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m205-ultra-finishing-polish",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M205 Ultra Finishing Polish",
    "descripcion": "Pulido de acabado avanzado profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz",
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m210-ultra-pro-finishing-polish-mirror-glaze",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M210 Ultra Pro Finishing Polish Mirror Glaze",
    "descripcion": "Evolución profesional del pulido de acabado M205.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d166-detailer-ultra-polishing-wax",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D166 Detailer Ultra Polishing Wax",
    "descripcion": "Cera limpiadora profesional que remueve defectos y protege en un solo paso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m06-cleaner-wax",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M06 Cleaner Wax",
    "descripcion": "Cera limpiadora profesional de aplicación en un solo paso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "64oz",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m66-quik-detailer",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M66 Quik Detailer",
    "descripcion": "Cera limpiadora profesional de alto rendimiento en formato spray.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-g190526-hybrid-ceramic-wax",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional G190526 Hybrid Ceramic Wax",
    "descripcion": "Cera cerámica simple de línea profesional: se rocía, enjuaga y seca.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "26oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-g210300-hybrid-paint-coating",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional G210300 Hybrid Paint Coating",
    "descripcion": "Recubrimiento híbrido profesional de química avanzada; kit con preparador de superficie M122 y recubrimiento.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Kit (M122 + recubrimiento)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m21-synthetic-sealant-2-0",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M21 Synthetic Sealant 2.0",
    "descripcion": "Sellador sintético profesional de larga duración.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "64oz",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m26-hi-tech-yellow-wax",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M26 Hi-Tech Yellow Wax",
    "descripcion": "Cera de carnaúba premium de línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "16oz",
      "11oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m27-pro-hybrid-ceramic-sealant",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M27 Pro Hybrid Ceramic Sealant",
    "descripcion": "Sellador cerámico híbrido de uso profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-detailing-clay-mild-c2000",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Professional Detailing Clay Mild (C2000)",
    "descripcion": "Barra de arcilla no abrasiva profesional que remueve rápido contaminantes adheridos a la superficie (overspray, fallout industrial, resina, alquitrán) en pintura, vidrio, metal y plástico.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "200g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-detailing-clay-aggressive-c2100",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Professional Detailing Clay Aggressive (C2100)",
    "descripcion": "Barra de arcilla profesional más agresiva para contaminación más difícil.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "200g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d155-detailer-last-touch-spray-detailer",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D155 Detailer Last Touch Spray Detailer",
    "descripcion": "Spray detailer profesional para retoques finales antes de la entrega del vehículo; también se usa como lubricante de arcilla diluido 1:1.",
    "diluciones": [
      "RTU",
      "1:1 (como lubricante de arcilla)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "5gal",
      "1gal",
      "botella RTU 32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d156-synthetic-x-press-spray-wax",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D156 Synthetic X-Press Spray Wax",
    "descripcion": "Cera en spray profesional de fácil aplicación y limpieza.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m34-final-inspection",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M34 Final Inspection",
    "descripcion": "Spray profesional para inspección final rápida antes de la entrega del vehículo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m122-surface-prep",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M122 Surface Prep",
    "descripcion": "Preparador de superficie profesional previo a la aplicación de sellador o recubrimiento (elimina residuos de pulido/cera).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m799-pro-hybrid-ceramic-bead-booster",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M799 Pro Hybrid Ceramic Bead Booster",
    "descripcion": "Sellador spray cerámico híbrido profesional booster de perlado.",
    "diluciones": [
      "RTU",
      "1:3"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1gal",
      "32oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-two-step-headlight-restoration-kit-g2970",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Two Step Headlight Restoration Kit (G2970)",
    "descripcion": "Kit profesional de restauración de faros sin taladro: solución limpiadora con almohadilla abrasiva + recubrimiento protector + paño de microfibra.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 12 meses de protección, según la marca",
    "tamanosEnvase": [
      "Kit completo"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-heavy-duty-headlight-restoration-kit-g2980",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Heavy Duty Headlight Restoration Kit (G2980)",
    "descripcion": "Kit profesional para restauración de faros con taladro, para casos de oxidación más severa.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "Kit completo con discos"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m10-clear-plastic-polish",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M10 Clear Plastic Polish",
    "descripcion": "Pulido profesional que restaura la claridad óptica de plásticos transparentes.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m17-clear-plastic-cleaner",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional M17 Clear Plastic Cleaner",
    "descripcion": "Limpiador profesional no abrasivo para plásticos transparentes.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-m18-clear-plastic-detailer",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional M18 Clear Plastic Detailer",
    "descripcion": "Detallador rápido profesional para plástico transparente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d300-detailer-da-microfiber-correction-compound",
    "marca": "Meguiar's",
    "categoria": "pulido_correccion",
    "nombre": "Professional D300 Detailer DA Microfiber Correction Compound",
    "descripcion": "Compuesto de corrección profesional formulado para usarse con discos de microfibra en pulidora DA.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-d301-detailer-da-microfiber-finishing-wax",
    "marca": "Meguiar's",
    "categoria": "proteccion_sellado",
    "nombre": "Professional D301 Detailer DA Microfiber Finishing Wax",
    "descripcion": "Cera de acabado profesional formulada para usarse con discos de microfibra en pulidora DA.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16oz",
      "1gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-w0004-applicator-pads",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Professional W0004 Applicator Pads",
    "descripcion": "Almohadillas aplicadoras reutilizables de espuma, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Paquete de 4"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-x2000-microfiber-water-magnet-drying-towel",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Professional X2000 Microfiber Water Magnet Drying Towel",
    "descripcion": "Toalla de secado de microfibra de alta absorción, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "22\" x 30\""
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-x3002-microfiber-wash-mitt",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Professional X3002 Microfiber Wash Mitt",
    "descripcion": "Manopla de lavado de microfibra, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "8\" x 10\""
    ],
    "prioridadSugerida": null
  },
  {
    "id": "meguiar-s-professional-x3003-grit-guard",
    "marca": "Meguiar's",
    "categoria": "accesorios_consumibles",
    "nombre": "Professional X3003 Grit Guard",
    "descripcion": "Rejilla separadora de sedimento para balde de lavado, línea profesional.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Para baldes de 3 a 5gal"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-fusso-coat-12-months-wax-light-color",
    "marca": "Soft99",
    "categoria": "ceras",
    "nombre": "Fusso Coat 12 Months Wax Light Color",
    "descripcion": "Cera sintética con polímero de flúor de alta resiliencia que protege la pintura de colores claros contra UV, lluvia y suciedad, con gran dureza y resistencia a rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "12 meses de protección, según la marca",
    "tamanosEnvase": [
      "200 g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-fusso-coat-12-months-wax-dark-color",
    "marca": "Soft99",
    "categoria": "ceras",
    "nombre": "Fusso Coat 12 Months Wax Dark Color",
    "descripcion": "Cera sintética con polímero de flúor de alta resiliencia formulada para pintura de colores oscuros, con dureza excepcional y durabilidad prolongada.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "12 meses de protección, según la marca",
    "tamanosEnvase": [
      "200 g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-fusso-coat-f7-all-color",
    "marca": "Soft99",
    "categoria": "ceras",
    "nombre": "Fusso Coat F7 All Color",
    "descripcion": "Sellador acrílico en spray que forma una capa de flúor tipo PTFE sobre la pintura sin necesidad de tratamiento base, repele el agua y es fácil de retirar al pulir.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 7 meses de hidrofobia, según pruebas internas de la marca",
    "tamanosEnvase": [
      "300 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-authentic-premium-e",
    "marca": "Soft99",
    "categoria": "ceras",
    "nombre": "Authentic Premium(E)",
    "descripcion": "Cera en pasta de carnauba natural refinada importada de Brasil, formulada sin compromisos de calidad, con aplicador incluido para una cobertura pareja.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "200 g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-fukupika-strong-water-repellent",
    "marca": "Soft99",
    "categoria": "ceras",
    "nombre": "FUKUPIKA Strong Water Repellent",
    "descripcion": "Toallitas impregnadas con aceites de silicona hidrorrepelentes y cera adhesiva que permiten lavar el auto en seco y dejan una capa hidrofóbica protectora.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 3 meses o 5 lavados, según la marca",
    "tamanosEnvase": [
      "Pack de 10 toallitas (350 x 300 mm cada una)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-glaco-roll-on",
    "marca": "Soft99",
    "categoria": "vidrios",
    "nombre": "Glaco Roll On",
    "descripcion": "Repelente de agua para vidrios con aplicador de fieltro tipo roll-on; a más de 45 km/h el agua se despega y sale volando del parabrisas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "75 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-ultra-glaco",
    "marca": "Soft99",
    "categoria": "vidrios",
    "nombre": "Ultra Glaco",
    "descripcion": "Repelente de agua a base de flúor con tecnología Fusso que multiplica por 6 la durabilidad frente a un recubrimiento de vidrio estándar, resistente a limpiaparabrisas, polvo, aceite y detergente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 1 año de hidrorrepelencia con el mantenimiento adecuado, según la marca",
    "tamanosEnvase": [
      "70 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-glaco-glass-compound-roll-on",
    "marca": "Soft99",
    "categoria": "vidrios",
    "nombre": "Glaco Glass Compound Roll On",
    "descripcion": "Compuesto pulidor para vidrio en formato roll-on que remueve manchas y película de tránsito difíciles; preparación recomendada antes de aplicar un recubrimiento de vidrio.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "100 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-fukupika-glass-gel",
    "marca": "Soft99",
    "categoria": "vidrios",
    "nombre": "Fukupika Glass Gel",
    "descripcion": "Limpiavidrios en gel que no gotea ni se dispersa con el viento, penetra en suciedad adherida como excremento de aves; apto también para espejos, plástico sin pintar y goma.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-tire-black-wax",
    "marca": "Soft99",
    "categoria": "llantas_neumaticos",
    "nombre": "Tire Black Wax",
    "descripcion": "Cera sólida con cera mineral y pigmento de carbón ultrafino que devuelve el negro natural y el brillo a neumáticos y molduras plásticas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Aproximadamente 1 mes de duración según uso y condiciones de almacenamiento (FAQ oficial de la marca)",
    "tamanosEnvase": [
      "170 g"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-black-black-hard-coat-for-tire",
    "marca": "Soft99",
    "categoria": "llantas_neumaticos",
    "nombre": "BLACK BLACK -Hard Coat for Tire-",
    "descripcion": "Forma una capa gruesa y resistente sobre el neumático, con brillo alto, efecto no pegajoso y sin salpicado ('no-sling'), de larga duración.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Más de 60 días de protección, según la marca",
    "tamanosEnvase": [
      "110 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "soft99-digloss-black-devil-tire-wax",
    "marca": "Soft99",
    "categoria": "llantas_neumaticos",
    "nombre": "DiGloss Black Devil Tire Wax",
    "descripcion": "Combina carbón negro y carnauba 'blackshine' para un negro natural y brillante en el neumático, protegiendo contra el desteñido UV y el pardeamiento, con resistencia al agua.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Al menos 2 meses de duración, según la marca",
    "tamanosEnvase": [
      "200 ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "koch-chemie-green-star",
    "marca": "Koch-Chemie",
    "categoria": "lavado_exterior",
    "nombre": "Green Star",
    "descripcion": "Limpiador universal alcalino ultraconcentrado, sin fosfatos ni solventes, para exterior, motor, interior y pisos de taller.",
    "diluciones": [
      "1:5 a 1:30 (exterior de vehículo/motor)",
      "1:10 a 1:20 (interior/textiles)",
      "1:40 a 1:120 (pisos de taller/industrial)"
    ],
    "dilucionRecomendada": "1:5 a 1:30 (exterior de vehículo/motor)",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L",
      "5 L",
      "11 kg",
      "22 kg",
      "225 kg"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-nanomagic-shampoo",
    "marca": "Koch-Chemie",
    "categoria": "lavado_exterior",
    "nombre": "NanoMagic Shampoo",
    "descripcion": "Shampoo de alta tecnología que lava, abrillanta y protege en un solo paso, dejando una capa nano hidrorrepelente sin dañar ceras o selladores previos.",
    "diluciones": [
      "Aprox. 50 ml (5 tapitas) cada 10 L de agua, lavado manual con esponja/mitón"
    ],
    "dilucionRecomendada": "Aprox. 50 ml (5 tapitas) cada 10 L de agua, lavado manual con esponja/mitón",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "10 kg"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-insect-dirt-remover",
    "marca": "Koch-Chemie",
    "categoria": "lavado_exterior",
    "nombre": "Insect&Dirt Remover",
    "descripcion": "Desincrustante para insectos, aceite y suciedad ambiental adherida en carrocería y vano motor.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "10 kg"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-prefoam-efficient",
    "marca": "Koch-Chemie",
    "categoria": "lavado_exterior",
    "nombre": "PreFoam efficient",
    "descripcion": "Espuma activa concentrada, alcalina y libre de fosfatos, para prelavado de autos y camiones (clase VDA B).",
    "diluciones": [
      "1:20 (limpieza de insectos)",
      "1:30 (prelavado de autos)",
      "1:15 a 1:20 (prelavado de camiones)"
    ],
    "dilucionRecomendada": "1:20 (limpieza de insectos)",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "20 L",
      "200 L",
      "1000 L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-finish-spray-exterior",
    "marca": "Koch-Chemie",
    "categoria": "lavado_exterior",
    "nombre": "Finish Spray exterior",
    "descripcion": "Spray de detailing rápido para pintura, vidrio y plásticos exteriores; quita manchas de sarro y deja alto brillo sin residuos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-quick-finish",
    "marca": "Koch-Chemie",
    "categoria": "lavado_exterior",
    "nombre": "Quick Finish",
    "descripcion": "Spray todo terreno que limpia, cuida y sella en un solo paso superficies lisas y pintadas (carrocería, vidrio, plásticos).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-felgenreiniger-cl",
    "marca": "Koch-Chemie",
    "categoria": "llantas_neumaticos",
    "nombre": "Felgenreiniger CL",
    "descripcion": "Limpiador de llantas a base de ácido fosfórico y clorhídrico para materiales resistentes a ácidos; remueve polvo de freno incrustado, óxido y sarro.",
    "diluciones": [
      "1:2 a 1:10 (limpieza de llantas)",
      "1:8 a 1:20 (limpieza de boxes/pisos)"
    ],
    "dilucionRecomendada": "1:2 a 1:10 (limpieza de llantas)",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "23 kg",
      "225 kg"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-reactivewheelcleaner",
    "marca": "Koch-Chemie",
    "categoria": "llantas_neumaticos",
    "nombre": "ReactiveWheelCleaner",
    "descripcion": "Limpiador de llantas libre de ácido con indicador de reacción (vira a rojo) y aditivos de brillo, para llantas de alta gama.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.75 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-felgenreiniger-extrem",
    "marca": "Koch-Chemie",
    "categoria": "llantas_neumaticos",
    "nombre": "Felgenreiniger extrem",
    "descripcion": "Limpiador de llantas extremadamente ácido (base clorhídrica) para suciedad muy incrustada en materiales resistentes.",
    "diluciones": [
      "1:2 a 1:10 según nivel de suciedad"
    ],
    "dilucionRecomendada": "1:2 a 1:10 según nivel de suciedad",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "11 kg",
      "22 kg",
      "225 kg"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-pol-star",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "Pol Star",
    "descripcion": "Limpiador neutro con protección para tapizados de tela, cuero y alcantara; espuma de poro fino que extrae la suciedad sin dejar marcas de agua.",
    "diluciones": [
      "1:5 a 1:20 según nivel de suciedad"
    ],
    "dilucionRecomendada": "1:5 a 1:20 según nivel de suciedad",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L",
      "5 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-mehrzweckreiniger",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "Mehrzweckreiniger",
    "descripcion": "Limpiador intensivo alcalino multiuso para aceite, grasa, tinta, hollín y suciedad general en habitáculo y superficies alcalino-resistentes.",
    "diluciones": [
      "1:5 a 1:50 según nivel de suciedad"
    ],
    "dilucionRecomendada": "1:5 a 1:50 según nivel de suciedad",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L",
      "11 kg",
      "21 kg",
      "225 kg"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-allround-leather-cleaner",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "Allround Leather Cleaner",
    "descripcion": "Limpiador de vinilo, símil cuero y cuero liso sin dejar residuos ni marcas, con efecto de refresco de color.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "No especificado con precisión en la ficha oficial (unidad de venta indicada como '10 STK')"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-leather-star",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "Leather Star",
    "descripcion": "Acondicionador premium de cuero liso, gamuza y cuero perforado; da un acabado semi-mate, revitaliza y protege sin dejar sensación resbaladiza.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-refreshcockpitcare",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "RefreshCockpitCare",
    "descripcion": "Protector de plásticos del habitáculo (tablero, paneles) que limpia, cuida y filtra rayos UV dejando aspecto renovado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.5 L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-hydro-plast-care",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "Hydro Plast Care",
    "descripcion": "Concentrado de cuidado de plásticos y goma a base de agua, sin solventes, con nivel de brillo ajustable según dilución y protección UV.",
    "diluciones": [
      "Puro o 1:1 = brillo alto",
      "1:2 = brillo medio",
      "1:3 = satinado",
      "1:4 = aspecto natural"
    ],
    "dilucionRecomendada": "Puro o 1:1 = brillo alto",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "1 L",
      "5 L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-glass-cleaner",
    "marca": "Koch-Chemie",
    "categoria": "interior",
    "nombre": "Glass Cleaner",
    "descripcion": "Limpiavidrios listo para usar para todas las superficies lisas del vehículo (vidrios, espejos); escurre rápido y sin rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "10 L",
      "20 L",
      "200 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-heavy-cut-h9-02",
    "marca": "Koch-Chemie",
    "categoria": "pulido_correccion",
    "nombre": "Heavy Cut H9.02",
    "descripcion": "Pulimento de corte grueso libre de silicona (índice oficial Abrasión 9.0 / Brillo 6.0), para repaso rápido de pintura muy deteriorada, rayas profundas y marcas de lija de hasta grano 1200. Es la ficha vigente que sucede al histórico H8.02.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.25 L",
      "1 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-micro-cut-finish-p3-01",
    "marca": "Koch-Chemie",
    "categoria": "pulido_correccion",
    "nombre": "Micro Cut & Finish P3.01",
    "descripcion": "Micropulido de última generación (índice oficial Corte 3.2 / Brillo 9.5) que remueve hologramas, rayas finas y marcas de lija hasta grano P3000 sellando con carnauba y siliconas no volátiles. Es la ficha vigente que sucede al histórico Finish Polish 3.02.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.25 L",
      "1 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-micro-cut-m3-02",
    "marca": "Koch-Chemie",
    "categoria": "pulido_correccion",
    "nombre": "Micro Cut M3.02",
    "descripcion": "Micropulido ultra fino (índice oficial Corte 3.2 / Brillo 9.0), libre de silicona, para acabado espejo incluso en colores oscuros bajo luz exigente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.25 L",
      "1 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-one-cut-foam-pad",
    "marca": "Koch-Chemie",
    "categoria": "pulido_correccion",
    "nombre": "One Cut Foam Pad",
    "descripcion": "Boina de espuma de abrasividad media (25 mm de alto) para retrabajo de intemperismo moderado y rayas, para pulidora rotativa u orbital.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Ø76mm",
      "Ø126mm",
      "Ø150mm",
      "pack 5x Ø45mm"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-nanomagic-twin-wax",
    "marca": "Koch-Chemie",
    "categoria": "proteccion_sellado",
    "nombre": "NanoMagic Twin Wax",
    "descripcion": "Cera de conservación de alta tecnología: protección, brillo profundo, hidrorrepelencia duradera (efecto loto) y secado sin gotas; apta para aplicación en frío, caliente o en espuma.",
    "diluciones": [
      "Sin diluir o hasta 1:4 (con bomba dosificadora)",
      "1:200 a 1:500 (autolavados manuales)"
    ],
    "dilucionRecomendada": "1:200 a 1:500 (autolavados manuales)",
    "rendimientoEstimado": "Dosis recomendada por vehículo: 12-18 ml (cera caliente/fría), 12-18 ml (cera espuma), 15-22 ml (cera premium)",
    "tamanosEnvase": [
      "20 L",
      "210 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-nanomagic-polish",
    "marca": "Koch-Chemie",
    "categoria": "proteccion_sellado",
    "nombre": "NanoMagic Polish",
    "descripcion": "Microemulsión de alta espuma que limpia y protege con brillo profundo duradero; funciona como pulido de espuma con brillo o shampoo con cepillo, apta también para capotas de lona.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Dosis recomendada por vehículo: 10-20 ml (pulido de espuma) o 5-10 ml (uso como shampoo)",
    "tamanosEnvase": [
      "21 kg",
      "210 kg"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-wetgloss",
    "marca": "Koch-Chemie",
    "categoria": "proteccion_sellado",
    "nombre": "WetGloss",
    "descripcion": "Sellador húmedo de alto rendimiento para toda la carrocería; superficie muy lisa, brillante e hidrofóbica, usable solo o como capa final sobre un cerámico.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Aprox. 250 ml por vehículo (según tamaño)",
    "tamanosEnvase": [
      "0.5 L",
      "5 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-1k-nano",
    "marca": "Koch-Chemie",
    "categoria": "proteccion_sellado",
    "nombre": "1K-Nano",
    "descripcion": "Sellador nano de pintura de un solo componente, forma una capa espejo lisa resistente a químicos, UV y abrasión; según la marca dura aprox. 1 año (hasta 3 con mantenimiento adecuado).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "75 ml del envase de 250 ml suele alcanzar para un vehículo mediano (según la marca)",
    "tamanosEnvase": [
      "0.25 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-motorplast",
    "marca": "Koch-Chemie",
    "categoria": "proteccion_sellado",
    "nombre": "Motorplast",
    "descripcion": "Protector desplazante de agua para vano motor, mangueras de goma y componentes del motor; deja brillo natural y film elástico anticorrosivo (resiste hasta 250°C).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.5 L",
      "5 L",
      "20 L",
      "200 L"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "koch-chemie-clay-spray",
    "marca": "Koch-Chemie",
    "categoria": "accesorios_consumibles",
    "nombre": "Clay Spray",
    "descripcion": "Lubricante suave y de bajo residuo para descontaminación con arcilla (clay bar) o paño de clay, sin dejar film ni dañar el material del clay.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "0.5 L",
      "10 L"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-clay-pad",
    "marca": "Koch-Chemie",
    "categoria": "accesorios_consumibles",
    "nombre": "Clay Pad",
    "descripcion": "Almohadilla de descontaminación reutilizable para uso con pulidora (rotativa u orbital), alternativa a la arcilla tradicional que ahorra tiempo; diámetro 150 mm.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "1 unidad (150 mm)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-coating-towel",
    "marca": "Koch-Chemie",
    "categoria": "accesorios_consumibles",
    "nombre": "Coating Towel",
    "descripcion": "Paño de microfibra cortado por ultrasonido (80% poliéster / 20% poliamida, 300 g/m²) diseñado para pulir el excedente de selladores y cerámicos sin rayar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Set de 5",
      "40x40 cm"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-drying-towel",
    "marca": "Koch-Chemie",
    "categoria": "accesorios_consumibles",
    "nombre": "Drying Towel",
    "descripcion": "Paño absorbente con estructura gofrada para secado rápido y sin marcas de pintura, vidrio y plástico tras el lavado.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Set de 2",
      "80x55 cm"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "koch-chemie-polish-and-sealing-towel",
    "marca": "Koch-Chemie",
    "categoria": "accesorios_consumibles",
    "nombre": "Polish and Sealing Towel",
    "descripcion": "Paño de microfibra premium sin costuras, cortado por ultrasonido, con dos caras de textura distinta; pensado para aplicar/retirar el sellador 1K-Nano con acabado sin rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Set de 5",
      "40x40 cm"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-mr-pink-super-suds-shampoo",
    "marca": "Chemical Guys",
    "categoria": "lavado_exterior",
    "nombre": "Mr. Pink Super Suds Shampoo",
    "descripcion": "Shampoo de pH balanceado que genera espuma abundante para levantar tierra y grasa sin dañar ceras, sellador ni recubrimientos cerámicos.",
    "diluciones": [
      "1 a 3 oz por balde de 5 galones (~19 L) de agua"
    ],
    "dilucionRecomendada": "1 a 3 oz por balde de 5 galones (~19 L) de agua",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "946 ml (32 oz)",
      "1.89 L (64 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-honeydew-snow-foam-auto-wash",
    "marca": "Chemical Guys",
    "categoria": "lavado_exterior",
    "nombre": "Honeydew Snow Foam Auto Wash",
    "descripcion": "Shampoo de alta tecnología que genera una espuma extrema en cañón o pistola de espuma, lubricando la superficie para evitar rayones durante el lavado.",
    "diluciones": [
      "Balde: 1 a 3 oz por balde de 5 galones (~19 L)",
      "Cañón/pistola de espuma: 1 a 3 oz por tanque de 32 oz"
    ],
    "dilucionRecomendada": "Balde: 1 a 3 oz por balde de 5 galones (~19 L)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "1.89 L (64 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-citrus-wash-gloss",
    "marca": "Chemical Guys",
    "categoria": "lavado_exterior",
    "nombre": "Citrus Wash & Gloss",
    "descripcion": "Shampoo hiperconcentrado con realzador de brillo cítrico que resalta un brillo vibrante en todos los colores de pintura.",
    "diluciones": [
      "1 a 3 oz por tanque de 32 oz (cañón/pistola de espuma)"
    ],
    "dilucionRecomendada": "1 a 3 oz por tanque de 32 oz (cañón/pistola de espuma)",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "1.89 L (64 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-all-clean-all-purpose-cleaner-degreaser",
    "marca": "Chemical Guys",
    "categoria": "apc_desengrasante",
    "nombre": "All Clean+ All Purpose Cleaner & Degreaser",
    "descripcion": "Desengrasante multiuso concentrado que ataca grasa y aceite adherido, diluible para limpiar vinilo, alfombras, motor, plástico y llantas.",
    "diluciones": [
      "Uso exterior: 10 partes de agua por 1 parte de producto",
      "Uso interior: 20 partes de agua por 1 parte de producto"
    ],
    "dilucionRecomendada": "Uso exterior: 10 partes de agua por 1 parte de producto",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-nonsense-invinsible-super-cleaner",
    "marca": "Chemical Guys",
    "categoria": "apc_desengrasante",
    "nombre": "Nonsense Invinsible Super Cleaner",
    "descripcion": "Limpiador multiuso incoloro e inodoro que elimina suciedad y manchas de prácticamente cualquier superficie del interior, llantas y más.",
    "diluciones": [
      "Aproximadamente 20:1 con agua destilada, ajustable según la suciedad"
    ],
    "dilucionRecomendada": "Aproximadamente 20:1 con agua destilada, ajustable según la suciedad",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "946 ml (32 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-leather-cleaner",
    "marca": "Chemical Guys",
    "categoria": "interior",
    "nombre": "Leather Cleaner",
    "descripcion": "Limpiador suave que remueve tierra, grasa, aceites corporales, sudor, residuos de comida y manchas leves de cuero natural, cuero sellado y cuero sintético.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "946 ml (32 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-leather-conditioner",
    "marca": "Chemical Guys",
    "categoria": "interior",
    "nombre": "Leather Conditioner",
    "descripcion": "Crema que hidrata en profundidad y revitaliza el cuero, protegiéndolo del desgaste diario y manteniendo su textura suave y flexible.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-total-interior-cleaner-protectant",
    "marca": "Chemical Guys",
    "categoria": "interior",
    "nombre": "Total Interior Cleaner & Protectant",
    "descripcion": "Limpia y protege prácticamente cualquier superficie del interior del auto, con protección UV que ayuda a prevenir el desteñido, sin dejar rayas ni residuo graso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "946 ml (32 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-lightning-fast-stain-extractor-for-fabric",
    "marca": "Chemical Guys",
    "categoria": "interior",
    "nombre": "Lightning Fast Stain Extractor for Fabric",
    "descripcion": "Spray líquido 2 en 1 que elimina manchas difíciles de grasa, tierra y mugre en tapizados de tela, alfombras y tapizados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-signature-series-glass-cleaner-ammonia-free-spray",
    "marca": "Chemical Guys",
    "categoria": "interior",
    "nombre": "Signature Series Glass Cleaner Ammonia Free Spray",
    "descripcion": "Limpiavidrios libre de amoníaco que corta grasa, tierra y suciedad para dejar los vidrios del auto con claridad libre de rayas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-diablo-wheel-gel-oxygen-infused-foam-wheel-and-rim-cleaner",
    "marca": "Chemical Guys",
    "categoria": "llantas_neumaticos",
    "nombre": "Diablo Wheel Gel (Oxygen Infused Foam Wheel and Rim Cleaner)",
    "descripcion": "Limpiador de llantas con pH balanceado y espuma infusionada con oxígeno que limpia de forma segura cualquier acabado de llanta sin causar daño.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz gel concentrado)",
      "3.78 L (1 galón gel concentrado)",
      "473 ml (16 oz listo para usar en spray)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-signature-series-wheel-cleaner",
    "marca": "Chemical Guys",
    "categoria": "llantas_neumaticos",
    "nombre": "Signature Series Wheel Cleaner",
    "descripcion": "Limpiador de llantas a base de cítricos, duro contra el polvo de freno y la mugre pero suave y seguro para la mayoría de los acabados y materiales de llanta.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-silk-shine-vinyl-rubber-plastic-satin-protectant-dressing",
    "marca": "Chemical Guys",
    "categoria": "llantas_neumaticos",
    "nombre": "Silk Shine Vinyl, Rubber, Plastic Satin Protectant Dressing",
    "descripcion": "Dressing a base de agua que restaura un aspecto como nuevo con acabado satinado en vinilo, goma y plástico interior y exterior, sin dejar aspecto grasoso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)",
      "3.78 L (1 galón)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-total-extract-tire-rubber-cleaner",
    "marca": "Chemical Guys",
    "categoria": "llantas_neumaticos",
    "nombre": "Total Extract Tire & Rubber Cleaner",
    "descripcion": "Limpiador de neumáticos y goma que elimina tierra, manchado (blooming), mugre, decoloración y acumulación de dressing viejo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-butter-wet-wax",
    "marca": "Chemical Guys",
    "categoria": "proteccion_sellado",
    "nombre": "Butter Wet Wax",
    "descripcion": "Cera de carnauba de textura cremosa que entrega un brillo cálido y profundo en minutos, protegiendo contra los rayos UV con un acabado libre de marcas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-jetseal-durable-sealant-and-paint-protectant",
    "marca": "Chemical Guys",
    "categoria": "proteccion_sellado",
    "nombre": "JetSeal Durable Sealant and Paint Protectant",
    "descripcion": "Sellador de polímero nanotecnológico desarrollado originalmente para exteriores de aviones, que protege contra los elementos más duros dejando un brillo vidrioso.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 1 año de protección por aplicación, según la marca",
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-hybrid-v07-optical-select-high-gloss-liquid-wax",
    "marca": "Chemical Guys",
    "categoria": "proteccion_sellado",
    "nombre": "Hybrid V07 Optical Select High Gloss Liquid Wax",
    "descripcion": "Cera híbrida líquida que combina carnauba natural con tecnología de sellador sintético para un brillo profundo tipo 'pintura mojada' y protección UV duradera.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-v34-optical-grade-hybrid-compound",
    "marca": "Chemical Guys",
    "categoria": "pulido_correccion",
    "nombre": "V34 Optical Grade Hybrid Compound",
    "descripcion": "Compuesto refinador de grado medio que elimina defectos e imperfecciones de pintura leves a moderados; paso intermedio del sistema de corrección de la línea V.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "118 ml (4 oz)",
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-v36-optical-grade-cutting-polish",
    "marca": "Chemical Guys",
    "categoria": "pulido_correccion",
    "nombre": "V36 Optical Grade Cutting Polish",
    "descripcion": "Micro-abrasivos avanzados que dejan un acabado suave y brillante sin rellenos, para eliminar remolinos y rayones con pulidora orbital o rotativa.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "118 ml (4 oz)",
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-v38-optical-grade-final-polish",
    "marca": "Chemical Guys",
    "categoria": "pulido_correccion",
    "nombre": "V38 Optical Grade Final Polish",
    "descripcion": "Pulido de acabado ultra refinado que perfecciona la pintura después de los pasos de corte y pulido más agresivos, aportando el máximo brillo, claridad y profundidad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "118 ml (4 oz)",
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-v4-all-in-one-compound-polish",
    "marca": "Chemical Guys",
    "categoria": "pulido_correccion",
    "nombre": "V4 All-in-One Compound Polish",
    "descripcion": "Pule y sella en un solo paso: corta imperfecciones leves, rayones y remolinos, termina como un pulido fino y deja una capa de protección.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-hydroslick-intense-gloss-sio2-ceramic-coating-hyperwax",
    "marca": "Chemical Guys",
    "categoria": "ceramicos",
    "nombre": "HydroSlick Intense Gloss SiO2 Ceramic Coating HyperWax",
    "descripcion": "Recubrimiento cerámico verdadero en formato gel que se aplica como una cera pero entrega protección, brillo e hidrofobia de nivel cerámico.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 1 año de protección por aplicación, según la marca",
    "tamanosEnvase": [
      "473 ml (16 oz)"
    ],
    "prioridadSugerida": "Alta"
  },
  {
    "id": "chemical-guys-carbon-force-ceramic-protective-paint-coating-system",
    "marca": "Chemical Guys",
    "categoria": "ceramicos",
    "nombre": "Carbon Force Ceramic Protective Paint Coating System",
    "descripcion": "Recubrimiento cerámico con nanotecnología que crea una capa de defensa duradera contra los elementos, con propiedades hidrofóbicas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Hasta 5 años de protección, según la marca",
    "tamanosEnvase": [
      "Kit único (la marca no publica variantes de tamaño)"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-woolly-mammoth-microfiber-drying-towel-36-x-25",
    "marca": "Chemical Guys",
    "categoria": "accesorios_consumibles",
    "nombre": "Woolly Mammoth Microfiber Drying Towel 36\" x 25\"",
    "descripcion": "Toalla de microfibra ultra absorbente de gran tamaño y grosor premium que seca el vehículo en una o dos pasadas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "36\" x 25\" (91 x 64 cm)",
      "colores gris o azul"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-workhorse-professional-grade-microfiber-towel-3-pack",
    "marca": "Chemical Guys",
    "categoria": "accesorios_consumibles",
    "nombre": "Workhorse Professional-Grade Microfiber Towel (3 Pack)",
    "descripcion": "Toalla de uso diario del detallador profesional, hecha con mezcla de microfibra suave, para tareas de fregado, secado y limpieza.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "16\" x 16\" (40 x 40 cm)",
      "pack x3",
      "colores azul",
      "tostado o negro"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "chemical-guys-chenille-microfiber-car-wash-mitt",
    "marca": "Chemical Guys",
    "categoria": "accesorios_consumibles",
    "nombre": "Chenille Microfiber Car Wash Mitt",
    "descripcion": "Guante de microfibra chenille extra mullido que retiene abundante agua jabonosa para un lavado suave que minimiza micro-rayones y remolinos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "Unidad",
      "también disponible en pack x2"
    ],
    "prioridadSugerida": "Media"
  },
  {
    "id": "menzerna-super-heavy-cut-compound-300",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Super Heavy Cut Compound 300",
    "descripcion": "Compound de corte máximo (índice Corte/Brillo oficial 10/6) para eliminar marcas de lija de grano 1200 y defectos profundos sin solventes agresivos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-super-heavy-cut-compound-300-green-line",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Super Heavy Cut Compound 300 GREEN LINE",
    "descripcion": "Versión libre de VOC del corte máximo (índice Corte/Brillo oficial 10/6), remueve marcas de lija de grano 1200 sin solventes peligrosos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-heavy-cut-compound-400",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Heavy Cut Compound 400",
    "descripcion": "Compound de corte pesado en un solo paso (índice Corte/Brillo oficial 8/8) que remueve rayas y marcas de lija dejando brillo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-heavy-cut-compound-400-green-line",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Heavy Cut Compound 400 GREEN LINE",
    "descripcion": "Versión libre de VOC del corte pesado en un paso (índice Corte/Brillo oficial 8/8), sin olores molestos.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-cut-force-pro",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Cut Force Pro",
    "descripcion": "Compound de alto rendimiento (índice Corte/Brillo oficial 9/9) para remover rayas, marcas de lija y desgaste a máxima velocidad.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-heavy-cut-compound-1000",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Heavy Cut Compound 1000",
    "descripcion": "Compound de corte pesado (índice Corte/Brillo oficial 9/3) optimizado para boinas de espuma, mejor relación precio/rendimiento del segmento Heavy Cut.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-heavy-cut-compound-1100",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Heavy Cut Compound 1100",
    "descripcion": "Compound de corte pesado (índice Corte/Brillo oficial 8/5) optimizado para boinas de lana, remueve rayas profundas de forma permanente.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-medium-cut-polish-2000",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Medium Cut Polish 2000",
    "descripcion": "Pulido de corte medio (índice Corte/Brillo oficial 5/6), sin silicona, elimina marcas de compound y rayas de lavadero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-one-step-polish-3in1",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "One-Step Polish 3in1",
    "descripcion": "Pulido de corte medio en un solo paso (índice Corte/Brillo oficial 5/9) que pule, abrillanta y sella (cera de carnaúba) a la vez.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-medium-cut-polish-2400",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Medium Cut Polish 2400",
    "descripcion": "Pulido líquido de corte medio (índice Corte/Brillo oficial 5/8) pensado para pinturas viejas o pinturas blandas ('sticky paint').",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-medium-cut-polish-2500",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Medium Cut Polish 2500",
    "descripcion": "Pulido de corte medio con abrillantado (índice Corte/Brillo oficial 5/7), combina remoción de marcas de lija y brillo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-final-finish-3000",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Final Finish 3000",
    "descripcion": "Pulido de alto brillo clásico (índice Corte/Brillo oficial 3/9), antiholograma, elimina swirls y rayas de lavadero.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-super-finish-3500",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Super Finish 3500",
    "descripcion": "Pulido de alto brillo para acabado espejo (índice Corte/Brillo oficial 3/10), ideal en pinturas negras y oscuras.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-super-finish-plus-3800",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Super Finish Plus 3800",
    "descripcion": "Pulido de máximo brillo profundo (índice Corte/Brillo oficial 2/10), remueve microrrayas y hologramas en pinturas oscuras.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-power-protect-ultra-2in1",
    "marca": "Menzerna",
    "categoria": "pulido_correccion",
    "nombre": "Power Protect Ultra 2in1",
    "descripcion": "Pulido de alto brillo 2 en 1 (índice Corte/Brillo oficial 2/10) que abrillanta y sella con cera de carnaúba sin silicona en un solo producto.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "menzerna-power-lock-ultimate-protection",
    "marca": "Menzerna",
    "categoria": "proteccion_sellado",
    "nombre": "Power Lock Ultimate Protection",
    "descripcion": "Sellador polimérico (polymer sealant) sintético para clearcoat, sella la pintura y genera efecto de beading; vida útil declarada de 6 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": null,
    "tamanosEnvase": [
      "250ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-one-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² One Evo",
    "descripcion": "Recubrimiento cerámico de pintura de nivel inicial, fácil de aplicar y remover, con protección real, mayor brillo y repelencia al agua; vida útil real publicada de hasta 24 meses / 25.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 25-30 ml/auto (aprox. 1 vehículo por envase de 30ml)",
    "tamanosEnvase": [
      "30ml",
      "50ml",
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-pure-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Pure Evo",
    "descripcion": "Recubrimiento cerámico puro de SiO2 en una capa para pintura, de acabado espeso, brillante y muy resistente; vida útil real publicada de hasta 36 meses / 40.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 25-30 ml/auto (aprox. 1 vehículo por envase de 30ml)",
    "tamanosEnvase": [
      "30ml",
      "50ml",
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-mohs-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Mohs Evo",
    "descripcion": "Recubrimiento cerámico de polisilazanos modificados para pintura, con autolimpieza, protección UV y repelencia al agua; vida útil real publicada de hasta 36 meses/40.000 km (1 capa) o 48 meses/50.000 km (2 capas).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 15-25 ml/auto",
    "tamanosEnvase": [
      "30ml",
      "50ml",
      "100ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-matte-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Matte Evo",
    "descripcion": "Recubrimiento cerámico transparente para pintura mate/satinada, PPF y vinilo, sin alterar el acabado original; vida útil real publicada de hasta 24 meses / 30.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30-50 ml/auto",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-syncro-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Syncro Evo",
    "descripcion": "Sistema cerámico de pintura en dos etapas (base Q² Mohs Evo + tope Q² Skin Evo) para máxima durabilidad, brillo y repelencia al agua, pensado para autos oscuros; vida útil real publicada de hasta 50 meses / 50.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 15-25 ml/auto (por cada componente del kit)",
    "tamanosEnvase": [
      "Kit 30ml + 30ml",
      "Kit 50ml + 50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-cancoat-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² CanCoat Evo",
    "descripcion": "Recubrimiento cerámico en formato spray, de aplicación simple (rociar y paño), apto para pintura, plásticos exteriores, metal, llantas y vidrios laterales/traseros; vida útil real publicada de hasta 12 meses / 12.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 10-15 ml/auto (varias aplicaciones completas por envase)",
    "tamanosEnvase": [
      "200ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-cancoat-pro-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² CanCoat Pro Evo",
    "descripcion": "Tope rápido en spray para detailers certificados Gyeon: potencia brillo e hidrofobia sobre los recubrimientos de la línea profesional y renueva el aspecto de superficies Q² Infinite; vida útil real publicada de más de 12 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 10-15 ml/auto",
    "tamanosEnvase": [
      "200ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-flash-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Flash Evo",
    "descripcion": "Recubrimiento cerámico de curado ultra rápido para pintura, pensado para servicios móviles/profesionales con mínimo tiempo de espera antes de exponerse a lluvia; la marca indica vida útil real \"dependiente del sistema y uso\", sin cifra fija.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto (1 vehículo por envase)",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-infinite-base-type-1",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Infinite Base Type 1",
    "descripcion": "Recubrimiento cerámico profesional de polisilazanos fluoro-modificados para pintura, exclusivo para detailers certificados Gyeon; se usa solo o como base de un sistema en capas. Vida útil real publicada: \"dependiente del sistema y uso\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto (1 vehículo por envase)",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-infinite-base-type-2",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Infinite Base Type 2",
    "descripcion": "Recubrimiento cerámico profesional de alta concentración de SiO2 para pintura, con mayor tiempo de trabajo (hasta 20 min) y acabado profundo, exclusivo para detailers certificados Gyeon. Vida útil real publicada: \"dependiente del sistema y uso\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto (1 vehículo por envase)",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-infinite-topcoat-type-1",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Infinite TopCoat Type 1",
    "descripcion": "Tope profesional que potencia el efecto hidrofóbico y la durabilidad de las bases Q² Infinite certificadas, exclusivo para detailers certificados Gyeon. Vida útil real publicada: \"dependiente del sistema y uso\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto (1 vehículo por envase)",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-infinite-topcoat-type-2",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Infinite TopCoat Type 2",
    "descripcion": "Tope profesional que aumenta la deslizabilidad de la superficie y la resistencia a manchas químicas de las bases Q² Infinite certificadas, exclusivo para detailers certificados Gyeon. Vida útil real publicada: \"dependiente del sistema y uso\".",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto (1 vehículo por envase)",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-ppf-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² PPF Evo",
    "descripcion": "Recubrimiento cerámico creado específicamente para film de protección de pintura (PPF), mejora la resistencia a manchas, suciedad y rayos UV; vida útil real publicada de hasta 24 meses / 25.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30-50 ml/auto",
    "tamanosEnvase": [
      "50ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-fabriccoat",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² FabricCoat",
    "descripcion": "Recubrimiento cerámico hidrorrepelente para telas y textiles del auto (asientos, alfombras, capotas convertibles), mantiene la transpirabilidad y el aspecto original; protección publicada de hasta 6 meses.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: aprox. 80 ml por m² de tela",
    "tamanosEnvase": [
      "120ml",
      "400ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-rim-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Rim Evo",
    "descripcion": "Recubrimiento cerámico dedicado a llantas/rines, protege contra polvo de freno, suciedad de ruta y altas temperaturas (resiste más de 800°C según la marca); vida útil real publicada de hasta 18 meses / 45.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 15-20 ml por juego de llantas",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-view-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² View Evo",
    "descripcion": "Recubrimiento cerámico de larga duración para vidrios, mejora la visibilidad en lluvia y reduce la dependencia del limpiaparabrisas a alta velocidad; vida útil real publicada de hasta 24 meses / 50.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 20 ml/auto (1 vehículo por envase)",
    "tamanosEnvase": [
      "20ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-quickview",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² QuickView",
    "descripcion": "Sellador cerámico de vidrios de aplicación rápida (sin curado extendido), mejora la visibilidad en condiciones de lluvia; vida útil real publicada de hasta 6 meses (la marca también menciona \"pocas semanas\" según uso y clima).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto",
    "tamanosEnvase": [
      "120ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-trim-evo",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Trim Evo",
    "descripcion": "Recubrimiento cerámico para restaurar y proteger plásticos exteriores/molduras (texturados, sin pintar o barnizados), realza el color y frena el envejecimiento por UV y químicos, dejando acabado mate/satinado; vida útil real publicada de hasta 36 meses / 50.000 km.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 10 ml/auto (aprox. 3 vehículos por envase de 30ml)",
    "tamanosEnvase": [
      "30ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2-tire",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q² Tire",
    "descripcion": "Sellador para neumáticos, posicionado por la marca entre las ceras/dressings tradicionales y los recubrimientos cerámicos; se une al caucho y mantiene el aspecto oscuro por más tiempo; vida útil real publicada de hasta 6 lavados.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 10-15 ml por juego (set) de neumáticos",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-cure-redefined",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q²M Cure Redefined",
    "descripcion": "Spray sellador cerámico a base de sílice para mantenimiento de superficies con o sin recubrimiento, potencia brillo y repelencia al agua; vida útil real publicada de más de 6 semanas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto",
    "tamanosEnvase": [
      "100ml",
      "250ml",
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-cure-matte-redefined",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q²M Cure Matte Redefined",
    "descripcion": "Spray de mantenimiento a base de sílice desarrollado específicamente para pinturas mate: protege y realza el color sin agregar brillo; vida útil real publicada de más de 6 semanas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 30 ml/auto",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-ceramicdetailer",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q²M CeramicDetailer",
    "descripcion": "Detailer rápido a base de SiO2 para el mantenimiento de autos con recubrimiento cerámico, potencia brillo, deslizamiento e hidrofobia; vida útil real publicada de hasta 6 semanas.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 40-50 ml/auto",
    "tamanosEnvase": [
      "500ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-wetcoat",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q²M WetCoat",
    "descripcion": "Spray potenciador instantáneo de hidrofobia (\"booster\"), de aplicación rociar-y-enjuagar, capa protectora temporal para mantenimiento entre lavados; protección publicada de hasta 12 semanas según condiciones.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: aprox. 80 ml/auto",
    "tamanosEnvase": [
      "500ml",
      "1L",
      "4L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-wetcoat-essence",
    "marca": "Gyeon",
    "categoria": "proteccion_sellado",
    "nombre": "Q²M WetCoat Essence",
    "descripcion": "Versión concentrada y diluible de Q²M WetCoat: sellador rociar-y-enjuagar con efecto perlado instantáneo, apto para autos con o sin recubrimiento cerámico; protección publicada de hasta 12 semanas según condiciones.",
    "diluciones": [
      "1:5 (más concentrado)",
      "1:10",
      "1:15 (más diluido, mayor rendimiento)"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": "No publicado (el rendimiento por envase depende de la dilución elegida, 1:5 a 1:15)",
    "tamanosEnvase": [
      "100ml",
      "250ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-prep",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M Prep",
    "descripcion": "Desengrasante dedicado de pre-recubrimiento (\"pre-coating degreaser\"): remueve residuos oleosos, aceites de pulido y restos de cera de la pintura antes de aplicar un cerámico. Sin dato de vida útil publicado (es un preparatorio, no un sellador).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 150 ml/auto",
    "tamanosEnvase": [
      "500ml",
      "1L",
      "4L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-iron-redefined",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M Iron Redefined",
    "descripcion": "Removedor ferroso de acción rápida, pH neutro, para descontaminar pintura, llantas y otras superficies de partículas de hierro (polvo de freno, partículas ferrosas de vía) antes de pulir o encerar.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: aprox. 150 ml/auto",
    "tamanosEnvase": [
      "500ml",
      "1L",
      "4L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-tar-redefined",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M Tar Redefined",
    "descripcion": "Removedor de alquitrán/brea seguro para carrocería, pH neutro: disuelve alquitrán, asfalto y contaminación orgánica en pintura, vidrio y molduras plásticas, sin dañar recubrimientos existentes.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: 100 ml/auto",
    "tamanosEnvase": [
      "500ml",
      "1L",
      "4L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-totalremover",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M TotalRemover",
    "descripcion": "Removedor químico de ceras, selladores y recubrimientos viejos (\"a cierto nivel\") para preparar la superficie antes de aplicar un nuevo cerámico, sin necesidad de pulir; la marca confirma que es apto para pintura mate.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml",
      "1L"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-claylube-redefined",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M ClayLube Redefined",
    "descripcion": "Lubricante concentrado y ultra deslizante para descontaminación con barra de arcilla (clay bar), pH neutro, compatible con todo tipo de arcillas, telas y discos de clay.",
    "diluciones": [
      "Puro / sin diluir",
      "Hasta 1:25 diluido"
    ],
    "dilucionRecomendada": "Sin recomendación oficial",
    "rendimientoEstimado": "No publicado",
    "tamanosEnvase": [
      "500ml"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-clay-bars",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M Clay Bars",
    "descripcion": "Barras de arcilla para descontaminación completa de la pintura (remueve alquitrán, contaminación industrial y orgánica que el lavado no saca), disponibles en Coarse Evo (contaminación pesada) y Mild Evo (mantenimiento regular, segura en toda pintura).",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: aprox. 20 g/auto (una barra de 100g rendiría aprox. 5 vehículos según nivel de contaminación)",
    "tamanosEnvase": [
      "100g (Coarse Evo)",
      "100g (Mild Evo)"
    ],
    "prioridadSugerida": null
  },
  {
    "id": "gyeon-q2m-iron-wheelcleaner-redefined",
    "marca": "Gyeon",
    "categoria": "accesorios_consumibles",
    "nombre": "Q²M Iron WheelCleaner Redefined",
    "descripcion": "Limpiador dedicado de llantas en gel, pH neutro, que remueve grasa, suciedad y polvo de freno (contaminación ferrosa) de forma segura en llantas con o sin recubrimiento cerámico; paso previo típico antes de aplicar Q² Rim Evo.",
    "diluciones": [
      "Puro"
    ],
    "dilucionRecomendada": "Puro",
    "rendimientoEstimado": "Consumo publicado: aprox. 100 ml/auto",
    "tamanosEnvase": [
      "500ml",
      "1L",
      "4L"
    ],
    "prioridadSugerida": null
  }
];


// Estantería real: arranca vacía. La lista de fantasía anterior (con
// niveles de stock de ejemplo) se sacó junto con el catálogo viejo — cada
// taller carga acá su stock real desde "Agregar Insumo".
export const misInsumosIniciales = [];
