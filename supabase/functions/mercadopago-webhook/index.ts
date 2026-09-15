// Recibe las notificaciones (webhooks) de Mercado Pago cuando cambia el
// estado de una suscripción (preapproval) del taller, y mantiene
// sincronizadas `suscripciones` y `talleres.plan` (ver
// supabase/crear_suscripciones.sql y ESTADO_PROYECTO.md sección 4, "Pagos /
// flujo de compra de plan real").
//
// TODO BLOQUEANTE — credenciales reales de Mercado Pago (las consigue Nico
// con Augusto). Sin esto la función queda desplegable pero inoperante a
// propósito (falla cerrado, ver handleRequest más abajo):
//   - MERCADOPAGO_ACCESS_TOKEN: token de API para pedirle a Mercado Pago el
//     estado real de la suscripción (nunca se confía en el body del
//     webhook solo, ver el porqué más abajo). Secreto de esta función
//     (`supabase secrets set MERCADOPAGO_ACCESS_TOKEN=...`) — NUNCA un
//     EXPO_PUBLIC_*, no debe llegar al bundle de la app.
//   - MERCADOPAGO_WEBHOOK_SECRET: secreto para validar la firma
//     (`x-signature`) de cada notificación entrante, se obtiene en el panel
//     de Mercado Pago al configurar el webhook. Mismo criterio: secreto de
//     esta función, nunca en el cliente.
//
// TODO BLOQUEANTE — MP_PREAPPROVAL_PLAN_ID_A_PLAN (más abajo): hoy está
// vacío porque los 3 preapproval_plan de Mercado Pago todavía no existen
// (hay que crearlos llamando a la API de MP con la cuenta real). Mantener
// sincronizado a mano con data/planesSuscripcion.js del lado de la app
// (mismos 3 ids) — no hay una tabla compartida entre app y Edge Function
// para esto, son solo 3 entradas.
//
// Nota de deploy (no bloqueante, pero necesaria): este repo no tiene
// supabase/config.toml, así que al deployar hay que pasar --no-verify-jwt
// a mano — Mercado Pago no manda un JWT de sesión de Supabase (a diferencia
// de supabase/functions/places-proxy, que sí lo requiere):
//   supabase functions deploy mercadopago-webhook --no-verify-jwt
//
// Fuera de alcance a propósito: la función que CREA la suscripción en
// Mercado Pago (la que devolvería el init_point del checkout) no está
// construida todavía — no se puede probar sin los preapproval_plan reales.
// Esta función solo procesa notificaciones de una suscripción ya creada.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
const MERCADOPAGO_WEBHOOK_SECRET = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");

// Inyectadas automáticamente por Supabase en toda Edge Function — no son un
// secreto a configurar a mano, a diferencia de las dos de arriba.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// TODO BLOQUEANTE: completar con los ids reales una vez creados los 3
// preapproval_plan en Mercado Pago. Ver comentario de cabecera.
const MP_PREAPPROVAL_PLAN_ID_A_PLAN: Record<string, "basico" | "intermedio" | "pro"> = {
  // "<preapproval_plan_id de básico>": "basico",
  // "<preapproval_plan_id de intermedio>": "intermedio",
  // "<preapproval_plan_id de pro>": "pro",
};

