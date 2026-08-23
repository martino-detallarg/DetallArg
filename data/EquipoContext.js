import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

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

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarEmpleados() {
      const { data, error } = await supabase
        .from("empleados")
        .select("id, nombre, rol, telefono")
        .eq("taller_id", user.id)
        .order("nombre", { ascending: true });

      if (cancelado) return;

      if (error) {
        console.warn("No se pudieron cargar los empleados desde Supabase:", error.message);
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
  }, [user]);

  async function agregarEmpleado({ nombre, rol, telefono }) {
    const { data, error } = await supabase
      .from("empleados")
      .insert({ taller_id: user.id, nombre, rol, telefono })
      .select("id, nombre, rol, telefono")
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

  async function eliminarEmpleado(id) {
    const { error } = await supabase.from("empleados").delete().eq("id", id);
    if (error) throw error;

    setEmpleados((actuales) => actuales.filter((e) => e.id !== id));
  }

  const value = useMemo(
    () => ({ empleados, cargandoEquipo, agregarEmpleado, editarEmpleado, eliminarEmpleado }),
    [empleados, cargandoEquipo]
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
