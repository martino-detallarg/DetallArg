-- Arreglo de alter_turnos_servicio_previo_ppf.sql: turnos.servicio_previo_id
-- se creó con `references servicios(id)` sin cláusula `on delete`, o sea con
-- NO ACTION — borrar desde Mis Servicios un servicio que algún trabajo PPF
-- usó como servicio previo fallaba por la FK. Se alinea con
-- turnos.servicio_id (schema.sql): `on delete set null`. El trabajo conserva
-- precio_servicio_previo; la app muestra "Servicio previo" como nombre
-- genérico (ver TrabajoDetalleModal.js).
--
-- Idempotente: se puede correr más de una vez. Correr en el SQL Editor de
-- Supabase, todo junto.

alter table turnos
  drop constraint if exists turnos_servicio_previo_id_fkey;

alter table turnos
  add constraint turnos_servicio_previo_id_fkey
  foreign key (servicio_previo_id) references servicios (id) on delete set null;
