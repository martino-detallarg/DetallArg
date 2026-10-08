-- Conecta el costo real de un trabajo de PPF a Finanzas. Hoy
-- utils/calculosFinanzas.js (costoInsumosTurno/margenBrutoTrabajo) solo lee
-- turno_receta_aplicada -- un trabajo de PPF no tiene filas ahí, así que
-- Finanzas lo cuenta como si hubiera costado $0 (todo lo cobrado = ganancia
-- bruta). Esto corrige eso sin tocar la lógica de presupuesto/paneles que ya
-- funciona bien (utils/calculosPpf.js, data/ppfPanelMatrix.js).

-- 1) Lo que se elige en el paso de Presupuesto de PPF (PresupuestoPpfStep.js)
--    hoy NO se persiste en ningún lado -- vive solo en el estado local del
--    wizard y se pierde al guardar el turno. Estas columnas guardan ese plan
--    para poder usarlo después, al finalizar el trabajo (que puede pasar en
--    otro día/sesión).
alter table turnos
  add column if not exists insumo_ppf_id uuid references insumos(id),
  add column if not exists modo_corte_ppf text,
  add column if not exists mano_obra_ppf_estimada numeric(12,2),
  add column if not exists insumos_adicionales_ppf_estimado numeric(12,2);

alter table turnos
  drop constraint if exists turnos_modo_corte_ppf_check;

alter table turnos
  add constraint turnos_modo_corte_ppf_check
  check (modo_corte_ppf is null or modo_corte_ppf in ('manual', 'laser'));

-- Nota: mano_obra_ppf_estimada queda guardada solo a nivel informativo (para
-- poder mostrar/exportar el presupuesto completo más adelante) -- decisión
-- de Augusto (1/10/2026): la mano de obra de PPF NO se resta del margen,
-- mismo criterio que el resto de la app (v1 sin mano de obra en ningún
-- cálculo de Finanzas). No hace falta ninguna columna de snapshot para esto.

-- 2) El material del PPF (rollo real usado, según m² real) y los insumos
--    adicionales del presupuesto SÍ se congelan en turno_receta_aplicada,
--    reusando la misma tabla/mecánica que cualquier receta normal (con
--    origen nuevo, para distinguirlos en el detalle del trabajo sin afectar
--    ningún cálculo -- costoInsumosTurno ya suma TODAS las filas del turno
--    sin filtrar por origen).
--    Nota de orden: esto puede correrse antes o después de
--    alter_turnos_servicio_previo_ppf.sql (el que agregó `origen` por
--    primera vez) -- el add column if not exists de abajo lo cubre en
--    cualquiera de los dos órdenes.
alter table turno_receta_aplicada
  add column if not exists origen text not null default 'principal';

alter table turno_receta_aplicada
  drop constraint if exists turno_receta_aplicada_origen_check;

alter table turno_receta_aplicada
  add constraint turno_receta_aplicada_origen_check
  check (origen in ('principal', 'previo', 'ppf_material', 'ppf_adicional'));

-- Diagnóstico rápido post-migración (no hace falta correrlo):
-- select column_name from information_schema.columns where table_name = 'turnos'
--   and column_name like '%ppf%';
