-- ============================================================================
-- DetallArg — políticas de RLS para las 12 tablas de negocio restantes
-- (`talleres` ya se resolvió en supabase/trigger_nuevo_usuario.sql). Se
-- corre DESPUÉS de schema.sql y trigger_nuevo_usuario.sql.
--
-- Criterio (mismo que `talleres`, acordado antes de escribir esto):
--   - Todo queda `to authenticated` (nada para `anon`).
--   - Tablas con `taller_id` propio: `auth.uid() = taller_id` directo.
--   - Tablas sin `taller_id` (child tables): `exists (...)` contra la
--     tabla padre que sí lo tiene, subiendo la cadena hasta encontrarlo
--     (servicio_receta_items -> servicios; turno_danios/turno_fotos_danio/
--     turno_receta_aplicada -> turnos).
--   - Mínimo privilegio: solo se agrega una operación (SELECT/INSERT/
--     UPDATE/DELETE) si existe hoy una función real en el Context
--     correspondiente que la dispare. No se agrega "por las dudas".
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- horarios_atencion — taller_id directo. CRUD completo (actualizarHorario
-- es la única función hoy, pero la tabla ni siquiera se siembra todavía —
-- ver pendiente anotado en ESTADO_PROYECTO.md — así que se deja el CRUD
-- completo previendo el alta desde la app).
-- ----------------------------------------------------------------------------

alter table public.horarios_atencion enable row level security;

drop policy if exists "horarios_atencion_select_propio" on public.horarios_atencion;
create policy "horarios_atencion_select_propio"
  on public.horarios_atencion for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "horarios_atencion_insert_propio" on public.horarios_atencion;
create policy "horarios_atencion_insert_propio"
  on public.horarios_atencion for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "horarios_atencion_update_propio" on public.horarios_atencion;
create policy "horarios_atencion_update_propio"
  on public.horarios_atencion for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "horarios_atencion_delete_propio" on public.horarios_atencion;
create policy "horarios_atencion_delete_propio"
  on public.horarios_atencion for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- clientes — taller_id directo. CRUD completo (agregarCliente/
-- editarCliente/eliminarCliente, ya conectados a la UI).
-- ----------------------------------------------------------------------------

alter table public.clientes enable row level security;

drop policy if exists "clientes_select_propio" on public.clientes;
create policy "clientes_select_propio"
  on public.clientes for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "clientes_insert_propio" on public.clientes;
create policy "clientes_insert_propio"
  on public.clientes for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "clientes_update_propio" on public.clientes;
create policy "clientes_update_propio"
  on public.clientes for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "clientes_delete_propio" on public.clientes;
create policy "clientes_delete_propio"
  on public.clientes for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- vehiculos — taller_id directo (denormalizado a propósito, ver
-- schema.sql, para no necesitar un join acá). CRUD completo
-- (agregarVehiculo/editarVehiculo/eliminarVehiculo).
-- ----------------------------------------------------------------------------

alter table public.vehiculos enable row level security;

drop policy if exists "vehiculos_select_propio" on public.vehiculos;
create policy "vehiculos_select_propio"
  on public.vehiculos for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "vehiculos_insert_propio" on public.vehiculos;
create policy "vehiculos_insert_propio"
  on public.vehiculos for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "vehiculos_update_propio" on public.vehiculos;
create policy "vehiculos_update_propio"
  on public.vehiculos for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "vehiculos_delete_propio" on public.vehiculos;
create policy "vehiculos_delete_propio"
  on public.vehiculos for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- empleados — taller_id directo. CRUD completo (agregarEmpleado/
-- editarEmpleado/eliminarEmpleado).
-- ----------------------------------------------------------------------------

alter table public.empleados enable row level security;

drop policy if exists "empleados_select_propio" on public.empleados;
create policy "empleados_select_propio"
  on public.empleados for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "empleados_insert_propio" on public.empleados;
create policy "empleados_insert_propio"
  on public.empleados for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "empleados_update_propio" on public.empleados;
create policy "empleados_update_propio"
  on public.empleados for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "empleados_delete_propio" on public.empleados;
create policy "empleados_delete_propio"
  on public.empleados for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- insumos — taller_id directo. SELECT/INSERT/UPDATE (agregarInsumo,
-- descontarInsumos). SIN DELETE a propósito: no existe `eliminarInsumo` en
-- DataContext todavía — mínimo privilegio, no se agrega de más.
-- ----------------------------------------------------------------------------

alter table public.insumos enable row level security;

