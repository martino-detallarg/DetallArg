# Prompt para Claude Code — Conectar el costo real de PPF a Finanzas

Contexto: ya se corrió `supabase/alter_turnos_costo_ppf_finanzas.sql` contra la base real. Agregó:
- `turnos.insumo_ppf_id` (uuid, references `insumos(id)`) — el rollo de carrocería elegido en el presupuesto.
- `turnos.modo_corte_ppf` (text, check `in ('manual','laser')`)
- `turnos.mano_obra_ppf_estimada` (numeric) — **solo informativo, nunca se resta del margen**.
- `turnos.insumos_adicionales_ppf_estimado` (numeric)
- `turno_receta_aplicada.origen` ahora también permite `'ppf_material'` y `'ppf_adicional'` (ya existían `'principal'`/`'previo'` de otro ALTER).

Problema real que esto resuelve: `utils/calculosFinanzas.js` (`costoInsumosTurno`/`margenBrutoTrabajo`) solo lee `turno_receta_aplicada`. Un trabajo de PPF hoy NO tiene ninguna fila ahí, así que Finanzas lo cuenta como si hubiera costado $0 — todo lo cobrado aparece como ganancia bruta, lo cual es falso. La lógica de presupuesto/paneles que ya funciona bien (`utils/calculosPpf.js`, `data/ppfPanelMatrix.js`, `screens/trabajoNuevo/PresupuestoPpfStep.js`) NO se toca — esto solo persiste lo que el wizard ya calcula y lo conecta al momento de finalizar el trabajo.

## 1. Persistir la elección del presupuesto al crear el trabajo

Hoy `PresupuestoPpfStep.js` calcula todo en memoria (`insumoPpfId`, `modoCorte`, `manoDeObraTexto`, `insumosAdicionalesTexto`) y se pierde al guardar el turno. En `data/TurnoContext.js`:

- Agregá a `MAPEO_CAMPOS_TURNO`:
  ```js
  insumoPpfId: "insumo_ppf_id",
  modoCortePpf: "modo_corte_ppf",
  manoObraPpfEstimada: "mano_obra_ppf_estimada",
  insumosAdicionalesPpfEstimado: "insumos_adicionales_ppf_estimado",
  ```
- Agregá las 4 columnas a `COLUMNAS_TURNO` y su traducción en `filaATurno`.
- En el wizard (`screens/trabajoNuevo/TrabajoNuevoWizard.js`), cuando arma el `datosTurno` final para `agregarTurno`, agregá estos 4 campos SOLO si el servicio es PPF: `insumoPpfId: datos.insumoPpfId ?? null`, `modoCortePpf: datos.modoCorte ?? null`, y los dos números ya parseados igual que lo hace `PresupuestoPpfStep.js` (`Number(String(texto).replace(",", ".")) || 0`) para `manoObraPpfEstimada`/`insumosAdicionalesPpfEstimado`.

## 2. Congelar el costo real al finalizar el trabajo

En `actualizarEstadoTrabajo` (`data/TurnoContext.js`), dentro del bloque que ya existe `if (!turno.panelesPpfAplicados && turno.panelesPpf?.length > 0) { ... }` (el mismo que arma `filasPpf` con el m² real por panel) — usá ese MISMO guard, no agregues uno nuevo, para que esto se congele exactamente una vez, junto con `turno_ppf_paneles`:

