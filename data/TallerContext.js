import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { horariosIniciales, PLANES } from "./mockTaller";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const TallerContext = createContext(null);

const MIS_DATOS_VACIOS = {
  nombrePersonal: "",
  web: "",
  correo: "",
  telefono: "",
  ubicacion: "",
  situacionFiscal: null,
};

// Contexto separado de DataContext porque agrupa datos del taller en sí
// (nombre, logo, datos del titular, plan de suscripción) en vez de datos
// operativos como clientes o insumos.
//
// El ESTADO INICIAL (nombreTaller/logoTaller/misDatos/plan) se trae una
// sola vez de la fila real de `talleres` en Supabase — la crea
// automáticamente el trigger handle_new_user al registrarse (ver
// supabase/trigger_nuevo_usuario.sql).
//
// Mutaciones: `actualizarMisDatos` y la parte de `nombre` de
// `actualizarTaller` escriben de verdad en Supabase (async, tiran si hay
// error — quien las llama debe hacer await + try/catch). `logo` (sin
// Storage todavía), `cambiarPlan` (solo lo usa el panel de pruebas de
// desarrollo) y `actualizarHorario` (la tabla `horarios_atencion` ni
// siquiera tiene mecanismo de alta, ver ESTADO_PROYECTO.md) siguen siendo
// solo en memoria a propósito.
export function TallerProvider({ children }) {
  const { user } = useAuth();
  const [nombreTaller, setNombreTaller] = useState("");
  const [logoTaller, setLogoTaller] = useState(null);
  const [misDatos, setMisDatos] = useState(MIS_DATOS_VACIOS);
  const [plan, setPlan] = useState("basico");
  const [horarios, setHorarios] = useState(horariosIniciales);
  const [cargandoTaller, setCargandoTaller] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarTaller() {
      const { data, error } = await supabase
        .from("talleres")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelado) return;

      if (error) {
        console.warn("No se pudo cargar el taller desde Supabase:", error.message);
        setCargandoTaller(false);
        return;
      }

      setNombreTaller(data.nombre ?? "");
      setLogoTaller(data.logo_url ?? null);
      setMisDatos({
        nombrePersonal: data.nombre_personal ?? "",
        web: data.web ?? "",
        correo: data.correo ?? "",
        telefono: data.telefono ?? "",
        ubicacion: data.ubicacion ?? "",
        situacionFiscal: data.situacion_fiscal ?? null,
      });
      setPlan(data.plan ?? "basico");
      setCargandoTaller(false);
    }

    cargarTaller();
    return () => {
      cancelado = true;
    };
  }, [user]);

  // `nombre` se escribe de verdad en Supabase. `logo` sigue solo en
  // memoria: todavía no hay Supabase Storage para subir la imagen (hoy es
  // una URI local del dispositivo — guardarla en `logo_url` no serviría de
  // nada entre sesiones/dispositivos, ver ESTADO_PROYECTO.md).
  async function actualizarTaller({ nombre, logo }) {
    if (nombre !== undefined) {
      const { error } = await supabase.from("talleres").update({ nombre }).eq("id", user.id);
      if (error) throw error;
      setNombreTaller(nombre);
    }
    if (logo !== undefined) setLogoTaller(logo);
  }

  async function actualizarMisDatos(cambios) {
    const columnas = {};
    if (cambios.nombrePersonal !== undefined) columnas.nombre_personal = cambios.nombrePersonal;
    if (cambios.web !== undefined) columnas.web = cambios.web;
    if (cambios.correo !== undefined) columnas.correo = cambios.correo;
    if (cambios.telefono !== undefined) columnas.telefono = cambios.telefono;
    if (cambios.ubicacion !== undefined) columnas.ubicacion = cambios.ubicacion;
    if (cambios.situacionFiscal !== undefined) columnas.situacion_fiscal = cambios.situacionFiscal;

    const { error } = await supabase.from("talleres").update(columnas).eq("id", user.id);
    if (error) throw error;

    setMisDatos((actuales) => ({ ...actuales, ...cambios }));
  }

  // Actualiza un solo día del horario de atención (Mis Horarios). Todavía
  // no restringe nada del wizard de Trabajo Nuevo, es solo de referencia.
  function actualizarHorario(dia, cambios) {
    setHorarios((actuales) =>
      actuales.map((horario) => (horario.dia === dia ? { ...horario, ...cambios } : horario))
    );
  }

  // Sin pagos reales conectados: hoy solo lo llama el panel de pruebas de
  // MiEquipoScreen.js. El día que haya un flujo de compra real, este sigue
  // siendo el punto de entrada para actualizar el plan.
  function cambiarPlan(nuevoPlan) {
    setPlan(nuevoPlan);
  }

  const limiteEmpleados = PLANES[plan].limiteEmpleados;

  const value = useMemo(
    () => ({
      nombreTaller,
      logoTaller,
      actualizarTaller,
      misDatos,
      actualizarMisDatos,
      plan,
      limiteEmpleados,
      cambiarPlan,
      horarios,
      actualizarHorario,
      cargandoTaller,
    }),
    [nombreTaller, logoTaller, misDatos, plan, limiteEmpleados, horarios, cargandoTaller]
  );

  return <TallerContext.Provider value={value}>{children}</TallerContext.Provider>;
}

export function useTaller() {
  const contexto = useContext(TallerContext);
  if (!contexto) {
    throw new Error("useTaller debe usarse dentro de <TallerProvider>");
  }
  return contexto;
}
