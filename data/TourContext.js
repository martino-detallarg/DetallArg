import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PASOS_TOUR } from "./tourSteps";

const TourContext = createContext(null);

const CLAVE_TOUR_VISTO = "@detallarg/tour_visto";

// Tutorial guiado tipo "spotlight" (ver components/tour/TourAnchor.js y
// TourSpotlight.js) que arranca una sola vez al terminar el onboarding (ver
// OnboardingWizard.handleFinalizar) y se puede volver a disparar a mano
// desde Configuración ("Ver tutorial de nuevo").
//
// Guardado en AsyncStorage, NO en Supabase: cada dispositivo tiene su propio
// estado de "¿ya lo vio?" a propósito -- en talleres con más de una persona
// usando la app, cada una entra desde su propio celular, y que uno haya visto
// el tour no debería ocultárselo al resto.
//
// Cada paso avanza con el botón del globito (TourSpotlight: "Siguiente" o
// "Entendido" en el último), no con completar la acción real -- ningún
// componente de negocio necesita saber que el tour existe, salvo por el
// TourAnchor puntual que envuelve cada punto de interés (ver
// data/tourSteps.js para la lista completa de pasos).
export function TourProvider({ children }) {
  const [tourActivo, setTourActivo] = useState(false);
  const [pasoActualId, setPasoActualId] = useState(null);
  const [tourVisto, setTourVisto] = useState(false);

  useEffect(() => {
    let cancelado = false;
    AsyncStorage.getItem(CLAVE_TOUR_VISTO).then((valor) => {
      if (!cancelado) setTourVisto(valor === "true");
    });
    return () => {
      cancelado = true;
    };
  }, []);

  function iniciarTour() {
    setPasoActualId(PASOS_TOUR[0].id);
    setTourActivo(true);
  }

  // Común a saltear y a terminar el último paso: apaga el tour y lo marca
  // como visto para que no vuelva a aparecer solo (ver iniciarTour, que sí
  // lo puede volver a disparar a mano desde Configuración).
  function marcarTourVisto() {
    setTourActivo(false);
    setPasoActualId(null);
    setTourVisto(true);
    AsyncStorage.setItem(CLAVE_TOUR_VISTO, "true").catch(() => {});
  }

  function avanzarTour() {
    const indiceActual = PASOS_TOUR.findIndex((p) => p.id === pasoActualId);
    const siguiente = PASOS_TOUR[indiceActual + 1];
    if (!siguiente) {
      marcarTourVisto();
      return;
    }
    setPasoActualId(siguiente.id);
  }

  function saltearTour() {
    marcarTourVisto();
  }

  function finalizarTour() {
    marcarTourVisto();
  }

  const value = useMemo(
    () => ({
      tourActivo,
      pasoActualId,
      tourVisto,
      iniciarTour,
      avanzarTour,
      saltearTour,
      finalizarTour,
    }),
    [tourActivo, pasoActualId, tourVisto]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const contexto = useContext(TourContext);
  if (!contexto) {
    throw new Error("useTour debe usarse dentro de <TourProvider>");
  }
  return contexto;
}
