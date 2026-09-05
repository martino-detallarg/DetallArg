-- ============================================================================
-- Sumar tiene_tratamiento_actual / tipo_tratamiento_actual a `turnos`.
--
-- Nuevo paso del wizard de Trabajo Nuevo (TratamientoActualStep.js, entre
-- Inspección Visual y Conformidad): si el vehículo ya tiene un tratamiento
-- previo (acrílico/cerámico/cera/PPF) al momento del check-in. Puramente
-- descriptivo — no toca receta, costeo, ni dispara nada en Notificaciones.
--
-- Mismo criterio que kilometraje/nivel_nafta (ver alter_turnos_kilometraje.sql
-- y alter_turnos_etapa_a.sql): ambas columnas quedan NULLABLE a nivel de
-- base — la obligatoriedad de completar el paso la exige el wizard, no un
-- NOT NULL acá, porque los turnos ya cargados antes de este cambio no
-- tienen este dato y no se van a migrar a mano. Por el mismo motivo, sin
-- CHECK cruzado exigiendo tipo_tratamiento_actual cuando
-- tiene_tratamiento_actual es true — se decide en la UI del paso, no en la
-- base.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo).
-- ============================================================================

alter table turnos
  add column tiene_tratamiento_actual boolean,
  add column tipo_tratamiento_actual  text
                check (tipo_tratamiento_actual is null or tipo_tratamiento_actual in (
                  'acrilico', 'ceramico', 'cera', 'ppf'
                ));
