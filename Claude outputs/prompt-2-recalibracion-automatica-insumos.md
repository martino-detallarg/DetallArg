# Prompt para Claude Code — Recalibración automática de ml_por_uso

Contexto: ya se corrió `supabase/alter_insumos_fecha_ultima_reposicion.sql` contra la base real. Agregó `insumos.fecha_ultima_reposicion` (timestamptz, default `now()`) — desde cuándo se está midiendo el envase actual.

Necesito que `ajustarNivelInsumo` (en `data/DataContext.js`) recalibre `mlPorUso` AUTOMÁTICAMENTE usando el historial real de consumo de la app (`turno_receta_aplicada`), sin pedirle ningún dato nuevo al taller — hoy el taller solo corrige "cuánto me queda" desde Mis Insumos, y eso tiene que alcanzar.

## La lógica exacta

Antes de pisar `nivel`/`cantidadActual` con la corrección nueva, con el insumo YA cargado en `misInsumos` (su `cantidadActual` actual, antes de esta corrección, y su `fechaUltimaReposicion`):

1. **Contá cuántas veces se usó este insumo desde `fechaUltimaReposicion`.** Consultá `turno_receta_aplicada` filtrando `insumo_id = id`, unido a `turnos` para quedarte solo con las filas cuyo `turnos.created_at >= fechaUltimaReposicion`. Cada FILA es un uso real (un trabajo finalizado que consumió este insumo) — no filtres por `origen`, todas las filas de este insumo cuentan (principal, previo, ppf_material, ppf_adicional son todas consumo real de ESTE insumo puntual). La CANTIDAD de filas es `usos`.
   - Query de ejemplo (ajustá al cliente de Supabase que ya usa el resto del archivo):
     ```js
     const { data, error } = await supabase
       .from("turno_receta_aplicada")
       .select("id, turnos!inner(created_at)")
       .eq("insumo_id", id)
       .gte("turnos.created_at", insumo.fechaUltimaReposicion);
     if (error) throw error;
     const usos = data.length;
     ```
2. **Calculá cuánto se consumió REALMENTE**, según lo que el taller acaba de decir: `consumoReal = insumo.cantidadActual - cantidadActualNueva` (donde `cantidadActualNueva` es la misma que ya calcula `ajustarNivelInsumo` hoy: `insumo.capacidadTotal * (nivelNuevo / 100)`). Importante: `cantidadActual` NO se actualiza con cada trabajo (`descontarInsumos` solo toca `nivel`, nunca `cantidad_actual`) — así que `insumo.cantidadActual` en este momento sigue siendo el valor de la última vez que se reseteó (la última `ajustarNivelInsumo` o `reponerInsumo`), que es exactamente el punto de partida que necesitás acá. No hace falta ningún cálculo adicional de `nivel`.
3. **Si `usos > 0` y `consumoReal > 0`**: `mlPorUsoNuevo = Math.round((consumoReal / usos) * 100) / 100` — mismo redondeo que ya usa `recalibrarMlPorUso` existente. Guardalo junto con el resto del UPDATE de esta función.
4. **Si `usos === 0`** (no hay ningún trabajo que haya consumido este insumo desde el último reset — nada para aprender todavía): NO toques `mlPorUso`. Mismo criterio que ya sigue `recalibrarMlPorUso`: "no hace nada en vez de guardar un número inventado".
5. **Siempre, al final de `ajustarNivelInsumo`** (haya recalibrado `mlPorUso` o no): actualizá también `fecha_ultima_reposicion = new Date().toISOString()` en el mismo UPDATE a `insumos` — esto "reinicia el contador" para la próxima corrección, tal como dice el comentario del ALTER.

## También: `reponerInsumo` tiene que resetear el contador

Un envase nuevo (`reponerInsumo` en `data/DataContext.js`) también tiene que actualizar `fecha_ultima_reposicion = new Date().toISOString()` en su UPDATE — un envase nuevo arranca una medición nueva desde cero, igual que una corrección manual.

## Cambios de mapeo necesarios

- Agregá `fechaUltimaReposicion: fila.fecha_ultima_reposicion` a `filaAInsumo`.
- Agregá `fecha_ultima_reposicion` a `COLUMNAS_INSUMO`.
- Los dos UPDATE (`ajustarNivelInsumo` y `reponerInsumo`) tienen que mandar `fecha_ultima_reposicion` en el `.update({...})` y reflejarlo también en el `setMisInsumos` que sincroniza el estado local — mismo patrón que ya usan con el resto de los campos.

## UI — avisar que se recalibró

En `ajustarNivelInsumo` no hay feedback visual hoy (es upload silencioso desde Mis Insumos). Buscá dónde se llama esta función (`components/MoverCategoriaModal.js` u otro lugar de Mis Insumos) y, si `mlPorUso` efectivamente cambió como resultado de esta llamada, mostrá algún aviso chico tipo "✓ Ajustamos la estimación de consumo" — podés reusar el mismo texto/estilo que ya tiene `components/NotificacionStockBajoCard.js` en `calibracionOk` como referencia de tono, no hace falta copiar el componente entero.

## Qué NO tocar

- `recalibrarMlPorUso` (la función existente, ligada a la pregunta de calibración de `NotificacionStockBajoCard.js`) — queda como está, es un camino alternativo/manual que coexiste con este nuevo camino automático. No la borres ni la fusiones con `ajustarNivelInsumo`.
- `descontarInsumos` — no cambia nada de su lógica actual.

## Para verificar al terminar

- Cargar un insumo, simular 2-3 trabajos que lo consuman (o usar datos ya existentes en la base), corregir el nivel a mano desde Mis Insumos, y confirmar que `ml_por_uso` cambió a un valor coherente con `consumoReal / usos` — no un número inventado.
- Corregir el nivel de un insumo que NO tuvo ningún trabajo que lo consumiera desde el último reset → `ml_por_uso` queda intacto.
- Confirmar que `fecha_ultima_reposicion` se actualiza tanto al reponer un envase como al corregir el nivel a mano.
