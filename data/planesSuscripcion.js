// Metadata de pago de cada plan (Mercado Pago), separada de PLANES
// (data/mockTaller.js, que sigue siendo solo "etiqueta + límite de
// empleados" y no se toca acá). Usada por screens/SeleccionPlanScreen.js.
import { ORDEN_PLANES, PLANES } from "./mockTaller";

// TODO BLOQUEANTE: precios definitivos de cada plan — se definen en la
// reunión con Augusto. Hasta entonces, `precio: null` y la pantalla
// muestra "Precio a confirmar" en vez de inventar un número.
//
// TODO BLOQUEANTE: `mpPreapprovalPlanId` — hay que crear los 3
// "preapproval_plan" en Mercado Pago llamando a su API con la cuenta real
// (no se puede hacer sin las credenciales). Hasta que cada plan tenga acá
// su id real, el botón "Suscribirme" de SeleccionPlanScreen.js queda
// deshabilitado.
//
// Si se agrega un preapproval_plan real acá, hay que reflejar el mismo id
// en el mapeo de supabase/functions/mercadopago-webhook/index.ts (no hay
// una tabla compartida entre app y Edge Function para esto todavía — son 3
// entradas, se mantienen a mano en los dos lugares).
export const PLANES_SUSCRIPCION = {
  basico: { precio: null, mpPreapprovalPlanId: null },
  intermedio: { precio: null, mpPreapprovalPlanId: null },
  pro: { precio: null, mpPreapprovalPlanId: null },
};

export { ORDEN_PLANES, PLANES };
