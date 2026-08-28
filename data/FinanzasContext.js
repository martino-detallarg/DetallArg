import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";
import { convertirFechaAISO, convertirFechaDesdeISO } from "../utils/fecha";

const FinanzasContext = createContext(null);

// Traducen una fila de `cobros`/`gastos_variables` (snake_case, ver
// supabase/schema.sql) a la forma que espera el resto de la app (camelCase,
// fecha como "DD/MM/AAAA" — mismo criterio que TurnoContext con `turnos`).
function filaACobro(fila) {
  return {
    id: fila.id,
    turnoId: fila.turno_id,
    monto: fila.monto,
    fecha: convertirFechaDesdeISO(fila.fecha),
    formaPago: fila.forma_pago,
  };
}

function filaAGastoVariable(fila) {
  return {
    id: fila.id,
    monto: fila.monto,
    categoria: fila.categoria,
    fecha: convertirFechaDesdeISO(fila.fecha),
    descripcion: fila.descripcion ?? "",
  };
}

const COLUMNAS_COBRO = "id, turno_id, monto, fecha, forma_pago";
const COLUMNAS_GASTO_VARIABLE = "id, monto, categoria, fecha, descripcion";

// Fase A de Finanzas: registrar cobros de trabajos y cargar gastos variables
// (tablas `cobros` y `gastos_variables`, ver supabase/schema.sql). Mismo
// patrón exacto que DataContext.js: todas las mutaciones son `async` y
// escriben de verdad contra Supabase antes de tocar el estado local (sin
// actualización optimista) — si Supabase devuelve error, se relanza
// (`throw`) y el estado en memoria no se toca, quien llama debe hacer
// `await` + `try/catch`.
export function FinanzasProvider({ children }) {
  const { user } = useAuth();
  const [cobros, setCobros] = useState([]);
  const [cargandoCobros, setCargandoCobros] = useState(true);
  const [errorCargaCobros, setErrorCargaCobros] = useState(null);
  const [intentoCargaCobros, setIntentoCargaCobros] = useState(0);

  const [gastosVariables, setGastosVariables] = useState([]);
  const [cargandoGastosVariables, setCargandoGastosVariables] = useState(true);
  const [errorCargaGastosVariables, setErrorCargaGastosVariables] = useState(null);
  const [intentoCargaGastosVariables, setIntentoCargaGastosVariables] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarCobros() {
      setCargandoCobros(true);
      setErrorCargaCobros(null);

      const { data, error } = await supabase
        .from("cobros")
        .select(COLUMNAS_COBRO)
        .eq("taller_id", user.id)
        .order("fecha", { ascending: false });

      if (cancelado) return;

      if (error) {
        setErrorCargaCobros(mensajeErrorCarga(error, "los cobros"));
        setCargandoCobros(false);
        return;
      }

      setCobros(data.map(filaACobro));
      setCargandoCobros(false);
    }

    cargarCobros();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaCobros]);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarGastosVariables() {
      setCargandoGastosVariables(true);
      setErrorCargaGastosVariables(null);

      const { data, error } = await supabase
        .from("gastos_variables")
        .select(COLUMNAS_GASTO_VARIABLE)
        .eq("taller_id", user.id)
        .order("fecha", { ascending: false });

      if (cancelado) return;

      if (error) {
        setErrorCargaGastosVariables(mensajeErrorCarga(error, "los gastos variables"));
        setCargandoGastosVariables(false);
        return;
      }

      setGastosVariables(data.map(filaAGastoVariable));
      setCargandoGastosVariables(false);
    }

    cargarGastosVariables();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaGastosVariables]);

  function recargarCobros() {
    setIntentoCargaCobros((n) => n + 1);
  }

  function recargarGastosVariables() {
    setIntentoCargaGastosVariables((n) => n + 1);
  }

  // Un turno = un cobro en v1 (sin pagos parciales) — TrabajoDetalleModal es
  // quien decide si ya existe un cobro para este turno antes de mostrar el
  // botón "Registrar cobro", esta función no lo valida de nuevo.
  async function registrarCobro({ turnoId, monto, fecha, formaPago }) {
    const { data, error } = await supabase
      .from("cobros")
      .insert({
        taller_id: user.id,
        turno_id: turnoId,
        monto,
        fecha: convertirFechaAISO(fecha),
        forma_pago: formaPago,
      })
      .select(COLUMNAS_COBRO)
      .single();
    if (error) throw error;

    const nuevoCobro = filaACobro(data);
    setCobros((actuales) => [nuevoCobro, ...actuales]);
    return nuevoCobro;
  }

  async function agregarGastoVariable({ monto, categoria, fecha, descripcion }) {
    const { data, error } = await supabase
      .from("gastos_variables")
      .insert({
        taller_id: user.id,
        monto,
        categoria,
        fecha: convertirFechaAISO(fecha),
        descripcion: descripcion || null,
      })
      .select(COLUMNAS_GASTO_VARIABLE)
      .single();
    if (error) throw error;

    const nuevoGasto = filaAGastoVariable(data);
    setGastosVariables((actuales) => [nuevoGasto, ...actuales]);
    return nuevoGasto;
  }

  async function eliminarGastoVariable(id) {
    const { error } = await supabase.from("gastos_variables").delete().eq("id", id);
    if (error) throw error;

    setGastosVariables((actuales) => actuales.filter((g) => g.id !== id));
  }

  const value = useMemo(
    () => ({
      cobros,
      cargandoCobros,
      errorCargaCobros,
      recargarCobros,
      gastosVariables,
      cargandoGastosVariables,
      errorCargaGastosVariables,
      recargarGastosVariables,
      registrarCobro,
      agregarGastoVariable,
      eliminarGastoVariable,
    }),
    [
      cobros,
      cargandoCobros,
      errorCargaCobros,
      gastosVariables,
      cargandoGastosVariables,
      errorCargaGastosVariables,
    ]
  );

  return <FinanzasContext.Provider value={value}>{children}</FinanzasContext.Provider>;
}

export function useFinanzas() {
  const contexto = useContext(FinanzasContext);
  if (!contexto) {
    throw new Error("useFinanzas debe usarse dentro de <FinanzasProvider>");
  }
  return contexto;
}
