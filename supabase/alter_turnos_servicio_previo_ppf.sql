-- Servicio previo a un trabajo de PPF (lavado/pulido antes de instalar el PPF).
-- Alcance: solo para trabajos cuyo servicio principal es PPF (servicios.es_ppf = true).
-- No es un modelo general de "varios servicios por trabajo" -- decisión de Augusto
-- (1/10/2026): resolver esto puntual para PPF por ahora, no generalizar todavía.

-- 1) Qué servicio previo se hizo (opcional) y qué se cobró por él.
--    precio_servicio_previo queda separado de turnos.precio (que sigue siendo
--    el precio del servicio principal / presupuesto de PPF) para que el
--    desglose en el detalle del trabajo sea exacto. El total cobrado del
--    trabajo = precio + precio_servicio_previo.
alter table turnos
  add column if not exists servicio_previo_id uuid references servicios(id),
  add column if not exists precio_servicio_previo numeric(10,2);

-- 2) Las líneas de receta aplicadas (turno_receta_aplicada) necesitan saber
--    de qué servicio vienen -- el trabajo ahora puede tener recetas de DOS
--    servicios distintos (el principal y el previo) y conviene no mezclarlas
--    a ciegas, tanto para mostrar el desglose como para debug futuro.
--    El cálculo de costo total de insumos del trabajo (costoInsumosTurno en
--    utils/calculosFinanzas.js) sigue sumando TODAS las filas del turno sin
--    importar el origen -- esta columna es solo para trazabilidad/UI, no
--    cambia ninguna fórmula de Finanzas.
alter table turno_receta_aplicada
  add column if not exists origen text not null default 'principal';

alter table turno_receta_aplicada
  drop constraint if exists turno_receta_aplicada_origen_check;

alter table turno_receta_aplicada
  add constraint turno_receta_aplicada_origen_check
  check (origen in ('principal', 'previo'));

-- Diagnóstico rápido post-migración (no hace falta correrlo, es solo para
-- confirmar que las columnas quedaron bien si hace falta revisar):
-- select column_name, data_type from information_schema.columns
--   where table_name = 'turnos' and column_name in ('servicio_previo_id','precio_servicio_previo');
-- select column_name, data_type from information_schema.columns
--   where table_name = 'turno_receta_aplicada' and column_name = 'origen';
