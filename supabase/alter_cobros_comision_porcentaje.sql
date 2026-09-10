-- ============================================================================
-- cobros.comision_porcentaje — comisión de tarjeta "fotografiada" en el
-- momento de registrar el cobro (ver el prompt "nuevo home de Finanzas,
-- semáforo y comisión de tarjeta", Fase 4). Mismo criterio ya usado para
-- turno_receta_aplicada.costo_unitario_snapshot: se copia el número vigente
-- en talleres.comision_tarjeta_porcentaje al momento de guardar, no una
-- referencia al valor de configuración actual — si el taller cambia de
-- proveedor o renegocia el % después, los cobros ya registrados siguen
-- mostrando la comisión con la que se cobraron.
--
-- numeric null (no default 0): `null` significa "este cobro no tuvo
-- comisión fotografiada" (forma de pago sin comisión configurada, o cobro
-- cargado antes de esta migración) — distinto de "0%", que sí sería un
-- valor real fotografiado. calcularTotalComisionesTarjeta (ver
-- utils/calculosFinanzas.js) ignora los `null`, nunca los trata como 0
-- fotografiado.
-- ============================================================================

alter table cobros
  add column comision_porcentaje numeric(5, 2) null
              check (comision_porcentaje is null or (comision_porcentaje >= 0 and comision_porcentaje <= 100));

comment on column cobros.comision_porcentaje is
  'Comisión de tarjeta vigente en talleres.comision_tarjeta_porcentaje al momento de registrar ESTE cobro, copiada una sola vez (nunca se actualiza después). Null si la forma de pago no tenía comisión configurada (>0) en ese momento, o si el cobro se cargó antes de esta columna existir.';
