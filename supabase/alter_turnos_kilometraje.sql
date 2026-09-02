-- ============================================================================
-- Sumar `kilometraje` a `turnos`.
--
-- Nuevo campo obligatorio del paso "Tipo de Vehículo" del wizard de Trabajo
-- Nuevo (TipoVehiculoStep.js): kilometraje del vehículo al momento de la
-- llegada. Mismo criterio que tipo_vehiculo/grupo_vehiculo/
-- subdivision_vehiculo/nivel_nafta (agregados en alter_turnos_etapa_a.sql):
-- la columna queda NULLABLE a nivel de base — la obligatoriedad la exige el
-- propio paso del wizard, no un NOT NULL acá, porque los turnos ya cargados
-- antes de este cambio no tienen este dato y no se van a migrar a mano.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo).
-- ============================================================================

alter table turnos
  add column kilometraje integer check (kilometraje is null or kilometraje >= 0);
