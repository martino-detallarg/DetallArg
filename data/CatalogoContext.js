import { createContext, useContext, useMemo, useState } from "react";

const CatalogoContext = createContext(null);

const MONEDA_DEFAULT = "ARS $";

// Mismo patrón de Context + useState en memoria que ServicioContext, sin
// backend por ahora. Un "item de catálogo" es un servicio de Mis Servicios
// exportado a la pantalla de Catálogo (screens/CatalogoScreen.js), con la
// plantilla visual elegida y las fotos de antes/después para el PDF.
//
// `tallerFormaTrabajo` y `tallerMonedaCobro` son datos operativos que hoy no
// existen en Mis Datos ni en la tabla `talleres` de Supabase — se cargan y
// guardan acá mismo, aislados a propósito, para que el día que Nico quiera
// migrarlos a la tabla `talleres` sea un cambio localizado a este archivo.
export function CatalogoProvider({ children }) {
  const [itemsCatalogo, setItemsCatalogo] = useState([]);
  const [tallerFormaTrabajo, setTallerFormaTrabajo] = useState("");
  const [tallerMonedaCobro, setTallerMonedaCobro] = useState(MONEDA_DEFAULT);

  function agregarAlCatalogo(servicioId) {
    setItemsCatalogo((actuales) =>
      actuales.some((item) => item.servicioId === servicioId)
        ? actuales
        : [...actuales, { servicioId, plantilla: null, fotos: [] }]
    );
  }

  function quitarDelCatalogo(servicioId) {
    setItemsCatalogo((actuales) => actuales.filter((item) => item.servicioId !== servicioId));
  }

  function estaEnCatalogo(servicioId) {
    return itemsCatalogo.some((item) => item.servicioId === servicioId);
  }

  function actualizarItemCatalogo(servicioId, cambios) {
    setItemsCatalogo((actuales) =>
      actuales.map((item) => (item.servicioId === servicioId ? { ...item, ...cambios } : item))
    );
  }

  function actualizarDatosOperativos({ formaTrabajo, monedaCobro }) {
    if (formaTrabajo !== undefined) setTallerFormaTrabajo(formaTrabajo);
    if (monedaCobro !== undefined) setTallerMonedaCobro(monedaCobro);
  }

  const value = useMemo(
    () => ({
      itemsCatalogo,
      agregarAlCatalogo,
      quitarDelCatalogo,
      estaEnCatalogo,
      actualizarItemCatalogo,
      tallerFormaTrabajo,
      tallerMonedaCobro,
      actualizarDatosOperativos,
    }),
    [itemsCatalogo, tallerFormaTrabajo, tallerMonedaCobro]
  );

  return <CatalogoContext.Provider value={value}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo() {
  const contexto = useContext(CatalogoContext);
  if (!contexto) {
    throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>");
  }
  return contexto;
}
