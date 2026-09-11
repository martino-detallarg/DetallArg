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
    facturado: fila.facturado,
    esSena: fila.es_sena,
    comisionPorcentaje: fila.comision_porcentaje,
    cuotas: fila.cuotas,
  };
}

function filaAGastoVariable(fila) {
  return {
    id: fila.id,
    monto: fila.monto,
    categoria: fila.categoria,
    fecha: convertirFechaDesdeISO(fila.fecha),
    descripcion: fila.descripcion ?? "",
    facturado: fila.facturado,
    comprobantePath: fila.comprobante_storage_path,
  };
}

const COLUMNAS_COBRO = "id, turno_id, monto, fecha, forma_pago, facturado, es_sena, comision_porcentaje, cuotas";
const COLUMNAS_GASTO_VARIABLE = "id, monto, categoria, fecha, descripcion, facturado, comprobante_storage_path";

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

  // Un turno puede tener varios cobros (pagos parciales, ver
  // calcularSaldoPendienteTurno en utils/calculosFinanzas.js) — TrabajoDetalleModal
  // es quien decide si mostrar "Registrar cobro"/"Registrar seña" según el
  // saldo pendiente y el estado del turno, no según si ya existe un cobro
  // previo; esta función no vuelve a validar nada de eso.
  //
  // `esSena` (ver alter_cobros_es_sena.sql): un cobro parcial tomado con el
  // turno todavía en Pendiente/En proceso, para reservarlo. Límite conocido,
  // no bloqueante: el costo de insumos de un trabajo
  // (turno_receta_aplicada.costo_unitario_snapshot, ver costoInsumosTurno en
  // utils/calculosFinanzas.js) recién se congela cuando el turno pasa a
  // Finalizado. Si el reporte de Finanzas de un mes se mira ANTES de que el
  // trabajo se finalice, una seña de ese mes figura con margen ~100% (sin
  // costo todavía) — misma convención que ya existe hoy para un turno sin
  // receta aplicada, y no se recalcula después.
  // `comisionPorcentaje`/`cuotas` (comisión de tarjeta por cantidad de
  // cuotas, ver crear_comisiones_tarjeta_cuotas.sql): los valores YA
  // FOTOGRAFIADOS que decide quien llama (RegistrarCobroModal.js, de un
  // plan guardado en TallerContext.planesCuotasTarjeta o cargados a mano
  // para ese cobro puntual) — esta función no vuelve a resolver nada de
  // configuración, solo persiste lo que le pasan. `null`/`undefined` en
  // los dos si ese cobro no tuvo comisión elegida.
  async function registrarCobro({
    turnoId,
    monto,
    fecha,
    formaPago,
    facturado,
    esSena = false,
    comisionPorcentaje = null,
    cuotas = null,
  }) {
    const { data, error } = await supabase
      .from("cobros")
      .insert({
        taller_id: user.id,
        turno_id: turnoId,
        monto,
        fecha: convertirFechaAISO(fecha),
        forma_pago: formaPago,
        facturado,
        es_sena: esSena,
        comision_porcentaje: comisionPorcentaje,
        cuotas,
      })
      .select(COLUMNAS_COBRO)
      .single();
    if (error) throw error;

    const nuevoCobro = filaACobro(data);
    setCobros((actuales) => [nuevoCobro, ...actuales]);
    return nuevoCobro;
  }

  async function agregarGastoVariable({ monto, categoria, fecha, descripcion, facturado, comprobantePath }) {
    const { data, error } = await supabase
      .from("gastos_variables")
      .insert({
        taller_id: user.id,
        monto,
        categoria,
        fecha: convertirFechaAISO(fecha),
        descripcion: descripcion || null,
        facturado,
        comprobante_storage_path: comprobantePath || null,
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
