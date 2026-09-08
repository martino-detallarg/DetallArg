-- ============================================================================
-- Distinción facturado/no-facturado en cobros y gastos_variables + bucket de
-- comprobantes para gastos.
--
-- Motivo: el PDF "para el contador" (utils/finanzasPdf.js, tipo: "contador")
-- hoy llama "Facturación total" a lo efectivamente COBRADO (trabajosDelMes
-- reduce sobre cobro.monto), sin ninguna distinción real entre "facturado"
-- (con comprobante fiscal formal) y "cobrado" (recibido, formal o no). Esto
-- suma un campo real para que esa distinción exista en la base, no solo en
-- el nombre del PDF.
--
-- `facturado` default false (no true): no hay que asumir retroactivamente
-- que todo lo cargado hasta ahora tuvo comprobante formal — el taller lo va
-- marcando a mano, cobro por cobro / gasto por gasto, de ahora en más.
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando
-- que cada uno terminó bien antes de seguir con el siguiente (ver
-- [[feedback_sql_bloques_chicos_supabase]] — no agrupar nada en un
-- begin;/commit;: agrupar el insert del bucket + las create policy fue
-- justamente lo que causó un rollback silencioso con fotos-danios).
-- ============================================================================

-- 1) Columna en cobros
alter table cobros
  add column facturado boolean not null default false;

-- 2) Columnas en gastos_variables
alter table gastos_variables
  add column facturado boolean not null default false,
  add column comprobante_storage_path text;

-- 3) Bucket para las fotos de comprobante de gastos variables (ticket/factura).
-- Mismo criterio que fotos-danios (ver storage_fotos_danios.sql): privado,
-- ruta {taller_id}/{timestamp}.{ext}, solo SELECT/INSERT (sin UPDATE/DELETE
-- por ahora, se borra y se vuelve a cargar el gasto si hace falta).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprobantes-gastos', 'comprobantes-gastos', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- 4) Policy de lectura
drop policy if exists "comprobantes_gastos_select_propio" on storage.objects;
create policy "comprobantes_gastos_select_propio"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'comprobantes-gastos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) Policy de inserción
drop policy if exists "comprobantes_gastos_insert_propio" on storage.objects;
create policy "comprobantes_gastos_insert_propio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'comprobantes-gastos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
