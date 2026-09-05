// Formato de moneda compartido para no repetir el mismo Intl.NumberFormat
// en cada pantalla de Finanzas.
const formateadorPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPesos(monto) {
  return formateadorPesos.format(monto ?? 0);
}

// Duración de un servicio (Mis Servicios / Catálogo): "2 horas" / "1 día".
// Sin minutos — ver ServicioModal.js, duracionUnidad es "horas" o "dias".
export function formatearDuracion(valor, unidad) {
  if (!valor) return "No especificado";
  if (unidad === "dias") return `${valor} ${valor === 1 ? "día" : "días"}`;
  return `${valor} ${valor === 1 ? "hora" : "horas"}`;
}

const formateadorEntero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

// Cantidad de un insumo en su unidad CRUDA de siempre (ml/g/unidades, ver
// UNIDADES_CAPACIDAD en data/mockInsumos.js), redondeada y con separador de
// miles ("3.750ml") — para mostrar cuánto queda AHORA, con la precisión con
// la que se guarda de verdad (ver MedidorNivelInsumo.js).
export function formatearCantidadInsumo(valor, unidad) {
  if (unidad === "unidades") {
    const cantidad = Math.round(valor ?? 0);
    return `${cantidad} ${cantidad === 1 ? "unidad" : "unidades"}`;
  }
  return `${formateadorEntero.format(Math.round(valor ?? 0))}${unidad ?? ""}`;
}

// Mismo dato que formatearCantidadInsumo, pero para la CAPACIDAD TOTAL del
// envase: a partir de 1000ml/1000g la muestra en L/kg (ej. capacidadTotal
// 5000 "ml" -> "5L") para que se lea como el tamaño real del envase que
// compró el taller ("un bidón de 5L"), no como un número crudo en la unidad
// chica en la que se guarda internamente.
export function formatearCapacidadLegible(valor, unidad) {
  if (unidad === "unidades" || valor == null) return formatearCantidadInsumo(valor, unidad);
  if (valor < 1000) return formatearCantidadInsumo(valor, unidad);

  const unidadGrande = unidad === "g" ? "kg" : "L";
  const convertido = valor / 1000;
  const textoConvertido =
    convertido % 1 === 0 ? String(convertido) : convertido.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${textoConvertido.replace(".", ",")}${unidadGrande}`;
}
