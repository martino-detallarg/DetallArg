-- ============================================================================
-- comisiones_tarjeta_cuotas — reemplaza el % único de
-- talleres.comision_tarjeta_porcentaje por una LISTA de planes de cuotas
-- (ver el prompt "Comisión de tarjeta por cantidad de cuotas"): la
-- comisión real que cobra el medio de pago varía según la cantidad de
-- cuotas que elige el cliente (ej. 5% en 1 pago, 8% en 3 cuotas, 15% en 6
-- cuotas), un solo % fijo no lo representaba bien.
--
-- Mismo patrón que costos_fijos: taller_id directo (no vía join), CRUD
-- completo (agregarPlanCuotas/editarPlanCuotas/eliminarPlanCuotas en
-- TallerContext.js). `unique (taller_id, cuotas)` — un solo plan por
-- cantidad de cuotas por taller, coherente con que el selector de
-- RegistrarCobroModal.js no puede mostrar dos chips para la misma
-- cantidad de cuotas.
--
-- Correr en el SQL Editor de Supabase (no hay CLI de migraciones en este
-- repo — mismo mecanismo que el resto de los archivos de supabase/).
-- ============================================================================

create table if not exists comisiones_tarjeta_cuotas (
  id                   uuid primary key default gen_random_uuid(),
  taller_id            uuid not null references talleres (id) on delete cascade,
  cuotas               integer not null check (cuotas > 0),
  comision_porcentaje  numeric not null check (comision_porcentaje >= 0 and comision_porcentaje <= 100),

  unique (taller_id, cuotas)
);

comment on table comisiones_tarjeta_cuotas is
  'Planes de comisión de tarjeta del taller, uno por cantidad de cuotas (ej. 1 pago 5%, 3 cuotas 8%). Editables desde ConfiguracionFinanzasScreen.js, elegidos al registrar un cobro con forma de pago Tarjeta (RegistrarCobroModal.js) — el % elegido se fotografía en cobros.comision_porcentaje/cobros.cuotas, este plan puede seguir cambiando después sin afectar cobros ya registrados.';

-- ----------------------------------------------------------------------------
-- cobros.cuotas — fotografiada junto con comision_porcentaje (ver
-- alter_cobros_comision_porcentaje.sql, mismo criterio de estilo/comentario):
-- la cantidad de cuotas elegida al registrar ESE cobro puntual, ya sea de un
-- plan guardado en comisiones_tarjeta_cuotas o cargada a mano para esa vez
-- sin guardarla como plan. Null para cobros en efectivo/transferencia/otro,
-- o tarjeta sin cuotas elegidas (el cobro se guarda igual, sin comisión
-- calculada).
-- ----------------------------------------------------------------------------

alter table cobros
  add column if not exists cuotas integer null check (cuotas is null or cuotas > 0);

comment on column cobros.cuotas is
  'Cantidad de cuotas elegida al registrar este cobro (de un plan guardado o cargada a mano para esa vez) — fotografiada junto con comision_porcentaje, nunca se recalcula después. Null si no se eligió ninguna (cobro sin comisión, o forma de pago distinta de tarjeta).';

-- ----------------------------------------------------------------------------
-- Migración de datos: el % fijo que ya tenía cargado el taller (si lo
-- tenía) se conserva como el plan de "1 pago" — no se pierde. `on conflict
-- do nothing` por si esta migración se corre más de una vez por error.
-- ----------------------------------------------------------------------------

insert into comisiones_tarjeta_cuotas (taller_id, cuotas, comision_porcentaje)
select id, 1, comision_tarjeta_porcentaje
from talleres
where comision_tarjeta_porcentaje is not null and comision_tarjeta_porcentaje > 0
on conflict (taller_id, cuotas) do nothing;

-- talleres.comision_tarjeta_porcentaje queda como columna LEGACY a partir de
-- acá: NO se borra (para no arriesgar nada), pero el código deja de leerla
-- y escribirla por completo desde este cambio — no usarla en código nuevo,
-- la fuente de verdad pasó a ser comisiones_tarjeta_cuotas.
comment on column talleres.comision_tarjeta_porcentaje is
  'LEGACY — reemplazada por comisiones_tarjeta_cuotas (ver crear_comisiones_tarjeta_cuotas.sql). El código ya no la lee ni la escribe. Se conserva sin borrar por las dudas; su valor, si lo tenía, ya se migró como el plan de 1 cuota en comisiones_tarjeta_cuotas.';

-- ----------------------------------------------------------------------------
-- RLS — mismo patrón que costos_fijos: taller_id directo, CRUD completo.
-- ----------------------------------------------------------------------------

alter table public.comisiones_tarjeta_cuotas enable row level security;

drop policy if exists "comisiones_tarjeta_cuotas_select_propio" on public.comisiones_tarjeta_cuotas;
create policy "comisiones_tarjeta_cuotas_select_propio"
  on public.comisiones_tarjeta_cuotas for select to authenticated
  using (auth.uid() = taller_id);

drop policy if exists "comisiones_tarjeta_cuotas_insert_propio" on public.comisiones_tarjeta_cuotas;
create policy "comisiones_tarjeta_cuotas_insert_propio"
  on public.comisiones_tarjeta_cuotas for insert to authenticated
  with check (auth.uid() = taller_id);

drop policy if exists "comisiones_tarjeta_cuotas_update_propio" on public.comisiones_tarjeta_cuotas;
create policy "comisiones_tarjeta_cuotas_update_propio"
  on public.comisiones_tarjeta_cuotas for update to authenticated
  using (auth.uid() = taller_id)
  with check (auth.uid() = taller_id);

drop policy if exists "comisiones_tarjeta_cuotas_delete_propio" on public.comisiones_tarjeta_cuotas;
create policy "comisiones_tarjeta_cuotas_delete_propio"
  on public.comisiones_tarjeta_cuotas for delete to authenticated
  using (auth.uid() = taller_id);
