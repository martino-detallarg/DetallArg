// data/ppfPanelMatrix.js
//
// Matriz de referencia de m2 por panel para el presupuesto de PPF, por tipo/subdivision de
// vehiculo. NO son medidas de fabrica ni de cada modelo puntual -- son una ESTIMACION.
//
// Cada key de `paneles` es EXACTAMENTE el id real y tocable de los diagramas de check-in de
// components/diagrams/vehicles (namespaced "<vista>__<zonaId>", igual que arma
// crearVistaDesdeZonas en ImageZoneDiagram.js a partir de cada assets/checkin-diagrams/<tipo>/
// <subdivision>/<vista>/zonas.json) -- así el selector de paneles de PPF puede reusar esos mismos
// diagramas 1 a 1, sin re-vectorizar nada ni mantener un segundo mapa de ids. Los ids de zona de
// "vidrio" (parabrisas, lunetas, ventanillas) quedan afuera a propósito: PPF no cubre vidrio.
//
// Origen del numero: se partio de la matriz original (armada antes de tener los zonas.json reales
// a la vista, con paneles "izq"/"der" inventados) y se remapeo cada valor a los paneles reales
// tocables de cada subdivision, con estas reglas fijas (pedido de Augusto, ver conversación del
// 8/9):
//   1) Una zona LATERAL sin sufijo _izq/_der (ej. "puerta_delantera", "guardabarro_delantero",
//      "panel_carga", "cola") representa AMBOS lados combinados -- tocarla una vez carga el m2 de
//      las 2 piezas simétricas, porque la silueta lateral es una única vista representativa del
//      costado del vehículo, no de un lado puntual.
//   2) Un panel físico que aparece en MÁS DE UNA vista (ej. "parante_izq"/"parante_der" en Frente
//      Y en Cenital -- son el mismo parante visto desde dos ángulos, ver el comentario de
//      ImageZoneDiagram.js) recibe el MISMO valor de m2 en cada vista donde aparece tocable, no un
//      valor sumado ni dividido entre vistas -- se marca en una sola vista en la práctica; si se
//      llegara a marcar en las dos por error, el m2 se cuenta dos veces (mismo trade-off ya
//      aceptado hoy para el marcado de daños, no se resuelve acá).
//   3) La "caja" de las pickup (cabina simple/doble) y el "panel_carga" de los utilitarios
//      acarrozados siguen el mismo criterio del punto 2: es la misma superficie del costado de la
//      caja/carrocería, tocable tanto desde Cenital (mirando la caja desde arriba) como desde
//      Lateral -- mismo valor en las dos, no una fracción.
//   4) Los paneles "zocalo_izq/der" de la matriz original no tienen zona tocable equivalente en
//      ningún diagrama real (no hay un polígono de zócalo/faldón en los zonas.json) -- se
//      descartan directamente, no se inventa una zona nueva para ellos.
//   5) Las luces traseras ("luz_izq"/"luz_der" en Auto, "luz_izquierda"/"luz_derecha" en Camioneta/
//      SUV) SON zonas tocables reales en la vista Atrás y la matriz original NUNCA las contempló
//      (solo tenía "faro_izq/der" del frente) -- se agregaron acá con el mismo m2Referencia que la
//      óptica delantera de esa misma subdivisión (tamaño comparable, misma complejidad), no es un
//      dato que venga de la matriz original.
//
// Verificado 1 a 1 contra los zonas.json reales de las 14 subdivisiones (assets/checkin-diagrams):
// cada key de `paneles` de acá tiene su zona tocable real correspondiente, y toda zona tocable
// real no-vidrio de cada subdivisión tiene su key acá (script de verificación, no versionado).
//
// Precision esperada: igual que la matriz original, el REPARTO relativo entre paneles es
// consistente pero el numero total tiene un margen real de +-10-15% porque no se midió cada
// modelo real uno por uno -- mismo nivel de precisión con el que cotiza cualquier instalador de
// PPF en la calle. Con el tiempo se puede afinar comparando contra `turno_ppf_paneles` (que ya
// guarda el m2 real usado en cada trabajo real de PPF).
//
// Cada panel trae: m2Referencia (estimado), complejidad (simple/compleja -- define la merma),
// mermaPct (fraccion, ej. 0.08 = 8%), m2ConMerma (m2Referencia ya con la merma aplicada -- este es
// el numero que hay que sumar para calcular cuanto rollo comprar/usar).
//
// 14 subdivisiones cubiertas en esta v1 (5 Auto, 7 Camioneta, 2 SUV) -- Moto y "Camioneta /
// Utilitario acarrozado / Chico" quedan afuera (sin diagrama de PPF todavía, aunque Utilitario
// Chico sí tenga diagrama de daños): obtenerPanelesPpf devuelve null para cualquier combinación no
// listada acá, y el wizard debe mostrar el mismo tipo de aviso "Próximamente" que ya usa
// InspeccionVisualStep para Moto sin diagrama.
//
// Editable a mano por Augusto/el taller si algún número no le cierra para un modelo puntual -- no
// está pensado como dato cerrado, es punto de partida.

