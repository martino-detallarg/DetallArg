import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../navigation/navigationRef";
import { useTaller } from "./TallerContext";

const TourManagerContext = createContext(null);

// Tutorial relacional: explica cómo se conectan las partes de la app
// (Cliente -> Trabajo -> Agenda -> Cobro -> Finanzas). Distinto del
// onboarding de carga de datos (screens/onboarding/OnboardingWizard.js):
// acá no se carga nada, solo se muestra.
//
// Tipos de paso:
//   - "pantalla": navega a una pantalla real y resalta el elemento marcado
//     con useTourTarget(target) (ver data/TourTargetContext.js).
//   - "ilustrativo": tarjeta mockup (components/TourOverlay.js) sin
//     navegación real — a propósito NO abre el wizard/modal de verdad, para
//     que nadie arranque a cargar datos reales en medio del tutorial.
//   - "cierre": pantalla final.
//
// `ruta` es la forma anidada que espera navigationRef.navigate(): Clientes,
// Agenda y Notificaciones son tabs sin botón visible adentro de "Dashboard",
// y Finanzas y Mi Taller son stacks anidados dentro de su tab (ver
// navigation/DashboardNavigator.js).
//
// Ajustes opcionales del recorte (ver TourOverlay.js):
//   - `expandirResaltado.top` agranda el recorte hacia arriba, para lo que
//     sobresale del elemento medido (ej. el "+" central sobre la tab bar).
//   - `paddingResaltado` reemplaza el margen default (8px) alrededor.
export const PASOS_TOUR_RELACIONAL = [
  {
    id: "clientes",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "Clientes" }],
    target: "clientes.nuevo",
    titulo: "Clientes",
    texto: "Acá cargás un cliente con su vehículo. Queda guardado para no volver a pedirlo cada vez.",
  },
  {
    id: "trabajo",
    tipo: "ilustrativo",
    ilustracion: "trabajo",
    titulo: "Trabajo nuevo",
    texto: "Un Trabajo siempre parte de un Cliente + Vehículo. Elegís servicio, fecha y hora.",
  },
  {
    id: "agenda",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "Agenda" }],
    target: "agenda.calendario",
    titulo: "Agenda",
    texto:
      "Apenas cargás fecha y hora, el trabajo aparece solo acá. La Agenda no es una pantalla aparte, es la vista calendario de tus Trabajos.",
  },
  {
    id: "cobro",
    tipo: "ilustrativo",
    ilustracion: "cobro",
    titulo: "Cobros y señas",
    texto:
      "Cuando el cliente paga (todo o una seña), lo registrás desde el detalle del trabajo o desde el botón + de abajo.",
  },
  {
    id: "finanzas",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "Finanzas", params: { screen: "FinanzasHome" } }],
    target: "finanzas.ganancia",
    titulo: "Finanzas",
    texto:
      "Ese cobro que acabás de ver ya está sumado acá. La ganancia se calcula sola, no hay que cargar nada de nuevo.",
  },
  {
    id: "mitaller",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "MiTaller", params: { screen: "MiTaller" } }],
    target: "mitaller.menu",
    titulo: "Mi Taller",
    texto: "Acá vive toda la config operativa: tus datos, tu equipo, insumos, horarios, servicios y catálogo.",
  },
  {
    id: "insumos",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "MiTaller", params: { screen: "MisInsumos" } }],
    target: "insumos.agregar",
    titulo: "Mis Insumos",
    texto:
      "Cargar bien el precio y el envase acá es lo que hace que el costo de cada trabajo en Finanzas sea real, no estimado.",
  },
  {
    // La receta vive adentro del editor de cada servicio (ServicioModal ->
    // RecetaServicioStep), que no se abre durante el tutorial (mismo
    // criterio que los pasos ilustrativos): se resalta la primera tarjeta
    // de servicio (o el "+" si todavía no hay ninguno), que es por donde
    // se entra a esa receta. Ver MisServiciosScreen.js.
    id: "servicios",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "MiTaller", params: { screen: "MisServicios" } }],
    target: "servicios.receta",
    titulo: "Mis Servicios",
    texto: "Acá armás qué insumos y cuánto gasta cada servicio — de ahí sale el costo real.",
  },
  {
    id: "catalogo",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "MiTaller", params: { screen: "Catalogo" } }],
    target: "catalogo.exportar",
    titulo: "Catálogo",
    texto: "Con tus servicios ya cargados, generás un PDF o link para mandarle a clientes.",
  },
  {
    // Se resalta la barra de pestañas tocables (Clientes / Stock /
    // Trabajos, con contador de alertas) de arriba de NotificacionesScreen.
    id: "notificaciones",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "Notificaciones" }],
    target: "notificaciones.pestanias",
    titulo: "Notificaciones",
    texto:
      "Stock avisa insumos por acabarse, Clientes avisa renovación de tratamientos, Trabajos avisa cobros pendientes.",
  },
  {
    id: "accesos",
    tipo: "pantalla",
    ruta: ["Dashboard", { screen: "Home" }],
    target: "tabs.barra",
    // El "+" central sobresale 16px por encima de la barra (paddingTop 6 +
    // marginTop -22 en DashboardNavigator.js); con padding 6 el marco queda
    // 6px por encima del "+" y 6px por debajo de las etiquetas (el área
    // medida termina justo en la base de las etiquetas, ver
    // altoHastaEtiquetas en DashboardNavigator.js).
    expandirResaltado: { top: 16 },
    paddingResaltado: 6,
    titulo: "Tus accesos principales",
    texto:
      "Ahora que viste cómo se conecta todo, estos son tus 5 accesos principales y el + de acciones rápidas.",
  },
  {
    id: "cierre",
    tipo: "cierre",
    titulo: "Listo, así funciona la app",
    texto:
      "Cliente → Trabajo → Agenda → Cobro → Finanzas, y Mi Taller alimentando los costos reales. Cargás cada cosa una sola vez y el resto se actualiza solo.\n\nPodés volver a ver este tutorial cuando quieras desde Configuración.",
  },
];

