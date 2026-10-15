# Prompt para Claude Code — Sacar Google Maps del build nativo (causa del crash en TestFlight)

Decisión de Augusto (14/10/2026): sacar la integración de Google Maps por completo, no arreglar la clave. `screens/MisDatosScreen.js` YA usa un campo de texto libre para "Ubicación" (no renderiza `BuscadorUbicacion`/`MapaUbicacion` — revisá el import, no están) y un botón "Cómo llegar" que abre un link de búsqueda de Google Maps a partir de ese texto (sin key, sin SDK nativo — `Linking.openURL` nomás). Esa pantalla se queda EXACTAMENTE como está, no la toques.

El problema real: aunque nada en la UI usa el mapa, `app.config.js` sigue configurando el SDK nativo de Google Maps (`ios.config.googleMapsApiKey`, `android.config.googleMaps.apiKey`), y `react-native-maps` sigue como dependencia — así que el build nativo igual intenta inicializar el SDK de Google al arrancar la app, y como la clave nunca estuvo cargada, crashea en el acto (confirmado: `GOOGLE_MAPS_API_KEY` no existe en el `.env` del proyecto).

## Qué hacer

1. **En `app.config.js`**: sacá el bloque `config: { googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY }` de `ios`, y el bloque `config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY } }` de `android`. Sacá también el comentario de arriba del archivo que explica lo de `GOOGLE_MAPS_API_KEY` (quedaría desactualizado) — dejá el resto del archivo intacto.
2. **Desinstalá `react-native-maps`** del proyecto (`npm uninstall react-native-maps` o equivalente) — que salga de `package.json`.
3. **Antes de borrar nada, confirmá que no se rompe ningún import**: buscá en todo el repo (`grep -r` o similar) referencias a `components/MapaUbicacion` y `components/BuscadorUbicacion`. Si efectivamente nadie más los importa (es lo esperado, según lo que ya revisamos), borrá esos dos archivos. Si encontrás algún import que no esperábamos, parate ahí y avisame antes de borrar nada — no asumas.
4. **No toques**: `screens/MisDatosScreen.js` (ya está bien como está), `supabase/functions/places-proxy` (Edge Function del lado del servidor, no se empaqueta en la app, no tiene nada que ver con este crash — queda ahí sin usarse, no hace falta borrarla ahora), ni ninguna columna de Supabase (`ubicacion_lat`/`ubicacion_lng`/`ubicacion_place_id` en `talleres` quedan como columnas sin usar, no rompen nada quedándose así).
5. Después de los cambios, corré `npx expo config` (o el chequeo que uses) para confirmar que ya no queda ninguna referencia a Google Maps en la config nativa resuelta.

## Para verificar al terminar
- `npm ls react-native-maps` no debería encontrar nada.
- La pantalla "Mis Datos" sigue funcionando exactamente igual que antes (campo de texto + "Cómo llegar").
- Generar un build de producción nuevo para iOS y confirmar que abre sin crashear.