// pending/authorized/paused/cancelled son los únicos estados que documenta
// Mercado Pago para un preapproval.
const MP_STATUS_A_ESTADO: Record<string, string> = {
  pending: "pendiente",
  authorized: "autorizada",
  paused: "pausada",
  cancelled: "cancelada",
};

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonError("Método no soportado", 405);
  }

  if (!MERCADOPAGO_WEBHOOK_SECRET) {
    // Falla cerrado a propósito: mejor rechazar todo que procesar
    // notificaciones sin poder validar que de verdad vienen de Mercado Pago.
    return jsonError("Falta configurar el secreto MERCADOPAGO_WEBHOOK_SECRET", 500);
  }
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return jsonError("Falta configurar el secreto MERCADOPAGO_ACCESS_TOKEN", 500);
  }

  const rawBody = await req.text();

  const firmaValida = await validarFirma(req, rawBody, MERCADOPAGO_WEBHOOK_SECRET);
  if (!firmaValida) {
    return jsonError("Firma inválida", 401);
  }

  let body: { type?: string; action?: string; data?: { id?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Body inválido, se esperaba JSON", 400);
  }

  // Mercado Pago manda notificaciones de varios tipos ("payment", etc.) al
  // mismo webhook si está configurado para todos los eventos — acá solo nos
  // interesan los de suscripción. Devolver 200 (no 4xx) para el resto: no
  // es un error, simplemente no hay nada que procesar, y así Mercado Pago
  // no reintenta una notificación que nunca vamos a usar.
  const esNotificacionDeSuscripcion = body.type === "subscription_preapproval" || body.type === "preapproval";
  if (!esNotificacionDeSuscripcion) {
    return Response.json({ recibido: true, procesado: false });
  }

  const preapprovalId = body.data?.id;
  if (!preapprovalId) {
    return jsonError("Falta data.id en la notificación", 400);
  }

  try {
    // Nunca se confía en el body del webhook para el estado: es solo el
    // aviso de "algo cambió" — se pide el recurso real a la API de MP.
    const preapproval = await obtenerPreapproval(preapprovalId);

    const tallerId = preapproval.external_reference;
    if (!tallerId) {
      // Puede pasar con suscripciones creadas a mano desde el dashboard de
      // MP, sin pasar por nuestro flujo de alta — no hay taller a quién
      // asociarlas.
      return jsonError("La suscripción no tiene external_reference (taller_id)", 422);
    }

    const estado = MP_STATUS_A_ESTADO[preapproval.status] ?? "pendiente";
    const planDelPreapproval = MP_PREAPPROVAL_PLAN_ID_A_PLAN[preapproval.preapproval_plan_id];

    const { error: errorUpsert } = await supabaseAdmin.from("suscripciones").upsert(
      {
        taller_id: tallerId,
        plan: planDelPreapproval ?? "basico",
        estado,
        mp_preapproval_id: preapproval.id,
        mp_preapproval_plan_id: preapproval.preapproval_plan_id ?? null,
        mp_payer_id: preapproval.payer_id != null ? String(preapproval.payer_id) : null,
        fecha_proximo_pago: preapproval.next_payment_date ?? null,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "taller_id" }
    );
    if (errorUpsert) throw errorUpsert;

    // Sincroniza el "derecho vigente" que ya usa el resto de la app
    // (talleres.plan, ver TallerContext.js). Política inicial, a revisar
    // con el negocio más adelante (no bloqueante):
    //   - autorizada -> sube al plan pago.
    //   - cancelada -> vuelve a básico de inmediato.
    //   - pendiente/pausada -> no se toca talleres.plan todavía.
    if (estado === "autorizada" && planDelPreapproval) {
      const { error: errorTaller } = await supabaseAdmin
        .from("talleres")
        .update({ plan: planDelPreapproval })
        .eq("id", tallerId);
      if (errorTaller) throw errorTaller;
    } else if (estado === "cancelada") {
      const { error: errorTaller } = await supabaseAdmin
        .from("talleres")
        .update({ plan: "basico" })
        .eq("id", tallerId);
      if (errorTaller) throw errorTaller;
    }

    return Response.json({ recibido: true, procesado: true });
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error);
    // 500 (no 200) a propósito: Mercado Pago reintenta automáticamente ante
    // cualquier respuesta que no sea 2xx.
    return jsonError("No se pudo procesar la notificación", 500);
  }
});

// Algoritmo documentado por Mercado Pago para validar `x-signature`:
// https://www.mercadopago.com.ar/developers/es/docs/checkout-api/webhooks
// El manifest se arma con el `data.id` que viene en el QUERY STRING de la
// URL (no el del body), el `x-request-id`, y el `ts` extraído del propio
// header `x-signature` (formato "ts=...,v1=...").
async function validarFirma(req: Request, rawBody: string, secreto: string): Promise<boolean> {
  const firmaHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!firmaHeader || !requestId) return false;

  const partes = Object.fromEntries(
    firmaHeader.split(",").map((parte) => {
      const [clave, valor] = parte.split("=").map((s) => s.trim());
      return [clave, valor];
    })
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const dataId = new URL(req.url).searchParams.get("data.id") ?? "";
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

  const claveHmac = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firmaCalculada = await crypto.subtle.sign("HMAC", claveHmac, new TextEncoder().encode(manifest));
  const firmaCalculadaHex = Array.from(new Uint8Array(firmaCalculada))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return firmaCalculadaHex === v1;
}

async function obtenerPreapproval(preapprovalId: string) {
  const respuesta = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!respuesta.ok) {
    throw new Error(`Mercado Pago respondió ${respuesta.status} al pedir el preapproval ${preapprovalId}`);
  }
  return respuesta.json();
}

function jsonError(mensaje: string, status: number) {
  return Response.json({ error: mensaje }, { status });
}
