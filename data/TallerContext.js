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

const ORDEN_DIAS = horariosIniciales.map((h) => h.dia);

// Postgres `time` vuelve de Supabase como "09:00:00" (con segundos) — se
// recorta a "09:00" para seguir siendo compatible con parsearHoraHHMM/
// formatearHoraHHMM (esperan HH:MM exacto). También reordena Lunes->Domingo,
// porque Supabase no garantiza el orden de filas de una tabla sin ORDER BY
// explícito por ese criterio.
function filasDbAHorarios(filas) {
  const porDia = new Map(
    filas.map((f) => [
      f.dia_semana,
      {
        dia: f.dia_semana,
        abierto: f.abierto,
        horaApertura: f.hora_apertura.slice(0, 5),
        horaCierre: f.hora_cierre.slice(0, 5),
      },
    ])
  );
  return ORDEN_DIAS.map((dia) => porDia.get(dia)).filter(Boolean);
}

// Contexto separado de DataContext porque agrupa datos del taller en sí
// (nombre, logo, datos del titular, plan de suscripción) en vez de datos
// operativos como clientes o insumos.
//
// El ESTADO INICIAL (nombreTaller/logoTaller/misDatos/plan) se trae una
// sola vez de la fila real de `talleres` en Supabase — la crea
// automáticamente el trigger handle_new_user al registrarse (ver
// supabase/trigger_nuevo_usuario.sql).
//
// `horarios` (Mis Horarios) también migrado: bootstrap propio, separado del
// de `talleres`, porque `horarios_atencion` no tiene ningún trigger que la
// siembre al registrarse (a diferencia de `talleres`) — la primera vez que
// un taller (nuevo o ya existente de antes de esta migración) no tiene
// ninguna fila cargada, esta misma función las crea (upsert de
// `horariosIniciales`, con `ignoreDuplicates` por si dos dispositivos entran
// a la vez) y recién después vuelve a leer para quedarse con el estado real.
//
// Mutaciones: `actualizarMisDatos`, la parte de `nombre` de
// `actualizarTaller` y `actualizarHorario` escriben de verdad en Supabase
// (async, tiran si hay error — quien las llama debe hacer await +
// try/catch). `logo` (sin Storage todavía) y `cambiarPlan` (solo lo usa el
// panel de pruebas de desarrollo) siguen siendo solo en memoria a propósito.
export function TallerProvider({ children }) {
  const { user } = useAuth();
  const [nombreTaller, setNombreTaller] = useState("");
  const [logoTaller, setLogoTaller] = useState(null);
  const [misDatos, setMisDatos] = useState(MIS_DATOS_VACIOS);
  const [plan, setPlan] = useState("basico");
  const [horarios, setHorarios] = useState(horariosIniciales);
  const [cargandoTaller, setCargandoTaller] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);

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

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarHorarios() {
      const columnas = "dia_semana, abierto, hora_apertura, hora_cierre";
      let { data, error } = await supabase
        .from("horarios_atencion")
        .select(columnas)
        .eq("taller_id", user.id);

      if (cancelado) return;

      if (error) {
        console.warn("No se pudieron cargar los horarios desde Supabase:", error.message);
        setCargandoHorarios(false);
        return;
      }

      if (data.length === 0) {
        // Primera vez que este taller no tiene ninguna fila: se siembran los
        // 7 días default. `ignoreDuplicates` por si otro dispositivo llega a
        // sembrarlas al mismo tiempo (evita pisarse con el UNIQUE de
        // taller_id+dia_semana) — después se vuelve a leer para quedarse con
        // el estado real, sea cual sea el que haya ganado la carrera.
        const filasDefault = horariosIniciales.map((h) => ({
          taller_id: user.id,
          dia_semana: h.dia,
          abierto: h.abierto,
          hora_apertura: h.horaApertura,
          hora_cierre: h.horaCierre,
        }));

        const { error: errorSiembra } = await supabase
          .from("horarios_atencion")
          .upsert(filasDefault, { onConflict: "taller_id,dia_semana", ignoreDuplicates: true });

        if (cancelado) return;

        if (errorSiembra) {
          console.warn("No se pudieron crear los horarios iniciales en Supabase:", errorSiembra.message);
          setCargandoHorarios(false);
          return;
        }

        ({ data, error } = await supabase.from("horarios_atencion").select(columnas).eq("taller_id", user.id));

        if (cancelado) return;

        if (error) {
          console.warn("No se pudieron releer los horarios desde Supabase:", error.message);
          setCargandoHorarios(false);
          return;
        }
      }

      setHorarios(filasDbAHorarios(data));
      setCargandoHorarios(false);
    }

    cargarHorarios();
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

  // Actualiza un solo día del horario de atención (Mis Horarios).
  async function actualizarHorario(dia, cambios) {
    const columnas = {};
    if (cambios.abierto !== undefined) columnas.abierto = cambios.abierto;
    if (cambios.horaApertura !== undefined) columnas.hora_apertura = cambios.horaApertura;
    if (cambios.horaCierre !== undefined) columnas.hora_cierre = cambios.horaCierre;

    const { error } = await supabase
      .from("horarios_atencion")
      .update(columnas)
      .eq("taller_id", user.id)
      .eq("dia_semana", dia);
    if (error) throw error;

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
      cargandoHorarios,
    }),
    [nombreTaller, logoTaller, misDatos, plan, limiteEmpleados, horarios, cargandoTaller, cargandoHorarios]
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
