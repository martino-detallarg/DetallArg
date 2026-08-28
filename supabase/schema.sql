-- ============================================================================
-- DetallArg — esquema inicial de Supabase (Postgres)
-- Generado a partir de la investigación de los 7 Contexts en memoria de la
-- app (ClienteContext, TurnoContext, ServicioContext, EquipoContext,
-- TallerContext, DataContext, PedidoContext). Ver ESTADO_PROYECTO.md.
--
-- Fuera de alcance a propósito (decidido con el usuario antes de escribir
-- esto):
--   - Políticas de RLS: se hacen en un paso aparte, con calma.
--   - Catálogo de insumos (catalogoInsumos): queda estático en el JS del
--     cliente por ahora, sin tabla propia.
--   - Pedidos a proveedor (PedidoContext): sigue siendo un carrito de UI,
--     sin tabla ni historial.
--   - Storage de imágenes (logo del taller, fotos de daño): las columnas
--     que hoy guardan una URI local (`logo_url`, `imagen_url`,
--     `storage_path`) quedan listas para apuntar a Supabase Storage el día
--     que se suba ese flujo — no se crea ningún bucket acá.
--
-- Tenancy: un login = un taller (no hay múltiples usuarios por taller
-- todavía). `talleres.id` es el mismo UUID que `auth.users.id`.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. TALLER (TallerContext: taller + "Mis Datos" del titular, fusionados)
-- ----------------------------------------------------------------------------

