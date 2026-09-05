-- ============================================================================
-- insumos.ml_por_uso — pedido de Augusto (calculadora de dosis en Mis
-- Insumos + selector x1/x2/x3 en Receta de Insumos).
--
-- Dosis base de ESTE taller para el insumo (cuántos ml usa por trabajo),
-- calculada UNA vez desde la calculadora de dosis: dilución que usa (1:Y) +
-- volumen de mezcla en litros que carga por trabajo -> ml_por_uso =
-- (volumen_litros * 1000) / Y. Reemplaza la carga manual de ml que hacía
-- antes RecetaServicioStep.js.
--
-- A propósito NO es lo mismo que insumos.diluciones[].ml_por_uso (jsonb, ver
-- alter_insumos_diluciones_jsonb.sql): ese es un dato POR CADA dilución
-- recomendada del catálogo (puede haber varias), este es UN solo valor por
-- insumo, la dosis real que usa el taller — con el nuevo diseño, las
-- diluciones del catálogo pasan a ser solo texto de referencia
-- ("Recomendado: ..."), ya no seleccionables ni usadas para calcular nada;
-- su `ml_por_uso` anidado queda sin uso de acá en más (no se borra ese
-- campo del jsonb en este ALTER, por las dudas de que algo lo siga leyendo
-- en algún lado — a confirmar antes de limpiarlo aparte).
--
-- Nullable, sin default: null es el estado esperado para todo insumo que
-- todavía no pasó por la calculadora nueva (incluidos los ya cargados hoy)
-- — la app debe seguir pidiendo el ml a mano en la receta para esos, nunca
-- inventar un valor ni bloquear el guardado por no tenerlo.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql). El lado de
-- la app (calculadora de dosis en AgregarInsumoModal.js/DataContext.js, y
-- el selector x1/x2/x3 en RecetaServicioStep.js) se construye recién
-- después de que esto esté corrido, para no escribir código contra un
-- campo que todavía no existe.
-- ============================================================================

alter table insumos
  add column ml_por_uso numeric(10, 2) check (ml_por_uso is null or ml_por_uso > 0);

comment on column insumos.ml_por_uso is
  'Dosis base del insumo para este taller (ml por uso), calculada una vez desde la calculadora de dosis de Mis Insumos (dilución 1:Y + volumen de mezcla en litros). Null si el insumo todavía no pasó por la calculadora — la receta de servicios sigue pidiendo el ml a mano en ese caso. No confundir con diluciones[].ml_por_uso (jsonb), que es por cada dilución recomendada del catálogo, no la dosis real del taller.';
