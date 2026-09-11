// Topes de facturación ANUAL por categoría de Monotributo — usados para el
// aviso de tope en Finanzas (FinanzasScreen.js) y como referencia en el PDF
// para el contador (utils/finanzasPdf.js). El tope es el mismo esté el
// taller categorizado como "servicios" o "venta de bienes" — lo único que
// cambia entre esos dos es la cuota mensual, que no se guarda ni se usa acá.
//
// ⚠️ MONTOS VIGENTES DESDE AGOSTO 2026 — ARCA los actualiza periódicamente
// por inflación (viene siendo cada 3-6 meses). NO hay forma automática de
// traerlos hoy: cuando cambien, hay que actualizar esta tabla a mano.
// Fuente consultada el 11/9/2026: tiendanube.com/blog/categorias-monotributo
// e iprofesional.com.
export const TOPES_MONOTRIBUTO = {
  A: 12009410.45,
  B: 17595182.74,
  C: 24670494.31,
  D: 30628651.43,
  E: 36028231.33,
  F: 45151659.41,
  G: 53995798.87,
  H: 81924660.37,
  I: 91699761.9,
  J: 105012519.2,
  K: 126610838.75,
};

export const ORDEN_CATEGORIAS_MONOTRIBUTO = Object.keys(TOPES_MONOTRIBUTO);
