import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Única fuente de verdad de "¿hay sesión?" en toda la app — envuelve TODO
// App.js (incluso Splash/Login/Signup), no solo la parte autenticada, para
// poder decidir a qué pantalla ir apenas resuelve. La sesión persiste sola
// entre reinicios de la app gracias al AsyncStorage configurado en
// lib/supabase.js — acá solo la leemos y nos suscribimos a sus cambios.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
    });

    return () => suscripcion.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // `nombreTaller` es opcional (el usuario puede ser un detailer
  // independiente sin nombre de fantasía): el trigger handle_new_user (ver
  // supabase/trigger_nuevo_usuario.sql) usa `nombre` como fallback de
  // `talleres.nombre` cuando no viene.
  async function signUp({ email, password, nombre, telefono, nombreTaller }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          telefono,
          nombre_taller: nombreTaller || undefined,
        },
      },
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function resendConfirmation(email) {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      cargando,
      signIn,
      signUp,
      signOut,
      resendConfirmation,
    }),
    [session, cargando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
}
