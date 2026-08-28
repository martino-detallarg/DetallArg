import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";

const ServicioContext = createContext(null);

// Traduce una fila de `servicios` + su embed de `servicio_receta_items`
// (snake_case, ver supabase/schema.sql) a la forma que espera el resto de
// la app (camelCase). Cada línea de `servicio_receta_items` es de catálogo
// ({ insumoId, cantidad }, cuando insumo_id no es null) o "libre" ({ libre:
// true, libreId, nombre, costoEstimado }, cuando insumo_id es null — ver
// RecetaServicioStep.js). `libreId` es el `id` real de la fila una vez
// guardada (no el `libre${Date.now()}` temporal que usa la UI antes de
// guardar por primera vez).
function filaAServicio(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precio: fila.precio,
    duracionValor: fila.duracion_valor,
    duracionUnidad: fila.duracion_unidad,
    receta: fila.servicio_receta_items.map((item) =>
      item.insumo_id
        ? { insumoId: item.insumo_id, cantidad: item.cantidad }
        : { libre: true, libreId: item.id, nombre: item.nombre_libre, costoEstimado: item.costo_estimado }
    ),
  };
}

const COLUMNAS_SERVICIO =
  "id, nombre, descripcion, precio, duracion_valor, duracion_unidad, " +
  "servicio_receta_items(id, insumo_id, cantidad, nombre_libre, costo_estimado)";

// Reconcilia servicio_receta_items contra una receta nueva ([{ insumoId,
// cantidad }] y/o [{ libre, libreId, nombre, costoEstimado }]).
//
// Líneas de catálogo: UPSERT (aprovechando el unique(servicio_id, insumo_id)
// del esquema) de las presentes, y DELETE solo de las que ya no están —
// mismo criterio que descontarInsumos en DataContext.js: no hay una
// transacción real envolviendo los pasos, pero nunca hay una ventana donde
// el servicio se quede sin receta en la base.
//
// Líneas libres: NO tienen una clave natural en la base (insumo_id es
// siempre null, y Postgres no las considera "iguales" entre sí para el
// unique de arriba, así que un UPSERT nunca las actualizaría, solo las
// duplicaría). Se reemplazan todas juntas en cada guardado: se borran las
// libres existentes de este servicio y se insertan las actuales de nuevo —
// más simple que intentar diffear por libreId, y sin costo real (son pocas
// líneas por servicio).
async function reconciliarReceta(servicioId, receta) {
  const lineasCatalogo = receta.filter((item) => !item.libre);
  const lineasLibres = receta.filter((item) => item.libre);

  if (lineasCatalogo.length > 0) {
    const filas = lineasCatalogo.map((item) => ({
      servicio_id: servicioId,
      insumo_id: item.insumoId,
      cantidad: item.cantidad,
    }));
    const { error } = await supabase
      .from("servicio_receta_items")
      .upsert(filas, { onConflict: "servicio_id,insumo_id" });
    if (error) throw error;
  }

  let queryCatalogo = supabase
    .from("servicio_receta_items")
    .delete()
    .eq("servicio_id", servicioId)
    .not("insumo_id", "is", null);
  if (lineasCatalogo.length > 0) {
    const idsVigentes = lineasCatalogo.map((item) => item.insumoId);
    queryCatalogo = queryCatalogo.not("insumo_id", "in", `(${idsVigentes.join(",")})`);
  }
  const { error: errorBorrarCatalogo } = await queryCatalogo;
  if (errorBorrarCatalogo) throw errorBorrarCatalogo;

  const { error: errorBorrarLibres } = await supabase
    .from("servicio_receta_items")
    .delete()
    .eq("servicio_id", servicioId)
    .is("insumo_id", null);
  if (errorBorrarLibres) throw errorBorrarLibres;

  if (lineasLibres.length > 0) {
    const filasLibres = lineasLibres.map((item) => ({
      servicio_id: servicioId,
      insumo_id: null,
      nombre_libre: item.nombre,
      costo_estimado: item.costoEstimado,
    }));
    const { error: errorInsertLibres } = await supabase.from("servicio_receta_items").insert(filasLibres);
    if (errorInsertLibres) throw errorInsertLibres;
  }
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

  async function agregarServicio({ nombre, descripcion, precio, duracionValor, duracionUnidad, receta = [] }) {
    const { data, error } = await supabase
      .from("servicios")
      .insert({
        taller_id: user.id,
        nombre,
        descripcion,
        precio,
        duracion_valor: duracionValor,
        duracion_unidad: duracionUnidad,
      })
      .select("id, nombre, descripcion, precio, duracion_valor, duracion_unidad")
      .single();
    if (error) throw error;

    if (receta.length > 0) {
      await reconciliarReceta(data.id, receta);
    }

    const nuevoServicio = { ...filaAServicio({ ...data, servicio_receta_items: [] }), receta };
    setServicios((actuales) => [...actuales, nuevoServicio]);
    return nuevoServicio;
  }

  async function editarServicio(id, { nombre, descripcion, precio, duracionValor, duracionUnidad, receta = [] }) {
    const { error } = await supabase
      .from("servicios")
      .update({
        nombre,
        descripcion,
        precio,
        duracion_valor: duracionValor,
        duracion_unidad: duracionUnidad,
      })
      .eq("id", id);
    if (error) throw error;

    await reconciliarReceta(id, receta);

    setServicios((actuales) =>
      actuales.map((s) =>
        s.id === id ? { ...s, nombre, descripcion, precio, duracionValor, duracionUnidad, receta } : s
      )
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
