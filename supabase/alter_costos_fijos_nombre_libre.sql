-- ============================================================================
-- Sacar el CHECK de categoría en `costos_fijos` y pasar a texto libre.
--
-- Pedido de Augusto: van a ser nombres específicos de costos individuales
-- (no categorías que agrupan varios), así que el CHECK con el catálogo fijo
-- (alquiler/sueldos/servicios/mantenimiento/seguro/otro) ya no tiene sentido.
-- Se renombra la columna a `nombre` (más preciso) y se elimina el constraint.
--
-- Las filas existentes quedan tal cual (sin migrar a mano) — el rename es
-- transparente para los datos ya cargados.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo).
-- ============================================================================

alter table costos_fijos drop constraint costos_fijos_categoria_check;
alter table costos_fijos rename column categoria to nombre;
