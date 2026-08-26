// Proxy a las Web Service APIs de Google Places para el autocompletado de
// "Ubicación" en Mis Datos (MisDatosScreen.js / TallerContext.js).
//
// Existe porque react-native-google-places-autocomplete llama a estos
// endpoints con un fetch() plano — sin SDK nativo de por medio, Google no
// tiene forma de restringir la key por app (package name / bundle id: esa
// restricción solo la respetan el Maps SDK / Places SDK nativos, no las Web
// Service APIs). La única forma de que la key no quede expuesta en el
// bundle es que viva acá, como secreto de esta función
// (GOOGLE_PLACES_API_KEY, setear con `supabase secrets set`).
//
// Requiere sesión de Supabase: se invoca vía `supabase.functions.invoke`,
// que manda el JWT del usuario logueado como Authorization header. La
// verificación de ese JWT la hace la plataforma antes de correr este código
// (verify_jwt, encendido por default al deployar) — no se revalida acá.

const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonError("Método no soportado", 405);
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return jsonError("Falta configurar el secreto GOOGLE_PLACES_API_KEY", 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Body inválido, se esperaba JSON", 400);
  }

  const { action, sessionToken } = body;

  if (action === "autocomplete") {
    return handleAutocomplete(body.input, sessionToken);
  }
  if (action === "details") {
    return handleDetails(body.placeId, sessionToken);
  }
  return jsonError("`action` debe ser 'autocomplete' o 'details'", 400);
});

async function handleAutocomplete(input: unknown, sessionToken: unknown) {
  if (typeof input !== "string" || input.trim() === "") {
    return Response.json({ predictions: [] });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", input);
  url.searchParams.set("key", GOOGLE_PLACES_API_KEY!);
  // Restricción a Argentina decidida junto al usuario: resultados más
  // relevantes y más rápidos para un taller que opera localmente.
  url.searchParams.set("components", "country:ar");
  url.searchParams.set("language", "es");
  if (typeof sessionToken === "string") url.searchParams.set("sessiontoken", sessionToken);

  const respuestaGoogle = await fetch(url);
  const datos = await respuestaGoogle.json();

  // ZERO_RESULTS es una respuesta válida de Google (el usuario todavía no
  // tipeó nada que matchee), no un error.
  if (datos.status !== "OK" && datos.status !== "ZERO_RESULTS") {
    return jsonError(`Google Places respondió ${datos.status}`, 502);
  }

  const predictions = (datos.predictions ?? []).map((p: any) => ({
    placeId: p.place_id,
    description: p.description,
  }));

  return Response.json({ predictions });
}

async function handleDetails(placeId: unknown, sessionToken: unknown) {
  if (typeof placeId !== "string" || placeId.trim() === "") {
    return jsonError("Falta `placeId`", 400);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", GOOGLE_PLACES_API_KEY!);
  url.searchParams.set("fields", "formatted_address,geometry,place_id");
  url.searchParams.set("language", "es");
  if (typeof sessionToken === "string") url.searchParams.set("sessiontoken", sessionToken);

  const respuestaGoogle = await fetch(url);
  const datos = await respuestaGoogle.json();

  if (datos.status !== "OK") {
    return jsonError(`Google Places respondió ${datos.status}`, 502);
  }

  const resultado = datos.result;
  return Response.json({
    formattedAddress: resultado.formatted_address,
    placeId: resultado.place_id,
    lat: resultado.geometry?.location?.lat ?? null,
    lng: resultado.geometry?.location?.lng ?? null,
  });
}

function jsonError(mensaje: string, status: number) {
  return Response.json({ error: mensaje }, { status });
}
