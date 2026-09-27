-- ============================================================================
-- Tutorial relacional (coachmarks en vivo, ver components/TourOverlay.js y
-- data/TourManager.js): talleres.tour_relacional_completado.
--
-- Mismo criterio que alter_talleres_onboarding.sql:
--   - Default TRUE en la columna: las cuentas YA EXISTENTES quedan con el
--     tour "ya visto" al correr este ALTER, para que no les aparezca de golpe
--     (igual lo pueden abrir a mano desde Configuración > "Ver tutorial de
--     la app").
--   - handle_new_user() se re-crea insertando tour_relacional_completado =
--     false explícitamente en el alta (junto con onboarding_completado =
--     false, que ya estaba) — el default de la columna queda como red de
--     seguridad para cualquier otra vía de inserción.
--
-- GRANT de columna: `talleres` tiene UPDATE restringido por whitelist de
-- columnas para `authenticated` (ver
-- alter_talleres_revoke_plan_authenticated.sql). Sin sumar esta columna al
-- grant, TallerContext.marcarTourRelacionalCompletado() falla con
-- "permission denied". El grant es aditivo: no toca las columnas que ya
-- estaban en la whitelist.
-- ============================================================================

begin;

alter table public.talleres
  add column tour_relacional_completado boolean not null default true;

comment on column public.talleres.tour_relacional_completado is
  'Tutorial relacional (coachmarks Clientes -> Trabajo -> Agenda -> Cobro -> Finanzas). Default true para cuentas existentes; handle_new_user() lo inserta en false para altas nuevas.';

grant update (tour_relacional_completado) on public.talleres to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.talleres (
    id, nombre, nombre_personal, correo, telefono,
    onboarding_completado, tour_relacional_completado
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre_taller', ''),
      nullif(new.raw_user_meta_data ->> 'nombre', ''),
      'Mi taller'
    ),
    new.raw_user_meta_data ->> 'nombre',
    new.email,
    new.raw_user_meta_data ->> 'telefono',
    false,
    false
  );
  return new;
end;
$$;

commit;
