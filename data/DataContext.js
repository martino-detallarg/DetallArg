import { createContext, useContext, useMemo, useState } from "react";
import { misInsumosIniciales } from "./mockInsumos";
import { costosFijosIniciales } from "./mockFinanzas";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [misInsumos, setMisInsumos] = useState(misInsumosIniciales);
  const [costosFijos, setCostosFijos] = useState(costosFijosIniciales);

  function agregarInsumo({
    productoId,
    marca,
    nombre,
    categoria,
    ph,
    dilucion,
    rendimiento,
    imagen,
    precioCompra,
    capacidadTotal,
    capacidadUnidad,
  }) {
    const nuevoInsumo = {
      id: `mi${Date.now()}`,
      productoId,
      marca,
      nombre,
      categoria,
      ph,
      dilucion,
      rendimiento,
      imagen,
      precioCompra,
      capacidadTotal,
      capacidadUnidad,
      // Un insumo recién agregado se asume lleno hasta que carguemos control
      // real de stock.
      nivel: 100,
    };
    setMisInsumos((actuales) => [...actuales, nuevoInsumo]);
    return nuevoInsumo;
  }

  function getInsumoById(id) {
    return misInsumos.find((i) => i.id === id);
  }

  // Descuenta stock de insumos según una receta de servicio ([{ insumoId,
  // cantidad }], cantidad en la unidad de `capacidadUnidad` de ese insumo).
  // Se llama una sola vez por trabajo, desde TurnoContext.actualizarEstadoTrabajo
  // al pasar a "Finalizado" — ver ese archivo para la lógica de "no descontar
  // dos veces". Un insumo sin `capacidadTotal` cargada o que ya no exista
  // (borrado de Mis Insumos) se ignora en vez de romper el descuento del
  // resto de la receta.
  function descontarInsumos(receta) {
    if (!receta || receta.length === 0) return;
    setMisInsumos((actuales) =>
      actuales.map((insumo) => {
        const item = receta.find((r) => r.insumoId === insumo.id);
        if (!item || !insumo.capacidadTotal) return insumo;
        const puntosADescontar = (item.cantidad / insumo.capacidadTotal) * 100;
        return { ...insumo, nivel: Math.max(0, insumo.nivel - puntosADescontar) };
      })
    );
  }

  function agregarCostoFijo({ categoria, monto }) {
    const nuevoCostoFijo = { id: `cf${Date.now()}`, categoria, monto };
    setCostosFijos((actuales) => [...actuales, nuevoCostoFijo]);
    return nuevoCostoFijo;
  }

  function actualizarCostoFijo(id, cambios) {
    setCostosFijos((actuales) => actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  function eliminarCostoFijo(id) {
    setCostosFijos((actuales) => actuales.filter((c) => c.id !== id));
  }

  const value = useMemo(
    () => ({
      misInsumos,
      costosFijos,
      agregarInsumo,
      getInsumoById,
      descontarInsumos,
      agregarCostoFijo,
      actualizarCostoFijo,
      eliminarCostoFijo,
    }),
    [misInsumos, costosFijos]
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
