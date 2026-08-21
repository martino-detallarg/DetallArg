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
      // Un insumo recién agregado se asume lleno hasta que carguemos control
      // real de stock.
      nivel: 100,
    };
    setMisInsumos((actuales) => [...actuales, nuevoInsumo]);
    return nuevoInsumo;
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
