# Assets — check-in visual (paneles tocables sobre imagen)

Esta carpeta la va llenando el chat de diseño gráfico (aparte de este) a medida que se procesa cada vehículo. Convención de carpetas — mirroring la clasificación real de la pantalla "Selección de Vehículo" de la app:

```
checkin-diagrams/
  <tipo>/
    <subdivision>/
      <vista>/
        diagrama.png   — imagen tratada: fondo quitado, silueta rellena con
                          el color de panel, sin logos de marca.
        zonas.json      — zonas tocables invisibles: id, label en español,
                          y el polígono en píxeles (mismo sistema de
                          coordenadas que el viewBox de diagrama.png).
```

## Árbol de tipos y subdivisiones (según la pantalla real de la app)

```
auto/
  coupe/
  descapotable/
  sedan/
  hatchback/
  familiar/
camioneta/
  cabina_simple_chico/
  cabina_simple_mediano/
  doble_cabina_mediano/
  doble_cabina_grande/
  utilitario_acarrozado_chico/
  utilitario_acarrozado_mediano/
suv/
  compacto/
  grande/
moto/
  naked/
  sport/
  motocross/
```

⚠️ Los nombres de subdivisión de acá (`coupe`, `cabina_simple_chico`, etc.) son slugs armados a partir de las etiquetas en español que se ven en pantalla — todavía no están confirmados contra los ids/strings reales que usa el código de la app. Antes de integrar, comparar contra cómo está tipado `vehicleType`/`subdivision` en el proyecto (o preguntarle a Augusto) y renombrar carpetas si hace falta.

Cada vista dentro de una subdivisión sigue el mismo formato ya usado en `auto/coupe/frente/`.

## Cómo se usa cada `zonas.json`

```json
{
  "vehicleType": "auto",
  "subdivision": "coupe",
  "view": "frente",
  "viewBox": "0 0 692 498",
  "imageFile": "diagrama.png",
  "zones": [
    { "id": "capot", "label": "Capó", "points": [[x,y], [x,y], ...] },
    ...
  ]
}
```

Cada zona se renderiza como un `<Svg viewBox={viewBox}>` superpuesto a `diagrama.png` (mismo `viewBox`, mismas dimensiones), con un `<Polygon>` por zona usando `points`. Al tocar una zona se dispara la selección de tipo de daño.

## ⚠️ Importante — tipo de daño

Las zonas de acá NO traen su propio sistema de tipos de daño incorporado. Cuando se conecte cada zona a la UI real, hay que usar la lista de tipos de daño que ya existe/se está ampliando en el resto de la app (Augusto la está extendiendo más allá de Rayón/Abolladura/Óxido/Repintado) — no copiar un enum fijo de 4 tipos desde ningún prototipo de prueba. El `id` de la zona es lo único que hace falta guardar junto con el tipo de daño elegido, igual que en el resto del check-in.

## Nota — Pickup Cabina Simple ya entregada aparte

Antes de tener esta clasificación real, ya se armó y entregó un componente completo (`PickupCabinaSimpleDiagram.jsx`, 12 paneles reales, las 5 vistas) para "pickup cabina simple" en general, sin distinguir Chico/Mediano. Con el árbol real, esa carrocería corresponde a `camioneta/cabina_simple_chico/` y/o `camioneta/cabina_simple_mediano/` — falta definir con Augusto si Chico y Mediano comparten el mismo diagrama (misma forma, distinta escala) o necesitan siluetas propias.

## Criterio — cada panel real aparece en una sola vista

Para no duplicar zonas entre vistas, cada parte real del auto se marca una sola vez, en la vista donde mejor se ve:

- Los **parantes** (A/B/C, incluidos los que separan el vidrio trasero) se marcan en la vista **cenital** (techo, de arriba) — no en Frente ni en Atrás, aunque se vean parcialmente en esas fotos.
- Frente y Atrás se quedan con las zonas "de frente" del panel: vidrios, ópticas/luces, capó/baúl, paragolpes. Ver el detalle de zonas de cada vista en su propio `zonas.json`.