create table talleres (
  id                 uuid primary key references auth.users (id) on delete cascade,

  -- Datos del taller (antes: nombreTaller, logoTaller, plan)
  nombre             text not null,
  logo_url           text,
  plan               text not null default 'basico'
                       check (plan in ('basico', 'intermedio', 'pro')),

  -- "Mis Datos" del titular (antes: misDatos en TallerContext)
  nombre_personal    text,
  web                text,
  correo             text,
  telefono           text,
  ubicacion          text,
  ubicacion_place_id text,
  ubicacion_lat      numeric,
  ubicacion_lng      numeric,
  situacion_fiscal   text
                       check (situacion_fiscal is null or situacion_fiscal in (
                         'Monotributista', 'Responsable Inscripto', 'Exento',
                         'Consumidor Final', 'Prefiero no decir'
                       )),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table talleres is 'Un taller = un usuario logueado (auth.users). Fusiona datos del taller y "Mis Datos" del titular.';
comment on column talleres.ubicacion is 'Dirección formateada que devuelve Google Places al elegirla en el autocompletado de Mis Datos (ver supabase/functions/places-proxy). Puede quedar vacía si el titular todavía no cargó ubicación.';
comment on column talleres.ubicacion_place_id is 'Place ID de Google de la dirección elegida — permite volver a pedir el detalle a Google (ej. recalcular lat/lng) sin repetir la búsqueda del usuario.';
comment on column talleres.ubicacion_lat is 'Latitud de `ubicacion`, resuelta por Google Places Details al momento de elegir la dirección. Null en filas cargadas antes de esta columna.';
comment on column talleres.ubicacion_lng is 'Longitud de `ubicacion`, mismo origen que ubicacion_lat.';

-- Horario de atención (Mis Horarios) — hoy solo informativo, no restringe
-- nada del wizard de Trabajo Nuevo.
create table horarios_atencion (
  id              uuid primary key default gen_random_uuid(),
  taller_id       uuid not null references talleres (id) on delete cascade,
  dia_semana      text not null
                    check (dia_semana in (
                      'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
                    )),
  abierto         boolean not null default true,
  hora_apertura   time not null,
  hora_cierre     time not null,

  unique (taller_id, dia_semana)
);

-- ----------------------------------------------------------------------------
-- 2. CLIENTES Y VEHÍCULOS (ClienteContext)
-- ----------------------------------------------------------------------------

create table clientes (
  id           uuid primary key default gen_random_uuid(),
  taller_id    uuid not null references talleres (id) on delete cascade,
  nombre       text not null,
  telefono     text,
  created_at   timestamptz not null default now()
);

-- Antes: cliente.vehiculos[] anidado. Pasa a tabla propia porque turnos
-- necesita un FK real contra un vehículo puntual.
create table vehiculos (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references clientes (id) on delete cascade,
  taller_id    uuid not null references talleres (id) on delete cascade,
  marca        text not null,
  modelo       text,
  anio         text,
  patente      text,
  color        text
);

comment on column vehiculos.anio is 'Texto libre, no numérico: en el wizard es un campo opcional sin validación estricta de formato.';

-- ----------------------------------------------------------------------------
-- 3. EQUIPO (EquipoContext) — contactos del taller, sin login propio
-- ----------------------------------------------------------------------------

create table empleados (
  id          uuid primary key default gen_random_uuid(),
  taller_id   uuid not null references talleres (id) on delete cascade,
  nombre      text not null,
  rol         text,
  telefono    text,
  activo      boolean not null default true,
  avatar      text check (avatar is null or avatar in ('hombre', 'mujer'))
);

comment on column empleados.activo is 'Desactivar en vez de borrar: libera el cupo del límite de empleados del plan sin perder el historial de turnos ya asignados a ese empleado.';
comment on column empleados.avatar is 'Silueta elegida para el avatar (EmpleadoModal.js) — puramente visual, sin relación con ningún dato personal real del empleado.';

-- ----------------------------------------------------------------------------
-- 4. INSUMOS Y COSTOS FIJOS (DataContext)
-- ----------------------------------------------------------------------------

create table insumos (
  id                uuid primary key default gen_random_uuid(),
  taller_id         uuid not null references talleres (id) on delete cascade,

  -- Referencia al catálogo estático de mockInsumos.js (ej. "carpro-iron-x").
  -- Sin FK: el catálogo no vive en una tabla todavía (ver nota de alcance).
  producto_id       text,

  marca             text,
  nombre            text not null,
  categoria         text not null
                      check (categoria in (
                        'lavado_exterior', 'interior', 'pulido_correccion', 'proteccion_sellado',
                        'accesorios_consumibles', 'ceras', 'vidrios', 'llantas_neumaticos',
                        'apc_desengrasante', 'ceramicos'
                      )),
  rendimiento       text,
  imagen_url        text,
  precio_compra     numeric(12, 2)
                      check (precio_compra is null or precio_compra > 0),

  -- Capacidad del envase: necesaria para convertir la cantidad de una
  -- receta de servicio (ej. "50ml") en puntos de `nivel` a descontar.
  capacidad_total   numeric(10, 2)
                      check (capacidad_total is null or capacidad_total > 0),
  capacidad_unidad  text
                      check (capacidad_unidad is null or capacidad_unidad in ('ml', 'g', 'unidades')),

  -- Stock como % de llenado del envase, no cantidad absoluta.
  nivel             numeric(5, 2) not null default 100
                      check (nivel >= 0 and nivel <= 100),

  -- Diluciones reales que puede usar el taller para este producto (array:
  -- reemplaza a la vieja columna `dilucion`, singular — ver AgregarInsumoModal.js).
  diluciones        text[] not null default '{}',

  -- Cuánto tiene el taller ahora mismo, en la unidad de `capacidad_unidad`.
  -- Se persiste tal cual (para poder recalcular/auditar después) además de
  -- usarse para derivar `nivel` (0-100) al momento de cargar el insumo — ver
  -- DataContext.agregarInsumo.
  cantidad_actual   numeric(10, 2),

  -- true si el insumo no viene del catálogo estático (mockInsumos.js) sino
  -- que el taller lo cargó a mano, sin ficha de referencia.
  es_personalizado  boolean not null default false
);

create table costos_fijos (
  id           uuid primary key default gen_random_uuid(),
  taller_id    uuid not null references talleres (id) on delete cascade,
  nombre       text not null,
  monto        numeric(12, 2) not null check (monto > 0)
);

-- ----------------------------------------------------------------------------
-- 5. SERVICIOS Y RECETA VIVA (ServicioContext)
-- ----------------------------------------------------------------------------

create table servicios (
  id                   uuid primary key default gen_random_uuid(),
  taller_id            uuid not null references talleres (id) on delete cascade,
  nombre               text not null,
  precio               numeric(12, 2) not null check (precio > 0),
  descripcion          text,

  -- Duración estimada como valor + unidad separados (reemplaza a la vieja
  -- columna `duracion_estimada`, en minutos) — permite cargar "2 días" sin
  -- convertir todo a minutos. Ambas nullable: un servicio puede no tener
  -- duración cargada todavía.
  duracion_valor       integer check (duracion_valor is null or duracion_valor > 0),
  duracion_unidad      text check (duracion_unidad is null or duracion_unidad in ('horas', 'dias'))
);

-- Receta VIVA del servicio: editable en cualquier momento desde
-- ServicioModal. Los trabajos ya finalizados NO leen de acá — leen de
-- turno_receta_aplicada (más abajo), que es una copia congelada al momento
-- de completar el trabajo. Editar esta tabla solo afecta a los próximos
-- trabajos que se finalicen.
create table servicio_receta_items (
  id             uuid primary key default gen_random_uuid(),
  servicio_id    uuid not null references servicios (id) on delete cascade,

  -- SET NULL (no CASCADE): si se borra el insumo, la línea de receta se
  -- conserva como "insumo eliminado" en vez de desaparecer silenciosamente
  -- — mismo criterio defensivo que ya tiene RecetaServicioStep.js hoy.
  insumo_id      uuid references insumos (id) on delete set null,

  -- Línea normal (insumo_id + cantidad) o línea "libre" (sin ficha en Mis
  -- Insumos: nombre_libre + costo_estimado en su lugar, ver
  -- RecetaServicioStep.js) — el check de abajo exige que sea una u otra,
  -- nunca las dos ni ninguna.
  cantidad       numeric(10, 2),
  nombre_libre   text,
  costo_estimado numeric(12, 2),

  constraint servicio_receta_items_linea_check check (
    (insumo_id is not null and cantidad is not null and cantidad > 0)
    or
    (insumo_id is null and nombre_libre is not null and costo_estimado is not null and costo_estimado > 0)
  ),

  unique (servicio_id, insumo_id)
);

-- ----------------------------------------------------------------------------
-- 6. TURNOS (TurnoContext) — el núcleo
-- ----------------------------------------------------------------------------

create table turnos (
  id                     uuid primary key default gen_random_uuid(),
  taller_id              uuid not null references talleres (id) on delete cascade,

  -- SET NULL en cliente/vehículo/servicio: un turno ya cargado es un
  -- registro de negocio que no debería desaparecer ni romperse si más
  -- adelante se borra el cliente, el vehículo o el servicio asociado —
  -- mismo espíritu que el fallback "Cliente sin datos"/"Auto sin datos"
  -- que ya tiene TurnoCard.js hoy para referencias colgantes.
  cliente_id             uuid references clientes (id) on delete set null,
  vehiculo_id            uuid references vehiculos (id) on delete set null,
  servicio_id            uuid references servicios (id) on delete set null,

  -- Copia congelada del precio del servicio al momento de crear el turno
  -- (ya es así en el código actual: no se recalcula si el servicio cambia
  -- de precio después). Mismo principio que turno_receta_aplicada.
  precio                 numeric(12, 2),

  -- Copia congelada del NOMBRE del servicio, mismo criterio que precio: no
  -- se recalcula si el servicio se renombra o se borra después.
  servicio_nombre        text,

  fecha                  date,
  hora                   time,
  tiempo_estimado        text, -- sigue como texto libre ("2 horas"), no normalizado
  observaciones          text,

  estado                 text not null default 'Pendiente'
                           check (estado in ('Pendiente', 'En proceso', 'Finalizado', 'Entregado')),

  -- Datos de la inspección visual (TipoVehiculoStep / InspeccionVisualStep)
  tipo_vehiculo          text
                           check (tipo_vehiculo is null or tipo_vehiculo in ('auto', 'camioneta', 'suv', 'moto')),
  grupo_vehiculo         text,
  subdivision_vehiculo   text,
  nivel_nafta            numeric(5, 2) check (nivel_nafta is null or (nivel_nafta >= 0 and nivel_nafta <= 100)),

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Empleados asignados a un turno (antes: turno.empleadosAsignados,
-- [{ empleadoId, nombreEmpleado }]). `nombre_empleado` va denormalizado
-- (nombre congelado al momento de asignar, no resuelto por join), mismo
-- criterio que turno_receta_aplicada: si el empleado cambia de nombre o se
-- desactiva después, la asignación histórica no se ve afectada.
create table turno_empleados (
  id               uuid primary key default gen_random_uuid(),
  turno_id         uuid not null references turnos (id) on delete cascade,

  -- SET NULL (no CASCADE): borrar un empleado no debería borrar el
  -- historial de a qué turnos estuvo asignado.
  empleado_id      uuid references empleados (id) on delete set null,
  nombre_empleado  text not null,

  unique (turno_id, empleado_id)
);

-- Daños previos por zona del diagrama (antes: turno.danios, mapa
-- { zonaId: { tipos: [...], nota } }). `tipos` como text[] nativo en vez de
-- tabla normalizada (decidido: son pocos valores de un catálogo chico y
-- fijo, TIPOS_DANIO).
create table turno_danios (
  id          uuid primary key default gen_random_uuid(),
  turno_id    uuid not null references turnos (id) on delete cascade,
  zona_id     text not null,
  tipos       text[] not null default '{}'
                check (tipos <@ array[
                  'rayon', 'abolladura', 'oxido', 'repintado',
                  'trizadura', 'excremento_ave', 'laca_quemada', 'otro',
                  'rasgada', 'grasa', 'quemado', 'trizado'
                ]::text[]),
  nota        text,

  unique (turno_id, zona_id)
);

-- Fotos del daño (antes: turno.fotosDano[], hoy URIs locales del celular
-- sin subir a ningún lado). `storage_path` queda pensado para un bucket de
-- Supabase Storage cuando se implemente esa parte — no se crea acá.
create table turno_fotos_danio (
  id             uuid primary key default gen_random_uuid(),
  turno_id       uuid not null references turnos (id) on delete cascade,
  storage_path   text not null
);

-- Copia CONGELADA de la receta de insumos aplicada a este turno en el
-- momento en que pasó a "Finalizado". Es la pieza clave de todo el diseño:
-- una vez insertadas estas filas, NUNCA se vuelven a tocar ni a recalcular
-- contra servicio_receta_items, aunque el servicio cambie su receta
-- después. `nombre_insumo`/`unidad` van denormalizados (copiados, no
-- resueltos por join) para que el registro histórico sobreviva intacto
-- incluso si el insumo original se borra más adelante.
create table turno_receta_aplicada (
  id                       uuid primary key default gen_random_uuid(),
  turno_id                 uuid not null references turnos (id) on delete cascade,
  insumo_id                uuid references insumos (id) on delete set null,
  nombre_insumo            text not null,
  unidad                   text,

  -- Línea normal (insumo_id + cantidad) o línea "libre" (sin ficha en Mis
  -- Insumos: costo_estimado congelado en su lugar) — mismo criterio que
  -- servicio_receta_items, el check de abajo exige una u otra.
  cantidad                 numeric(10, 2),
  costo_estimado           numeric(12, 2),

  -- Costo real congelado (precio_compra × cantidad/capacidad_total) al
  -- momento de finalizar el trabajo — null en líneas libres (usar
  -- costo_estimado) y en líneas cuyo insumo no tenía precio_compra/
  -- capacidad_total cargados. Ver alter_turno_receta_costo_unitario_snapshot.sql.
  costo_unitario_snapshot  numeric(12, 2),

  constraint turno_receta_aplicada_linea_check check (
    (insumo_id is not null and cantidad is not null and cantidad > 0)
    or
    (insumo_id is null and costo_estimado is not null and costo_estimado > 0)
  ),

  unique (turno_id, insumo_id)
);

comment on table turno_receta_aplicada is
  'Snapshot inmutable: se inserta una sola vez por turno (mismo guard que hoy tiene TurnoContext.actualizarEstadoTrabajo: solo si el turno todavía no tiene ninguna fila acá). Nunca se actualiza ni se borra por una edición posterior de servicio_receta_items.';

commit;
