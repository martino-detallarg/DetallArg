// Polyfill necesario porque Hermes (el motor JS de React Native) no trae la
// Web API `URL` completa, y el cliente de Supabase la usa por debajo.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan EXPO_PUBLIC_SUPABASE_URL y/o EXPO_PUBLIC_SUPABASE_ANON_KEY. Definilas en el archivo .env de la raíz del proyecto."
  );
}

// AsyncStorage como storage de sesión: el `localStorage` que usa el cliente
// por defecto no existe en React Native. `detectSessionInUrl: false` porque
// no hay navegador/URL de redirect en una app nativa.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
