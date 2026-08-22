# Integración — Auto/Coupé, 4 vistas (Frente, Atrás, Lateral, Cenital)

Esto viene del chat de diseño gráfico del check-in visual. Antes de escribir esto entré al repo y leí el código actual (`InspeccionVisualStep.js`, `TipoVehiculoStep.js`, `DiagramaDanios.js`, `DamageDiagram.js`, `components/diagrams/vehicles/index.js`, `data/tiposDanio.js`) para que esto sea preciso contra lo que ya existe, no una guía genérica.

## Qué hay ya listo en `assets/`

```
assets/checkin-diagrams/auto/coupe/
  frente/   diagrama.png + zonas.json   (9 zonas: capó, vidrio, parante izq/der, óptica izq/der, espejo izq/der, frente/paragolpes)
  atras/    diagrama.png + zonas.json   (5 zonas: vidrio, baúl entero, luz izq/der, paragolpes trasero)
  lateral/  diagrama.png + zonas.json   (4 zonas: guardabarro, puerta, vidrio, cola — un solo lado, ver nota abajo)
  cenital/  diagrama.png + zonas.json   (3 zonas: techo/vidrios como una sola pieza, parante izq, parante der)
```

Cada `diagrama.png` es fondo transparente + silueta rellena con el color de panel de la app, sin logo de marca. Cada `zonas.json` trae `viewBox`, `imageFile` y `zones: [{id, label, points}]` en el mismo sistema de coordenadas que el `viewBox`.

## El problema que Augusto notó (y por qué pasa)

Lo que hoy se ve en pantalla para Frente **no es este `diagrama.png`** — es una imagen distinta, hardcodeada adentro de `components/wizard/DamageDiagram.js`, que importa `frenteReferenciaImagen.js`. Esa es la referencia del PRIMER intento del chat de diseño, todavía con el logo de la marca visible, y con un set de 7 zonas viejo (sin los espejos). `DamageDiagram.js` es el diagrama "genérico" que se usa cuando `DIAGRAMAS_POR_TIPO_VEHICULO` no tiene una entrada para el vehículo elegido — y hoy esa tabla solo tiene la Pickup Cabina Simple, así que Auto/Coupé siempre cae en ese genérico viejo.

## Qué hay que hacer

1. **Componente genérico "imagen + zonas"**: `PickupCabinaSimpleDiagram` es un SVG vectorial hecho a mano panel por panel — no sirve para este formato (foto + polígonos). Conviene un componente nuevo, por ejemplo `components/diagrams/vehicles/ImageZoneDiagram.js`, que reciba `{ imageSource, zones, viewBox, danios, onPanelPress, width }` y renderice igual que hace hoy `DamageDiagram` (`<Image>` de fondo + `<Svg>` con un `<Polygon>` por zona, resaltado según si `danios[id]` tiene algo cargado). `zones` y `viewBox` salen directo de cada `zonas.json`.

2. **Imágenes vía `require()` estático**: Metro necesita el `require('.../diagrama.png')` literal, no armado con una variable/string en runtime. Si quieren elegir la imagen dinámicamente según vehículo+vista, armen un objeto/registro con los 4 `require()` ya resueltos (uno por vista), no compongan el path a mano.

3. **`zonas.json` se puede importar directo** (`import zonasFrente from '.../frente/zonas.json'`), Metro soporta JSON sin configuración extra.

4. **Wiring**:
   - `components/diagrams/vehicles/index.js`: falta la entrada de Auto/Coupé. Ojo que hoy el contrato es "1 vehículo → 1 Componente" (la Pickup dibuja sus 5 vistas en un solo SVG apilado); acá son 4 vistas separadas, misma "forma" de zona (foto + polígonos) pero un archivo por vista — puede convenir modelar esto como una lista de vistas en vez de un componente único. Uds tienen más contexto del resto del wizard para decidir la forma más prolija.
   - `obtenerClaveDiagrama({ tipoVehiculo, grupo })` (mismo archivo): hoy solo reconoce `tipoVehiculo === "camioneta" && grupo === "Cabina simple"`. Falta el caso Auto/Coupé — en `TipoVehiculoStep.js`, Coupé es `tipoVehiculo: "auto"`, `subdivision: "Coupé"`, sin `grupo` (grupo ahí es `"2 puertas"`, ojo no confundir con `subdivision`).
   - `InspeccionVisualStep.js`: `VISTAS_INSPECCION` hoy es `[{ id: "frente", etiqueta: "Frente" }]` nada más — el carrusel (swipe + puntitos) ya está armado para cualquier cantidad de vistas, pero hay que sumar ahí `atras`/`lateral`/`cenital` (con sus labels Atrás/Lateral/Cenital) y que cada página del carrusel use la vista que le corresponde, no siempre Frente.

## Lo que YA está bien, no hace falta tocar

El sistema de tipos de daño (`data/tiposDanio.js`, 8 tipos: rayón, abolladura, óxido, repintado, trizadura, excremento de ave, laca quemada, y "otro" con nota libre) es el real, y `DiagramaDanios.js` ya lo usa correctamente (selección múltiple por zona). Las zonas que vienen del chat de diseño nunca trajeron su propio enum de daño — así que no hay nada que desalinear acá, esto ya está resuelto.

## Pendiente / a definir con Augusto (no bloquea la integración)

- **Parantes duplicados**: Frente ya tiene sus propias zonas `parante_izq`/`parante_der` (se armaron antes de definir que los parantes van en la vista Cenital). Cenital también tiene las suyas. No rompe nada — mismo panel tocable desde dos vistas — pero si prefieren que el parante se marque solo desde Cenital, hay que sacarle esas dos zonas al `zonas.json` de Frente.
- **Lateral es de un solo lado**: la imagen de referencia mostraba un solo lateral del auto. Falta la versión espejada del otro lado (se genera reflejando imagen + coordenadas x, no hace falta una foto nueva) — pendiente de decidir el nombre de esas dos carpetas.
- **Nombres de carpeta**: `coupe` como slug matchea con el label "Coupé" de `TipoVehiculoStep.js`, pero para el resto de las 15 subdivisiones que van a ir llegando, conviene chequear cada vez contra los labels reales de esa pantalla antes de asumir el nombre de carpeta.
