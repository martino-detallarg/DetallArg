-- ============================================================================
-- turnos.conformidad_estado: sumar 'no_aplica' — trabajos rápidos donde el
-- taller elige saltear inspección de daños y firma de conformidad (ver
-- TipoVehiculoStep.js). Distinto de 'pendiente' (que sí se iba a firmar,
-- solo que el cliente no estaba en el momento del check-in) — 'no_aplica'
-- nunca dispara el aviso "Conformidad pendiente de firma" en
-- TrabajoDetalleModal.js, ni tiene sentido completarla después con
-- CompletarFirmaModal.js (no hay daños ni PDF que armar retroactivo).
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
--
-- `turnos_conformidad_estado_check` es el nombre que Postgres le da por
-- default al check inline sin nombre propio de alter_turnos_conformidad_estado.sql
-- (patrón <tabla>_<columna>_check) -- si al correr esto Postgres avisa que
-- ese nombre no existe, buscar el nombre real con:
--   select conname from pg_constraint where conrelid = 'turnos'::regclass and contype = 'c';
-- y reemplazarlo en el DROP de abajo antes de re-correr.
-- ============================================================================

alter table turnos
  drop constraint if exists turnos_conformidad_estado_check;

alter table turnos
  add constraint turnos_conformidad_estado_check
  check (conformidad_estado in ('pendiente', 'firmada', 'no_aplica'));
