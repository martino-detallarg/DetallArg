# Propuesta: esquema para Mis Servicios (rediseño) + campos nuevos de Mis Insumos

Para Nico. Esto es una **propuesta**, no algo ya aplicado — ningún DDL de acá se corrió contra Supabase, y los diffs de código (`DataContext.patch` / `ServicioContext.patch`, en esta misma carpeta) tampoco se aplicaron al repo. La idea es que la revises/ajustes vos y decidas cuándo y cómo correrla contra la base compartida.

Contexto: en paralelo a tu migración de `insumos`/`servicios`/`turnos` a Supabase, yo rediseñé "Mis Insumos" (diluciones múltiples, cantidad actual en stock, insumo personalizado, mover de categoría) y rehice "Mis Servicios" (sin categoría, con descripción, duración en horas/días, receta con insumos "libres") + una pantalla nueva de Catálogo exportable a PDF, todo en memoria porque no sabía que ibas a migrar esto vos también. Confirmé leyendo tu `DataContext.js`/`ServicioContext.js`/`schema.sql` reales que mi versión no encaja tal cual — esto es lo que faltaría para que sí encaje.

---

## 1) Insumos — 3 columnas nuevas en `insumos`

- **`diluciones`**: reemplaza `dilucion` (string único) por un array de strings — el taller puede cargar más de una dilución por insumo, o agregar la suya propia si el catálogo no la tiene. Necesita backfill: cada fila existente con `dilucion` cargada pasa a `diluciones = [dilucion]`.
- **`cantidad_actual`**: numeric, nullable — lo que el taller tiene cargado como stock real al momento de agregar el insumo, para calcular `nivel` real en vez de asumir el envase lleno (100%). Se guarda tal cual además de usarse para calcular `nivel` (que sigue siendo el valor derivado que usa el resto de la app).
- **`es_personalizado`**: boolean, default `false` — true cuando el insumo se cargó desde "Crear insumo personalizado" (sin ficha en el catálogo estático de `mockInsumos.js`) en vez de buscarlo ahí.

`moverInsumoDeCategoria` (mover un insumo ya cargado a otra categoría) **no necesita cambio de esquema** — `categoria` ya existe en la tabla, es un `UPDATE` normal. Ya está en el diff de `DataContext.js` de este mismo paquete.

### DDL propuesto

```sql
-- PROPUESTA — revisar antes de correr contra la base compartida.

-- 1a. diluciones (con backfill desde dilucion)
alter table insumos add column diluciones text[] not null default '{}';
update insumos set diluciones = array[dilucion] where dilucion is not null and dilucion <> '';
alter table insumos drop column dilucion;

-- 1b. cantidad_actual
alter table insumos add column cantidad_actual numeric(10, 2);

-- 1c. es_personalizado
alter table insumos add column es_personalizado boolean not null default false;
```

---

## 2) Servicios — en la tabla `servicios`

- **`categoria`**: la saqué de `ServicioModal.js` (ya no se carga desde la UI). El `CHECK`/`NOT NULL` actual (con las categorías viejas: lavados/interior/pintura/coating/tecnico/paquetes) rompe cualquier `INSERT` nuevo si se mantiene tal cual.
  **Antes de tocar esto: ¿hay filas reales ya cargadas por Martino/Alfonso con esas categorías?** Si las hay, hay que decidir qué pasa con ese dato (¿se conserva sin usarse? ¿se migra a otra cosa? ¿se borra?) — no es solo un cambio de código.
- **`descripcion`**: nueva, text — es lo que se muestra en la pantalla de Catálogo (nombre + descripción del servicio en el PDF exportado).
- **`duracion_estimada`** (integer, minutos) se reemplaza por **`duracion_valor`** (integer) + **`duracion_unidad`** (text, `check in ('horas','dias')`) — el wizard ya no tiene opción de minutos.
  **Backfill de duración**: convertir minutos a horas/días de forma exacta no siempre es posible (ej. 45 minutos no es un número entero de horas). Dejo un backfill de ejemplo abajo que solo convierte los casos limpios (múltiplos de 60) a horas y deja el resto en `null` para que el taller lo vuelva a cargar a mano — es una sugerencia, no una decisión tomada.

### DDL propuesto