drop policy if exists "insumos_select_propio" on public.insumos;
create policy "insumos_select_propio"
  on public.insumos for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "insumos_insert_propio" on public.insumos;
create policy "insumos_insert_propio"
  on public.insumos for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "insumos_update_propio" on public.insumos;
create policy "insumos_update_propio"
  on public.insumos for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- costos_fijos — taller_id directo. CRUD completo (agregarCostoFijo/
-- actualizarCostoFijo/eliminarCostoFijo).
-- ----------------------------------------------------------------------------

alter table public.costos_fijos enable row level security;

drop policy if exists "costos_fijos_select_propio" on public.costos_fijos;
create policy "costos_fijos_select_propio"
  on public.costos_fijos for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "costos_fijos_insert_propio" on public.costos_fijos;
create policy "costos_fijos_insert_propio"
  on public.costos_fijos for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "costos_fijos_update_propio" on public.costos_fijos;
create policy "costos_fijos_update_propio"
  on public.costos_fijos for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "costos_fijos_delete_propio" on public.costos_fijos;
create policy "costos_fijos_delete_propio"
  on public.costos_fijos for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- servicios — taller_id directo. CRUD completo (agregarServicio/
-- editarServicio/eliminarServicio).
-- ----------------------------------------------------------------------------

alter table public.servicios enable row level security;

drop policy if exists "servicios_select_propio" on public.servicios;
create policy "servicios_select_propio"
  on public.servicios for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "servicios_insert_propio" on public.servicios;
create policy "servicios_insert_propio"
  on public.servicios for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "servicios_update_propio" on public.servicios;
create policy "servicios_update_propio"
  on public.servicios for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "servicios_delete_propio" on public.servicios;
create policy "servicios_delete_propio"
  on public.servicios for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- servicio_receta_items — SIN taller_id propio: ownership vía
-- servicios.taller_id. CRUD completo (RecetaServicioStep agrega, cambia
-- cantidad y saca líneas al marcar/desmarcar insumos).
-- ----------------------------------------------------------------------------

alter table public.servicio_receta_items enable row level security;

drop policy if exists "servicio_receta_items_select_propio" on public.servicio_receta_items;
create policy "servicio_receta_items_select_propio"
  on public.servicio_receta_items for select to authenticated
  using (
    exists (
      select 1 from public.servicios
      where servicios.id = servicio_receta_items.servicio_id
        and servicios.taller_id = auth.uid()
    )
  );

drop policy if exists "servicio_receta_items_insert_propio" on public.servicio_receta_items;
create policy "servicio_receta_items_insert_propio"
  on public.servicio_receta_items for insert to authenticated
  with check (
    exists (
      select 1 from public.servicios
      where servicios.id = servicio_receta_items.servicio_id
        and servicios.taller_id = auth.uid()
    )
  );

drop policy if exists "servicio_receta_items_update_propio" on public.servicio_receta_items;
create policy "servicio_receta_items_update_propio"
  on public.servicio_receta_items for update to authenticated
  using (
    exists (
      select 1 from public.servicios
      where servicios.id = servicio_receta_items.servicio_id
        and servicios.taller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.servicios
      where servicios.id = servicio_receta_items.servicio_id
        and servicios.taller_id = auth.uid()
    )
  );

