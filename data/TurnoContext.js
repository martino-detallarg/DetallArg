import { createContext, useContext, useMemo, useState } from "react";
import { turnosIniciales } from "./mockData";
import { useServicios } from "./ServicioContext";
import { useData } from "./DataContext";

const TurnoContext = createContext(null);

// Mismo patrón de Context + useState en memoria que ClienteContext,
// TallerContext y PedidoContext (sin backend). Depende de ServicioContext y
// DataContext (ver App.js: TurnoProvider queda anidado dentro de ambos) para
// poder descontar insumos al completar un trabajo.
export function TurnoProvider({ children }) {
  const [turnos, setTurnos] = useState(turnosIniciales);
  const { getServicioById } = useServicios();
  const { getInsumoById, descontarInsumos } = useData();

  function agregarTurno(datosTurno) {
    // empleadosAsignados guarda { empleadoId, nombreEmpleado } con el
    // nombre "congelado" al momento de asignar (mismo criterio que
    // recetaAplicada más abajo): si el empleado después cambia de nombre o
    // se desactiva, el turno viejo sigue mostrando el nombre que tenía.
    const nuevoTurno = { id: `t${Date.now()}`, empleadosAsignados: [], ...datosTurno };
    setTurnos((actuales) => [...actuales, nuevoTurno]);
    return nuevoTurno;
  }

  function actualizarTurno(id, cambios) {
    setTurnos((actuales) => actuales.map((t) => (t.id === id ? { ...t, ...cambios } : t)));
  }

  // Al pasar un trabajo a "Finalizado" por primera vez, se descuenta stock
  // según la receta ACTUAL del servicio y se guarda una copia congelada en
  // `recetaAplicada` (con nombre/unidad incluidos, no solo el id, para que el
  // registro no dependa de que el insumo siga existiendo igual después). El
  // guard `!turno.recetaAplicada` evita descontar dos veces si el trabajo se
  // vuelve a mover a Finalizado tras pasar por otro estado — a propósito no
  // se repone stock si se revierte hacia atrás (ver ESTADO_PROYECTO.md).
  function actualizarEstadoTrabajo(id, nuevoEstado) {
    const turno = getTurnoById(id);

    if (nuevoEstado === "Finalizado" && turno && !turno.recetaAplicada && turno.servicioId) {
      const servicio = getServicioById(turno.servicioId);
      if (servicio?.receta?.length) {
        descontarInsumos(servicio.receta);
        // Una línea "libre" (insumo sin ficha en Mis Insumos, ver
        // RecetaServicioStep.js) no tiene insumoId/cantidad: se congela con
        // su nombre y costo estimado tal como se cargaron, en vez de
        // intentar resolverla como si fuera del catálogo de insumos.
        const recetaAplicada = servicio.receta.map((linea) => {
          if (linea.libre) {
            return {
              libre: true,
              libreId: linea.libreId,
              nombreInsumo: linea.nombre,
              costoEstimado: linea.costoEstimado,
            };
          }
          const insumo = getInsumoById(linea.insumoId);
          return {
            insumoId: linea.insumoId,
            nombreInsumo: insumo?.nombre ?? "Insumo eliminado",
            unidad: insumo?.capacidadUnidad ?? "",
            cantidad: linea.cantidad,
          };
        });
        actualizarTurno(id, { estado: nuevoEstado, recetaAplicada });
        return;
      }
    }

    actualizarTurno(id, { estado: nuevoEstado });
  }

  function eliminarTurno(id) {
    setTurnos((actuales) => actuales.filter((t) => t.id !== id));
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
      eliminarTurno,
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
