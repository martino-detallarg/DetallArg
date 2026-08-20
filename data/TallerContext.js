import { createContext, useContext, useMemo, useState } from "react";
import { tallerInicial, misDatosIniciales } from "./mockTaller";

const TallerContext = createContext(null);

// Contexto separado de DataContext porque agrupa datos del taller en sí
// (nombre, logo, datos del titular) en vez de datos operativos como
// clientes o insumos. Se va a reutilizar más adelante en otras pantallas.
export function TallerProvider({ children }) {
  const [nombreTaller, setNombreTaller] = useState(tallerInicial.nombre);
  const [logoTaller, setLogoTaller] = useState(tallerInicial.logo);
  const [misDatos, setMisDatos] = useState(misDatosIniciales);

  function actualizarTaller({ nombre, logo }) {
    if (nombre !== undefined) setNombreTaller(nombre);
    if (logo !== undefined) setLogoTaller(logo);
  }

  function actualizarMisDatos(cambios) {
    setMisDatos((actuales) => ({ ...actuales, ...cambios }));
  }

  const value = useMemo(
    () => ({ nombreTaller, logoTaller, actualizarTaller, misDatos, actualizarMisDatos }),
    [nombreTaller, logoTaller, misDatos]
  );

  return <TallerContext.Provider value={value}>{children}</TallerContext.Provider>;
}

export function useTaller() {
  const contexto = useContext(TallerContext);
  if (!contexto) {
    throw new Error("useTaller debe usarse dentro de <TallerProvider>");
  }
  return contexto;
}