export const PPF_PANEL_MATRIX = {
  auto: {
    sedan: {
      paneles: {
        frente__capot: { m2Referencia: 2.16, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.33 },
        frente__parante_izq: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        cenital__parante_izq: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        frente__parante_der: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        cenital__parante_der: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        frente__espejo_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__espejo_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__optica_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__optica_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__frente_completo: { m2Referencia: 1.62, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.91 },
        cenital__techo: { m2Referencia: 1.8, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.94 },
        atras__baul: { m2Referencia: 1.26, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.36 },
        atras__paragolpes_trasero: { m2Referencia: 1.44, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.7 },
        atras__luz_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        atras__luz_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        lateral__guardabarro: { m2Referencia: 1.44, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.7 },
        lateral__puerta_delantera: { m2Referencia: 2.52, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.72 },
        lateral__puerta_trasera: { m2Referencia: 2.16, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.33 },
        lateral__cola: { m2Referencia: 1.44, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.7 },
      },
    },
    hatchback: {
      paneles: {
        frente__capot: { m2Referencia: 1.8, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.94 },
        frente__parante_izq: { m2Referencia: 0.23, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.27 },
        cenital__parante_izq: { m2Referencia: 0.23, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.27 },
        frente__parante_der: { m2Referencia: 0.23, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.27 },
        cenital__parante_der: { m2Referencia: 0.23, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.27 },
        frente__espejo_izq: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__espejo_der: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__optica_izq: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__optica_der: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__frente_completo: { m2Referencia: 1.35, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.59 },
        cenital__techo: { m2Referencia: 1.5, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.62 },
        atras__baul: { m2Referencia: 1.05, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.13 },
        atras__paragolpes_trasero: { m2Referencia: 1.2, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.42 },
        atras__luz_izq: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        atras__luz_der: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        lateral__guardabarro: { m2Referencia: 1.2, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.42 },
        lateral__puerta_delantera: { m2Referencia: 2.1, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.27 },
        lateral__puerta_trasera: { m2Referencia: 1.8, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.94 },
        lateral__cola: { m2Referencia: 1.2, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.42 },
      },
    },
    familiar: {
      paneles: {
        frente__capot: { m2Referencia: 2.28, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.46 },
        frente__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        cenital__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        frente__parante_der: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        cenital__parante_der: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        frente__espejo_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__espejo_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__optica_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__optica_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__frente_completo: { m2Referencia: 1.71, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.02 },
        cenital__techo: { m2Referencia: 1.9, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.05 },
        atras__baul: { m2Referencia: 1.33, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.44 },
        atras__paragolpes_trasero: { m2Referencia: 1.52, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.79 },
        atras__luz_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        atras__luz_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        lateral__guardabarro: { m2Referencia: 1.52, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.79 },
        lateral__puerta_delantera: { m2Referencia: 2.66, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.87 },
        lateral__puerta_trasera: { m2Referencia: 2.28, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.46 },
        lateral__cola: { m2Referencia: 1.52, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.79 },
      },
    },
    coupe: {
      paneles: {
        frente__capot: { m2Referencia: 1.92, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.07 },
        frente__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.28 },
        cenital__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.28 },
        frente__parante_der: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.28 },
        cenital__parante_der: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.28 },
        frente__espejo_izq: { m2Referencia: 0.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.14 },
        frente__espejo_der: { m2Referencia: 0.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.14 },
        frente__optica_izq: { m2Referencia: 0.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.14 },
        frente__optica_der: { m2Referencia: 0.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.14 },
        frente__frente_completo: { m2Referencia: 1.44, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.7 },
        cenital__techo: { m2Referencia: 1.6, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.73 },
        atras__baul: { m2Referencia: 1.12, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.21 },
        atras__paragolpes_trasero: { m2Referencia: 1.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.51 },
        atras__luz_izq: { m2Referencia: 0.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.14 },
        atras__luz_der: { m2Referencia: 0.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.14 },
        // Coupé/Descapotable: lateral no distingue puerta delantera/trasera (2 puertas, una sola
        // por lado) -- la zona real se llama "puerta" (sin sufijo), no "puerta_delantera".
        lateral__guardabarro: { m2Referencia: 1.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.51 },
        lateral__puerta: { m2Referencia: 3.2, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.46 },
        lateral__cola: { m2Referencia: 2.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.64 },
      },
    },
    descapotable: {
      paneles: {
        frente__capot: { m2Referencia: 1.8, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.94 },
        // A diferencia de las otras subdivisiones de Auto, Descapotable no tiene vista Cenital
        // (capota plegable) -- pero SÍ tiene parante_izq/der tocables en Frente (mismo criterio
        // que el resto: valor de la vieja matriz "parantes" partido a la mitad por lado), sin la
        // vista duplicada de Cenital porque esa vista no existe para esta subdivisión.
        frente__parante_izq: { m2Referencia: 0.23, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.27 },
        frente__parante_der: { m2Referencia: 0.23, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.27 },
        frente__espejo_izq: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__espejo_der: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__optica_izq: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__optica_der: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        frente__frente_completo: { m2Referencia: 1.35, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.59 },
        atras__baul: { m2Referencia: 1.05, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.13 },
        atras__paragolpes_trasero: { m2Referencia: 1.2, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.42 },
        atras__luz_izq: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        atras__luz_der: { m2Referencia: 0.11, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.13 },
        lateral__guardabarro: { m2Referencia: 1.2, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.42 },
        lateral__puerta: { m2Referencia: 3.0, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.24 },
        lateral__cola: { m2Referencia: 2.1, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.48 },
        // Sin vista Cenital (capota plegable, no hay techo fijo que fotografiar desde arriba) ni
        // parantes tocables -- "capota" (la capota guardada) reemplaza a "techo", tocable tanto
        // desde Atrás como desde Lateral (mismo criterio del punto 2 del header: mismo valor en
        // las dos vistas, no dividido).
        atras__capota: { m2Referencia: 1.5, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.62 },
        lateral__capota: { m2Referencia: 1.5, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.62 },
      },
    },
  },
  camioneta: {
    cabina_simple_chico: {
      paneles: {
        frente__capot: { m2Referencia: 1.76, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.9 },
        frente__parante_izq: { m2Referencia: 0.4, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.47 },
        cenital__parante_izq: { m2Referencia: 0.4, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.47 },
        frente__parante_der: { m2Referencia: 0.4, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.47 },
        cenital__parante_der: { m2Referencia: 0.4, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.47 },
        frente__espejo_izq: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__espejo_der: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__optica_izq: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__optica_der: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__frente_completo: { m2Referencia: 1.44, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.7 },
        cenital__techo: { m2Referencia: 1.12, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.21 },
        atras__compuerta: { m2Referencia: 0.96, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.13 },
        atras__luz_izquierda: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        atras__luz_derecha: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        lateral__guardabarro_delantero: { m2Referencia: 1.44, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.7 },
        // Cabina simple: una sola fila de asientos -- una sola puerta por lado, zona real
        // "puerta" (sin sufijo), no "puerta_delantera".
        lateral__puerta: { m2Referencia: 3.2, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.46 },
        // "caja" (la caja de carga) es tocable desde Cenital y desde Lateral -- mismo criterio del
        // punto 3 del header: mismo valor en las dos vistas.
        cenital__caja: { m2Referencia: 2.88, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.11 },
        lateral__caja: { m2Referencia: 2.88, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.11 },
      },
    },
    cabina_simple_mediano: {
      paneles: {
        frente__capot: { m2Referencia: 2.09, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.26 },
        frente__parante_izq: { m2Referencia: 0.47, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.56 },
        cenital__parante_izq: { m2Referencia: 0.47, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.56 },
        frente__parante_der: { m2Referencia: 0.47, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.56 },
        cenital__parante_der: { m2Referencia: 0.47, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.56 },
        frente__espejo_izq: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__espejo_der: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__optica_izq: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__optica_der: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__frente_completo: { m2Referencia: 1.71, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.02 },
        cenital__techo: { m2Referencia: 1.33, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.44 },
        atras__compuerta: { m2Referencia: 1.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.35 },
        atras__paragolpes_trasero: { m2Referencia: 0.95, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.12 },
        atras__luz_izquierda: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        atras__luz_derecha: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        lateral__guardabarro_delantero: { m2Referencia: 1.7, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.01 },
        lateral__puerta: { m2Referencia: 3.8, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 4.1 },
        cenital__caja: { m2Referencia: 3.42, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.69 },
        lateral__caja: { m2Referencia: 3.42, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.69 },
      },
    },
    doble_cabina_chico: {
      paneles: {
        frente__capot: { m2Referencia: 1.91, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.06 },
        frente__parante_izq: { m2Referencia: 0.39, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.45 },
        cenital__parante_izq: { m2Referencia: 0.39, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.45 },
        frente__parante_der: { m2Referencia: 0.39, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.45 },
        cenital__parante_der: { m2Referencia: 0.39, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.45 },
        frente__espejo_izq: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__espejo_der: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__optica_izq: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__optica_der: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        frente__frente_completo: { m2Referencia: 1.53, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.81 },
        cenital__techo: { m2Referencia: 1.34, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.45 },
        atras__compuerta: { m2Referencia: 0.96, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.13 },
        atras__paragolpes_trasero: { m2Referencia: 0.96, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.13 },
        atras__luz_izquierda: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        atras__luz_derecha: { m2Referencia: 0.19, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.22 },
        lateral__guardabarro_delantero: { m2Referencia: 1.54, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.82 },
        lateral__puerta_delantera: { m2Referencia: 2.48, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.68 },
        lateral__puerta_trasera: { m2Referencia: 2.3, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.48 },
        cenital__caja: { m2Referencia: 2.3, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.48 },
        lateral__caja: { m2Referencia: 2.3, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.48 },
      },
    },
    doble_cabina_mediano: {
      paneles: {
        frente__capot: { m2Referencia: 2.23, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.41 },
        frente__parante_izq: { m2Referencia: 0.45, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.53 },
        cenital__parante_izq: { m2Referencia: 0.45, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.53 },
        frente__parante_der: { m2Referencia: 0.45, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.53 },
        cenital__parante_der: { m2Referencia: 0.45, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.53 },
        frente__espejo_izq: { m2Referencia: 0.22, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.26 },
        frente__espejo_der: { m2Referencia: 0.22, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.26 },
        frente__optica_izq: { m2Referencia: 0.22, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.26 },
        frente__optica_der: { m2Referencia: 0.22, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.26 },
        frente__frente_completo: { m2Referencia: 1.79, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.11 },
        cenital__techo: { m2Referencia: 1.56, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.68 },
        atras__compuerta: { m2Referencia: 1.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.32 },
        atras__paragolpes_trasero: { m2Referencia: 1.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.32 },
        atras__luz_izquierda: { m2Referencia: 0.22, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.26 },
        atras__luz_derecha: { m2Referencia: 0.22, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.26 },
        lateral__guardabarro_delantero: { m2Referencia: 1.78, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.1 },
        lateral__puerta_delantera: { m2Referencia: 2.9, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.13 },
        lateral__puerta_trasera: { m2Referencia: 2.68, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.89 },
        cenital__caja: { m2Referencia: 2.68, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.89 },
        lateral__caja: { m2Referencia: 2.68, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.89 },
      },
    },
    doble_cabina_grande: {
      paneles: {
        frente__capot: { m2Referencia: 2.66, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.87 },
        frente__parante_izq: { m2Referencia: 0.53, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.63 },
        cenital__parante_izq: { m2Referencia: 0.53, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.63 },
        frente__parante_der: { m2Referencia: 0.53, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.63 },
        cenital__parante_der: { m2Referencia: 0.53, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.63 },
        frente__espejo_izq: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        frente__espejo_der: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        frente__optica_izq: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        frente__optica_der: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        frente__frente_completo: { m2Referencia: 2.13, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.51 },
        cenital__techo: { m2Referencia: 1.86, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.01 },
        atras__compuerta: { m2Referencia: 1.33, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.57 },
        atras__paragolpes_trasero: { m2Referencia: 1.33, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.57 },
        atras__luz_izquierda: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        atras__luz_derecha: { m2Referencia: 0.27, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.32 },
        lateral__guardabarro_delantero: { m2Referencia: 2.12, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.5 },
        lateral__puerta_delantera: { m2Referencia: 3.46, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.74 },
        lateral__puerta_trasera: { m2Referencia: 3.2, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.46 },
        cenital__caja: { m2Referencia: 3.2, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.46 },
        lateral__caja: { m2Referencia: 3.2, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.46 },
      },
    },
    // "Utilitario acarrozado / Chico" queda afuera de esta v1 (sin combinación en la matriz):
    // obtenerPanelesPpf devuelve null para esa combinación aunque ya tenga diagrama de daños.
    utilitario_acarrozado_mediano: {
      paneles: {
        frente__capot: { m2Referencia: 1.46, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.58 },
        frente__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.29 },
        cenital__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.29 },
        frente__parante_der: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.29 },
        cenital__parante_der: { m2Referencia: 0.24, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.29 },
        frente__espejo_izq: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__espejo_der: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__optica_izq: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__optica_der: { m2Referencia: 0.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.19 },
        frente__frente_completo: { m2Referencia: 1.13, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.33 },
        cenital__techo: { m2Referencia: 1.46, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.58 },
        lateral__guardabarro_delantero: { m2Referencia: 1.3, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.53 },
        lateral__puerta_delantera: { m2Referencia: 2.6, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.81 },
        // Carrocería cerrada (furgón): no hay "caja" abierta ni "cola" -- el costado de carga es
        // "panel_carga", y la parte trasera son las 2 puertas batientes reales (Atrás).
        lateral__panel_carga: { m2Referencia: 3.88, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 4.19 },
        atras__puerta_izquierda: { m2Referencia: 1.3, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.53 },
        atras__puerta_derecha: { m2Referencia: 1.3, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.53 },
      },
    },
    utilitario_acarrozado_grande: {
      paneles: {
        frente__capot: { m2Referencia: 2.49, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.69 },
        frente__parante_izq: { m2Referencia: 0.41, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.49 },
        cenital__parante_izq: { m2Referencia: 0.41, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.49 },
        frente__parante_der: { m2Referencia: 0.41, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.49 },
        cenital__parante_der: { m2Referencia: 0.41, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.49 },
        frente__espejo_izq: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.33 },
        frente__espejo_der: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.33 },
        frente__optica_izq: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.33 },
        frente__optica_der: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.33 },
        frente__frente_completo: { m2Referencia: 1.93, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.28 },
        cenital__techo: { m2Referencia: 2.49, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.69 },
        lateral__guardabarro_delantero: { m2Referencia: 2.2, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.6 },
        lateral__puerta_delantera: { m2Referencia: 4.42, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 4.77 },
        lateral__panel_carga: { m2Referencia: 6.62, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 7.15 },
        atras__puerta_izquierda: { m2Referencia: 2.21, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.61 },
        atras__puerta_derecha: { m2Referencia: 2.21, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.61 },
      },
    },
  },
  suv: {
    compacto: {
      paneles: {
        frente__capot: { m2Referencia: 2.28, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.46 },
        frente__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        cenital__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        frente__parante_der: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        cenital__parante_der: { m2Referencia: 0.28, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.34 },
        frente__espejo_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__espejo_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__optica_izq: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__optica_der: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        frente__frente_completo: { m2Referencia: 1.71, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.02 },
        cenital__techo: { m2Referencia: 1.9, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.05 },
        atras__baul: { m2Referencia: 1.33, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.44 },
        atras__paragolpes_trasero: { m2Referencia: 1.52, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.79 },
        atras__luz_izquierda: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        atras__luz_derecha: { m2Referencia: 0.14, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.17 },
        lateral__guardabarro_delantero: { m2Referencia: 1.52, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.79 },
        lateral__puerta_delantera: { m2Referencia: 2.66, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.87 },
        lateral__puerta_trasera: { m2Referencia: 2.28, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.46 },
        lateral__cola: { m2Referencia: 1.52, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 1.79 },
      },
    },
    grande: {
      paneles: {
        frente__capot: { m2Referencia: 2.88, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.11 },
        frente__parante_izq: { m2Referencia: 0.36, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.42 },
        cenital__parante_izq: { m2Referencia: 0.36, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.42 },
        frente__parante_der: { m2Referencia: 0.36, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.42 },
        cenital__parante_der: { m2Referencia: 0.36, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.42 },
        frente__espejo_izq: { m2Referencia: 0.18, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.21 },
        frente__espejo_der: { m2Referencia: 0.18, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.21 },
        frente__optica_izq: { m2Referencia: 0.18, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.21 },
        frente__optica_der: { m2Referencia: 0.18, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.21 },
        frente__frente_completo: { m2Referencia: 2.16, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.55 },
        cenital__techo: { m2Referencia: 2.4, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 2.59 },
        atras__baul: { m2Referencia: 1.68, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 1.81 },
        atras__paragolpes_trasero: { m2Referencia: 1.92, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.27 },
        atras__luz_izquierda: { m2Referencia: 0.18, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.21 },
        atras__luz_derecha: { m2Referencia: 0.18, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 0.21 },
        lateral__guardabarro_delantero: { m2Referencia: 1.92, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.27 },
        lateral__puerta_delantera: { m2Referencia: 3.36, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.63 },
        lateral__puerta_trasera: { m2Referencia: 2.88, complejidad: "simple", mermaPct: 0.08, m2ConMerma: 3.11 },
        lateral__cola: { m2Referencia: 1.92, complejidad: "compleja", mermaPct: 0.18, m2ConMerma: 2.27 },
      },
    },
  },
};
