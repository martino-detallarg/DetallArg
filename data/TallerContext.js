import { createContext, useContext, useMemo, useState } from "react";
import { tallerInicial, misDatosIniciales, PLANES } from "./mockTaller";

const TallerContext = createContext(null);

// Contexto separado de DataContext porque agrupa datos del taller en sí
// (nombre, logo, datos del titular, plan de suscripción) en vez de datos
// operativos como clientes o insumos. Se va a reutilizar más adelante en
// otras pantallas.
export function TallerProvider({ children }) {
  const [nombreTaller, setNombreTaller] = useState(tallerInicial.nombre);
  const [logoTaller, setLogoTaller] = useState(tallerInicial.logo);
  const [misDatos, setMisDatos] = useState(misDatosIniciales);
  const [plan, setPlan] = useState(tallerInicial.plan);

  function actualizarTaller({ nombre, logo }) {
    if (nombre !== undefined) setNombreTaller(nombre);
    if (logo !== undefined) setLogoTaller(logo);
  }

  function actualizarMisDatos(cambios) {
    setMisDatos((actuales) => ({ ...actuales, ...cambios }));
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
    }),
    [nombreTaller, logoTaller, misDatos, plan, limiteEmpleados]
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