// Pasos "numerados" (sin contar el cierre), para el "Paso X de N".
export const CANTIDAD_PASOS_NUMERADOS = PASOS_TOUR_RELACIONAL.filter((p) => p.tipo !== "cierre").length;
// Desde este índice en adelante el tour ya pasó por el stack de Mi Taller
// (ver cerrarTour).
const INDICE_PRIMER_PASO_MI_TALLER = PASOS_TOUR_RELACIONAL.findIndex((p) => p.id === "mitaller");

function navegarA(ruta) {
  // Si el contenedor todavía no está listo no hay nada que hacer: el paso
  // se muestra igual y el overlay cae al modo "sin spotlight" (ver
  // TourOverlay.js) en vez de quedar trabado.
  if (!ruta || !navigationRef.isReady()) return;
  navigationRef.navigate(...ruta);
}

// El Tab.Navigator usa backBehavior="history" (ver DashboardNavigator.js):
// sin esto, después del tour el botón atrás de Android (y cualquier goBack)
// recorrería el trayecto del tutorial (Mi Taller -> Notificaciones ->
// Finanzas -> ...) en vez de salir desde Inicio. Deja el historial de tabs
// en solo Inicio, sin tocar las rutas (mismas keys: ninguna pantalla se
// re-monta ni pierde su estado). Si el estado no es el esperado (Inicio no
// quedó enfocado, navegador todavía sin estado), no hace nada: en el peor
// caso queda el historial largo, que no rompe nada.
function recortarHistorialDeTabsAInicio() {
  if (!navigationRef.isReady()) return;
  const tabs = navigationRef.getRootState()?.routes.find((r) => r.name === "Dashboard")?.state;
  if (!tabs || tabs.type !== "tab" || tabs.stale !== false) return;
  const inicio = tabs.routes[tabs.index];
  if (inicio?.name !== "Home") return;
  navigationRef.dispatch({
    ...CommonActions.reset({ ...tabs, history: [{ type: "route", key: inicio.key }] }),
    target: tabs.key,
  });
}