⚠️ **Excepción ya en el repo**: `auto/coupe/frente/` se armó ANTES de definir este criterio, así que todavía tiene sus propias zonas `parante_izq`/`parante_der` (el parante A visto de frente), que ahora se solapan conceptualmente con `parante_izq`/`parante_der` de `auto/coupe/cenital/`. No se tocó Frente para no romper lo ya confirmado — queda a criterio de Augusto si conviene sacarle esas dos zonas a Frente (para que el parante se marque solo desde la Cenital) o dejarlo así (mismo panel tocable desde dos vistas, sin problema real más que la duplicación de datos).

## ⚠️ Importante — cómo cargar `diagrama.png` en la app (bug ya encontrado y resuelto)

`require(".../diagrama.png")` (el PNG suelto de este repo, referenciado como asset bundleado de Metro) causó un bug real en Auto/Coupé: las 4 vistas se veían recortadas/zoomeadas en pantalla, aunque las zonas del `zonas.json` se posicionaban bien. La vista vieja de prueba (con logo, la que carga la imagen como base64 embebido en un archivo `.js` en vez de `require()` de un PNG) nunca tuvo este problema — cambiar Auto/Coupé al mismo esquema de base64 embebido lo solucionó.

**Por eso, de acá en adelante, además de `diagrama.png` en cada carpeta de vista, el chat de diseño va a entregar también un archivo `.js` con la imagen en base64** (mismo contenido, mismo `diagrama.png` de siempre, solo que codificado como string `data:image/png;base64,...` dentro de un `export const`) — para que la integración use ese archivo como `imageSource` en vez de `require()` del PNG. El PNG se deja igual en la carpeta por si sirve de referencia visual rápida (para ver la imagen sin abrir código), pero no debería ser lo que carga el componente en runtime.

## Nota — vista Lateral es de un solo lado

`auto/coupe/lateral/` trae la imagen y las zonas de UN lado del auto (el de la foto de referencia). Para el lado opuesto no hace falta procesar una imagen nueva: como el auto es simétrico, alcanza con reflejar horizontalmente `diagrama.png` y invertir la coordenada x de cada punto de zona (`x' = viewBox_width - x`). Todavía no se generó/guardó esa versión espejada — queda pendiente de decidir cómo se van a llamar las dos carpetas (ej. `lateral_izquierdo` / `lateral_derecho`) antes de guardarla.

## Estado actual

