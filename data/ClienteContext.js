import { createContext, useContext, useMemo, useState } from "react";

const ClienteContext = createContext(null);

// Clientes/vehículos de ejemplo con los mismos IDs (c1/c2, a1/a2/a3) que
// esperan los turnos de ejemplo en mockData.js (turnosIniciales). Sin esto,
// esos turnos no resuelven a ningún cliente/vehículo real y TurnoCard
// muestra "Cliente sin datos" / "Auto sin datos".
const clientesIniciales = [
  {
    id: "c1",
    nombre: "Juan Pérez",
    telefono: "11 2345-6789",
    vehiculos: [
      { id: "a1", marca: "Volkswagen", modelo: "Golf", anio: "2019", patente: "AB123CD", color: "Gris" },
      { id: "a2", marca: "Toyota", modelo: "Hilux", anio: "2021", patente: "AC456EF", color: "Blanca" },
    ],
  },
  {
    id: "c2",
    nombre: "Marina López",
    telefono: "11 3456-7890",
    vehiculos: [
      { id: "a3", marca: "Fiat", modelo: "Cronos", anio: "2020", patente: "AD789GH", color: "Negro" },
    ],
  },
];

// Mismo patrón de Context + useState en memoria que DataContext y
// PedidoContext (sin backend). Cada cliente guarda sus vehículos anidados
// en `vehiculos`, así no hace falta una tabla separada tipo "autos".
export function ClienteProvider({ children }) {
  const [clientes, setClientes] = useState(clientesIniciales);

  function agregarCliente({ nombre, telefono }) {
    const nuevoCliente = { id: `c${Date.now()}`, nombre, telefono, vehiculos: [] };
    setClientes((actuales) => [...actuales, nuevoCliente]);
    return nuevoCliente;
  }

  function editarCliente(id, cambios) {
    setClientes((actuales) => actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  function eliminarCliente(id) {
    setClientes((actuales) => actuales.filter((c) => c.id !== id));
  }

  function agregarVehiculo(clienteId, vehiculo) {
    const nuevoVehiculo = { id: `v${Date.now()}`, ...vehiculo };
    setClientes((actuales) =>
      actuales.map((c) =>
        c.id === clienteId ? { ...c, vehiculos: [...c.vehiculos, nuevoVehiculo] } : c
      )
    );
    return nuevoVehiculo;
  }

  function editarVehiculo(clienteId, vehiculoId, cambios) {
    setClientes((actuales) =>
      actuales.map((c) =>
        c.id === clienteId
          ? { ...c, vehiculos: c.vehiculos.map((v) => (v.id === vehiculoId ? { ...v, ...cambios } : v)) }
          : c
      )
    );
  }

  function eliminarVehiculo(clienteId, vehiculoId) {
    setClientes((actuales) =>
      actuales.map((c) =>
        c.id === clienteId ? { ...c, vehiculos: c.vehiculos.filter((v) => v.id !== vehiculoId) } : c
      )
    );
  }

  function getClienteById(id) {
    return clientes.find((c) => c.id === id);
  }

  // Busca un vehículo por id recorriendo todos los clientes, para los
  // lugares que solo tienen el id del vehículo a mano (por ejemplo un turno
  // guardado con clienteId + autoId).
  function getVehiculoById(id) {
    for (const cliente of clientes) {
      const vehiculo = cliente.vehiculos.find((v) => v.id === id);
      if (vehiculo) return vehiculo;
    }
    return undefined;
  }

  const value = useMemo(
    () => ({
      clientes,
      agregarCliente,
      editarCliente,
      eliminarCliente,
      agregarVehiculo,
      editarVehiculo,
      eliminarVehiculo,
      getClienteById,
      getVehiculoById,
    }),
    [clientes]
  );

  return <ClienteContext.Provider value={value}>{children}</ClienteContext.Provider>;
}

export function useClientes() {
  const contexto = useContext(ClienteContext);
  if (!contexto) {
    throw new Error("useClientes debe usarse dentro de <ClienteProvider>");
  }
  return contexto;
}
