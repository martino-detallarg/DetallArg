-- ============================================================================
-- turno_medicion_micrones — medición de espesor de pintura (micrones/µm)
-- opcional en el check-in de un trabajo (ver Inspección Visual,
-- InspeccionVisualStep.js -> MedicionMicronesModal.js). Dato típico de un
-- medidor de espesor/micrómetro que muchos detailers ya usan para detectar
-- repintados. Mismo patrón que turno_ppf_paneles/turno_danios: snapshot por
-- trabajo, ligado a turno_id, SIN taller_id propio (ownership vía
-- turnos.taller_id).
--
-- El taller elige UN SOLO modo por trabajo, nunca los dos combinados en el
-- mismo turno (decisión ya tomada, ver el prompt original):
--   - "Por panel": una fila por cada zona medida, con panel_id/vista
--     seteados (mismo criterio que turno_ppf_paneles) — no hace falta que
--     estén TODAS las zonas, el taller puede medir solo algunas.
--   - "Promedio general": una única fila con panel_id/vista en null,
--     representa el promedio de todo el vehículo.
-- El código que lee esta tabla (TurnoContext.js) distingue el modo así: una
-- sola fila con panel_id null = promedio general; una o más filas con
-- panel_id seteado = por panel.
--
-- No es un snapshot inmutable en el mismo sentido que turno_receta_aplicada/
-- turno_ppf_paneles (esos se congelan al FINALIZAR el trabajo, resolviendo
-- contra una config vigente en ese momento) — acá el valor lo tipea el
-- taller directo al cargar el check-in, así que se inserta una sola vez al
-- crear el turno (mismo momento que turno_danios/turno_empleados, ver
-- TurnoContext.agregarTurno). Igual que esas, sin política de UPDATE/DELETE:
-- no hay ninguna pantalla que edite un turno ya guardado.
--
-- Correr en el SQL Editor de Supabase (no hay CLI de migraciones en este
-- repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

create table if not exists turno_medicion_micrones (
  id         uuid primary key default gen_random_uuid(),
  turno_id   uuid not null references turnos (id) on delete cascade,

  -- null en modo "promedio general" (una sola fila); seteado en modo "por
  -- panel" (una fila por zona medida). Mismo id que ya usan los diagramas
  -- de check-in (ver turno_danios.zona_id / turno_ppf_paneles.panel_id).
  panel_id   text,
  -- Vista del diagrama al momento de medir (ej. "frente", "lateral") — null
  -- junto con panel_id en modo "promedio general". Se guarda aparte de
  -- panel_id, mismo criterio que turno_ppf_paneles.vista: no depender de
  -- parsear el string, y que los diagramas que no namespacean también
  -- puedan registrar la vista sin ambigüedad.
  vista      text,

  micrones   numeric not null check (micrones > 0),
  created_at timestamptz not null default now(),

  -- Ambos null (promedio general) o ambos seteados (por panel) — nunca uno
  -- solo, para no dejar una fila "por panel" sin saber de qué vista es.
  check ((panel_id is null) = (vista is null))
);

comment on table turno_medicion_micrones is
  'Medición opcional de espesor de pintura (µm) cargada en el check-in de un trabajo. UN SOLO modo por turno: una fila con panel_id/vista null = promedio general; una o más filas con panel_id/vista seteados = por panel. Se inserta una sola vez al crear el turno (TurnoContext.agregarTurno), igual que turno_danios/turno_empleados — no hay edición posterior.';

-- ----------------------------------------------------------------------------
-- RLS — mismo patrón que turno_ppf_paneles: SIN taller_id propio (ownership
-- vía turnos.taller_id), SOLO SELECT/INSERT (se inserta una sola vez al
-- crear el turno, nunca se actualiza ni se borra por separado — si el turno
-- entero se borra, el ON DELETE CASCADE de turno_id se encarga).
-- ----------------------------------------------------------------------------

alter table public.turno_medicion_micrones enable row level security;

drop policy if exists "turno_medicion_micrones_select_propio" on public.turno_medicion_micrones;
create policy "turno_medicion_micrones_select_propio"
  on public.turno_medicion_micrones for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_medicion_micrones.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_medicion_micrones_insert_propio" on public.turno_medicion_micrones;
create policy "turno_medicion_micrones_insert_propio"
  on public.turno_medicion_micrones for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_medicion_micrones.turno_id
        and turnos.taller_id = auth.uid()
    )
  );
