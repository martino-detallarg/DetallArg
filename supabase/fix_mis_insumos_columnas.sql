-- DetallArg — arreglo de "Mis Insumos no se pudo cargar".
--
-- Causa: data/DataContext.js hace un SELECT con estas columnas de `insumos`:
--   se_diluye, dilucion_x, envase_aplicador_ml, ml_por_uso, material_ppf, ancho_rollo
-- Si UNA sola no existe en la base real, Postgres devuelve error 42703 y toda la
-- pantalla falla con "No pudimos cargar los insumos".
--
-- Este archivo es IDEMPOTENTE: se puede correr entero, y varias veces, sin romper nada
-- (usa "add column if not exists"). Suma solo las columnas que falten y no toca datos.
-- No borra las columnas viejas (diluciones, rendimiento): eso queda para después.
--
-- Correr en el SQL Editor de Supabase, todo junto.

-- 1) Diagnóstico (opcional, informativo): qué columnas de las 6 ya existían antes de correr esto.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'insumos'
  and column_name in ('se_diluye', 'dilucion_x', 'envase_aplicador_ml', 'ml_por_uso', 'material_ppf', 'ancho_rollo')
order by column_name;

-- 2) Columnas del modelo de consumo (ex alter_insumos_ml_por_uso.sql, parte 1).
alter table insumos add column if not exists se_diluye boolean not null default false;
alter table insumos add column if not exists dilucion_x numeric(10, 2) check (dilucion_x is null or dilucion_x > 0);
alter table insumos add column if not exists envase_aplicador_ml numeric(10, 2) check (envase_aplicador_ml is null or envase_aplicador_ml > 0);
alter table insumos add column if not exists ml_por_uso numeric(10, 2) check (ml_por_uso is null or ml_por_uso > 0);

-- 3) Ancho de rollo de PPF (ex alter_insumos_ancho_rollo.sql).
alter table insumos add column if not exists ancho_rollo numeric(6, 2) check (ancho_rollo is null or ancho_rollo > 0);

-- 4) Material del rollo de PPF: carrocería o vidrio (ex alter_insumos_material_ppf.sql).
--    Default 'carroceria' para que los rollos ya cargados sigan igual.
alter table insumos add column if not exists material_ppf text not null default 'carroceria' check (material_ppf in ('carroceria', 'vidrio'));

-- 5) Verificación final: deben aparecer las 6 columnas.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'insumos'
  and column_name in ('se_diluye', 'dilucion_x', 'envase_aplicador_ml', 'ml_por_uso', 'material_ppf', 'ancho_rollo')
order by column_name;
