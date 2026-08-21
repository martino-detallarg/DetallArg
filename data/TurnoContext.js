import { createContext, useContext, useMemo, useState } from "react";
import { turnosIniciales } from "./mockData";

const TurnoContext = createContext(null);

// Mismo patrón de Context + useState en memoria que ClienteContext,
// TallerContext y PedidoContext (sin backend).
export function TurnoProvider({ children }) {
  const [turnos, setTurnos] = useState(turnosIniciales);

  function agregarTurno(datosTurno) {
    const nuevoTurno = { id: `t${Date.now()}`, ...datosTurno };
    setTurnos((actuales) => [...actuales, nuevoTurno]);
    return nuevoTurno;
  }

  function actualizarTurno(id, cambios) {
    setTurnos((actuales) => actuales.map((t) => (t.id === id ? { ...t, ...cambios } : t)));
  }

  function actualizarEstadoTrabajo(id, nuevoEstado) {
    actualizarTurno(id, { estado: nuevoEstado });
  }

  function getTurnoById(id) {
    return turnos.find((t) => t.id === id);
  }

  const value = useMemo(
    () => ({
      turnos,
      agregarTurno,
      actualizarTurno,
      actualizarEstadoTrabajo,
      getTurnoById,
    }),
    [turnos]
  );

  return <TurnoContext.Provider value={value}>{children}</TurnoContext.Provider>;
}

export function useTurnos() {
  const contexto = useContext(TurnoContext);
  if (!contexto) {
    throw new Error("useTurnos debe usarse dentro de <TurnoProvider>");
  }
  return contexto;
}