- `filasPpf`/`detalleValido` ya tiene el m² real con merma por panel (`d.m2ConMerma`) y de qué material es cada panel (revisá la forma exacta que devuelve `calcularPresupuestoPpf` en `utils/calculosPpf.js` — debería traer algo como `d.material` igual a `"carroceria"` o `"vidrio"` por panel, es la misma matriz que usa `data/ppfPanelMatrix.js`). Sumá el m² real total por material: `m2TotalCarroceria` y `m2TotalVidrio`.
- **Costo del rollo de carrocería**: buscá el insumo real con `getInsumoById(turno.insumoPpfId)` (de `data/DataContext.js`). Si existe y tiene `precioCompra`/`capacidadTotal` cargados: `costoCarroceria = rollo.precioCompra * (m2TotalCarroceria / rollo.capacidadTotal)`. Insertá una fila en `turno_receta_aplicada`: `{ turno_id: id, insumo_id: rollo.id, nombre_insumo: rollo.nombre, unidad: rollo.capacidadUnidad, cantidad: m2TotalCarroceria, costo_unitario_snapshot: costoCarroceria, origen: 'ppf_material' }`. Si el insumo fue borrado o no tiene precio/capacidad cargados, no inventes un costo — mismo criterio que ya usa el resto del archivo con `costoUnitarioSnapshot: null`.
- **Costo del rollo de vidrio** (solo si `m2TotalVidrio > 0`): el ALTER NO agregó una columna separada para el rollo de vidrio elegido (`insumo_ppf_id` es solo el de carrocería) — a propósito, para no pedir otra migración. Resolvelo igual que ya resuelve `PresupuestoPpfStep.js` su propio default: buscá en `misInsumos` el primer insumo con `categoria === 'ppf' && materialPpf === 'vidrio' && capacidadUnidad === 'm2' && capacidadTotal > 0 && precioCompra > 0` (mismo filtro que ya usa ese archivo para `rollosVidrio`) y usalo como el rollo de vidrio real. Mismo cálculo y mismo insert que el de carrocería, con `origen: 'ppf_material'` también (es una fila aparte, un insumo distinto).
- **Insumos adicionales** (`turno.insumosAdicionalesPpfEstimado`, si es `> 0`): es un número suelto que el taller tipeó en el wizard, no un insumo real del catálogo — insertalo como "línea libre", igual que ya hace el resto de este archivo para líneas sin ficha: `{ turno_id: id, insumo_id: null, nombre_insumo: "Insumos adicionales (PPF)", costo_estimado: turno.insumosAdicionalesPpfEstimado, origen: 'ppf_adicional' }`. Esto NO descuenta stock de nada (ningún insumo real asociado), igual que cualquier línea libre existente.
- **Mano de obra**: `turno.manoObraPpfEstimada` NO se inserta en `turno_receta_aplicada` bajo ningún concepto — queda guardada solo en `turnos` para uso informativo futuro (mostrar/exportar el presupuesto completo). Esto es a propósito: decisión ya tomada de que la mano de obra no resta del margen en ningún cálculo de Finanzas, mismo criterio que el resto de la app.
- Actualizá `recetaAplicadaNueva` (el array que sincroniza el estado local) para que incluya estas filas nuevas junto con las que ya arma el resto de la función (receta del servicio principal, y del servicio previo si existe esa otra funcionalidad ya implementada).

## Qué NO tocar

- `utils/calculosPpf.js` / `calcularPresupuestoPpf` — la lógica de presupuesto en sí no cambia, solo se persiste y reusa su resultado.
- `costoInsumosTurno`/`margenBrutoTrabajo` en `utils/calculosFinanzas.js` — ya suman TODAS las filas de `turno_receta_aplicada` sin filtrar por `origen`, así que esto entra solo, sin tocar esas funciones.
- No restes mano de obra de ningún cálculo de margen, en ningún lado.

## Para verificar al terminar

- Crear un trabajo de PPF, elegir rollo/modo de corte/insumos adicionales en el presupuesto, finalizarlo, y confirmar en Supabase que `turno_receta_aplicada` tiene las filas nuevas (`ppf_material` por cada rollo usado, `ppf_adicional` si correspondía) con costos coherentes.
- En Finanzas (`FinanzasScreen.js`/`FinanzasCostosScreen.js`), ese trabajo de PPF ya NO debería aparecer con 100% de margen — el costo de insumos tiene que reflejar el material real usado.
- Un trabajo de PPF con parabrisas (material vidrio) y uno sin parabrisas, para confirmar que el costo de vidrio solo se agrega cuando corresponde.
- La mano de obra cargada en el presupuesto NO afecta el margen mostrado en Finanzas.
