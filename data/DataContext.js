import { createContext, useContext, useMemo, useState } from "react";
import { autos as autosIniciales, clientes as clientesIniciales } from "./mockData";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [clientes, setClientes] = useState(clientesIniciales);
  const [autos, setAutos] = useState(autosIniciales);

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

  const value = useMemo(
    () => ({
      clientes,
      autos,
      agregarCliente,
      agregarAuto,
      actualizarCliente,
      actualizarAuto,
      getClienteById,
      getAutoById,
      getAutosByClienteId,
    }),
    [clientes, autos]
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
