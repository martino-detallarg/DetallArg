-- ============================================================================
-- URGENTE — cobros y gastos_variables: estas dos tablas están documentadas
-- en schema.sql (líneas 368-394) y sus políticas de RLS en
-- rls_tablas_negocio.sql (líneas 471-510) desde el commit ab974fe ("WIP:
-- Catálogo exportable a PDF + Finanzas Fase A"), pero JAMÁS se corrieron
-- contra la base real — confirmado el 2026-09-07 con information_schema
-- (Nico) y con PostgREST/anon key (PGRST205 "Could not find the table
-- 'public.cobros'/'public.gastos_variables' in the schema cache").
--
-- Impacto mientras esto no se corra: Finanzas Fase A completa está rota en
-- producción — RegistrarCobroModal, GastoVariableModal, CuentasPorCobrarScreen,
-- TrabajoPendienteCobroCard y FinanzasScreen fallan con el overlay de error
-- (ver FinanzasContext.js, no hay ningún camino que trague el error).
--
-- Extraído tal cual de schema.sql/rls_tablas_negocio.sql (columnas y
-- políticas correctas, nunca se tocó el diseño) — solo partido en bloques
-- chicos e independientes, SIN begin;/commit; agrupando nada, para no repetir
-- el rollback silencioso que ya tuvimos dos veces esta noche con
-- fotos-danios y con el bucket de comprobantes (ver
-- [[feedback_sql_bloques_chicos_supabase]]).
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando
-- que cada uno terminó bien antes de seguir con el siguiente.
--
-- DESPUÉS de esto, siguen pendientes (ya preparados, correr en este orden):
--   1) alter_finanzas_facturado_comprobante.sql (agrega facturado/
--      comprobante_storage_path a las dos tablas + bucket de comprobantes)
--   2) alter_gastos_variables_insumo_perdido.sql (agrega 'insumo_perdido' al
--      CHECK de categoria)
-- Ambos asumen que estas dos tablas ya existen — no se pueden correr antes.
-- ============================================================================

-- 1) Tabla cobros
create table cobros (
  id           uuid primary key default gen_random_uuid(),
  taller_id    uuid not null references talleres (id) on delete cascade,

  -- SET NULL (no CASCADE): si se borra el turno, el ingreso histórico se
  -- conserva — mismo criterio que turno_receta_aplicada.insumo_id.
  turno_id     uuid references turnos (id) on delete set null,

  monto        numeric(12, 2) not null check (monto > 0),
  fecha        date not null,
  forma_pago   text check (forma_pago in ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  created_at   timestamptz not null default now()
);

-- 2) Tabla gastos_variables — el costo de insumos NO entra acá: ya se cuenta
-- una vez al comprar el insumo (insumos.precio_compra) — sumarlo de nuevo
-- acá sería doble conteo (ver FinanzasScreen.js).
create table gastos_variables (
  id           uuid primary key default gen_random_uuid(),
  taller_id    uuid not null references talleres (id) on delete cascade,
  monto        numeric(12, 2) not null check (monto > 0),
  categoria    text not null check (categoria in ('personal_comisiones', 'otro')),
  fecha        date not null,
  descripcion  text,
  created_at   timestamptz not null default now()
);

-- 3) RLS en cobros — taller_id directo
alter table public.cobros enable row level security;

-- 4) Policy de lectura en cobros
drop policy if exists "cobros_select_propio" on public.cobros;
create policy "cobros_select_propio"
  on public.cobros for select to authenticated
  using (auth.uid() = taller_id);

-- 5) Policy de inserción en cobros — SOLO SELECT/INSERT: registrarCobro es
-- la única función hoy (v1 no tiene editar/eliminar un cobro ya registrado).
drop policy if exists "cobros_insert_propio" on public.cobros;
create policy "cobros_insert_propio"
  on public.cobros for insert to authenticated
  with check (auth.uid() = taller_id);

-- 6) RLS en gastos_variables — taller_id directo
alter table public.gastos_variables enable row level security;

-- 7) Policy de lectura en gastos_variables
drop policy if exists "gastos_variables_select_propio" on public.gastos_variables;
create policy "gastos_variables_select_propio"
  on public.gastos_variables for select to authenticated
  using (auth.uid() = taller_id);

-- 8) Policy de inserción en gastos_variables
drop policy if exists "gastos_variables_insert_propio" on public.gastos_variables;
create policy "gastos_variables_insert_propio"
  on public.gastos_variables for insert to authenticated
  with check (auth.uid() = taller_id);

-- 9) Policy de borrado en gastos_variables — SIN UPDATE: no existe una
-- función para editar un gasto ya cargado (agregarGastoVariable/
-- eliminarGastoVariable son las únicas en FinanzasContext.js).
drop policy if exists "gastos_variables_delete_propio" on public.gastos_variables;
create policy "gastos_variables_delete_propio"
  on public.gastos_variables for delete to authenticated
  using (auth.uid() = taller_id);
