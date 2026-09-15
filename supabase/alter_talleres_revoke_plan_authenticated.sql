-- Cierra un hallazgo de la auditoría de seguridad del 2026-09-15: la policy
-- RLS `talleres_update_propio` (supabase/trigger_nuevo_usuario.sql) autoriza
-- el UPDATE de toda la fila de `talleres` con `auth.uid() = id`, sin
-- restricción de columnas. `plan` ('basico'/'intermedio'/'pro') es el
-- "derecho vigente" que usa el resto de la app (límite de empleados en Mi
-- Equipo, y a futuro cualquier feature paga) y está pensado para que lo
-- escriba EXCLUSIVAMENTE supabase/functions/mercadopago-webhook/index.ts
-- (vía service_role, que bypassea privilegios de columna igual que bypassea
-- RLS) — nunca el cliente autenticado.
--
-- Sin este fix, cualquier usuario autenticado podía hacer
-- `PATCH /rest/v1/talleres?id=eq.<su-propio-uid>` con `{"plan":"pro"}` desde
-- fuera de la app y auto-otorgarse el plan pago sin pasar por Mercado Pago,
-- porque RLS solo valida la fila, no el contenido de la escritura.
--
-- INTENTO ANTERIOR FALLIDO (por qué esto NO es un simple revoke de columna):
-- `revoke update (plan) on talleres from authenticated` no alcanza. Postgres
-- trata los privilegios de tabla completa y de columna como ACLs
-- independientes: el grant por default de Supabase
-- (`grant all on all tables in schema public to authenticated, anon, ...`)
-- es un grant DE TABLA COMPLETA, sin lista de columnas — eso ya autoriza
-- UPDATE sobre cualquier columna presente o futura. Revocar un privilegio
-- de columna que nunca existió como tal no le quita nada al grant de tabla
-- completa, que sigue vigente. Postgres autoriza el UPDATE de una columna
-- si CUALQUIERA de los dos ACL (tabla completa O columna específica) lo
-- permite, así que hay que revocar el de tabla completa y volver a
-- otorgarlo explícitamente solo sobre las columnas que sí deben quedar
-- editables (whitelist), no intentar bloquear una sola columna (blacklist).
--
-- Columnas de talleres que SÍ escribe el cliente hoy (ver TallerContext.js:
-- actualizarTaller, actualizarMisDatos, actualizarConfiguracionFinanzas,
-- marcarOnboardingCompletado) quedan en el grant de abajo. Quedan AFUERA a
-- propósito: `id` (PK, nunca se actualiza), `plan` (el hallazgo — solo
-- service_role), `created_at`/`updated_at` (gestión de la base, ningún
-- código JS las toca), `comision_tarjeta_porcentaje` (columna LEGACY,
-- reemplazada por la tabla comisiones_tarjeta_cuotas, ver
-- crear_comisiones_tarjeta_cuotas.sql), y `meta_facturacion_mensual` /
-- `meta_ganancia_neta_mensual` / `meta_actualizada_en` (agregadas por
-- alter_talleres_metas_mensuales.sql para una función de Finanzas que
-- todavía no se conectó del lado de la app — ningún código JS las escribe
-- hoy; si se conecta esa función más adelante, sumarlas acá en ese momento).
--
-- `ubicacion_place_id`/`ubicacion_lat`/`ubicacion_lng` (las 3 columnas del
-- autocompletado de Google Places que TallerContext.actualizarMisDatos ya
-- sabe escribir) NO están en el grant de abajo: verificado por PostgREST
-- (anon key, `select=<col>` -> 42703 column does not exist) que esas 3
-- columnas nunca se crearon en la base real — solo existen en schema.sql
-- (el documento de referencia), nunca se escribió el alter_*.sql real para
-- ellas. Si se agregan más adelante junto con el resto del feature de
-- autocompletado, sumarlas a este grant en ese momento.
--
-- Verificado que esto no rompe nada existente: `cambiarPlan` de
-- TallerContext.js (el único lugar del cliente que "cambia" el plan, usado
-- por components/PanelPruebasPlan.js) es puro `setState` en memoria —
-- nunca emite un UPDATE a Supabase. El único `.update({ plan: ... })` real
-- de todo el repo está en el webhook, con service_role (no se ve afectado
-- por revocar privilegios de `authenticated`/`anon`).
--
-- No se agrega trigger: la whitelist de columnas alcanza para cerrar el
-- hueco real y no afecta a service_role (webhook) ni a la sesión postgres
-- del SQL Editor, a diferencia de un trigger BEFORE UPDATE que dispararía
-- también para el superusuario.

revoke update on public.talleres from authenticated, anon;

grant update (
  nombre,
  logo_url,
  nombre_personal,
  web,
  correo,
  telefono,
  ubicacion,
  situacion_fiscal,
  categoria_monotributo,
  onboarding_completado,
  umbral_ganancia_verde_porcentaje
) on public.talleres to authenticated;
