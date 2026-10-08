-- Arreglo de alter_turnos_costo_ppf_finanzas.sql: turnos.insumo_ppf_id se
-- creó con `references insumos(id)` sin cláusula `on delete` (NO ACTION) —
-- eliminar desde Mis Insumos un rollo de PPF que algún trabajo tenga
-- elegido fallaba por la FK. Se alinea con turno_receta_aplicada.insumo_id
-- (schema.sql): `on delete set null`. Si el trabajo todavía no se finalizó,
-- al finalizarlo no se congela costo de material de carrocería (no hay
-- rollo con qué calcularlo); si ya se finalizó, su costo ya quedó
-- congelado en turno_receta_aplicada y no se pierde.
--
-- Idempotente: se puede correr más de una vez. Correr en el SQL Editor de
-- Supabase, todo junto.

alter table turnos
  drop constraint if exists turnos_insumo_ppf_id_fkey;

alter table turnos
  add constraint turnos_insumo_ppf_id_fkey
  foreign key (insumo_ppf_id) references insumos (id) on delete set null;
