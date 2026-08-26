-- ============================================================================
-- Ajuste de `insumos` para la migración de DataContext.js a Supabase.
--
-- La tabla `insumos` nunca fue escrita por ningún Context (DataContext seguía
-- 100% en memoria hasta ahora), así que no hay filas reales que backfillear.
--
-- 1. `categoria` tenía el CHECK con las categorías placeholder originales
--    (desengrasantes, shampoo, pulidores, protecciones, interiores,
--    rejuvenecedores). El catálogo real de Augusto (478 productos,
--    data/mockInsumos.js) usa 10 categorías completamente distintas — con el
--    CHECK viejo, insertar cualquier insumo real fallaría siempre.
-- 2. `ph` se saca del catálogo real (ya no lo pide AgregarInsumoModal.js) —
--    columna huérfana.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo ya usado para sumar las columnas de ubicación
-- de Google Places a `talleres`).
-- ============================================================================

alter table insumos drop column ph;

alter table insumos drop constraint insumos_categoria_check;
alter table insumos add constraint insumos_categoria_check
  check (categoria in (
    'lavado_exterior', 'interior', 'pulido_correccion', 'proteccion_sellado',
    'accesorios_consumibles', 'ceras', 'vidrios', 'llantas_neumaticos',
    'apc_desengrasante', 'ceramicos'
  ));