```sql
-- PROPUESTA — revisar antes de correr contra la base compartida.

-- 2a. categoria — PRIMERO confirmar si hay filas reales con este dato antes
--     de correr esto. Deja la columna (por si hace falta conservar el dato)
--     pero ya no la exige ni la restringe:
alter table servicios drop constraint servicios_categoria_check; -- confirmar nombre real del constraint
alter table servicios alter column categoria drop not null;
-- Si se confirma que no hace falta conservar nada de categoria:
-- alter table servicios drop column categoria;

-- 2b. descripcion (nullable a nivel DB — la UI la exige, pero no forzamos
--     NOT NULL acá por si hay filas viejas sin valor)
alter table servicios add column descripcion text;

-- 2c. duracion_valor + duracion_unidad, reemplazando duracion_estimada
alter table servicios add column duracion_valor integer check (duracion_valor is null or duracion_valor > 0);
alter table servicios add column duracion_unidad text check (duracion_unidad is null or duracion_unidad in ('horas', 'dias'));

-- Backfill de EJEMPLO (ajustar según lo que decidan): solo convierte los
-- casos exactos (múltiplos de 60 minutos) a horas; el resto queda en null.
update servicios
  set duracion_valor = duracion_estimada / 60,
      duracion_unidad = 'horas'
  where duracion_estimada is not null and duracion_estimada % 60 = 0;

alter table servicios drop column duracion_estimada;
```

---

## 3) `servicio_receta_items` — soporte para insumo "libre"

Un insumo "libre" es uno que el taller usa en un servicio pero no tiene cargado en Mis Insumos (sin ficha de rendimiento/precio de envase) — en vez de eso, se le pide un costo estimado por uso directamente. Mismo espíritu que el patrón que vos ya usaste en `turno_receta_aplicada` (`insumo_id` nullable, `nombre_insumo` not null): acá agrego las columnas que le faltan a `servicio_receta_items` para el mismo caso.

- **`nombre_libre`** (text, nullable) y **`costo_estimado`** (numeric, nullable): datos de la línea libre.
- **`cantidad`** pasa a nullable (una línea libre no tiene cantidad, tiene costo estimado).
- El `check(cantidad > 0)` actual se reemplaza por uno que exige **una de las dos formas completas**: catálogo (`insumo_id` + `cantidad`) o libre (`nombre_libre` + `costo_estimado`).

### DDL propuesto

```sql
-- PROPUESTA — revisar antes de correr contra la base compartida.

alter table servicio_receta_items add column nombre_libre text;
alter table servicio_receta_items add column costo_estimado numeric(12, 2);

alter table servicio_receta_items alter column cantidad drop not null;
alter table servicio_receta_items drop constraint servicio_receta_items_cantidad_check; -- confirmar nombre real del constraint

alter table servicio_receta_items add constraint servicio_receta_items_linea_check
  check (
    (insumo_id is not null and cantidad is not null and cantidad > 0)
    or
    (insumo_id is null and nombre_libre is not null and costo_estimado is not null and costo_estimado > 0)
  );
```

**Nota aparte (no incluida en el diff de código todavía):** si un servicio con líneas libres se usa en un trabajo y ese trabajo pasa a "Finalizado", `TurnoContext.actualizarEstadoTrabajo` va a necesitar el mismo tipo de columnas en `turno_receta_aplicada` (hoy `cantidad` ahí también es `not null`, sin lugar para costo estimado de una línea libre) para poder congelar el snapshot sin romper. Lo dejo señalado para resolver en una vuelta aparte una vez que estos 3 puntos estén confirmados — no lo toqué porque `TurnoContext.js` es tuyo y recién migrado en 4 etapas, no quise meter mano ahí sin hablarlo primero.

---

## Diffs de código listos (sin aplicar)

En esta misma carpeta:

- **`DataContext.patch`**: `filaAInsumo`/`COLUMNAS_INSUMO`/`agregarInsumo` actualizados para `diluciones`/`cantidad_actual`/`es_personalizado`, más la función nueva `moverInsumoDeCategoria`. Usa el esquema de la sección 1.
- **`ServicioContext.patch`**: `filaAServicio`/`COLUMNAS_SERVICIO`/`agregarServicio`/`editarServicio` actualizados para `descripcion`/`duracion_valor`/`duracion_unidad` (sin `categoria`), más `reconciliarReceta` extendida para manejar líneas libres (se reemplazan todas juntas en cada guardado, ya que `insumo_id` siempre `null` no sirve como clave natural para un `UPSERT`). Usa el esquema de las secciones 2 y 3.

Los dos aplican limpio contra el estado actual del repo (verificado con `git apply --check`). Para aplicarlos una vez que la migración esté corrida:

```sh
git apply docs/propuesta-servicios-insumos/DataContext.patch
git apply docs/propuesta-servicios-insumos/ServicioContext.patch
```

Lo que falta después de aplicar estos dos diffs (no incluido acá): `ServicioModal.js` (sacar categoría, sumar descripción, duración en horas/días), `RecetaServicioStep.js` (insumo libre), `MisServiciosScreen.js` (tarjetas), y la pantalla nueva de Catálogo (`CatalogoScreen.js` + `CatalogoContext.js` + `plantillasCatalogo.js`, más el registro en `App.js`/navegación) — esos son componentes/pantallas nuevas o ya reescritas del lado mío, no dependen de tocar código tuyo ya migrado, así que los traigo aparte una vez que se confirme el esquema de esta propuesta.
