-- DDL final para la propuesta de Augusto (docs/propuesta-servicios-insumos/PROPUESTA.md,
-- rama propuesta-servicios-insumos, commit 83b4174) + el cierre del gap de
-- turno_receta_aplicada (sección 4, no estaba en la propuesta original).
--
-- Confirmado antes de escribir esto:
-- - No hay diferencias entre el documento escrito y lo que Augusto había
--   construido antes (rama insumos-supabase-merge-wip, ahora obsoleta) para
--   insumos/servicios/servicio_receta_items: mismos campos, mismos nombres.
-- - La única fila real con `categoria` cargada en `servicios` es de una
--   cuenta de prueba de Augusto ("El Galón detail") — aprobado descartarla
--   junto con la columna `categoria` entera (no la variante que solo saca
--   el NOT NULL/CHECK y deja la columna).
-- - Diferencia real encontrada: la versión que Augusto ya había construido
--   sí completaba el flujo de "insumo libre" hasta turno_receta_aplicada
--   (congelar la línea libre al finalizar un trabajo); el documento escrito
--   dejaba eso pendiente a propósito por no tocar TurnoContext.js sin
--   avisar. Sección 4 acá abajo cierra ese gap — sin ella, cualquier
--   servicio con una línea libre rompe actualizarEstadoTrabajo al intentar
--   finalizar un trabajo (INSERT contra `cantidad not null`).
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, en orden,
-- confirmando que cada uno terminó bien antes de seguir con el siguiente.

-- ============================================================================
-- 1) INSUMOS — diluciones / cantidad_actual / es_personalizado
-- ============================================================================

-- 1.1
alter table insumos add column diluciones text[] not null default '{}';

-- 1.2 (backfill: cada fila con `dilucion` cargada pasa a diluciones = [dilucion])
update insumos set diluciones = array[dilucion] where dilucion is not null and dilucion <> '';

-- 1.3 (revisar antes de correr: confirmar que el backfill de 1.2 se ve bien
--      con un select * from insumos; recién ahí soltar la columna vieja)
alter table insumos drop column dilucion;

-- 1.4
alter table insumos add column cantidad_actual numeric(10, 2);

-- 1.5
alter table insumos add column es_personalizado boolean not null default false;

-- ============================================================================
-- 2) SERVICIOS — sin categoria, + descripcion, duracion_valor/duracion_unidad
-- ============================================================================

-- 2.1 (la única fila real con categoria es la cuenta de prueba de Augusto —
--      confirmar con un select antes de correr si hay dudas; el cascade de
--      servicio_receta_items -> servicios ya borra su receta sola)
delete from servicios where categoria = 'lavados';

-- 2.2 (dropear la columna entera se lleva puesto el CHECK/NOT NULL solo,
--      no hace falta un DROP CONSTRAINT separado)
alter table servicios drop column categoria;

-- 2.3
alter table servicios add column descripcion text;

-- 2.4
alter table servicios add column duracion_valor integer check (duracion_valor is null or duracion_valor > 0);

-- 2.5
alter table servicios add column duracion_unidad text check (duracion_unidad is null or duracion_unidad in ('horas', 'dias'));

-- 2.6 (backfill de EJEMPLO: solo convierte los casos exactos, múltiplos de
--      60 minutos, a horas; el resto queda en null para cargar a mano)
update servicios
  set duracion_valor = duracion_estimada / 60,
      duracion_unidad = 'horas'
  where duracion_estimada is not null and duracion_estimada % 60 = 0;

-- 2.7 (correr recién después de confirmar que 2.6 backfilleó lo que se
--      podía backfillear)
alter table servicios drop column duracion_estimada;

-- ============================================================================
-- 3) SERVICIO_RECETA_ITEMS — soporte de línea "libre"
-- ============================================================================

-- 3.1
alter table servicio_receta_items add column nombre_libre text;

-- 3.2
alter table servicio_receta_items add column costo_estimado numeric(12, 2);

-- 3.3
alter table servicio_receta_items alter column cantidad drop not null;

-- 3.4 (nombre de constraint asumido por convención de Postgres para un
--      CHECK sin nombre sobre una sola columna: <tabla>_<columna>_check.
--      Si tira "constraint does not exist", buscar el nombre real con:
--      select conname from pg_constraint where conrelid = 'servicio_receta_items'::regclass;)
alter table servicio_receta_items drop constraint servicio_receta_items_cantidad_check;

-- 3.5
alter table servicio_receta_items add constraint servicio_receta_items_linea_check
  check (
    (insumo_id is not null and cantidad is not null and cantidad > 0)
    or
    (insumo_id is null and nombre_libre is not null and costo_estimado is not null and costo_estimado > 0)
  );

-- ============================================================================
-- 4) TURNO_RECETA_APLICADA — cierre del gap: snapshot de línea "libre"
--    al finalizar un trabajo (no estaba en PROPUESTA.md original)
-- ============================================================================

-- 4.1
alter table turno_receta_aplicada add column costo_estimado numeric(12, 2);

-- 4.2 (esta tabla no tenía CHECK propio en cantidad, solo NOT NULL —
--      no hace falta un DROP CONSTRAINT acá, a diferencia del punto 3.4)
alter table turno_receta_aplicada alter column cantidad drop not null;

-- 4.3 (nombre_insumo se sigue llenando siempre, incluso en una línea libre
--      —ahí guarda el nombre libre tal cual se cargó—, así que no hace
--      falta tocar esa columna)
alter table turno_receta_aplicada add constraint turno_receta_aplicada_linea_check
  check (
    (insumo_id is not null and cantidad is not null)
    or
    (insumo_id is null and costo_estimado is not null)
  );
