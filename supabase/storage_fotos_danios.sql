-- ============================================================================
-- DetallArg — bucket de Supabase Storage para las fotos de daños de un
-- turno (turno_fotos_danio.storage_path). Se corre DESPUÉS de schema.sql,
-- rls_tablas_negocio.sql y alter_turnos_etapa_a.sql.
--
-- Criterio (acordado antes de escribir esto, distinto del logo del taller):
--   - Bucket PRIVADO: a diferencia del logo (dato de negocio, sin problema
--     en ser público), estas son fotos de vehículos de clientes reales —
--     más sensibles. Sin lectura pública: mostrarlas más adelante requiere
--     una signed URL (supabase.storage.from('fotos-danios').createSignedUrl(...)),
--     no getPublicUrl().
--   - Nombre de archivo: `{taller_id}/{turno_id}/{timestamp}-{indice}.{ext}`
--     — el primer segmento de la ruta es el "dueño" (auth.uid()), validado
--     acá con storage.foldername(name), mismo principio de fondo que
--     auth.uid() = taller_id en el resto de las tablas, solo que expresado
--     como ruta en vez de columna. El segundo segmento agrupa las fotos de
--     un mismo turno.
--   - Sin UPDATE/DELETE: mismo mínimo privilegio que turno_fotos_danio (no
--     existe ninguna función para sacar o reemplazar una foto ya subida).
--   - Límite 5MB por archivo (vs. 2MB del logo — son fotos reales, no un
--     logo chico, aunque el picker ya comprime con quality: 0.6), mismos
--     mime types permitidos que logos.
-- ============================================================================

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-danios', 'fotos-danios', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Sin policy "to public": el bucket es privado, hace falta sesión + ser el
-- dueño de la carpeta (primer segmento de la ruta = auth.uid()) para leer o
-- subir.
drop policy if exists "fotos_danios_select_propio" on storage.objects;
create policy "fotos_danios_select_propio"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'fotos-danios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos_danios_insert_propio" on storage.objects;
create policy "fotos_danios_insert_propio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fotos-danios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
