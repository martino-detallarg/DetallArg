-- Suscripción de Mercado Pago del taller (ver ESTADO_PROYECTO.md, sección 4:
-- "Pagos / flujo de compra de plan real"). Separada de `talleres` a propósito:
-- `talleres.plan` sigue siendo el "derecho vigente" que ya usa el resto de la
-- app (límite de empleados en Mi Equipo, etc.), sin joins ni cambios acá.
-- Esta tabla es el registro de facturación que mantiene sincronizado
-- `supabase/functions/mercadopago-webhook` — un dominio de escritura
-- distinto (lo escribe la Edge Function con la service_role key, nunca el
-- taller desde la app).
--
-- TODO BLOQUEANTE: esta tabla queda vacía/sin actualizarse hasta que el
-- webhook tenga las credenciales reales de Mercado Pago (ver el comentario
-- de cabecera de supabase/functions/mercadopago-webhook/index.ts) y existan
-- los 3 preapproval_plan reales para poder crear suscripciones de verdad.

create table suscripciones (
  taller_id              uuid primary key references talleres (id) on delete cascade,

  -- Mismos valores que talleres.plan (no se duplica el catálogo de planes,
  -- solo se registra acá qué plan pagó realmente vía Mercado Pago).
  plan                   text not null default 'basico'
                           check (plan in ('basico', 'intermedio', 'pro')),

  estado                 text not null default 'sin_suscripcion'
                           check (estado in ('sin_suscripcion', 'pendiente', 'autorizada', 'pausada', 'cancelada')),

  mp_preapproval_id      text unique,       -- id de la suscripción (preapproval) en Mercado Pago
  mp_preapproval_plan_id text,              -- id del preapproval_plan asociado (ver TODO BLOQUEANTE en el webhook)
  mp_payer_id            text,
  fecha_proximo_pago     timestamptz,

  creado_en              timestamptz not null default now(),
  actualizado_en         timestamptz not null default now()
);

comment on table suscripciones is 'Estado de la suscripción de Mercado Pago del taller. talleres.plan sigue siendo el "derecho vigente" que usa el resto de la app; esta tabla es el registro de facturación que mantiene sincronizado el webhook de Mercado Pago.';
comment on column suscripciones.mp_preapproval_id is 'Id de la suscripción (preapproval) en Mercado Pago. Se completa recién cuando exista el flujo real de alta (fuera de alcance por ahora).';
comment on column suscripciones.mp_preapproval_plan_id is 'Id del preapproval_plan de Mercado Pago asociado. TODO BLOQUEANTE: los 3 preapproval_plan reales todavía no existen — hay que crearlos llamando a la API de Mercado Pago con la cuenta real.';

alter table suscripciones enable row level security;

-- Mínimo privilegio, mismo criterio que turno_receta_aplicada (ver
-- rls_tablas_negocio.sql): el taller solo puede LEER su propia fila. Nunca
-- INSERT/UPDATE/DELETE desde el cliente — todas las escrituras las hace la
-- Edge Function del webhook con la service_role key (bypassa RLS).
create policy suscripciones_select_propia on suscripciones
  for select to authenticated
  using (auth.uid() = taller_id);
