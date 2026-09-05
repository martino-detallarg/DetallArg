-- ============================================================================
-- gastos_variables.categoria — sumar 'insumo_perdido' al CHECK.
--
-- Pedido de Augusto: cuando el taller ajusta a mano el nivel de un insumo
-- hacia ABAJO (MoverCategoriaModal.js / MedidorNivelInsumo.js) y ese insumo
-- tiene precio_compra cargado, la app registra automáticamente un gasto
-- variable por el costo de lo perdido (precio_compra × %perdido/100).
--
-- 'insumo_perdido' es una categoría 100% AUTOMÁTICA — a propósito no se
-- suma a ORDEN_CATEGORIAS_GASTOS_VARIABLES del lado de la app (ver
-- data/mockFinanzas.js), así que nunca aparece como chip seleccionable a
-- mano en GastoVariableModal.js. Este ALTER solo permite que el INSERT
-- automático no choque contra el CHECK.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table gastos_variables drop constraint gastos_variables_categoria_check;
alter table gastos_variables add constraint gastos_variables_categoria_check
  check (categoria in ('personal_comisiones', 'otro', 'insumo_perdido'));
