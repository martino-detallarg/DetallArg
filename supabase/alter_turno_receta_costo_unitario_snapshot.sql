-- ============================================================================
-- turno_receta_aplicada.costo_unitario_snapshot — pedido de Augusto.
--
-- Congela el costo real de cada línea de receta (insumo real, no libre) al
-- momento de finalizar el trabajo: precio_compra × (cantidad ÷
-- capacidad_total), calculado y grabado en TurnoContext.actualizarEstadoTrabajo
-- junto con el resto de la fila. Así el margen de un trabajo ya finalizado no
-- se mueve después si sube el precio de compra del insumo.
--
-- Confirmado en el código antes de este ALTER (no se dio por sentado):
-- `cantidad` de la receta (RecetaServicioStep.js) y `capacidad_total` del
-- insumo están siempre en la misma unidad — no hay conversión en
-- DataContext.descontarInsumos, que hace la misma división sin factor.
--
-- Nullable, sin CHECK: queda en null en dos casos, ambos esperados, no
-- errores —
-- 1. Línea "libre" (insumo_id null): no hay precio_compra/capacidad_total
--    que multiplicar. Ya tiene su propio costo congelado en `costo_estimado`.
--    Un cálculo de margen futuro debe leer
--    COALESCE(costo_unitario_snapshot, costo_estimado), no asumir que esta
--    columna sola cubre todas las líneas.
-- 2. Línea con insumo real pero sin precio_compra o sin capacidad_total
--    cargados en Mis Insumos: no se puede calcular, se deja null en vez de
--    inventar un valor.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table turno_receta_aplicada
  add column costo_unitario_snapshot numeric(12, 2);

comment on column turno_receta_aplicada.costo_unitario_snapshot is
  'Costo real congelado de esta línea (precio_compra × cantidad/capacidad_total) al momento de finalizar el trabajo. Null en líneas libres (usar costo_estimado) y en líneas cuyo insumo no tenía precio_compra/capacidad_total cargados.';
