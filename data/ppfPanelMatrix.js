// data/ppfPanelMatrix.js
//
// Matriz de referencia de m2 por panel para el presupuesto de PPF, por tipo/subdivision de
// vehiculo. NO son medidas de fabrica ni de cada modelo puntual -- son una ESTIMACION.
//
// Cada key de `paneles` es EXACTAMENTE el id real y tocable de los diagramas de check-in de
// components/diagrams/vehicles (namespaced "<vista>__<zonaId>", igual que arma
// crearVistaDesdeZonas en ImageZoneDiagram.js a partir de cada assets/checkin-diagrams/<tipo>/
// <subdivision>/<vista>/zonas.json) -- así el selector de paneles de PPF puede reusar esos mismos
// diagramas 1 a 1, sin re-vectorizar nada ni mantener un segundo mapa de ids.
//
// El vidrio SÍ se cubre con PPF (antes se excluía a propósito -- ya no es así): se instala con un
// producto/rollo DISTINTO al de carrocería (una lámina especial pensada para vidrio curvo), así
// que cada panel trae un campo `material` ("carroceria" o "vidrio") que dice con qué rollo se
// cubre y a qué costo por m² corresponde (ver utils/calculosPpf.js, que separa
// costoPorM2RolloCarroceria de costoPorM2RolloVidrio). Por ahora el único panel de vidrio cargado
// es el parabrisas (`frente__vidrio`, zona real "vidrio" del zonas.json de cada subdivisión,
// confirmada 1 a 1 contra las 14 -- lunetas/ventanillas laterales quedan afuera todavía, no tienen
// zona tocable propia en los diagramas actuales).
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
// real de cada subdivisión (vidrio del parabrisas incluido, ver más arriba) tiene su key acá
// (script de verificación, no versionado).
//
// Precision esperada: igual que la matriz original, el REPARTO relativo entre paneles es
// consistente pero el numero total tiene un margen real de +-10-15% porque no se midió cada
// modelo real uno por uno -- mismo nivel de precisión con el que cotiza cualquier instalador de
// PPF en la calle (el parabrisas incluido: es una estimación proporcional al tamaño de cada
// subdivisión, no una medida real tampoco). Con el tiempo se puede afinar comparando contra
// `turno_ppf_paneles` (que ya guarda el m2 real usado en cada trabajo real de PPF).
//
// Cada panel trae m2Referencia (estimado), complejidad (simple/compleja) y material ("carroceria"
// o "vidrio", ver más arriba) -- ninguno de los tres cambia segun el metodo de corte. La merma
// (mermaPct) y el m2 ya con merma (m2ConMerma) NO viven mas en cada panel: dependen de con que se
// corta el vinilo (manual con cutter, con mas desperdicio, vs. laser/plotter, mas preciso), asi
// que se calculan al vuelo en utils/calculosPpf.js (calcularPresupuestoPpf) contra MERMA_POR_MODO
// de mas abajo, segun el modoCorte que elija el taller en PresupuestoPpfStep.js -- no contra un
// numero fijo por panel.
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
        frente__vidrio: { m2Referencia: 1.15, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.16, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.62, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.8, complejidad: "simple", material: "carroceria" },
        atras__baul: { m2Referencia: 1.26, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.44, complejidad: "compleja", material: "carroceria" },
        atras__luz_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        atras__luz_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro: { m2Referencia: 1.44, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.52, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 2.16, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 1.44, complejidad: "compleja", material: "carroceria" },
      },
    },
    hatchback: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.05, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 1.8, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.23, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.23, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.23, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.23, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.35, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.5, complejidad: "simple", material: "carroceria" },
        atras__baul: { m2Referencia: 1.05, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.2, complejidad: "compleja", material: "carroceria" },
        atras__luz_izq: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        atras__luz_der: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro: { m2Referencia: 1.2, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.1, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 1.8, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 1.2, complejidad: "compleja", material: "carroceria" },
      },
    },
    familiar: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.2, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.28, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.71, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.9, complejidad: "simple", material: "carroceria" },
        atras__baul: { m2Referencia: 1.33, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.52, complejidad: "compleja", material: "carroceria" },
        atras__luz_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        atras__luz_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro: { m2Referencia: 1.52, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.66, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 2.28, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 1.52, complejidad: "compleja", material: "carroceria" },
      },
    },
    coupe: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.05, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 1.92, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.12, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.12, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.12, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.12, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.44, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.6, complejidad: "simple", material: "carroceria" },
        atras__baul: { m2Referencia: 1.12, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.28, complejidad: "compleja", material: "carroceria" },
        atras__luz_izq: { m2Referencia: 0.12, complejidad: "compleja", material: "carroceria" },
        atras__luz_der: { m2Referencia: 0.12, complejidad: "compleja", material: "carroceria" },
        // Coupé/Descapotable: lateral no distingue puerta delantera/trasera (2 puertas, una sola
        // por lado) -- la zona real se llama "puerta" (sin sufijo), no "puerta_delantera".
        lateral__guardabarro: { m2Referencia: 1.28, complejidad: "compleja", material: "carroceria" },
        lateral__puerta: { m2Referencia: 3.2, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 2.24, complejidad: "compleja", material: "carroceria" },
      },
    },
    descapotable: {
      paneles: {
        frente__vidrio: { m2Referencia: 0.95, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 1.8, complejidad: "simple", material: "carroceria" },
        // A diferencia de las otras subdivisiones de Auto, Descapotable no tiene vista Cenital
        // (capota plegable) -- pero SÍ tiene parante_izq/der tocables en Frente (mismo criterio
        // que el resto: valor de la vieja matriz "parantes" partido a la mitad por lado), sin la
        // vista duplicada de Cenital porque esa vista no existe para esta subdivisión.
        frente__parante_izq: { m2Referencia: 0.23, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.23, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.35, complejidad: "compleja", material: "carroceria" },
        atras__baul: { m2Referencia: 1.05, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.2, complejidad: "compleja", material: "carroceria" },
        atras__luz_izq: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        atras__luz_der: { m2Referencia: 0.11, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro: { m2Referencia: 1.2, complejidad: "compleja", material: "carroceria" },
        lateral__puerta: { m2Referencia: 3.0, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 2.1, complejidad: "compleja", material: "carroceria" },
        // Sin vista Cenital (capota plegable, no hay techo fijo que fotografiar desde arriba) ni
        // parantes tocables -- "capota" (la capota guardada) reemplaza a "techo", tocable tanto
        // desde Atrás como desde Lateral (mismo criterio del punto 2 del header: mismo valor en
        // las dos vistas, no dividido).
        atras__capota: { m2Referencia: 1.5, complejidad: "simple", material: "carroceria" },
        lateral__capota: { m2Referencia: 1.5, complejidad: "simple", material: "carroceria" },
      },
    },
  },
  camioneta: {
    cabina_simple_chico: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.15, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 1.76, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.4, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.4, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.4, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.4, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.44, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.12, complejidad: "simple", material: "carroceria" },
        atras__compuerta: { m2Referencia: 0.96, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.44, complejidad: "compleja", material: "carroceria" },
        // Cabina simple: una sola fila de asientos -- una sola puerta por lado, zona real
        // "puerta" (sin sufijo), no "puerta_delantera".
        lateral__puerta: { m2Referencia: 3.2, complejidad: "simple", material: "carroceria" },
        // "caja" (la caja de carga) es tocable desde Cenital y desde Lateral -- mismo criterio del
        // punto 3 del header: mismo valor en las dos vistas.
        cenital__caja: { m2Referencia: 2.88, complejidad: "simple", material: "carroceria" },
        lateral__caja: { m2Referencia: 2.88, complejidad: "simple", material: "carroceria" },
      },
    },
    cabina_simple_mediano: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.3, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.09, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.47, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.47, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.47, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.47, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.71, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.33, complejidad: "simple", material: "carroceria" },
        atras__compuerta: { m2Referencia: 1.14, complejidad: "compleja", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 0.95, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.7, complejidad: "compleja", material: "carroceria" },
        lateral__puerta: { m2Referencia: 3.8, complejidad: "simple", material: "carroceria" },
        cenital__caja: { m2Referencia: 3.42, complejidad: "simple", material: "carroceria" },
        lateral__caja: { m2Referencia: 3.42, complejidad: "simple", material: "carroceria" },
      },
    },
    doble_cabina_chico: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.3, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 1.91, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.39, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.39, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.39, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.39, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.53, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.34, complejidad: "simple", material: "carroceria" },
        atras__compuerta: { m2Referencia: 0.96, complejidad: "compleja", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 0.96, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.19, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.54, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.48, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 2.3, complejidad: "simple", material: "carroceria" },
        cenital__caja: { m2Referencia: 2.3, complejidad: "simple", material: "carroceria" },
        lateral__caja: { m2Referencia: 2.3, complejidad: "simple", material: "carroceria" },
      },
    },
    doble_cabina_mediano: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.45, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.23, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.45, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.45, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.45, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.45, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.22, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.22, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.22, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.22, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.79, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.56, complejidad: "simple", material: "carroceria" },
        atras__compuerta: { m2Referencia: 1.12, complejidad: "compleja", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.12, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.22, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.22, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.78, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.9, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 2.68, complejidad: "simple", material: "carroceria" },
        cenital__caja: { m2Referencia: 2.68, complejidad: "simple", material: "carroceria" },
        lateral__caja: { m2Referencia: 2.68, complejidad: "simple", material: "carroceria" },
      },
    },
    doble_cabina_grande: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.6, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.66, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.53, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.53, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.53, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.53, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 2.13, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.86, complejidad: "simple", material: "carroceria" },
        atras__compuerta: { m2Referencia: 1.33, complejidad: "compleja", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.33, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.27, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 2.12, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 3.46, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 3.2, complejidad: "simple", material: "carroceria" },
        cenital__caja: { m2Referencia: 3.2, complejidad: "simple", material: "carroceria" },
        lateral__caja: { m2Referencia: 3.2, complejidad: "simple", material: "carroceria" },
      },
    },
    // "Utilitario acarrozado / Chico" queda afuera de esta v1 (sin combinación en la matriz):
    // obtenerPanelesPpf devuelve null para esa combinación aunque ya tenga diagrama de daños.
    utilitario_acarrozado_mediano: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.3, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 1.46, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.24, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.16, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.13, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.46, complejidad: "simple", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.3, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.6, complejidad: "simple", material: "carroceria" },
        // Carrocería cerrada (furgón): no hay "caja" abierta ni "cola" -- el costado de carga es
        // "panel_carga", y la parte trasera son las 2 puertas batientes reales (Atrás).
        lateral__panel_carga: { m2Referencia: 3.88, complejidad: "simple", material: "carroceria" },
        atras__puerta_izquierda: { m2Referencia: 1.3, complejidad: "compleja", material: "carroceria" },
        atras__puerta_derecha: { m2Referencia: 1.3, complejidad: "compleja", material: "carroceria" },
      },
    },
    utilitario_acarrozado_grande: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.55, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.49, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.41, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.41, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.41, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.41, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.93, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 2.49, complejidad: "simple", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 2.2, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 4.42, complejidad: "simple", material: "carroceria" },
        lateral__panel_carga: { m2Referencia: 6.62, complejidad: "simple", material: "carroceria" },
        atras__puerta_izquierda: { m2Referencia: 2.21, complejidad: "compleja", material: "carroceria" },
        atras__puerta_derecha: { m2Referencia: 2.21, complejidad: "compleja", material: "carroceria" },
      },
    },
  },
  suv: {
    compacto: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.25, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.28, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.28, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 1.71, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 1.9, complejidad: "simple", material: "carroceria" },
        atras__baul: { m2Referencia: 1.33, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.52, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.14, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.52, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 2.66, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 2.28, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 1.52, complejidad: "compleja", material: "carroceria" },
      },
    },
    grande: {
      paneles: {
        frente__vidrio: { m2Referencia: 1.55, complejidad: "compleja", material: "vidrio" },
        frente__capot: { m2Referencia: 2.88, complejidad: "simple", material: "carroceria" },
        frente__parante_izq: { m2Referencia: 0.36, complejidad: "compleja", material: "carroceria" },
        cenital__parante_izq: { m2Referencia: 0.36, complejidad: "compleja", material: "carroceria" },
        frente__parante_der: { m2Referencia: 0.36, complejidad: "compleja", material: "carroceria" },
        cenital__parante_der: { m2Referencia: 0.36, complejidad: "compleja", material: "carroceria" },
        frente__espejo_izq: { m2Referencia: 0.18, complejidad: "compleja", material: "carroceria" },
        frente__espejo_der: { m2Referencia: 0.18, complejidad: "compleja", material: "carroceria" },
        frente__optica_izq: { m2Referencia: 0.18, complejidad: "compleja", material: "carroceria" },
        frente__optica_der: { m2Referencia: 0.18, complejidad: "compleja", material: "carroceria" },
        frente__frente_completo: { m2Referencia: 2.16, complejidad: "compleja", material: "carroceria" },
        cenital__techo: { m2Referencia: 2.4, complejidad: "simple", material: "carroceria" },
        atras__baul: { m2Referencia: 1.68, complejidad: "simple", material: "carroceria" },
        atras__paragolpes_trasero: { m2Referencia: 1.92, complejidad: "compleja", material: "carroceria" },
        atras__luz_izquierda: { m2Referencia: 0.18, complejidad: "compleja", material: "carroceria" },
        atras__luz_derecha: { m2Referencia: 0.18, complejidad: "compleja", material: "carroceria" },
        lateral__guardabarro_delantero: { m2Referencia: 1.92, complejidad: "compleja", material: "carroceria" },
        lateral__puerta_delantera: { m2Referencia: 3.36, complejidad: "simple", material: "carroceria" },
        lateral__puerta_trasera: { m2Referencia: 2.88, complejidad: "simple", material: "carroceria" },
        lateral__cola: { m2Referencia: 1.92, complejidad: "compleja", material: "carroceria" },
      },
    },
  },
};

// Merma por metodo de corte, segun la complejidad del panel (mismo criterio de "punto de partida
// editable" del resto del archivo -- ver el comentario de cabecera). Corte manual (cutter a mano,
// hoy es lo unico que existia): mas desperdicio, mermas altas. Corte con laser/plotter (patron
// digital sobre la carroceria, corta justo): mucho menos desperdicio. Los valores de "manual" son
// los mismos mermaPct que ya tenia cada panel antes de este cambio (0.08 simple / 0.18 compleja);
// los de "laser" son un punto de partida conservador (la mitad), sin dato real todavia -- editar a
// mano si no le cierra a Augusto/el taller.
export const MERMA_POR_MODO = {
  manual: { simple: 0.08, compleja: 0.18 },
  laser: { simple: 0.04, compleja: 0.08 },
};
