import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";

const ServicioContext = createContext(null);

// Traduce una fila de `servicios` + su embed de `servicio_receta_items`
// (snake_case, ver supabase/schema.sql) a la forma que espera el resto de
// la app (camelCase, receta como [{ insumoId, cantidad }]) — mismo criterio
// que ClienteContext con `clientes(...vehiculos(...))`.
function filaAServicio(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    precio: fila.precio,
    categoria: fila.categoria,
    duracionEstimada: fila.duracion_estimada,
    receta: fila.servicio_receta_items.map((item) => ({
      insumoId: item.insumo_id,
      cantidad: item.cantidad,
    })),
  };
}

const COLUMNAS_SERVICIO = "id, nombre, precio, categoria, duracion_estimada, servicio_receta_items(insumo_id, cantidad)";

// Reconcilia servicio_receta_items contra una receta nueva ([{ insumoId,
// cantidad }]): UPSERT (aprovechando el unique(servicio_id, insumo_id) del
// esquema) de las líneas presentes, y DELETE solo de las que ya no están.
// No hay una transacción real envolviendo ambos pasos (mismo criterio que
// descontarInsumos en DataContext.js), pero a diferencia de un borrar-e-
// insertar-todo, nunca hay una ventana donde el servicio se quede sin
// receta en la base: si el UPSERT confirma y el DELETE de las sobrantes
// falla después, las líneas vigentes ya quedaron guardadas.
async function reconciliarReceta(servicioId, receta) {
  if (receta.length > 0) {
    const filas = receta.map((item) => ({
      servicio_id: servicioId,
      insumo_id: item.insumoId,
      cantidad: item.cantidad,
    }));
    const { error } = await supabase
      .from("servicio_receta_items")
      .upsert(filas, { onConflict: "servicio_id,insumo_id" });
    if (error) throw error;
  }

  let query = supabase.from("servicio_receta_items").delete().eq("servicio_id", servicioId);
  if (receta.length > 0) {
    const idsVigentes = receta.map((item) => item.insumoId);
    query = query.not("insumo_id", "in", `(${idsVigentes.join(",")})`);
  }
  const { error } = await query;
  if (error) throw error;
}

// Migrado a Supabase (tablas `servicios` y `servicio_receta_items`, ver
// supabase/schema.sql). Todas las mutaciones son `async` y escriben de
// verdad contra Supabase antes de tocar el estado local (sin actualización
// optimista, mismo criterio que el resto de los Contexts ya migrados): si
// Supabase devuelve error, se relanza (`throw`) y el estado en memoria no
// se toca — quien llama debe hacer `await` + `try/catch`.
export function ServicioProvider({ children }) {
  const { user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorCargaServicios, setErrorCargaServicios] = useState(null);
  const [intentoCargaServicios, setIntentoCargaServicios] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarServicios() {
      setCargandoServicios(true);
      setErrorCargaServicios(null);

      const { data, error } = await supabase
        .from("servicios")
        .select(COLUMNAS_SERVICIO)
        .eq("taller_id", user.id)
        .order("nombre", { ascending: true });

      if (cancelado) return;

      if (error) {
        setErrorCargaServicios(mensajeErrorCarga(error, "los servicios"));
        setCargandoServicios(false);
        return;
      }

      setServicios(data.map(filaAServicio));
      setCargandoServicios(false);
    }

    cargarServicios();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaServicios]);

  function recargarServicios() {
    setIntentoCargaServicios((n) => n + 1);
  }

  async function agregarServicio({ nombre, precio, categoria, duracionEstimada, receta = [] }) {
    const { data, error } = await supabase
      .from("servicios")
      .insert({
        taller_id: user.id,
        nombre,
        precio,
        categoria,
        duracion_estimada: duracionEstimada,
      })
      .select("id, nombre, precio, categoria, duracion_estimada")
      .single();
    if (error) throw error;

    if (receta.length > 0) {
      const filas = receta.map((item) => ({
        servicio_id: data.id,
        insumo_id: item.insumoId,
        cantidad: item.cantidad,
      }));
      const { error: errorReceta } = await supabase.from("servicio_receta_items").insert(filas);
      if (errorReceta) throw errorReceta;
    }

    const nuevoServicio = { ...filaAServicio({ ...data, servicio_receta_items: [] }), receta };
    setServicios((actuales) => [...actuales, nuevoServicio]);
    return nuevoServicio;
  }

  async function editarServicio(id, { nombre, precio, categoria, duracionEstimada, receta = [] }) {
    const { error } = await supabase
      .from("servicios")
      .update({ nombre, precio, categoria, duracion_estimada: duracionEstimada })
      .eq("id", id);
    if (error) throw error;

    await reconciliarReceta(id, receta);

    setServicios((actuales) =>
      actuales.map((s) => (s.id === id ? { ...s, nombre, precio, categoria, duracionEstimada, receta } : s))
    );
  }

  async function eliminarServicio(id) {
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (error) throw error;

    setServicios((actuales) => actuales.filter((s) => s.id !== id));
  }

  function getServicioById(id) {
    return servicios.find((s) => s.id === id);
  }

  const value = useMemo(
    () => ({
      servicios,
      cargandoServicios,
      errorCargaServicios,
      recargarServicios,
      agregarServicio,
      editarServicio,
      eliminarServicio,
      getServicioById,
    }),
    [servicios, cargandoServicios, errorCargaServicios]
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
