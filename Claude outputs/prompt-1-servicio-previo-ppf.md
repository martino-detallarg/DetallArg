# Prompt para Claude Code — Servicio previo a un trabajo de PPF

Contexto: ya se corrió `supabase/alter_turnos_servicio_previo_ppf.sql` contra la base real. Agregó:
- `turnos.servicio_previo_id` (uuid, references `servicios(id)`)
- `turnos.precio_servicio_previo` (numeric)
- `turno_receta_aplicada.origen` (text, default `'principal'`, check `in ('principal','previo')`)

Necesito que implementes la funcionalidad de la app que usa estas columnas. Alcance: **solo para trabajos cuyo servicio principal es PPF** (`servicio.esPpf === true`, ver `data/ServicioContext.js`). No es un modelo general de "varios servicios por trabajo" — resolvé esto puntual para PPF, no lo generalices a otros tipos de servicio.

## Qué hace falta

**1. Elegir el servicio previo al cargar el trabajo.** En el wizard de trabajo nuevo (`screens/trabajoNuevo/TrabajoNuevoWizard.js` y los steps que orquesta, especialmente `screens/trabajoNuevo/DatosServicioStep.js`), cuando el servicio principal elegido tiene `esPpf === true`, agregá la posibilidad de elegir un "servicio previo" opcional (ej. lavado, pulido) de la lista de servicios YA cargados en `data/ServicioContext.js` que NO sean PPF (`esPpf === false` o undefined) — no se crea un servicio nuevo, se elige uno existente del catálogo. Junto con eso, un campo para el precio de ese servicio previo (`precioServicioPrevio`), separado del precio del servicio principal (que sigue siendo `turno.precio`, sin tocar). Si el servicio principal no es PPF, no mostrar nada de esto — cero cambio visual para el resto de los trabajos.

**2. Persistir la elección.** En `data/TurnoContext.js`:
- Agregá `servicioPrevioId: "servicio_previo_id"` y `precioServicioPrevio: "precio_servicio_previo"` a `MAPEO_CAMPOS_TURNO`.
- Agregá `servicio_previo_id, precio_servicio_previo` a `COLUMNAS_TURNO`.
- Agregá los campos correspondientes (camelCase) en `filaATurno`.
- Asegurate de que el wizard arme el `datosTurno` que le pasa a `agregarTurno` incluyendo `servicioPrevioId`/`precioServicioPrevio` cuando corresponda (undefined/null si no hay servicio previo elegido).

**3. Descontar stock de LOS DOS servicios al finalizar el trabajo.** En `actualizarEstadoTrabajo` (`data/TurnoContext.js`), dentro del bloque `if (nuevoEstado === "Finalizado" && turno)`, hoy solo se descuenta/congela la receta del servicio principal (`turno.servicioId`). Extendé esa misma lógica para que, SI `turno.servicioPrevioId` existe, también:
- Llame a `descontarInsumos(servicioPrevio.receta)` (función ya existente en `data/DataContext.js`, no la reescribas) con la receta del servicio previo.
- Inserte las filas correspondientes en `turno_receta_aplicada` con `origen: 'previo'` (las del servicio principal seguí insertándolas con `origen: 'principal'` — hoy el insert no manda `origen` en absoluto, agregalo explícito en vez de confiar en el default de la columna, para que quede claro en el código).
- Usá el mismo guard que ya existe (`!turno.recetaAplicada`) para que esto no se repita si el trabajo se vuelve a mover a "Finalizado" — las filas del servicio previo tienen que quedar protegidas por el MISMO guard que las del principal (es un solo snapshot, no dos independientes).
- El array `recetaAplicadaNueva` que arma el estado local tiene que incluir las líneas de los dos servicios juntas (mismo shape que ya usa `filaATurno` para traducir `turno_receta_aplicada`).

**4. Mostrar el desglose.** En donde se muestre el total cobrado/a cobrar de un trabajo (buscá en `components/TrabajoDetalleModal.js` y en el paso de confirmación del wizard, `screens/trabajoNuevo/ConfirmacionTrabajoStep.js`), el total tiene que ser `turno.precio + (turno.precioServicioPrevio ?? 0)`, mostrando los dos conceptos por separado si el servicio previo existe (no sumarlos en silencio sin mostrar el desglose). Revisá también si el PDF/resumen de Finanzas que ya existe necesita este mismo ajuste — si usa `turno.precio` directo en algún lado para calcular lo cobrado de un trabajo PPF con servicio previo, va a quedar corto.

## Qué NO tocar
- `costoInsumosTurno`/`margenBrutoTrabajo` en `utils/calculosFinanzas.js` — ya suman TODAS las filas de `turno_receta_aplicada` sin filtrar por `origen`, así que el costo de insumos del servicio previo entra solo, sin tocar esas funciones.
- La lógica de paneles PPF (`turno_ppf_paneles`, `turno_ppf_seleccion`, `calcularPresupuestoPpf`) — no tiene relación con esto.
- No generalices a otros tipos de servicio no-PPF — fuera de alcance.

## Para verificar al terminar
- Un trabajo PPF sin servicio previo elegido sigue funcionando exactamente igual que hoy (cero regresión).
- Un trabajo PPF CON servicio previo, al finalizarlo, descuenta stock de las recetas de LOS DOS servicios, y `turno_receta_aplicada` queda con filas `origen='principal'` y `origen='previo'` bien diferenciadas.
- El total mostrado al cliente incluye los dos precios.
