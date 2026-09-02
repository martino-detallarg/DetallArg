-- DetallArg — insumos.diluciones: text[] -> jsonb
-- Cada dilución pasa a ser un objeto { "texto": ..., "ml_por_uso": ... } en
-- vez de un string suelto, para poder guardar el ml por uso de cada una
-- (pedido de Augusto, punto 2c). ml_por_uso arranca en null: las diluciones
-- ya cargadas no tienen ese dato todavía, se completa a mano después.
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando
-- que cada uno terminó bien antes de seguir con el siguiente (ver
-- [[feedback_sql_bloques_chicos_supabase]] — no agrupar todo en un solo
-- begin;/commit;).

-- 1) Columna nueva en paralelo (no se toca la vieja todavía)
alter table insumos add column diluciones_jsonb jsonb not null default '[]';

-- 2) Backfill: cada string de diluciones[] pasa a {"texto": <string>, "ml_por_uso": null}
update insumos
set diluciones_jsonb = (
  select coalesce(jsonb_agg(jsonb_build_object('texto', d, 'ml_por_uso', null)), '[]'::jsonb)
  from unnest(diluciones) as d
)
where diluciones is not null and array_length(diluciones, 1) > 0;

-- 3) Revisar ANTES de seguir: confirmar que diluciones_jsonb se ve bien
--    contra diluciones (columna vieja) para las filas que tenían datos.
select id, nombre, diluciones, diluciones_jsonb from insumos where array_length(diluciones, 1) > 0;

-- 4) Recién si 3) se ve bien: soltar la columna vieja y renombrar la nueva.
alter table insumos drop column diluciones;
alter table insumos rename column diluciones_jsonb to diluciones;
