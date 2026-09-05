import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { horariosIniciales, PLANES } from "./mockTaller";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { mensajeErrorCarga } from "../utils/errores";

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
// Mutaciones: `actualizarMisDatos`, `actualizarHorario` y `actualizarTaller`
// completo (nombre y logo, este último subiendo primero a Supabase Storage
// — ver supabase/storage_logos.sql) escriben de verdad en Supabase (async,
// tiran si hay error — quien las llama debe hacer await + try/catch).
// `cambiarPlan` (solo lo usa el panel de pruebas de desarrollo) sigue
// siendo solo en memoria a propósito.
export function TallerProvider({ children }) {
  const { user } = useAuth();
  const [nombreTaller, setNombreTaller] = useState("");
  const [logoTaller, setLogoTaller] = useState(null);
  const [misDatos, setMisDatos] = useState(MIS_DATOS_VACIOS);
  const [plan, setPlan] = useState("basico");
  const [onboardingCompletado, setOnboardingCompletado] = useState(true);
  const [horarios, setHorarios] = useState(horariosIniciales);
  const [cargandoTaller, setCargandoTaller] = useState(true);
  const [errorCargaTaller, setErrorCargaTaller] = useState(null);
  const [intentoCargaTaller, setIntentoCargaTaller] = useState(0);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);
  const [errorCargaHorarios, setErrorCargaHorarios] = useState(null);
  const [intentoCargaHorarios, setIntentoCargaHorarios] = useState(0);

  // Dependencia `user?.id` (no `user` completo) a propósito: `AuthContext`
  // arma un objeto `session`/`user` NUEVO en cada refresh automático de
  // token (~cada 1h, autoRefreshToken), y sin este detalle este efecto
  // recargaría todo en segundo plano cada vez — con spinner visible ahora
  // que hay uno, se notaría como un parpadeo. `user.id` no cambia mientras
  // sea la misma cuenta, así que solo dispara de nuevo ante un login real.
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarTaller() {
      setCargandoTaller(true);
      setErrorCargaTaller(null);

      const { data, error } = await supabase
        .from("talleres")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelado) return;

      if (error) {
        setErrorCargaTaller(mensajeErrorCarga(error, "los datos del taller"));
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
      // ?? true: fallback seguro para el ratito entre que se pushea este
      // código y Nico corre alter_talleres_onboarding.sql — hasta entonces
      // la columna no existe, data.onboarding_completado viene undefined y
      // no hay que mostrarle el wizard a nadie por error.
      setOnboardingCompletado(data.onboarding_completado ?? true);
      setCargandoTaller(false);
    }

    cargarTaller();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaTaller]);

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarHorarios() {
      setCargandoHorarios(true);
      setErrorCargaHorarios(null);

      const columnas = "dia_semana, abierto, hora_apertura, hora_cierre";
      let { data, error } = await supabase
        .from("horarios_atencion")
        .select(columnas)
        .eq("taller_id", user.id);

      if (cancelado) return;

      if (error) {
        setErrorCargaHorarios(mensajeErrorCarga(error, "los horarios"));
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
          setErrorCargaHorarios(mensajeErrorCarga(errorSiembra, "los horarios"));
          setCargandoHorarios(false);
          return;
        }

        ({ data, error } = await supabase.from("horarios_atencion").select(columnas).eq("taller_id", user.id));

        if (cancelado) return;

        if (error) {
          setErrorCargaHorarios(mensajeErrorCarga(error, "los horarios"));
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
  }, [user?.id, intentoCargaHorarios]);

  function recargarTaller() {
    setIntentoCargaTaller((n) => n + 1);
  }

  function recargarHorarios() {
    setIntentoCargaHorarios((n) => n + 1);
  }

  // Sube el logo elegido (URI local del picker + su mimeType real) al
  // bucket público `logos` con nombre fijo `{taller_id}.{ext}` y
  // `upsert: true` (siempre un único archivo por taller, ver
  // supabase/storage_logos.sql). El `?t=timestamp` al final es necesario
  // porque con upsert la URL pública NO cambia al reemplazar el archivo —
  // sin cache-busting, la app seguiría mostrando la imagen vieja cacheada.
  async function subirLogo({ uri, mimeType }) {
    const extension = mimeType === "image/png" ? "png" : "jpg";
    const rutaArchivo = `${user.id}.${extension}`;

    const respuesta = await fetch(uri);
    const arrayBuffer = await respuesta.arrayBuffer();

    const { error: errorSubida } = await supabase.storage
      .from("logos")
      .upload(rutaArchivo, arrayBuffer, {
        contentType: mimeType || "image/jpeg",
        upsert: true,
      });
    if (errorSubida) throw errorSubida;

    const { data } = supabase.storage.from("logos").getPublicUrl(rutaArchivo);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  // `nombre` se escribe directo. `logo` (cuando viene, ver EditarTallerModal.js)
  // es `{ uri, mimeType }` de una foto recién elegida: primero se sube a
  // Storage y recién si eso funciona se persiste `logo_url` — sin
  // actualización optimista, si cualquiera de los dos pasos tira error no
  // se toca el estado local (mismo criterio que el resto de las
  // mutaciones de este archivo).
  async function actualizarTaller({ nombre, logo }) {
    if (nombre !== undefined) {
      const { error } = await supabase.from("talleres").update({ nombre }).eq("id", user.id);
      if (error) throw error;
      setNombreTaller(nombre);
    }
    if (logo !== undefined) {
      const urlPublica = await subirLogo(logo);
      const { error } = await supabase.from("talleres").update({ logo_url: urlPublica }).eq("id", user.id);
      if (error) throw error;
      setLogoTaller(urlPublica);
    }
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

  // Wizard de bienvenida de 4 pasos (screens/onboarding/OnboardingWizard.js)
  // — se llama una sola vez, al terminar el último paso (sea completándolo
  // o salteándolo, ningún paso es obligatorio).
  async function marcarOnboardingCompletado() {
    const { error } = await supabase.from("talleres").update({ onboarding_completado: true }).eq("id", user.id);
    if (error) throw error;
    setOnboardingCompletado(true);
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
      onboardingCompletado,
      marcarOnboardingCompletado,
      horarios,
      actualizarHorario,
      cargandoTaller,
      errorCargaTaller,
      recargarTaller,
      cargandoHorarios,
      errorCargaHorarios,
      recargarHorarios,
    }),
    [
      nombreTaller,
      logoTaller,
      misDatos,
      plan,
      limiteEmpleados,
      onboardingCompletado,
      horarios,
      cargandoTaller,
      errorCargaTaller,
      cargandoHorarios,
      errorCargaHorarios,
    ]
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
