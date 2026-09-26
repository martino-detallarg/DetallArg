-- DetallArg — insumos.material_ppf: distinguir un rollo de PPF de carrocería de uno de vidrio.
--
-- El parabrisas vuelve a cubrirse con PPF (ver data/ppfPanelMatrix.js, campo `material` de cada
-- panel), pero con un producto DISTINTO al rollo de carrocería (una lámina especial pensada para
-- vidrio curvo) -- así que el costo por m² tiene que salir de un insumo distinto, no mezclado con
-- el rollo de carrocería. `material_ppf` guarda a cuál de los dos corresponde CADA insumo de
-- categoría "ppf" que carga el taller.
--
-- Solo tiene sentido para insumos con categoria = 'ppf' (un rollo) -- para el resto de las
-- categorías la columna existe igual (mismo criterio que dilucion_x/envase_aplicador_ml, que
-- tampoco aplican a todas las categorías) pero se ignora del todo.
--
-- Default 'carroceria' (NOT NULL, a diferencia de dilucion_x/envase_aplicador_ml/ml_por_uso que
-- son nullable): a propósito, para que los rollos de PPF YA cargados hoy sigan funcionando
-- exactamente igual que antes de este cambio (como rollo de carrocería) sin que el taller tenga
-- que entrar a tocarlos uno por uno -- "cero impacto en los trabajos existentes", pedido de
-- Augusto.
--
-- Correr cada bloque por separado en el SQL Editor de Supabase, confirmando que cada uno terminó
-- bien antes de seguir con el siguiente (mismo criterio que alter_insumos_ml_por_uso.sql -- no
-- agrupar todo en un solo begin;/commit;).

-- 1) Columna nueva, NOT NULL con default -- a diferencia de la migración anterior, esta sí puede
--    tener default real porque "carroceria" es el comportamiento correcto para TODO insumo ya
--    cargado (no hay ambigüedad como sí la había con ml_por_uso, donde no había forma confiable
--    de inventar un valor).
alter table insumos
  add column material_ppf text not null default 'carroceria'
  check (material_ppf in ('carroceria', 'vidrio'));

-- 2) Revisar ANTES de seguir: confirmar que todos los insumos de categoria 'ppf' ya cargados
--    quedaron en 'carroceria' (el comportamiento de siempre) y que el resto de las categorías no
--    se vio afectada en nada más.
select id, nombre, categoria, material_ppf from insumos where categoria = 'ppf';

comment on column insumos.material_ppf is 'Solo aplica a insumos de categoria ppf (un rollo): a qué le corresponde ese rollo puntual, "carroceria" o "vidrio" (lámina distinta, pensada para vidrio curvo) -- ver data/ppfPanelMatrix.js y utils/calculosPpf.js, que usan el costo por m² del rollo que corresponda según el material de cada panel. Default carroceria para que los rollos ya cargados sigan funcionando igual que antes.';
