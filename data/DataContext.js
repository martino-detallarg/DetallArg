import { createContext, useContext, useMemo, useState } from "react";
import { autos as autosIniciales, clientes as clientesIniciales } from "./mockData";
import { misInsumosIniciales } from "./mockInsumos";
import { costosFijosIniciales } from "./mockFinanzas";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [clientes, setClientes] = useState(clientesIniciales);
  const [autos, setAutos] = useState(autosIniciales);
  const [misInsumos, setMisInsumos] = useState(misInsumosIniciales);
  const [costosFijos, setCostosFijos] = useState(costosFijosIniciales);

  function agregarCliente({ nombre, telefono, ...resto }) {
    const nuevoCliente = { id: `c${Date.now()}`, nombre, telefono, ...resto };
    setClientes((actuales) => [...actuales, nuevoCliente]);
    return nuevoCliente;
  }

  function agregarAuto({ marca, modelo, patente, color, clienteId, ...resto }) {
    const nuevoAuto = { id: `a${Date.now()}`, marca, modelo, patente, color, clienteId, ...resto };
    setAutos((actuales) => [...actuales, nuevoAuto]);
    return nuevoAuto;
  }

  function actualizarCliente(id, cambios) {
    setClientes((actuales) => actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  function actualizarAuto(id, cambios) {
    setAutos((actuales) => actuales.map((a) => (a.id === id ? { ...a, ...cambios } : a)));
  }

  function getClienteById(id) {
    return clientes.find((c) => c.id === id);
  }

  function getAutoById(id) {
    return autos.find((a) => a.id === id);
  }

  function getAutosByClienteId(clienteId) {
    return autos.filter((a) => a.clienteId === clienteId);
  }

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
      clientes,
      autos,
      misInsumos,
      costosFijos,
      agregarCliente,
      agregarAuto,
      actualizarCliente,
      actualizarAuto,
      getClienteById,
      getAutoById,
      getAutosByClienteId,
      agregarInsumo,
      agregarCostoFijo,
      actualizarCostoFijo,
      eliminarCostoFijo,
    }),
    [clientes, autos, misInsumos, costosFijos]
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
