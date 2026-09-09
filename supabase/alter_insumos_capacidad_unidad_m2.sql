-- ============================================================================
-- insumos.capacidad_unidad: sumar 'm2' — pedido de Augusto (parte de conectar
-- la calculadora de PPF, ver utils/calculosPpf.js y data/ppfPanelMatrix.js).
--
-- El check original (ver supabase/schema.sql) solo permite 'ml' | 'g' |
-- 'unidades' -- pensado para insumos líquidos/en polvo/por unidad. Los
-- productos de PPF (categoría "ppf" en data/mockInsumos.js) son un rollo
-- físico: el taller carga el m² real del rollo comprado (ancho × largo) en
-- vez de un tamaño de envase de líquido, y `costoPorM2Rollo = precio_compra /
-- capacidad_total` sale del mismo cálculo que ya usa el resto de insumos
-- (precio de envase ÷ capacidad) -- no hace falta ninguna columna nueva,
-- solo que el check permita esta unidad.
--
-- Nota: el prompt original de esta funcionalidad asumía que no hacía falta
-- ningún ALTER para esto ("100% reuso del esquema insumos ya existente") --
-- eso es cierto para las columnas, pero no para este CHECK puntual, que sí
-- hay que tocar. Sin este ALTER, AgregarInsumoModal.js rechazaría el INSERT
-- apenas el taller intente cargar `capacidadUnidad: "m2"` en un producto PPF.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
--
-- `insumos_capacidad_unidad_check` es el nombre que Postgres le da por
-- default a un check inline sin nombre propio (patrón <tabla>_<columna>_check,
-- como quedó definido en supabase/schema.sql) -- si al correr esto Postgres
-- avisa que ese nombre no existe, buscar el nombre real con:
--   select conname from pg_constraint where conrelid = 'insumos'::regclass and contype = 'c';
-- y reemplazarlo en el DROP de abajo antes de re-correr.
-- ============================================================================

alter table insumos
  drop constraint if exists insumos_capacidad_unidad_check;

alter table insumos
  add constraint insumos_capacidad_unidad_check
  check (capacidad_unidad is null or capacidad_unidad in ('ml', 'g', 'unidades', 'm2'));
