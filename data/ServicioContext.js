import { createContext, useContext, useMemo, useState } from "react";
import { serviciosIniciales } from "./mockServicios";

const ServicioContext = createContext(null);

// Mismo patrón de Context + useState en memoria que TallerContext,
// ClienteContext y TurnoContext (sin backend).
export function ServicioProvider({ children }) {
  const [servicios, setServicios] = useState(serviciosIniciales);

  function agregarServicio({ nombre, descripcion, precio, duracionValor, duracionUnidad, receta = [] }) {
    const nuevoServicio = {
      id: `sv${Date.now()}`,
      nombre,
      descripcion,
      precio,
      duracionValor,
      duracionUnidad,
      receta,
    };
    setServicios((actuales) => [...actuales, nuevoServicio]);
    return nuevoServicio;
  }

  function editarServicio(id, cambios) {
    setServicios((actuales) => actuales.map((s) => (s.id === id ? { ...s, ...cambios } : s)));
  }

  function eliminarServicio(id) {
    setServicios((actuales) => actuales.filter((s) => s.id !== id));
  }

  function getServicioById(id) {
    return servicios.find((s) => s.id === id);
  }

  const value = useMemo(
    () => ({ servicios, agregarServicio, editarServicio, eliminarServicio, getServicioById }),
    [servicios]
  );

  return <ServicioContext.Provider value={value}>{children}</ServicioContext.Provider>;
}

export function useServicios() {
  const contexto = useContext(ServicioContext);
  if (!contexto) {
    throw new Error("useServicios debe usarse dentro de <ServicioProvider>");
  }
  return contexto;
}
