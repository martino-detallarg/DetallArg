-- ============================================================================
-- talleres.categoria_monotributo — categoría de Monotributo (A a K) del
-- taller, usada para el aviso de tope de facturación en Finanzas y como
-- referencia en el PDF para el contador (ver el prompt "Situación fiscal:
-- tope de monotributo + mostrarla en los PDF").
--
-- Solo tiene sentido cuando talleres.situacion_fiscal = 'Monotributista'
-- (ver MisDatosScreen.js) — no hay CHECK cruzado contra esa columna a
-- propósito: si el taller cambia de situación fiscal, el dato queda
-- guardado sin usarse (MisDatosScreen.js deja de mostrar el selector, y
-- FinanzasScreen.js deja de mostrar el aviso), no hace falta borrarlo.
--
-- Sin distinción servicios/bienes: el tope de facturación anual es el
-- mismo para las dos, lo único que cambia es la cuota mensual (fuera de
-- alcance acá) — ver data/monotributoCategorias.js para los montos.
--
-- not null: si es null, la ausencia de dato ya significa "sin categoría
-- cargada" (mismo criterio que un `situacion_fiscal` sin cargar). No se
-- puso `if not exists` en el ADD COLUMN: no es la convención real de este
-- repo para columnas sueltas (revisada contra alter_talleres_onboarding.sql/
-- alter_talleres_metas_mensuales.sql/alter_talleres_comision_tarjeta.sql/
-- alter_talleres_umbral_ganancia_verde.sql, ninguna la usa) — esa
-- convención es solo para `create table if not exists`.
-- ============================================================================

alter table talleres
  add column categoria_monotributo text
              check (categoria_monotributo is null or categoria_monotributo in
                ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'));

comment on column talleres.categoria_monotributo is
  'Categoría de Monotributo (A a K) del taller, solo relevante cuando situacion_fiscal = ''Monotributista''. Alimenta el aviso de tope de facturación de los últimos 12 meses en Finanzas (ver data/monotributoCategorias.js) y aparece como referencia en el PDF para el contador. Null si el taller no cargó categoría (o no es monotributista).';
