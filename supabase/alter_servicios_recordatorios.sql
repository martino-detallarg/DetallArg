-- ============================================================================
-- servicios.tiene_recordatorio / dura_meses / recordar_cada_meses — pedido
-- de Augusto.
--
-- Para servicios con un efecto que dura un tiempo y conviene recordarle al
-- cliente que lo renueve (ej. un sellador que dura 6 meses y conviene
-- avisar a los 5) — hoy la app no tiene ningún concepto de esto todavía;
-- este ALTER es solo la base de datos, el lado de la app (dónde se carga,
-- de dónde sale el recordatorio en Notificaciones, etc.) se arma aparte.
--
-- Aditivo, sin tocar nada existente: no afecta servicio_receta_items, el
-- costeo de Finanzas, ni ninguna receta — son 3 columnas nuevas en
-- `servicios`, todas con default/nullable, así que las filas existentes
-- quedan como "sin recordatorio" sin necesidad de backfill.
--
-- dura_meses/recordar_cada_meses son NULLABLE (no valores requeridos ni
-- siquiera con tiene_recordatorio = true): el constraint de abajo solo
-- exige que estén en null cuando tiene_recordatorio es false, para que no
-- quede un valor viejo "pegado" si el taller desactiva el recordatorio más
-- adelante — no exige que estén cargados cuando es true, para no trabar un
-- guardado incremental desde la UI (activar el switch y cargar los meses
-- en un paso aparte).
--
-- Correr a mano en el SQL Editor de Supabase (no hay CLI de migraciones en
-- este repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table servicios
  add column tiene_recordatorio     boolean not null default false,
  add column dura_meses             numeric(5, 1) check (dura_meses is null or dura_meses > 0),
  add column recordar_cada_meses    numeric(5, 1) check (recordar_cada_meses is null or recordar_cada_meses > 0);

alter table servicios
  add constraint servicios_recordatorio_check check (
    tiene_recordatorio = true or (dura_meses is null and recordar_cada_meses is null)
  );

comment on column servicios.tiene_recordatorio is
  'true si este servicio tiene un efecto que dura un tiempo y conviene recordarle al cliente que lo renueve. false (default) = sin recordatorio, sin cambios de comportamiento.';
comment on column servicios.dura_meses is
  'Cuántos meses dura el efecto del servicio (ej. 6). Null si tiene_recordatorio es false; puede ser null incluso si es true mientras el taller todavía no lo cargó.';
comment on column servicios.recordar_cada_meses is
  'Cada cuántos meses avisarle al cliente para que renueve (ej. 5, para avisar un mes antes de que se cumplan los 6 de dura_meses). Mismo criterio de nulidad que dura_meses.';
