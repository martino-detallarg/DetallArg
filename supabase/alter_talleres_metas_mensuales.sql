-- ============================================================================
-- Metas mensuales: objetivo de facturación y de ganancia neta, editable desde
-- Finanzas. Mismo patrón simple que costos_fijos (solo el valor vigente, sin
-- historial) — priorizado así a pedido explícito de Nico/Augusto: un
-- historial versionado (tabla aparte o jsonb con log de ediciones) complica
-- más de lo que aporta para esta primera versión.
--
-- Ambas columnas nullable, sin default: null significa "el taller todavía no
-- cargó una meta" — la UI debe mostrar un estado vacío/invitación a cargarla,
-- nunca inventar un objetivo. meta_actualizada_en la setea la app en cada
-- edición (no hay trigger); si el taller nunca cargó una meta, queda null.
-- ============================================================================

alter table talleres
  add column meta_facturacion_mensual  numeric(12, 2)
              check (meta_facturacion_mensual is null or meta_facturacion_mensual > 0),
  add column meta_ganancia_neta_mensual numeric(12, 2)
              check (meta_ganancia_neta_mensual is null or meta_ganancia_neta_mensual > 0),
  add column meta_actualizada_en        timestamptz;

comment on column talleres.meta_facturacion_mensual is
  'Objetivo mensual de facturación que el taller se propuso, editable desde Finanzas. Null si todavía no cargó ninguno. Sin historial: al editar se pisa el valor anterior (ver meta_actualizada_en).';
comment on column talleres.meta_ganancia_neta_mensual is
  'Objetivo mensual de ganancia neta (facturación - costos), editable desde Finanzas. Null si todavía no cargó ninguno. Sin historial, mismo criterio que meta_facturacion_mensual.';
comment on column talleres.meta_actualizada_en is
  'Cuándo se cargó/editó por última vez alguna de las dos metas de arriba. La setea la app en cada guardado, no un trigger. Null si nunca se cargó una meta.';
