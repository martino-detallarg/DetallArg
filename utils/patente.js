// Formatos válidos de patente argentina: el viejo (3 letras + 3 números, ej.
// ABC123) y el Mercosur (2 letras + 3 números + 2 letras, ej. AB123CD).
const REGEX_VIEJO = /^[A-Z]{3}[0-9]{3}$/;
const REGEX_MERCOSUR = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

// Se usa mientras el usuario tipea: solo uppercase y descarta caracteres que
// no sean letra o número. A propósito NO segmenta con espacios acá — el
// formato (viejo vs Mercosur) no se puede inferir de forma confiable con el
// texto a medio tipear, y forzar una forma fija rompía el formato viejo.
export function normalizarPatente(texto) {
  return texto.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function esPatenteValida(patenteNormalizada) {
  return REGEX_VIEJO.test(patenteNormalizada) || REGEX_MERCOSUR.test(patenteNormalizada);
}

// Solo tiene sentido llamarla sobre una patente ya validada (esPatenteValida
// === true): agrega espacios según el formato que matcheó, para guardar y
// mostrar.
export function formatearPatente(patenteNormalizada) {
  if (REGEX_VIEJO.test(patenteNormalizada)) {
    return `${patenteNormalizada.slice(0, 3)} ${patenteNormalizada.slice(3)}`;
  }
  if (REGEX_MERCOSUR.test(patenteNormalizada)) {
    return `${patenteNormalizada.slice(0, 2)} ${patenteNormalizada.slice(2, 5)} ${patenteNormalizada.slice(5)}`;
  }
  return patenteNormalizada;
}
