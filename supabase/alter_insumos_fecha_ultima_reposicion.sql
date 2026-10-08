-- Permite recalibrar mlPorUso automáticamente cuando el taller corrige el
-- nivel de un insumo "a mano" en cualquier momento (no solo cuando la app
-- avisa stock bajo) -- ver DataContext.ajustarNivelInsumo.
--
-- Idea: guardamos desde cuándo se está midiendo el envase actual. Cuando el
-- taller corrige el nivel, comparamos cuánto CREÍA haber consumido el
-- sistema desde esa fecha (sumando turno_receta_aplicada.cantidad de los
-- trabajos finalizados que usaron este insumo) contra cuánto dice la
-- corrección manual que realmente se consumió -- y ajustamos ml_por_uso con
-- esa diferencia. El taller no tiene que contar ni recordar nada: el único
-- dato nuevo que carga es el mismo que ya carga hoy (cuánto le queda).

alter table insumos
  add column if not exists fecha_ultima_reposicion timestamptz not null default now();

comment on column insumos.fecha_ultima_reposicion is
  'Desde cuándo se cuenta el consumo del envase actual, para recalibrar ml_por_uso al corregir el nivel a mano (ver DataContext.ajustarNivelInsumo/reponerInsumo). Se reinicia cada vez que se carga un envase nuevo (reponerInsumo) o cada vez que se corrige el nivel a mano (ajustarNivelInsumo) -- cada corrección vuelve a poner el contador en cero para la próxima vez. En insumos ya existentes queda en el momento en que se corre este ALTER: no hay forma de saber con certeza desde cuándo viene el envase actual de cada uno, así que arrancamos a contar desde ahora para todos.';

-- Diagnóstico rápido post-migración (no hace falta correrlo):
-- select id, nombre, fecha_ultima_reposicion from insumos limit 5;
