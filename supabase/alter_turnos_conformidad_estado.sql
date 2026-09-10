-- ============================================================================
-- turnos.conformidad_estado — permite diferir la firma de conformidad
-- (Firmar después) cuando el cliente no está físicamente presente en el
-- check-in, en vez de trabar el resto del wizard de Trabajo Nuevo.
--
-- Hallazgos de la investigación previa (Fase 1, ver
-- screens/trabajoNuevo/FirmaConformidadStep.js): hoy NADA de la firma se
-- persiste — es 100% efímera. La firma capturada (data-URI en memoria) se
-- embebe directo en el HTML del PDF (utils/conformidadPdf.js) y se comparte
-- con expo-sharing, sin pasar por Supabase. Las imágenes de los diagramas de
-- daños (react-native-view-shot, ver InspeccionVisualStep.js) TAMPOCO se
-- persisten nunca — solo viven en el estado del wizard mientras se crea el
-- turno.
--
-- Por eso esta migración NO suma ningún bucket de Storage para guardar la
-- imagen de la firma (se había evaluado): en las dos formas de firmar (en
-- el momento o después) la firma se captura en vivo y el PDF se genera ahí
-- mismo — nunca hace falta rearmar un PDF viejo sin volver a pedir firma.
-- Completar la firma después (components/CompletarFirmaModal.js) arma el
-- mismo texto legal con los daños en TEXTO (construirResumenDanios, ya
-- existe) en vez de las miniaturas del diagrama, que nunca se persistieron.
--
-- `conformidad_estado` default 'pendiente' (no 'firmada'): los turnos ya
-- cargados antes de este ALTER quedan marcados como pendientes, no como
-- firmados retroactivamente — un false positive de "ya está firmado" sería
-- peor que uno de "falta firmar" (el taller puede ignorar un aviso de
-- sobra, no puede recuperar una firma que nunca se pidió).
--
-- Correr en el SQL Editor de Supabase (no hay CLI de migraciones en este
-- repo — mismo mecanismo que el resto de los alter_*.sql).
-- ============================================================================

alter table turnos
  add column conformidad_estado text not null default 'pendiente'
    check (conformidad_estado in ('pendiente', 'firmada'));