export function TourManagerProvider({ children }) {
  const { tourRelacionalCompletado, marcarTourRelacionalCompletado } = useTaller();
  const [indicePaso, setIndicePaso] = useState(null);

  const tourActivo = indicePaso !== null;
  const pasoActual = tourActivo ? PASOS_TOUR_RELACIONAL[indicePaso] : null;

  // Aplica igual al arranque (auto o manual, desde cualquier pantalla) y a
  // cada transición entre pasos: primero se navega a la pantalla del paso
  // (no-op si ya se está ahí; los pasos ilustrativos no tienen `ruta` y no
  // navegan), y recién después se activa el paso. El overlay NO mide en ese
  // momento: espera a que la pantalla destino tenga foco y su target
  // registre un onLayout (esperarTargetListo en data/TourTargetContext.js),
  // y solo ahí mide y muestra el coachmark (ver components/TourOverlay.js).
  const irAPaso = useCallback((indice) => {
    navegarA(PASOS_TOUR_RELACIONAL[indice].ruta);
    setIndicePaso(indice);
  }, []);

  // Se puede llamar en cualquier momento, sin mirar el flag (botón manual
  // de Configuración). El disparo automático vive en App.js.
  const iniciarTour = useCallback(() => irAPaso(0), [irAPaso]);

  // Común a "Saltar tutorial" y a terminar el cierre: apaga el overlay,
  // vuelve a Inicio (el tour dejó al taller en Finanzas, o en la pantalla
  // del paso donde saltó) y apaga el disparo automático. Si la escritura
  // falla no se le muestra nada al taller: en el peor caso el tour vuelve a
  // aparecer solo una vez más en el próximo arranque.
  const cerrarTour = useCallback(() => {
    // Los pasos de Mis Insumos/Mis Servicios/Catálogo apilan pantallas en
    // el stack de Mi Taller, y `unmountOnBlur` ya no existe en
    // bottom-tabs v7 (se ignora): sin esto, la próxima vez que el taller
    // toque el tab "Mi Taller" caería en Catálogo en vez de en la lista.
    // Navegar a la raíz del stack hace pop de todo lo de arriba.
    if (indicePaso !== null && indicePaso >= INDICE_PRIMER_PASO_MI_TALLER) {
      navegarA(["Dashboard", { screen: "MiTaller", params: { screen: "MiTaller" } }]);
    }
    setIndicePaso(null);
    navegarA(["Dashboard", { screen: "Home" }]);
    // Un frame después, para leer el estado ya con Inicio enfocado.
    requestAnimationFrame(recortarHistorialDeTabsAInicio);
    if (!tourRelacionalCompletado) {
      marcarTourRelacionalCompletado().catch((error) => {
        console.warn("No se pudo guardar que el tutorial ya se vio:", error);
      });
    }
  }, [indicePaso, tourRelacionalCompletado, marcarTourRelacionalCompletado]);

  const avanzarTour = useCallback(() => {
    if (indicePaso === null) return;
    const siguiente = indicePaso + 1;
    if (siguiente >= PASOS_TOUR_RELACIONAL.length) {
      cerrarTour();
      return;
    }
    irAPaso(siguiente);
  }, [indicePaso, irAPaso, cerrarTour]);

  const value = useMemo(
    () => ({
      tourActivo,
      pasoActual,
      indicePaso,
      iniciarTour,
      avanzarTour,
      saltarTour: cerrarTour,
      terminarTour: cerrarTour,
    }),
    [tourActivo, pasoActual, indicePaso, iniciarTour, avanzarTour, cerrarTour]
  );

  return <TourManagerContext.Provider value={value}>{children}</TourManagerContext.Provider>;
}

export function useTourManager() {
  const contexto = useContext(TourManagerContext);
  if (!contexto) {
    throw new Error("useTourManager debe usarse dentro de <TourManagerProvider>");
  }
  return contexto;
}
