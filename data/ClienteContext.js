import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";

const ClienteContext = createContext(null);

// Migrado a Supabase (tablas `clientes` y `vehiculos`, ver supabase/schema.sql).
// Cada cliente sigue guardando sus vehículos **anidados** en `cliente.vehiculos`
// en memoria (mismo criterio que antes de migrar: no hay una tabla `autos`
// separada a nivel de la app, aunque en la base sí son dos tablas con FK).
// El fetch inicial usa un embedded resource de PostgREST para traer clientes
// + vehículos en una sola query, ya con la forma anidada que espera el resto
// de la app — así ninguna pantalla de solo lectura (ClientesScreen,
// SeleccionarClienteStep, HomeScreen/AgendaScreen vía getClienteById/
// getVehiculoById, TrabajoNuevoWizard) necesitó cambios.
//
// Todas las mutaciones son `async` y escriben de verdad contra Supabase
// antes de tocar el estado local (sin actualización optimista, mismo
// criterio que TallerContext): si Supabase devuelve error, se relanza
// (`throw`) y el estado en memoria no se toca — quien llama debe hacer
// `await` + `try/catch`.
export function ClienteProvider({ children }) {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [errorCargaClientes, setErrorCargaClientes] = useState(null);
  const [intentoCargaClientes, setIntentoCargaClientes] = useState(0);

  // Dependencia `user?.id`, no `user` completo — ver el comentario del
  // mismo detalle en TallerContext.js (evita recargar en cada refresh
  // automático de token).
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarClientes() {
      setCargandoClientes(true);
      setErrorCargaClientes(null);

      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, telefono, vehiculos(id, marca, modelo, anio, patente, color)")
        .eq("taller_id", user.id)
        .order("nombre", { ascending: true });

      if (cancelado) return;

      if (error) {
        setErrorCargaClientes(mensajeErrorCarga(error, "los clientes"));
        setCargandoClientes(false);
        return;
      }

      setClientes(data);
      setCargandoClientes(false);
    }

    cargarClientes();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaClientes]);

  function recargarClientes() {
    setIntentoCargaClientes((n) => n + 1);
  }

  async function agregarCliente({ nombre, telefono }) {
    const { data, error } = await supabase
      .from("clientes")
      .insert({ taller_id: user.id, nombre, telefono })
      .select("id, nombre, telefono")
      .single();
    if (error) throw error;

    const nuevoCliente = { ...data, vehiculos: [] };
    setClientes((actuales) => [...actuales, nuevoCliente]);
    return nuevoCliente;
  }

  async function editarCliente(id, cambios) {
    const { error } = await supabase.from("clientes").update(cambios).eq("id", id);
    if (error) throw error;

    setClientes((actuales) => actuales.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  async function eliminarCliente(id) {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;

    setClientes((actuales) => actuales.filter((c) => c.id !== id));
  }

  async function agregarVehiculo(clienteId, vehiculo) {
    const { data, error } = await supabase
      .from("vehiculos")
      .insert({ taller_id: user.id, cliente_id: clienteId, ...vehiculo })
      .select("id, marca, modelo, anio, patente, color")
      .single();
    if (error) throw error;

    setClientes((actuales) =>
      actuales.map((c) => (c.id === clienteId ? { ...c, vehiculos: [...c.vehiculos, data] } : c))
    );
    return data;
  }

  async function editarVehiculo(clienteId, vehiculoId, cambios) {
    const { error } = await supabase.from("vehiculos").update(cambios).eq("id", vehiculoId);
    if (error) throw error;

    setClientes((actuales) =>
      actuales.map((c) =>
        c.id === clienteId
          ? { ...c, vehiculos: c.vehiculos.map((v) => (v.id === vehiculoId ? { ...v, ...cambios } : v)) }
          : c
      )
    );
  }

  async function eliminarVehiculo(clienteId, vehiculoId) {
    const { error } = await supabase.from("vehiculos").delete().eq("id", vehiculoId);
    if (error) throw error;

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
  // guardado con clienteId + autoId). Opera sobre lo ya cargado en memoria,
  // no dispara ningún request nuevo.
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
      cargandoClientes,
      errorCargaClientes,
      recargarClientes,
      agregarCliente,
      editarCliente,
      eliminarCliente,
      agregarVehiculo,
      editarVehiculo,
      eliminarVehiculo,
      getClienteById,
      getVehiculoById,
    }),
    [clientes, cargandoClientes, errorCargaClientes]
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
