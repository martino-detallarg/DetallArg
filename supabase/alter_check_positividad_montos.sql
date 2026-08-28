-- ============================================================================
-- CHECKs de positividad en columnas de monto/cantidad, mismo criterio que ya
-- tienen servicio_receta_items.cantidad y turno_receta_aplicada.tipos (etc.):
-- un valor de $0 o negativo en estas columnas es siempre un dato inválido,
-- no un caso de negocio real.
--
-- Verificado antes de escribir esto (0 filas violarían ningún check acá):
--   select 'servicios.precio', id, precio from servicios where precio <= 0
--   union all select 'costos_fijos.monto', id, monto from costos_fijos where monto <= 0
--   union all select 'insumos.precio_compra', id, precio_compra from insumos
--     where precio_compra is not null and precio_compra <= 0
--   union all select 'insumos.capacidad_total', id, capacidad_total from insumos
--     where capacidad_total is not null and capacidad_total <= 0
--   union all select 'turno_receta_aplicada.cantidad', id, cantidad
--     from turno_receta_aplicada where cantidad <= 0
--   union all select 'turno_receta_aplicada.costo_estimado', id, costo_estimado
--     from turno_receta_aplicada where costo_estimado <= 0;
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando
-- que cada uno terminó bien antes de seguir con el siguiente.
-- ============================================================================

-- 1) servicios.precio y costos_fijos.monto — no nullable, positividad a secas.
alter table servicios add constraint servicios_precio_check check (precio > 0);
alter table costos_fijos add constraint costos_fijos_monto_check check (monto > 0);

-- 2) insumos.precio_compra e insumos.capacidad_total — nullable (una fila
--    puede no tener el dato cargado todavía), así que el check deja pasar
--    null y solo rechaza <= 0.
alter table insumos add constraint insumos_precio_compra_check
  check (precio_compra is null or precio_compra > 0);
alter table insumos add constraint insumos_capacidad_total_check
  check (capacidad_total is null or capacidad_total > 0);

-- 3) turno_receta_aplicada_linea_check — reemplazo por una versión que
--    también exige positividad en cantidad/costo_estimado, igual que su par
--    servicio_receta_items_linea_check. El check actual (confirmado con
--    pg_get_constraintdef antes de este ALTER) solo valida presencia según
--    insumo_id, no valores positivos.
alter table turno_receta_aplicada drop constraint turno_receta_aplicada_linea_check;
alter table turno_receta_aplicada add constraint turno_receta_aplicada_linea_check
  check (
    (insumo_id is not null and cantidad is not null and cantidad > 0)
    or
    (insumo_id is null and costo_estimado is not null and costo_estimado > 0)
  );
