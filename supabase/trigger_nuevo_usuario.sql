-- ============================================================================
-- DetallArg — trigger de alta de usuario + política mínima de RLS para
-- `talleres`. Se corre DESPUÉS de supabase/schema.sql.
--
-- Contexto: RLS ya está activado en las 13 tablas (sin políticas), así que
-- hoy `talleres` está bloqueada incluso para su dueño. Este archivo:
--   1. Crea `handle_new_user()`: al registrarse alguien en auth.users, esta
--      función inserta automáticamente su fila en public.talleres (mismo
--      id). Usa `security definer` a propósito: sin eso, el INSERT
--      quedaría sujeto a las políticas de RLS igual que cualquier query
--      normal, y en el momento del trigger todavía no hay ninguna policy
--      de INSERT para `talleres` (a propósito: la fila nunca se crea a
--      mano desde el cliente, solo vía este trigger). `security definer`
--      hace que la función corra con los privilegios de quien la creó
--      (postgres, vía SQL Editor), que tiene BYPASSRLS — por eso el INSERT
--      funciona a pesar de RLS. `set search_path = public` es hardening
--      estándar para funciones security definer (evita que alguien
--      secuestre la resolución de `public.talleres` cambiando el
--      search_path de la sesión).
--   2. Políticas de RLS SOLO para `talleres` (las otras 12 tablas quedan
--      sin políticas todavía, a propósito — se hacen aparte con calma):
--      un usuario autenticado puede VER y ACTUALIZAR únicamente su propia
--      fila (auth.uid() = id). No hay policy de INSERT para el rol
--      `authenticated`: la única vía de alta es el trigger de arriba.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Trigger: crear la fila de `talleres` al registrarse
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.talleres (id, nombre, nombre_personal, correo, telefono)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre_taller', ''),
      nullif(new.raw_user_meta_data ->> 'nombre', ''),
      'Mi taller'
    ),
    new.raw_user_meta_data ->> 'nombre',
    new.email,
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Crea automáticamente la fila de talleres al registrarse un usuario nuevo en auth.users. security definer: corre con privilegios de postgres (BYPASSRLS) porque no existe (ni debe existir) una policy de INSERT para el rol authenticated en talleres.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. RLS mínima para `talleres` (únicamente esta tabla, por ahora)
-- ----------------------------------------------------------------------------

alter table public.talleres enable row level security;

drop policy if exists "talleres_select_propio" on public.talleres;
create policy "talleres_select_propio"
  on public.talleres
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "talleres_update_propio" on public.talleres;
create policy "talleres_update_propio"
  on public.talleres
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sin policy de INSERT ni DELETE para `authenticated` a propósito: la fila
-- se crea únicamente vía el trigger (security definer) y no hay flujo en
-- la app para borrar un taller.

commit;
