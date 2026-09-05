-- ============================================================================
-- Onboarding de talleres nuevos: talleres.onboarding_completado.
--
-- Default TRUE en la columna (no false): así, las cuentas YA EXISTENTES
-- (Augusto, cualquier taller real que ya esté usando la app) quedan
-- "onboarding ya completado" automáticamente al correr este ALTER — no
-- tendría sentido mostrarles ahora un wizard de bienvenida.
--
-- Para que los talleres NUEVOS sí lo vean, se re-crea handle_new_user()
-- (ver trigger_nuevo_usuario.sql) insertando onboarding_completado = false
-- explícitamente en el alta — el default de la columna (true) queda como
-- red de seguridad para cualquier otra vía de inserción que no pase por acá.
-- ============================================================================

alter table talleres
  add column onboarding_completado boolean not null default true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.talleres (id, nombre, nombre_personal, correo, telefono, onboarding_completado)
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
    false
  );
  return new;
end;
$$;