- `auto/coupe/frente/` — listo (9 zonas: capó, vidrio, parante izq/der, óptica izq/der, espejo izq/der, frente/paragolpes). Vectorizado de un Audi A5 real usado solo como referencia de proporciones, sin logos.
- `auto/coupe/atras/` — listo (5 zonas: vidrio trasero, baúl completo como una sola pieza sin subdividir, luz izq/der, paragolpes trasero). Sin parantes — esos van en la vista cenital.
- `auto/coupe/lateral/` — listo (4 zonas: guardabarro, puerta, vidrio, cola). Es un solo lado — ver nota arriba sobre el lado espejado. Llantas sin zona propia todavía.
- `auto/coupe/cenital/` — listo (3 zonas: techo/vidrios como una sola zona sin dividir, parante izq, parante der). Ver nota arriba sobre el solape con los parantes de Frente.
- **`auto/coupe` completo — Frente, Atrás, Lateral y Cenital ✅.**
- `auto/sedan/frente/` — listo (9 zonas, prácticamente calcadas de `auto/coupe/frente/` — misma proporción de referencia).
- `auto/sedan/atras/` — listo (5 zonas, igual criterio que `auto/coupe/atras/`).
- `auto/sedan/lateral/` — listo (**5 zonas**, no 4 como el Coupé: se suma `puerta_trasera` porque el Sedán tiene 2 puertas por lado — cortada justo por el parante B real de la imagen).
- `auto/sedan/cenital/` — listo (3 zonas, igual que el Coupé — la franja de "parante" incluye tanto el A como el B, no se separan).
- **`auto/sedan` completo — Frente, Atrás, Lateral y Cenital ✅.** Reutilizó casi todas las coordenadas de `auto/coupe` (misma familia de imagen de referencia) — el único cambio real de zonas fue la puerta trasera en Lateral.
- Con esto ya son 2 de las 16 subdivisiones completas — sirven de plantilla/proceso probado para el resto.
- ⚠️ Ojo con no confundir: existe una carpeta vieja **`auto-sedan/`** (con guion, en la raíz de `checkin-diagrams/`, NO adentro de `auto/`) con contenido de una prueba de Frente armada antes de tener este árbol — es distinta de la carpeta real **`auto/sedan/`** de arriba. La vieja se puede borrar, quedó reemplazada por `auto/coupe/frente/` (fue una mala clasificación inicial, ese Audi era en realidad un Coupé, no un Sedán).
- `auto/descapotable/frente/` — listo (9 zonas, misma estructura que Coupé/Sedán — el parabrisas y los parantes A son fijos, no cambian con la capota).
- `auto/descapotable/atras/` — listo (5 zonas). ⚠️ La zona que en Coupé/Sedán se llamaba `vidrio` (vidrio trasero) acá se llama **`capota`** ("Capota (guardada)") — mismo polígono, pero en un descapotable ese panel es la lona/tapa de la capota guardada, no un vidrio fijo. Importante para no asumir que admite los mismos tipos de daño que un vidrio real.
- `auto/descapotable/lateral/` — listo (4 zonas: guardabarro, puerta, capota, cola — mismo criterio que Coupé, 2 puertas por lado, no 4). Acá tampoco hay zona de vidrio de puerta (la ventanilla no tiene marco fijo con la capota baja); en su lugar, detrás de la puerta va **`capota`**, que es el bulto de la lona guardada visible en la foto de referencia (top down). Es un solo lado — ver nota general arriba sobre el lado espejado.
- ⚠️ **`auto/descapotable` NO tiene vista Cenital** — a diferencia del resto de la familia Auto, esta subdivisión se armó con **3 vistas** (Frente, Atrás, Lateral), no 4. Motivo: en Cenital (vista de arriba) los demás autos usan esa vista solo para techo/vidrios y parantes — un descapotable con la capota baja no tiene techo que inspeccionar ahí, y el resto de los paneles visibles desde arriba (guardabarros, capó, baúl) ya están cubiertos por Frente/Atrás/Lateral. Si en algún momento se quiere agregar una Cenital igual (por ejemplo para controlar el estado de la tapicería/interior expuesto, que sí es relevante en un descapotable), es una decisión de producto pendiente de confirmar con Augusto — no zona inventada por las dudas.
- **`auto/descapotable` completo — Frente, Atrás y Lateral ✅ (sin Cenital, ver nota arriba).**
- `auto/familiar/frente/` — listo (9 zonas, misma imagen de referencia que Coupé/Sedán — el frente no cambia entre carrocerías en este set de fotos).
- `auto/familiar/atras/` — listo (5 zonas). ⚠️ La imagen de referencia de Atrás es la MISMA que la de Sedán (baúl con tapa separada) — el set de fotos no incluye un portón/tailgate real de familiar con vidrio integrado en una sola pieza. Las zonas (`vidrio`/`baul`/`luz_izq`/`luz_der`/`paragolpes_trasero`) siguen sirviendo para marcar daños, pero el dibujo no es 100% fiel a la carrocería real — a mejorar si se consigue/genera una referencia de familiar de atrás como corresponde.
- `auto/familiar/lateral/` — listo (**5 zonas**: guardabarro, puerta_delantera, puerta_trasera, vidrio, `cola` — acá `cola` es la cola/portón trasero con el techo extendido, no el baúl corto del Sedán/Coupé). 4 puertas como el Sedán. Es un solo lado — ver nota general arriba sobre el lado espejado.
- `auto/familiar/cenital/` — listo (3 zonas: techo/vidrios, parante izq, parante der — mismo criterio que el resto, pero la zona `techo` es más larga porque en un familiar el techo/vidrio llega casi hasta el portón trasero).
- **`auto/familiar` completo — Frente, Atrás, Lateral y Cenital ✅ (las 4 vistas, a diferencia de Descapotable).**
- Con esto ya son 4 de las 16 subdivisiones completas.
