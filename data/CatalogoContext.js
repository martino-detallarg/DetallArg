import { createContext, useContext, useMemo, useState } from "react";

const CatalogoContext = createContext(null);

// Configuración por defecto del Editor de Catálogo: Clean-Apple como base
// "neutra" (ver EditorCatalogoScreen.js) con su primer color de paleta.
const CONFIGURACION_CATALOGO_VACIA = {
  estiloBase: "clean_apple",
  colorAcento: "#446C95",
  ordenServicios: [],
  serviciosOcultos: [],
  fotoPortada: null,
  textoLibre1: "",
  textoLibre2: "",
};

// Catálogo de fichas/PDF para compartir con clientes: 100% en memoria, no
// migrado a Supabase (mismo estado que ServicioContext antes de migrar).
// Cada ítem de `itemsCatalogo` es { servicioId, fotos }, con `fotos` como
// array de pares { antes, despues } (URIs locales del picker) — ya no lleva
// `plantilla` propia: el estilo ahora es único para todo el catálogo y vive
// en `configuracionCatalogo` (ver Editor de Catálogo).
export function CatalogoProvider({ children }) {
  const [itemsCatalogo, setItemsCatalogo] = useState([]);
  const [tallerFormaTrabajo, setTallerFormaTrabajo] = useState("");
  const [tallerMonedaCobro, setTallerMonedaCobro] = useState("ARS $");
  const [configuracionCatalogo, setConfiguracionCatalogo] = useState(CONFIGURACION_CATALOGO_VACIA);

  function estaEnCatalogo(servicioId) {
    return itemsCatalogo.some((item) => item.servicioId === servicioId);
  }

  function agregarAlCatalogo(servicioId) {
    setItemsCatalogo((actuales) => {
      if (actuales.some((item) => item.servicioId === servicioId)) return actuales;
      return [...actuales, { servicioId, fotos: [] }];
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

  function actualizarConfiguracionCatalogo(cambios) {
    setConfiguracionCatalogo((actual) => ({ ...actual, ...cambios }));
  }

  const value = useMemo(
    () => ({
      itemsCatalogo,
      tallerFormaTrabajo,
      tallerMonedaCobro,
      configuracionCatalogo,
      agregarAlCatalogo,
      quitarDelCatalogo,
      estaEnCatalogo,
      actualizarItemCatalogo,
      actualizarDatosOperativos,
      actualizarConfiguracionCatalogo,
    }),
    [itemsCatalogo, tallerFormaTrabajo, tallerMonedaCobro, configuracionCatalogo]
  );

  return <CatalogoContext.Provider value={value}>{children}</CatalogoContext.Provider>;
}

// Arma el orden final de servicios del catálogo cruzando `itemsCatalogo`
// (fuente de verdad de qué servicios están exportados) con el orden guardado
// en configuracionCatalogo.ordenServicios (array de servicioId). Cualquier
// id de ordenServicios que ya no exista en itemsCatalogo se descarta, y
// cualquier servicio agregado al catálogo después de guardar el orden cae al
// final, en vez de desaparecer. La usan tanto EditorCatalogoScreen.js (para
// mostrar la lista reordenable) como CatalogoScreen.js (para filtrar/ordenar
// antes de generar el PDF completo, ver utils/catalogoPdf.js).
export function construirOrdenCompletoCatalogo(itemsCatalogo, ordenServicios) {
  const idsExistentes = new Set(itemsCatalogo.map((item) => item.servicioId));
  const ordenFiltrado = ordenServicios.filter((id) => idsExistentes.has(id));
  const idsYaOrdenados = new Set(ordenFiltrado);
  const nuevos = itemsCatalogo.map((item) => item.servicioId).filter((id) => !idsYaOrdenados.has(id));
  return [...ordenFiltrado, ...nuevos];
}

export function useCatalogo() {
  const contexto = useContext(CatalogoContext);
  if (!contexto) {
    throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>");
  }
  return contexto;
}
