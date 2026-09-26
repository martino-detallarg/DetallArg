-- DetallArg — insumos: unificar dilución/rendimiento en un único dato real
-- por insumo (pedido de Augusto, ver AgregarInsumoModal.js/ConfiguracionConsumoInsumo.js).
--
-- REEMPLAZA al draft anterior de este mismo archivo (commit 10055d1,
-- "Draft de migración para insumos.ml_por_uso", 5/9 — nunca corrido contra
-- la base real, "Sin aplicar, pendiente de que Nico lo corra"). Ese draft
-- solo sumaba una columna `ml_por_uso` suelta, calculada una vez desde una
-- calculadora de dosis (dilución 1:Y + volumen de mezcla en litros por
-- trabajo). Este ALTER es el diseño final, con más detalle: guarda también
-- CÓMO se llegó a ese número (se_diluye/dilucion_x/envase_aplicador_ml),
-- no sólo el resultado — así se puede volver a editar la configuración
-- después (ver EditarConsumoInsumoModal.js) sin perder el desglose, y el
-- envase de referencia es el del APLICADOR (rociador, foam cannon, balde),
-- no un volumen de mezcla genérico en litros.
--
-- Hasta acá el consumo de un insumo se guardaba como `diluciones` (array de
-- {texto, ml_por_uso}, jsonb -- ver alter_insumos_diluciones_jsonb.sql) más
-- `rendimiento` (texto libre, "cantidad de vehículos" sin relación real con
-- nada). Ninguno de los dos daba de verdad el dato que el resto de la app
-- necesita: cuántos ml de producto PURO se gastan en 1 uso/auto.
--
-- Reemplazo: 4 columnas simples, una sola dilución por insumo (no un array):
--   - se_diluye (bool)
--   - dilucion_x (numeric, el X de "1:X") -- null si no se diluye
--   - envase_aplicador_ml (numeric, el envase donde se prepara la mezcla
--     LISTA PARA USAR -- rociador, foam cannon, balde -- no el envase de
--     compra del producto puro, ese sigue siendo capacidad_total) -- null
--     si no se diluye
--   - ml_por_uso (numeric) -- el dato canónico que usa el resto de la app
--     (RecetaServicioStep.js, NotificacionStockBajoCard.js): si se diluye,
--     envase_aplicador_ml / (dilucion_x + 1); si no, el número que carga el
--     taller directo. SIEMPRE presente cuando el insumo está bien
--     configurado, null si todavía no.
--
-- A propósito NO se migra ningún número de los insumos ya cargados con el
-- modelo viejo: no hay forma confiable de derivar ml_por_uso de un
-- "rendimiento" en cantidad de vehículos, ni de un ml-por-litro-de-mezcla
-- que nunca preguntó cuánta mezcla gasta un auto. Todos arrancan con
-- se_diluye = false y ml_por_uso = null -- se completan a mano cuando el
-- taller edite ese insumo desde Mis Insumos (ver EditarConsumoInsumoModal.js).
-- Toda pantalla que lea ml_por_uso tiene que manejar ese null sin romperse.
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando
-- que cada uno terminó bien antes de seguir con el siguiente (mismo
-- criterio que alter_insumos_diluciones_jsonb.sql -- no agrupar todo en un
-- solo begin;/commit;).

-- 1) Columnas nuevas, todas nullable salvo se_diluye (default false).
alter table insumos add column se_diluye boolean not null default false;
alter table insumos add column dilucion_x numeric(10, 2) check (dilucion_x is null or dilucion_x > 0);
alter table insumos add column envase_aplicador_ml numeric(10, 2) check (envase_aplicador_ml is null or envase_aplicador_ml > 0);
alter table insumos add column ml_por_uso numeric(10, 2) check (ml_por_uso is null or ml_por_uso > 0);

-- 2) Revisar ANTES de seguir: confirmar que las 4 columnas se ven bien
--    (se_diluye en false, el resto en null para todas las filas existentes).
select id, nombre, se_diluye, dilucion_x, envase_aplicador_ml, ml_por_uso from insumos;

-- 3) Recién si 2) se ve bien: soltar las dos columnas viejas.
alter table insumos drop column diluciones;
alter table insumos drop column rendimiento;

comment on column insumos.ml_por_uso is 'Ml de producto PURO que se gastan en 1 uso/auto -- dato canónico que usa el resto de la app (receta de servicios, estimación de usos restantes). null si el insumo todavía no tiene la configuración completa (se completa a mano desde Mis Insumos, nunca se infiere ni se inventa).';
