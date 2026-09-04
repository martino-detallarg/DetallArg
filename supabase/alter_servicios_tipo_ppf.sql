-- ============================================================================
-- servicios.es_ppf — pedido de Augusto.
--
-- Distingue un servicio de tipo PPF (paint protection film) de un servicio
-- normal. Cuando es_ppf es true, la app va a mostrar un selector de paneles
-- del vehículo (reusando los diagramas de check-in de
-- components/diagrams/vehicles) en vez de la receta de insumos habitual de
-- ServicioModal/RecetaServicioStep.js — ese lado de la app todavía no está
-- construido, este ALTER es solo la base de datos.
--
-- Mismo tipo/convención que servicios.es_personalizado (ver
-- supabase/schema.sql): boolean not null default false, para que las filas
-- existentes queden como servicio normal sin tocarlas.
--
-- A propósito NO agrega ningún constraint cruzado con servicio_receta_items
-- todavía (ej. "un servicio PPF no puede tener receta de insumos") — se
-- decide cuando se construya el lado de la app y se sepa el comportamiento
-- real que va a tener el selector de paneles.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table servicios
  add column es_ppf boolean not null default false;

comment on column servicios.es_ppf is
  'true si este servicio es de tipo PPF (paint protection film): la app muestra un selector de paneles cubiertos en vez de la receta de insumos habitual. false (default) = servicio normal, sin cambios de comportamiento.';
