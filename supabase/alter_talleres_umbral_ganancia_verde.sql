-- ============================================================================
-- talleres.umbral_ganancia_verde_porcentaje — semáforo de color de la
-- Ganancia Neta del mes en FinanzasScreen.js (ver el prompt "nuevo home de
-- Finanzas, semáforo y comisión de tarjeta").
--
-- Decisión ya tomada: el umbral es un PORCENTAJE sobre el punto de
-- equilibrio (no un monto fijo en pesos), así no hay que reajustarlo a mano
-- por inflación — ver calcularColorSemaforoGananciaNeta en
-- utils/calculosFinanzas.js. Editable desde ConfiguracionFinanzasScreen.js
-- (accedida desde Mi Taller), mismo patrón simple que costos_fijos/metas
-- mensuales: solo el valor vigente, sin historial.
--
-- not null default 30 (a diferencia de las metas mensuales, que son
-- null-por-default): el semáforo necesita SIEMPRE un umbral con el que
-- comparar para poder pintar ámbar/verde, no tiene sentido un estado "sin
-- configurar" acá — 30% es el valor sugerido en el prompt original.
-- ============================================================================

alter table talleres
  add column umbral_ganancia_verde_porcentaje numeric(5, 2) not null default 30
              check (umbral_ganancia_verde_porcentaje >= 0);

comment on column talleres.umbral_ganancia_verde_porcentaje is
  '% de facturación por encima del punto de equilibrio a partir del cual la Ganancia Neta del mes se pinta verde en FinanzasScreen.js (ámbar si superó el equilibrio pero todavía no llegó a este %, rojo si no llegó al equilibrio). Editable desde ConfiguracionFinanzasScreen.js. Default 30.';
