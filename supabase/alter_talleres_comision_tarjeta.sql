-- ============================================================================
-- talleres.comision_tarjeta_porcentaje — % de comisión que cobra el medio de
-- pago por un cobro con forma_pago = 'tarjeta' (ver el prompt "nuevo home de
-- Finanzas, semáforo y comisión de tarjeta", Fase 4).
--
-- Se confirmó contra data/mockFinanzas.js (FORMAS_PAGO) que las formas de
-- pago reales son efectivo/transferencia/tarjeta/otro — NO hay Débito y
-- Crédito por separado como asumía el prompt original, así que hay una sola
-- columna de comisión (tarjeta), no dos. Efectivo/Transferencia/Otro quedan
-- en 0% fijo, sin campo editable (ver ConfiguracionFinanzasScreen.js).
--
-- not null default 0 (no null): "sin comisión configurada" y "comisión 0%"
-- son el mismo estado para este campo, a diferencia de las metas mensuales
-- (que sí distinguen "sin cargar" de "cargado en 0").
-- ============================================================================

alter table talleres
  add column comision_tarjeta_porcentaje numeric(5, 2) not null default 0
              check (comision_tarjeta_porcentaje >= 0 and comision_tarjeta_porcentaje <= 100);

comment on column talleres.comision_tarjeta_porcentaje is
  '% de comisión que descuenta el medio de pago en un cobro con forma_pago = tarjeta. Se "fotografía" en cobros.comision_porcentaje al momento de registrar cada cobro (ver alter_cobros_comision_porcentaje.sql) — cambiar este valor NO recalcula cobros ya registrados. Editable desde ConfiguracionFinanzasScreen.js. Default 0 (sin comisión).';
