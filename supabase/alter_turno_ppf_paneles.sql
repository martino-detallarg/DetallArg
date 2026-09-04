-- ============================================================================
-- turno_ppf_paneles — pedido de Augusto.
--
-- Registro de qué paneles se cubrieron con PPF en un trabajo real puntual,
-- para poder reconstruir después qué se hizo en cada turno y, con el
-- tiempo, comparar el m² que calculó la app contra el m² que realmente se
-- usó — el dato clave para afinar la matriz de m² con uso real, no solo con
-- la estimación inicial.
--
-- Tabla aparte (no jsonb en turnos), mismo criterio que turno_danios/
-- turno_empleados/turno_receta_aplicada: son varias filas por turno, con su
-- propia FK y RLS vía turnos.taller_id, no un blob dentro de la fila del
-- turno — más fácil de consultar/agregar en el análisis futuro que dice el
-- pedido (ej. "promedio de m² real por panel en todos los trabajos PPF").
--
-- Snapshot INMUTABLE una vez insertado, mismo criterio que
-- turno_receta_aplicada.costo_unitario_snapshot: m2 queda congelado tal
-- como se calculó en ese momento, aunque la matriz de m² de la app cambie
-- después — si se recalculara, se perdería justamente el dato real contra
-- el que comparar.
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql). El lado de
-- la app (selector de paneles reusando los diagramas de check-in + el
-- cálculo de presupuesto) se construye aparte, después de este ALTER.
-- ============================================================================

create table turno_ppf_paneles (
  id          uuid primary key default gen_random_uuid(),
  turno_id    uuid not null references turnos (id) on delete cascade,

  -- Mismo id que ya usan los diagramas de check-in — namespaced
  -- "<vistaId>__<zonaId>" en los diagramas por imagen+zonas (ver
  -- components/diagrams/vehicles/ImageZoneDiagram.js), o el id plano de los
  -- diagramas más viejos (PickupCabinaSimpleDiagram.js/DamageDiagram.js).
  panel_id    text not null,

  -- Vista del diagrama al momento de cubrir el panel (ej. "frente",
  -- "lateral"). Se guarda aparte de panel_id (aunque en los diagramas
  -- namespaced ya vaya implícita ahí) para no depender de parsear el string
  -- y para que los diagramas viejos, que no namespacean, también puedan
  -- registrar la vista sin ambigüedad.
  vista       text not null,

  -- m² CONGELADO al momento de cubrir el panel — no se recalcula después
  -- aunque cambie la matriz de m² de la app (ver nota de arriba).
  m2          numeric(10, 2) not null check (m2 > 0),

  -- Un panel no debería quedar registrado dos veces para el mismo turno.
  unique (turno_id, panel_id)
);

comment on table turno_ppf_paneles is
  'Snapshot inmutable de los paneles cubiertos con PPF en un trabajo real, con el m² calculado en ese momento. Se inserta una vez por turno PPF; no se actualiza ni se borra después (mismo criterio que turno_receta_aplicada) — es la base para comparar, con el tiempo, la estimación de la app contra el uso real.';

-- ----------------------------------------------------------------------------
-- RLS — mismo patrón que turno_receta_aplicada: SIN taller_id propio
-- (ownership vía turnos.taller_id), SOLO SELECT/INSERT porque es un
-- snapshot congelado que nunca se actualiza ni se borra una vez insertado.
-- ----------------------------------------------------------------------------

alter table public.turno_ppf_paneles enable row level security;

drop policy if exists "turno_ppf_paneles_select_propio" on public.turno_ppf_paneles;
create policy "turno_ppf_paneles_select_propio"
  on public.turno_ppf_paneles for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_ppf_paneles.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_ppf_paneles_insert_propio" on public.turno_ppf_paneles;
create policy "turno_ppf_paneles_insert_propio"
  on public.turno_ppf_paneles for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_ppf_paneles.turno_id
        and turnos.taller_id = auth.uid()
    )
  );
