-- ============================================================================
-- Actualizar el CHECK de `turno_danios.tipos` con los tipos de daño nuevos.
--
-- El CHECK seguía con la lista original de TIPOS_DANIO y no contemplaba:
-- - `rasgada`, agregada a TIPOS_DANIO (compartido por Auto/Camioneta/SUV).
-- - `grasa`, `quemado`, `trizado`, de TIPOS_DANIO_MOTO (set propio de Moto).
-- Sin este ALTER, guardar un trabajo con cualquiera de estos 4 daños
-- marcados hace fallar el INSERT en turno_danios — y agregarTurno borra el
-- turno recién creado si eso pasa (ver data/TurnoContext.js), así que el
-- guardado del trabajo entero falla.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo ya usado en alter_insumos_categorias_reales.sql).
-- ============================================================================

alter table turno_danios drop constraint turno_danios_tipos_check;
alter table turno_danios add constraint turno_danios_tipos_check
  check (tipos <@ array[
    'rayon', 'abolladura', 'oxido', 'repintado',
    'trizadura', 'excremento_ave', 'laca_quemada', 'otro',
    'rasgada', 'grasa', 'quemado', 'trizado'
  ]::text[]);
