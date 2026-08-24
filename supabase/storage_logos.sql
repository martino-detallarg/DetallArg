-- ============================================================================
-- DetallArg — bucket de Supabase Storage para el logo del taller.
-- Se corre DESPUÉS de schema.sql, trigger_nuevo_usuario.sql y
-- rls_tablas_negocio.sql.
--
-- Criterio (acordado antes de escribir esto):
--   - Bucket público: es solo un logo de negocio, no info sensible — evita
--     tener que manejar signed URLs con expiración solo para mostrar algo
--     que de por sí se quiere que se vea.
--   - Un archivo por taller, nombre fijo `{taller_id}.{ext}` (ext = jpg o
--     png, según el mimeType real del asset elegido). Se sube con
--     `upsert: true` desde la app, así siempre hay un único archivo
--     predecible por taller.
--   - Mismo estilo de políticas `_propio` que rls_tablas_negocio.sql:
--     `to authenticated`, y acá el "dueño" se valida contra el nombre del
--     archivo en vez de una columna taller_id (storage.objects no tiene esa
--     columna — es una tabla genérica de Supabase para todos los buckets).
-- ============================================================================

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Lectura pública de todo el bucket (a propósito: el logo se tiene que
-- poder mostrar sin sesión, ej. en un futuro recibo/PDF para el cliente).
drop policy if exists "logos_select_publico" on storage.objects;
create policy "logos_select_publico"
  on storage.objects for select
  to public
  using (bucket_id = 'logos');

-- Insert/update solo del propio archivo: el nombre tiene que ser
-- exactamente "{auth.uid()}.jpg|jpeg|png". Sin DELETE a propósito: no existe
-- ningún "quitar logo" en la UI hoy (mínimo privilegio, mismo criterio que
-- insumos_update_propio en rls_tablas_negocio.sql).
drop policy if exists "logos_insert_propio" on storage.objects;
create policy "logos_insert_propio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'logos'
    and name ~ ('^' || auth.uid()::text || '\.(jpg|jpeg|png)$')
  );

drop policy if exists "logos_update_propio" on storage.objects;
create policy "logos_update_propio"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'logos'
    and name ~ ('^' || auth.uid()::text || '\.(jpg|jpeg|png)$')
  )
  with check (
    bucket_id = 'logos'
    and name ~ ('^' || auth.uid()::text || '\.(jpg|jpeg|png)$')
  );

commit;
