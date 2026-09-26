-- ============================================================================
-- DetallArg — cliente -> turno -> cobro: cascada puntual (pedido explícito
-- de Augusto).
--
-- Hoy borrar un cliente NO borra sus turnos ni sus cobros: turnos.cliente_id
-- y cobros.turno_id son ON DELETE SET NULL a propósito (ver los comentarios
-- de supabase/schema.sql y supabase/crear_cobros_y_gastos_variables.sql —
-- la idea original era que borrar algo de catálogo nunca reescriba en
-- silencio las Finanzas de un mes ya cerrado).
--
-- Este ALTER cambia ESO puntualmente para la cadena cliente -> turno ->
-- cobro, nada más: vehiculo_id/servicio_id de turnos, y el resto de los
-- SET NULL del esquema (empleado_id de turno_empleados, insumo_id de
-- turno_receta_aplicada, etc.), quedan EXACTAMENTE como están -- ahí sí
-- seguimos queriendo conservar el historial aunque se borre el catálogo.
--
-- Efecto real: borrar un turno (a mano, o en cascada porque se borró el
-- cliente) ahora también borra sus cobros -- no hay forma de que una FK
-- distinga "por qué" se borró el turno, así que ambos caminos comparten el
-- mismo comportamiento. eliminarCliente (data/ClienteContext.js) queda
-- protegido con una confirmación que muestra cuántos trabajos y cuánto
-- cobrado se van a perder (ver hooks/useConfirmarYEliminarCliente.js) --
-- pero OJO: eliminarTurno (TurnoCard.js/AgendaScreen.js/HomeScreen.js, borrar
-- un turno SUELTO) sigue con su confirmación de siempre, que no menciona los
-- cobros que ahora también se van a borrar con él. Fuera de alcance de este
-- cambio (pedido puntual para el caso cliente), pero es una consecuencia
-- real de este ALTER que conviene resolver aparte.
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando
-- que cada uno terminó bien antes de seguir con el siguiente (mismo
-- criterio que alter_insumos_ml_por_uso.sql -- no agrupar todo en un solo
-- begin;/commit;).
-- ============================================================================

-- 1) Buscar el nombre REAL de las dos constraints antes de tocar nada -- NO
--    asumir el default de Postgres, aunque sea lo más probable dado que las
--    dos se definieron inline en su create table original (turnos en
--    schema.sql, cobros en crear_cobros_y_gastos_variables.sql) -- mismo
--    criterio de verificación que ya se usó en
--    alter_turno_danios_tipos_moto.sql/alter_insumos_capacidad_unidad_m2.sql.
select
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name and tc.table_schema = rc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and (
    (tc.table_name = 'turnos' and kcu.column_name = 'cliente_id')
    or (tc.table_name = 'cobros' and kcu.column_name = 'turno_id')
  );

-- Alternativa equivalente con pg_constraint, si se prefiere:
-- select conname, conrelid::regclass as tabla, confdeltype
-- from pg_constraint
-- where (conrelid = 'turnos'::regclass or conrelid = 'cobros'::regclass) and contype = 'f';
--
-- `delete_rule` (information_schema) tiene que decir 'SET NULL' para las
-- dos filas ANTES de seguir -- si dice otra cosa, no es la fila correcta,
-- parar y revisar. El nombre esperado por convención default de Postgres
-- para una FK sin nombre propio definida inline es
-- turnos_cliente_id_fkey / cobros_turno_id_fkey -- si el select de arriba
-- mostró otro nombre, reemplazarlo en los DROP de los puntos 2) y 4) antes
-- de correrlos.

-- 2) turnos.cliente_id: SET NULL -> CASCADE.
alter table turnos
  drop constraint turnos_cliente_id_fkey;

alter table turnos
  add constraint turnos_cliente_id_fkey
  foreign key (cliente_id) references clientes (id) on delete cascade;

-- 3) Revisar antes de seguir: correr de nuevo el select del punto 1) y
--    confirmar que la fila de turnos ahora dice delete_rule = 'CASCADE'.

-- 4) cobros.turno_id: SET NULL -> CASCADE.
alter table cobros
  drop constraint cobros_turno_id_fkey;

alter table cobros
  add constraint cobros_turno_id_fkey
  foreign key (turno_id) references turnos (id) on delete cascade;

-- 5) Revisar: correr el select del punto 1) una tercera vez y confirmar que
--    las DOS filas (turnos y cobros) ya dicen delete_rule = 'CASCADE'.

comment on constraint turnos_cliente_id_fkey on turnos is
  'CASCADE a propósito (ver alter_cliente_borrado_cascada.sql) -- borrar un cliente borra sus turnos. Distinto del resto de las FK de turnos (vehiculo_id/servicio_id siguen SET NULL): pedido puntual de Augusto, no un cambio general de criterio.';

comment on constraint cobros_turno_id_fkey on cobros is
  'CASCADE a propósito (ver alter_cliente_borrado_cascada.sql) -- borrar un turno borra sus cobros, ya sea a mano o en cascada porque se borró el cliente. Antes era SET NULL (el ingreso histórico se conservaba) -- ver eliminarCliente/useConfirmarYEliminarCliente para la confirmación que avisa cuánto se va a perder antes de llegar hasta acá.';

-- ============================================================================
-- ¿Alguna otra tabla referencia turnos.id o cobros.id sin pasar por acá, que
-- ahora quede huérfana? Revisado 1 a 1 contra TODO supabase/*.sql (grep de
-- "references turnos"/"references cobros"):
--
-- Tablas que referencian turnos.id -- YA cascadean solas, sin cambios
-- necesarios (se borran junto con el turno sin importar por qué se borró,
-- exactamente el mismo comportamiento que este ALTER le suma a cobros):
--   - turno_empleados, turno_danios, turno_fotos_danio,
--     turno_receta_aplicada (schema.sql) -- turno_id not null ... on delete
--     cascade.
--   - turno_medicion_micrones, turno_ppf_seleccion, turno_ppf_paneles (sus
--     propios alter_*.sql) -- mismo turno_id not null ... on delete cascade.
--   - cobros.turno_id -- el que este mismo ALTER acaba de poner en cascade.
-- Ninguna quedaría huérfana: no hace falta tocar ninguna de estas.
--
-- Tablas mencionadas en el pedido que NO referencian turnos.id ni cobros.id
-- en absoluto (no hay basura huérfana posible porque nunca hubo una FK):
--   - comisiones_tarjeta_cuotas: solo tiene taller_id (unique (taller_id,
--     cuotas)) -- son planes de comisión del taller, no atados a un cobro
--     puntual. El % elegido se FOTOGRAFÍA en cobros.comision_porcentaje/
--     cobros.cuotas al momento de registrar el cobro (ver
--     crear_comisiones_tarjeta_cuotas.sql) -- si el cobro se borra, esa foto
--     se borra con él (ya es una columna de la propia fila de cobros, no
--     una fila aparte); el plan en comisiones_tarjeta_cuotas ni se entera.
--   - gastos_variables (categoría 'insumo_perdido' incluida): no tiene
--     turno_id ni cobro_id -- es un gasto suelto, cargado a mano o generado
--     solo cuando se ajusta el nivel de un insumo hacia abajo (ver
--     alter_gastos_variables_insumo_perdido.sql), sin relación con ningún
--     turno ni cobro puntual.
--
-- Nada de esto necesita ningún ALTER extra -- se documenta acá para que
-- quede registrado que se revisó, no porque haga falta cambiar algo.
-- ============================================================================
