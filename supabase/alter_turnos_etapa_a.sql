-- ============================================================================
-- Etapa A de la migración de TurnoContext.js a Supabase: 3 gaps encontrados
-- al re-investigar el esquema de `turnos`/RLS (de hace un par de noches)
-- contra la forma real del código hoy. `schema.sql` y
-- `rls_tablas_negocio.sql` ya reflejan el estado final — este archivo es el
-- ALTER real para correr a mano en el SQL Editor de Supabase (mismo
-- mecanismo ya usado en alter_insumos_categorias_reales.sql), después de
-- los originales.
--
-- 1. turnos_delete_propio: faltaba la policy de DELETE. El comentario
--    original decía "no existe eliminarTurno todavía" — pero ya existe y ya
--    está conectado a HomeScreen.js/AgendaScreen.js.
-- 2. turnos.servicio_nombre: ya se congela `precio` al crear el turno, pero
--    no el NOMBRE del servicio — mismo criterio: no se recalcula si el
--    servicio se renombra o se borra después.
-- 3. turno_empleados: no existía ninguna tabla para `empleadosAsignados`
--    ([{ empleadoId, nombreEmpleado }], nombre congelado al asignar, mismo
--    criterio que turno_receta_aplicada).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. turnos_delete_propio
-- ----------------------------------------------------------------------------

drop policy if exists "turnos_delete_propio" on public.turnos;
create policy "turnos_delete_propio"
  on public.turnos for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- 2. turnos.servicio_nombre
-- ----------------------------------------------------------------------------

alter table public.turnos add column if not exists servicio_nombre text;

comment on column public.turnos.servicio_nombre is
  'Copia congelada del nombre del servicio al momento de crear el turno (mismo criterio que precio): no se recalcula si el servicio se renombra o se borra después.';

-- ----------------------------------------------------------------------------
-- 3. turno_empleados
-- ----------------------------------------------------------------------------

create table if not exists public.turno_empleados (
  id               uuid primary key default gen_random_uuid(),
  turno_id         uuid not null references public.turnos (id) on delete cascade,
  empleado_id      uuid references public.empleados (id) on delete set null,
  nombre_empleado  text not null,

  unique (turno_id, empleado_id)
);

comment on table public.turno_empleados is
  'Empleados asignados a un turno (antes: turno.empleadosAsignados). empleado_id SET NULL (no CASCADE) si se borra el empleado, para conservar el nombre congelado como historial.';

alter table public.turno_empleados enable row level security;

drop policy if exists "turno_empleados_select_propio" on public.turno_empleados;
create policy "turno_empleados_select_propio"
  on public.turno_empleados for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_empleados.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_empleados_insert_propio" on public.turno_empleados;
create policy "turno_empleados_insert_propio"
  on public.turno_empleados for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_empleados.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_empleados_delete_propio" on public.turno_empleados;
create policy "turno_empleados_delete_propio"
  on public.turno_empleados for delete to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_empleados.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

commit;
