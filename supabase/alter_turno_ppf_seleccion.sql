-- ============================================================================
-- turno_ppf_seleccion — pedido de Augusto (parte de conectar la calculadora
-- de PPF al resto de la app, ver utils/calculosPpf.js y data/ppfPanelMatrix.js).
--
-- turno_ppf_paneles (alter_turno_ppf_paneles.sql) es un snapshot INMUTABLE
-- que recién se inserta cuando el trabajo pasa a "Finalizado" (mismo criterio
-- que turno_receta_aplicada) -- pero el taller elige los paneles a proteger
-- en el wizard de "Trabajo nuevo", que puede pasar días antes de que el
-- trabajo se termine. Hace falta un lugar donde guardar esa elección mientras
-- tanto: esta tabla es la versión "plan" (se escribe una sola vez, al crear
-- el turno, mismo momento que turno_danios/turno_empleados/turno_fotos_danio
-- en TurnoContext.agregarTurno) que TurnoContext.actualizarEstadoTrabajo lee
-- al pasar a "Finalizado" para calcular el m² real (contra la matriz VIGENTE
-- en ese momento, mismo criterio que turno_receta_aplicada recalculando el
-- costo contra el precio_compra vigente) e insertar recién ahí en
-- turno_ppf_paneles.
--
-- Tabla aparte (no jsonb en turnos), mismo criterio que turno_danios/
-- turno_empleados/turno_receta_aplicada/turno_ppf_paneles.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

create table turno_ppf_seleccion (
  id          uuid primary key default gen_random_uuid(),
  turno_id    uuid not null references turnos (id) on delete cascade,

  -- Mismo id namespaced "<vista>__<zonaId>" que usan los diagramas de
  -- check-in (ver data/ppfPanelMatrix.js) y que después se copia tal cual a
  -- turno_ppf_paneles.panel_id.
  panel_id    text not null,

  unique (turno_id, panel_id)
);

comment on table turno_ppf_seleccion is
  'Plan de paneles a proteger con PPF elegido en el wizard de Trabajo nuevo (se escribe una sola vez, al crear el turno). Se lee al finalizar el trabajo para calcular el m² real e insertar el snapshot inmutable en turno_ppf_paneles -- esta tabla NO es el snapshot final.';

-- ----------------------------------------------------------------------------
-- RLS — mismo patrón que turno_danios: SIN taller_id propio (ownership vía
-- turnos.taller_id), SOLO SELECT/INSERT (se escribe una sola vez al crear el
-- turno, nunca se edita ni se borra desde la app).
-- ----------------------------------------------------------------------------

alter table public.turno_ppf_seleccion enable row level security;

drop policy if exists "turno_ppf_seleccion_select_propio" on public.turno_ppf_seleccion;
create policy "turno_ppf_seleccion_select_propio"
  on public.turno_ppf_seleccion for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_ppf_seleccion.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_ppf_seleccion_insert_propio" on public.turno_ppf_seleccion;
create policy "turno_ppf_seleccion_insert_propio"
  on public.turno_ppf_seleccion for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_ppf_seleccion.turno_id
        and turnos.taller_id = auth.uid()
    )
  );
