import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";

const DataContext = createContext(null);

// Traduce una fila de `insumos` (snake_case, ver supabase/schema.sql) a la
// forma que espera el resto de la app (camelCase) — mismo criterio que
// TallerContext con `talleres`.
function filaAInsumo(fila) {
  return {
    id: fila.id,
    productoId: fila.producto_id,
    marca: fila.marca,
    nombre: fila.nombre,
    categoria: fila.categoria,
    diluciones: fila.diluciones ?? [],
    rendimiento: fila.rendimiento,
    imagen: fila.imagen_url,
    precioCompra: fila.precio_compra,
    capacidadTotal: fila.capacidad_total,
    capacidadUnidad: fila.capacidad_unidad,
    cantidadActual: fila.cantidad_actual,
    esPersonalizado: fila.es_personalizado ?? false,
    nivel: fila.nivel,
  };
}

const COLUMNAS_INSUMO =
  "id, producto_id, marca, nombre, categoria, diluciones, rendimiento, imagen_url, precio_compra, capacidad_total, capacidad_unidad, cantidad_actual, es_personalizado, nivel";

// Migrado a Supabase (tablas `insumos` y `costos_fijos`, ver supabase/schema.sql).
// Todas las mutaciones son `async` y escriben de verdad contra Supabase antes
// de tocar el estado local (sin actualización optimista, mismo criterio que
// ClienteContext/TallerContext): si Supabase devuelve error, se relanza
// (`throw`) y el estado en memoria no se toca — quien llama debe hacer
// `await` + `try/catch`.
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [misInsumos, setMisInsumos] = useState([]);
  const [cargandoInsumos, setCargandoInsumos] = useState(true);
  const [errorCargaInsumos, setErrorCargaInsumos] = useState(null);
  const [intentoCargaInsumos, setIntentoCargaInsumos] = useState(0);

  const [costosFijos, setCostosFijos] = useState([]);
  const [cargandoCostosFijos, setCargandoCostosFijos] = useState(true);
  const [errorCargaCostosFijos, setErrorCargaCostosFijos] = useState(null);
  const [intentoCargaCostosFijos, setIntentoCargaCostosFijos] = useState(0);

  // Dependencia `user?.id`, no `user` completo — mismo detalle que
  // ClienteContext/TallerContext (evita recargar en cada refresh automático
  // de token).
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarInsumos() {
      setCargandoInsumos(true);
      setErrorCargaInsumos(null);

      const { data, error } = await supabase
        .from("insumos")
        .select(COLUMNAS_INSUMO)
        .eq("taller_id", user.id)
        .order("nombre", { ascending: true });

      if (cancelado) return;

      if (error) {
        setErrorCargaInsumos(mensajeErrorCarga(error, "los insumos"));
        setCargandoInsumos(false);
        return;
      }

      setMisInsumos(data.map(filaAInsumo));
      setCargandoInsumos(false);
    }

    cargarInsumos();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaInsumos]);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarCostosFijos() {
      setCargandoCostosFijos(true);
      setErrorCargaCostosFijos(null);

      const { data, error } = await supabase
        .from("costos_fijos")
        .select("id, categoria, monto")
        .eq("taller_id", user.id);

      if (cancelado) return;

      if (error) {
        setErrorCargaCostosFijos(mensajeErrorCarga(error, "los costos fijos"));
        setCargandoCostosFijos(false);
        return;
      }

      setCostosFijos(data);
      setCargandoCostosFijos(false);
    }

    cargarCostosFijos();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaCostosFijos]);

  function recargarInsumos() {
    setIntentoCargaInsumos((n) => n + 1);
  }

  function recargarCostosFijos() {
    setIntentoCargaCostosFijos((n) => n + 1);
  }

  // `cantidadActual` (cuánto tiene el taller ahora mismo, en la unidad de
  // `capacidadUnidad`) se persiste tal cual en `cantidad_actual` para poder
  // recalcular/auditar más adelante, y además se usa acá para calcular
  // `nivel` (0-100) antes de insertar — `nivel` sigue siendo el valor
  // derivado que usa el resto de la app (estantería, stock bajo, etc.).
  async function agregarInsumo({
    productoId,
    marca,
    nombre,
    categoria,
    diluciones,
    rendimiento,
    imagen,
    precioCompra,
    capacidadTotal,
    capacidadUnidad,
    cantidadActual,
    esPersonalizado = false,
  }) {
    const nivel =
      capacidadTotal > 0
        ? Math.max(0, Math.min(100, Math.round((cantidadActual / capacidadTotal) * 100)))
        : 100;

    const { data, error } = await supabase
      .from("insumos")
      .insert({
        taller_id: user.id,
        producto_id: productoId,
        marca,
        nombre,
        categoria,
        diluciones,
        rendimiento,
        imagen_url: imagen,
        precio_compra: precioCompra,
        capacidad_total: capacidadTotal,
        capacidad_unidad: capacidadUnidad,
        cantidad_actual: cantidadActual,
        es_personalizado: esPersonalizado,
        nivel,
      })
      .select(COLUMNAS_INSUMO)
      .single();
    if (error) throw error;

    const nuevoInsumo = filaAInsumo(data);
    setMisInsumos((actuales) => [...actuales, nuevoInsumo]);
    return nuevoInsumo;
  }

  function getInsumoById(id) {
    return misInsumos.find((i) => i.id === id);
  }

  async function moverInsumoDeCategoria(id, nuevaCategoria) {
    const { error } = await supabase.from("insumos").update({ categoria: nuevaCategoria }).eq("id", id);
    if (error) throw error;

    setMisInsumos((actuales) =>
      actuales.map((insumo) => (insumo.id === id ? { ...insumo, categoria: nuevaCategoria } : insumo))
    );
  }

  // Descuenta stock de insumos según una receta de servicio ([{ insumoId,
  // cantidad }], cantidad en la unidad de `capacidadUnidad` de ese insumo).
  // Se llama una sola vez por trabajo, desde TurnoContext.actualizarEstadoTrabajo
  // al pasar a "Finalizado" — ver ese archivo para la lógica de "no descontar
  // dos veces". Un insumo sin `capacidadTotal` cargada o que ya no exista
  // (borrado de Mis Insumos) se ignora en vez de romper el descuento del
  // resto de la receta — también ignora silenciosamente las líneas "libres"
  // de la receta (sin insumoId, ver RecetaServicioStep.js), que no tienen
  // stock real que descontar.
  //
  // Async, sin actualización optimista igual que el resto de este archivo:
  // se escriben TODOS los `UPDATE` de la receta primero (en paralelo) y solo
  // si ninguno falla se aplica el descuento al estado local. Si alguno falla,
  // se relanza el error y el estado local no se toca — aunque, a diferencia
  // de una mutación de un solo registro, es posible que algún `UPDATE` previo
  // del mismo `Promise.all` ya haya quedado guardado en Supabase antes de que
  // otro fallara (no hay una transacción real envolviendo el lote).
  // TurnoContext.actualizarEstadoTrabajo espera (`await`) esta función antes
  // de mover el turno a "Finalizado": si descontarInsumos tira, el turno
  // tampoco cambia de estado.
  async function descontarInsumos(receta) {
    if (!receta || receta.length === 0) return;

    const actualizaciones = receta
      .map((item) => {
        const insumo = misInsumos.find((i) => i.id === item.insumoId);
        if (!insumo || !insumo.capacidadTotal) return null;
        const puntosADescontar = (item.cantidad / insumo.capacidadTotal) * 100;
        return { id: insumo.id, nivel: Math.max(0, insumo.nivel - puntosADescontar) };
      })
      .filter(Boolean);

    if (actualizaciones.length === 0) return;

    const resultados = await Promise.all(
      actualizaciones.map(({ id, nivel }) => supabase.from("insumos").update({ nivel }).eq("id", id))
    );
    const resultadoConError = resultados.find((r) => r.error);
    if (resultadoConError) throw resultadoConError.error;

    setMisInsumos((actuales) =>
      actuales.map((insumo) => {
        const actualizacion = actualizaciones.find((a) => a.id === insumo.id);
        return actualizacion ? { ...insumo, nivel: actualizacion.nivel } : insumo;
      })
    );
  }

  async function agregarCostoFijo({ categoria, monto }) {
    const { data, error } = await supabase
      .from("costos_fijos")
      .insert({ taller_id: user.id, categoria, monto })
      .select("id, categoria, monto")
      .single();
    if (error) throw error;

    setCostosFijos((actuales) => [...actuales, data]);
    return data;
  }

  async function actualizarCostoFijo(id, cambios) {
    const { error } = await supabase.from("costos_fijos").update(cambios).eq("id", id);
    if (error) throw error;

    setCostosFijos((actuales) => actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  async function eliminarCostoFijo(id) {
    const { error } = await supabase.from("costos_fijos").delete().eq("id", id);
    if (error) throw error;

    setCostosFijos((actuales) => actuales.filter((c) => c.id !== id));
  }

  const value = useMemo(
    () => ({
      misInsumos,
      cargandoInsumos,
      errorCargaInsumos,
      recargarInsumos,
      costosFijos,
      cargandoCostosFijos,
      errorCargaCostosFijos,
      recargarCostosFijos,
      agregarInsumo,
      getInsumoById,
      moverInsumoDeCategoria,
      descontarInsumos,
      agregarCostoFijo,
      actualizarCostoFijo,
      eliminarCostoFijo,
    }),
    [misInsumos, cargandoInsumos, errorCargaInsumos, costosFijos, cargandoCostosFijos, errorCargaCostosFijos]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const contexto = useContext(DataContext);
  if (!contexto) {
    throw new Error("useData debe usarse dentro de <DataProvider>");
  }
  return contexto;
}
