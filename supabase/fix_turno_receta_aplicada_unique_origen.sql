-- Arreglo de alter_turnos_servicio_previo_ppf.sql: turno_receta_aplicada
-- tenía `unique (turno_id, insumo_id)` (schema.sql). Desde que un trabajo
-- PPF puede tener servicio previo, TurnoContext.actualizarEstadoTrabajo
-- inserta una fila por insumo Y por origen ('principal' / 'previo') — si el
-- servicio principal y el previo usan el mismo insumo, el INSERT fallaba
-- por esa unicidad y el trabajo no se podía pasar a "Finalizado".
-- La unicidad pasa a ser (turno_id, insumo_id, origen).
--
-- Idempotente: se puede correr más de una vez. Correr en el SQL Editor de
-- Supabase, todo junto.

alter table turno_receta_aplicada
  drop constraint if exists turno_receta_aplicada_turno_id_insumo_id_key;

alter table turno_receta_aplicada
  drop constraint if exists turno_receta_aplicada_turno_id_insumo_id_origen_key;

alter table turno_receta_aplicada
  add constraint turno_receta_aplicada_turno_id_insumo_id_origen_key
  unique (turno_id, insumo_id, origen);

-- Diagnóstico (opcional): confirmar que quedó solo la unicidad nueva.
-- select conname, pg_get_constraintdef(oid) from pg_constraint
-- where conrelid = 'turno_receta_aplicada'::regclass and contype = 'u';
