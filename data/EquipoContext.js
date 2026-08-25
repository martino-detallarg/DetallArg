import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";

const EquipoContext = createContext(null);

// Migrado a Supabase (tabla `empleados`, ver supabase/schema.sql). El límite
// de cuántos empleados se pueden agregar sigue sin validarse acá — sigue
// siendo puramente client-side en MiEquipoScreen.js (useTaller().limiteEmpleados
// contra empleados.length), sin ningún CHECK/trigger en la base: no cambia
// con esta migración, ya era así (sin pagos reales conectados).
//
// Fetch inicial + mutaciones `async`, sin actualización optimista: el
// estado local solo cambia si Supabase confirma (mismo criterio que
// TallerContext y ClienteContext).
export function EquipoProvider({ children }) {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [cargandoEquipo, setCargandoEquipo] = useState(true);
  const [errorCargaEquipo, setErrorCargaEquipo] = useState(null);
  const [intentoCargaEquipo, setIntentoCargaEquipo] = useState(0);

  // Dependencia `user?.id`, no `user` completo — ver el comentario del
  // mismo detalle en TallerContext.js (evita recargar en cada refresh
  // automático de token).
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarEmpleados() {
      setCargandoEquipo(true);
      setErrorCargaEquipo(null);

      const { data, error } = await supabase
        .from("empleados")
        .select("id, nombre, rol, telefono, activo")
        .eq("taller_id", user.id)
        .order("nombre", { ascending: true });

      if (cancelado) return;

      if (error) {
        setErrorCargaEquipo(mensajeErrorCarga(error, "los empleados"));
        setCargandoEquipo(false);
        return;
      }

      setEmpleados(data);
      setCargandoEquipo(false);
    }

    cargarEmpleados();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaEquipo]);

  function recargarEquipo() {
    setIntentoCargaEquipo((n) => n + 1);
  }

  async function agregarEmpleado({ nombre, rol, telefono }) {
    const { data, error } = await supabase
      .from("empleados")
      .insert({ taller_id: user.id, nombre, rol, telefono })
      .select("id, nombre, rol, telefono, activo")
      .single();
    if (error) throw error;

    setEmpleados((actuales) => [...actuales, data]);
    return data;
  }

  async function editarEmpleado(id, cambios) {
    const { error } = await supabase.from("empleados").update(cambios).eq("id", id);
    if (error) throw error;

    setEmpleados((actuales) => actuales.map((e) => (e.id === id ? { ...e, ...cambios } : e)));
  }

  // Desactivar en vez de eliminar: mismo patrón que editarEmpleado, para
  // liberar el cupo del límite de empleados del plan sin perder el
  // historial de turnos ya asignados a ese empleado (ver MiEquipoScreen.js).
  async function cambiarEstadoEmpleado(id, activo) {
    await editarEmpleado(id, { activo });
  }

  async function eliminarEmpleado(id) {
    const { error } = await supabase.from("empleados").delete().eq("id", id);
    if (error) throw error;

    setEmpleados((actuales) => actuales.filter((e) => e.id !== id));
  }

  const value = useMemo(
    () => ({
      empleados,
      cargandoEquipo,
      errorCargaEquipo,
      recargarEquipo,
      agregarEmpleado,
      editarEmpleado,
      cambiarEstadoEmpleado,
      eliminarEmpleado,
    }),
    [empleados, cargandoEquipo, errorCargaEquipo]
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
