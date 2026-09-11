-- ============================================================================
-- insumos.ancho_rollo: dato propio de un insumo de PPF (categoría "ppf" en
-- data/mockInsumos.js), que hoy se pierde por completo.
--
-- Un rollo de PPF tiene un ancho fijo de fábrica (ej. 1.52m) y un
-- largo/metraje que se va consumiendo con el uso. Antes de este cambio,
-- AgregarInsumoModal.js le pedía al taller multiplicar ancho × largo en la
-- cabeza y cargar solo el m² total resultante (`capacidad_total`) -- el
-- ancho en sí nunca se guardaba.
--
-- `ancho_rollo` es un dato ADICIONAL, no un reemplazo: `capacidad_total`
-- sigue siendo el m² total del rollo y `cantidad_actual` el m² disponible,
-- exactamente como hoy -- necesario para no romper `costoPorM2Rollo =
-- precio_compra / capacidad_total` en utils/calculosPpf.js. Ahora se
-- calculan como ancho × largo / ancho × metros restantes en vez de pedirse
-- ya multiplicados, y el ancho usado se guarda acá para no perderlo.
--
-- `null` para cualquier insumo que no sea PPF.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table insumos
  add column if not exists ancho_rollo numeric(6, 2)
  check (ancho_rollo is null or ancho_rollo > 0);
