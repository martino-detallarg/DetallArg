import { createContext, useContext, useMemo, useState } from "react";

const CatalogoContext = createContext(null);

// Catálogo de fichas/PDF para compartir con clientes: 100% en memoria, no
// migrado a Supabase (mismo estado que ServicioContext antes de migrar).
// Cada ítem de `itemsCatalogo` es { servicioId, plantilla, fotos }, con
// `fotos` como array de pares { antes, despues } (URIs locales del picker).
export function CatalogoProvider({ children }) {
  const [itemsCatalogo, setItemsCatalogo] = useState([]);
  const [tallerFormaTrabajo, setTallerFormaTrabajo] = useState("");
  const [tallerMonedaCobro, setTallerMonedaCobro] = useState("ARS $");
  const [plantillaCatalogoGeneral, setPlantillaCatalogoGeneral] = useState("clasica");

  function estaEnCatalogo(servicioId) {
    return itemsCatalogo.some((item) => item.servicioId === servicioId);
  }

  function agregarAlCatalogo(servicioId) {
    setItemsCatalogo((actuales) => {
      if (actuales.some((item) => item.servicioId === servicioId)) return actuales;
      return [...actuales, { servicioId, plantilla: "clasica", fotos: [] }];
    });
  }

  function quitarDelCatalogo(servicioId) {
    setItemsCatalogo((actuales) => actuales.filter((item) => item.servicioId !== servicioId));
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

  function actualizarPlantillaGeneral(clave) {
    setPlantillaCatalogoGeneral(clave);
  }

  const value = useMemo(
    () => ({
      itemsCatalogo,
      tallerFormaTrabajo,
      tallerMonedaCobro,
      plantillaCatalogoGeneral,
      agregarAlCatalogo,
      quitarDelCatalogo,
      estaEnCatalogo,
      actualizarItemCatalogo,
      actualizarDatosOperativos,
      actualizarPlantillaGeneral,
    }),
    [itemsCatalogo, tallerFormaTrabajo, tallerMonedaCobro, plantillaCatalogoGeneral]
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
