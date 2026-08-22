import { createContext, useContext, useMemo, useState } from "react";
import { empleadosIniciales } from "./mockEquipo";

const EquipoContext = createContext(null);

// Mismo patrón de Context + useState en memoria que ClienteContext y
// ServicioContext (sin backend). El límite de cuántos empleados se pueden
// agregar vive en TallerContext (useTaller().limiteEmpleados), no acá: este
// Context solo guarda los datos, no valida el plan.
export function EquipoProvider({ children }) {
  const [empleados, setEmpleados] = useState(empleadosIniciales);

  function agregarEmpleado({ nombre, rol, telefono }) {
    const nuevoEmpleado = { id: `emp${Date.now()}`, nombre, rol, telefono };
    setEmpleados((actuales) => [...actuales, nuevoEmpleado]);
    return nuevoEmpleado;
  }

  function editarEmpleado(id, cambios) {
    setEmpleados((actuales) => actuales.map((e) => (e.id === id ? { ...e, ...cambios } : e)));
  }

  function eliminarEmpleado(id) {
    setEmpleados((actuales) => actuales.filter((e) => e.id !== id));
  }

  const value = useMemo(
    () => ({ empleados, agregarEmpleado, editarEmpleado, eliminarEmpleado }),
    [empleados]
  );

  return <EquipoContext.Provider value={value}>{children}</EquipoContext.Provider>;
}

export function useEquipo() {
  const contexto = useContext(EquipoContext);
  if (!contexto) {
    throw new Error("useEquipo debe usarse dentro de <EquipoProvider>");
  }
  return contexto;
}