drop policy if exists "servicio_receta_items_delete_propio" on public.servicio_receta_items;
create policy "servicio_receta_items_delete_propio"
  on public.servicio_receta_items for delete to authenticated
  using (
    exists (
      select 1 from public.servicios
      where servicios.id = servicio_receta_items.servicio_id
        and servicios.taller_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- turnos — taller_id directo. CRUD completo (agregarTurno,
-- actualizarTurno/actualizarEstadoTrabajo, eliminarTurno — ya conectado a
-- HomeScreen.js/AgendaScreen.js).
-- ----------------------------------------------------------------------------

alter table public.turnos enable row level security;

drop policy if exists "turnos_select_propio" on public.turnos;
create policy "turnos_select_propio"
  on public.turnos for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "turnos_insert_propio" on public.turnos;
create policy "turnos_insert_propio"
  on public.turnos for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "turnos_update_propio" on public.turnos;
create policy "turnos_update_propio"
  on public.turnos for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "turnos_delete_propio" on public.turnos;
create policy "turnos_delete_propio"
  on public.turnos for delete to authenticated
  using (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- turno_empleados — SIN taller_id propio: ownership vía turnos.taller_id.
-- SOLO SELECT/INSERT/DELETE: toggleEmpleado (DatosServicioStep.js) agrega o
-- saca una asignación completa, nunca edita el nombre congelado de una ya
-- existente — sin UPDATE, mínimo privilegio.
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- turno_danios — SIN taller_id propio: ownership vía turnos.taller_id.
-- CRUD completo (handleCambiarZona agrega, cambia tipos/nota, y borra la
-- línea cuando se desmarca la última zona).
-- ----------------------------------------------------------------------------

alter table public.turno_danios enable row level security;

drop policy if exists "turno_danios_select_propio" on public.turno_danios;
create policy "turno_danios_select_propio"
  on public.turno_danios for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_danios.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_danios_insert_propio" on public.turno_danios;
create policy "turno_danios_insert_propio"
  on public.turno_danios for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_danios.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_danios_update_propio" on public.turno_danios;
create policy "turno_danios_update_propio"
  on public.turno_danios for update to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_danios.turno_id
        and turnos.taller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_danios.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_danios_delete_propio" on public.turno_danios;
create policy "turno_danios_delete_propio"
  on public.turno_danios for delete to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_danios.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- turno_fotos_danio — SIN taller_id propio: ownership vía turnos.taller_id.
-- SOLO SELECT/INSERT: handleAgregarFotoDano únicamente agrega fotos al
-- array, no hay forma de sacar o editar una foto desde la UI hoy.
-- ----------------------------------------------------------------------------

alter table public.turno_fotos_danio enable row level security;

drop policy if exists "turno_fotos_danio_select_propio" on public.turno_fotos_danio;
create policy "turno_fotos_danio_select_propio"
  on public.turno_fotos_danio for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_fotos_danio.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_fotos_danio_insert_propio" on public.turno_fotos_danio;
create policy "turno_fotos_danio_insert_propio"
  on public.turno_fotos_danio for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_fotos_danio.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- turno_receta_aplicada — SIN taller_id propio: ownership vía
-- turnos.taller_id. SOLO SELECT/INSERT, A PROPÓSITO: es el snapshot
-- congelado de la receta aplicada (ver schema.sql) — el diseño dice
-- explícitamente que nunca se actualiza ni se borra una vez insertado.
-- Bloquear UPDATE/DELETE acá refuerza esa invariante en la base, no solo
-- por convención en el código.
-- ----------------------------------------------------------------------------

alter table public.turno_receta_aplicada enable row level security;

drop policy if exists "turno_receta_aplicada_select_propio" on public.turno_receta_aplicada;
create policy "turno_receta_aplicada_select_propio"
  on public.turno_receta_aplicada for select to authenticated
  using (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_receta_aplicada.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

drop policy if exists "turno_receta_aplicada_insert_propio" on public.turno_receta_aplicada;
create policy "turno_receta_aplicada_insert_propio"
  on public.turno_receta_aplicada for insert to authenticated
  with check (
    exists (
      select 1 from public.turnos
      where turnos.id = turno_receta_aplicada.turno_id
        and turnos.taller_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- cobros — taller_id directo. SOLO SELECT/INSERT: registrarCobro es la única
-- función hoy (v1 no tiene editar/eliminar un cobro ya registrado) — mínimo
-- privilegio, no se agrega de más.
-- ----------------------------------------------------------------------------

alter table public.cobros enable row level security;

drop policy if exists "cobros_select_propio" on public.cobros;
create policy "cobros_select_propio"
  on public.cobros for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "cobros_insert_propio" on public.cobros;
create policy "cobros_insert_propio"
  on public.cobros for insert to authenticated
  with check (auth.uid() = taller_id);

-- ----------------------------------------------------------------------------
-- gastos_variables — taller_id directo. SELECT/INSERT/DELETE
-- (agregarGastoVariable/eliminarGastoVariable). SIN UPDATE: no existe una
-- función para editar un gasto ya cargado — mínimo privilegio.
-- ----------------------------------------------------------------------------

alter table public.gastos_variables enable row level security;

drop policy if exists "gastos_variables_select_propio" on public.gastos_variables;
create policy "gastos_variables_select_propio"
  on public.gastos_variables for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "gastos_variables_insert_propio" on public.gastos_variables;
create policy "gastos_variables_insert_propio"
  on public.gastos_variables for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "gastos_variables_delete_propio" on public.gastos_variables;
create policy "gastos_variables_delete_propio"
  on public.gastos_variables for delete to authenticated
  using (auth.uid() = taller_id);

commit;
