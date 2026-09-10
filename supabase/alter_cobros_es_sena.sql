-- ============================================================================
-- cobros.es_sena — distingue una seña (cobro parcial tomado ANTES de que el
-- trabajo esté Finalizado/Entregado, para reservarlo) de un cobro normal.
--
-- Motivo: hoy RegistrarCobroModal.js solo se puede abrir cuando
-- turno.estado ya está en Finalizado/Entregado (ver ESTADOS_QUE_PERMITEN_COBRO
-- en TrabajoDetalleModal.js) — una seña es el mismo mecanismo de cobro
-- parcial, pero tomado mientras el turno sigue Pendiente/En proceso. `cobros`
-- ya soporta varios cobros por turno (pagos parciales); esta columna es solo
-- para poder etiquetar cuáles de esos cobros fueron una seña, sin agregar
-- ninguna tabla nueva.
--
-- `es_sena` default false (no true): no hay que asumir retroactivamente que
-- algún cobro ya cargado fue una seña.
--
-- Correr en el SQL Editor de Supabase (no hay CLI de migraciones en este
-- repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table cobros
  add column es_sena boolean not null default false;
