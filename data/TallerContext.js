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
// supabase/trigger_nuevo_usuario.sql). Las MUTACIONES de este Context
// (actualizarTaller, actualizarMisDatos, cambiarPlan, actualizarHorario)
// siguen siendo solo en memoria por ahora, igual que antes: esto es
// únicamente el bootstrap de lectura, no la migración completa de
// escritura a Supabase (eso queda para más adelante).
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

  function actualizarTaller({ nombre, logo }) {
    if (nombre !== undefined) setNombreTaller(nombre);
    if (logo !== undefined) setLogoTaller(logo);
  }

  function actualizarMisDatos(cambios) {
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
