import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useServicios } from "./ServicioContext";
import { useData } from "./DataContext";
import { mensajeErrorCarga } from "../utils/errores";
import { convertirFechaAISO, convertirFechaDesdeISO } from "../utils/fecha";
import { obtenerClavePpf, obtenerPanelesPpf } from "../utils/calculosPpf";

const TurnoContext = createContext(null);

// Mapeo camelCase (forma que usa el resto de la app) -> snake_case (columnas
// reales de `turnos`, ver supabase/schema.sql). Sirve para el INSERT
// completo de agregarTurno y para el UPDATE parcial de actualizarTurno (solo
// se traducen las claves presentes en `datos`) — así no se duplica la
// traducción en los dos lugares.
const MAPEO_CAMPOS_TURNO = {
  clienteId: "cliente_id",
  autoId: "vehiculo_id",
  servicio: "servicio_nombre",
  servicioId: "servicio_id",
  precio: "precio",
  fecha: "fecha",
  hora: "hora",
  tiempoEstimado: "tiempo_estimado",
  observaciones: "observaciones",
  estado: "estado",
  tipoVehiculo: "tipo_vehiculo",
  grupoVehiculo: "grupo_vehiculo",
  subdivisionVehiculo: "subdivision_vehiculo",
  kilometraje: "kilometraje",
  nivelNafta: "nivel_nafta",
  conformidadEstado: "conformidad_estado",
};

function turnoACamposDb(datos) {
  const campos = {};
  for (const [clave, columna] of Object.entries(MAPEO_CAMPOS_TURNO)) {
    if (!(clave in datos)) continue;
    campos[columna] = clave === "fecha" ? convertirFechaAISO(datos.fecha) : datos[clave];
  }
  return campos;
}

const COLUMNAS_TURNO =
  "id, cliente_id, vehiculo_id, servicio_id, servicio_nombre, precio, fecha, hora, " +
  "tiempo_estimado, observaciones, estado, tipo_vehiculo, grupo_vehiculo, " +
  "subdivision_vehiculo, kilometraje, nivel_nafta, conformidad_estado, " +
  "turno_receta_aplicada(insumo_id, nombre_insumo, unidad, cantidad, costo_estimado, costo_unitario_snapshot), " +
  "turno_danios(zona_id, tipos, nota), turno_empleados(empleado_id, nombre_empleado), " +
  "turno_fotos_danio(storage_path), turno_ppf_seleccion(panel_id), turno_ppf_paneles(panel_id), " +
  "turno_medicion_micrones(panel_id, vista, micrones)";

// Traduce las filas de turno_medicion_micrones (ver
// supabase/alter_turno_medicion_micrones.sql) a la forma { modo, promedio,
// porPanel } que espera MedicionMicronesModal.js — mismo shape que arma el
// wizard antes de guardar (ver TrabajoNuevoWizard.js). `null` si el turno no
// tiene ninguna medición cargada. Una sola fila con panel_id null = modo
// "promedio"; cualquier fila con panel_id seteado = modo "panel" (el CHECK
// de la tabla garantiza que panel_id y vista van siempre juntos).
function filasMicronesAMedicion(filas) {
  if (!filas || filas.length === 0) return null;

  if (filas.length === 1 && filas[0].panel_id == null) {
    return { modo: "promedio", promedio: String(filas[0].micrones), porPanel: {} };
  }

  const porPanel = {};
  for (const fila of filas) {
    if (fila.panel_id == null) continue;
    porPanel[fila.vista] = { ...(porPanel[fila.vista] ?? {}), [fila.panel_id]: String(fila.micrones) };
  }
  return { modo: "panel", promedio: "", porPanel };
}

// Inversa de filasMicronesAMedicion: a partir del `medicionMicrones` del
// wizard, arma las filas a insertar en turno_medicion_micrones — solo del
// modo activo (nunca los dos a la vez, ver alter_turno_medicion_micrones.sql)
// y solo los valores numéricos válidos > 0 (un campo vacío o inválido
// simplemente no genera fila, no bloquea el guardado del resto).
function filasMedicionMicrones(turnoId, medicion) {
  if (!medicion?.modo) return [];

  function valorValido(texto) {
    if (!texto?.trim()) return null;
    const numero = Number(texto.replace(",", "."));
    return !Number.isNaN(numero) && numero > 0 ? numero : null;
  }

  if (medicion.modo === "promedio") {
    const valor = valorValido(medicion.promedio);
    return valor != null ? [{ turno_id: turnoId, panel_id: null, vista: null, micrones: valor }] : [];
  }

  const filas = [];
  for (const [vistaId, panelesMap] of Object.entries(medicion.porPanel ?? {})) {
    for (const [panelId, texto] of Object.entries(panelesMap ?? {})) {
      const valor = valorValido(texto);
      if (valor != null) filas.push({ turno_id: turnoId, panel_id: panelId, vista: vistaId, micrones: valor });
    }
  }
  return filas;
}

// Traduce una fila de `turnos` + sus embeds (turno_receta_aplicada,
// turno_danios, turno_empleados, turno_fotos_danio) a la forma que espera el
// resto de la app. `fotosDano` queda como el array de `storage_path` (no
// signed URLs): todavía no hay ninguna pantalla que muestre las fotos, así
// que generar URLs firmadas acá sería trabajo de más para datos que nadie
// mira — eso se resuelve el día que exista un consumidor real.
function filaATurno(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    autoId: fila.vehiculo_id,
    servicio: fila.servicio_nombre,
    servicioId: fila.servicio_id,
    precio: fila.precio,
    fecha: convertirFechaDesdeISO(fila.fecha),
    hora: fila.hora ? fila.hora.slice(0, 5) : "",
    tiempoEstimado: fila.tiempo_estimado ?? "",
    observaciones: fila.observaciones ?? "",
    estado: fila.estado,
    tipoVehiculo: fila.tipo_vehiculo,
    grupoVehiculo: fila.grupo_vehiculo,
    subdivisionVehiculo: fila.subdivision_vehiculo,
    kilometraje: fila.kilometraje,
    nivelNafta: fila.nivel_nafta,
    // 'pendiente' | 'firmada' (ver alter_turnos_conformidad_estado.sql).
    // 'pendiente' cuando se creó el turno con "Firmar después"
    // (FirmaConformidadStep.js) — CompletarFirmaModal.js la pasa a
    // 'firmada' al completarla, típicamente al retirar el vehículo.
    conformidadEstado: fila.conformidad_estado,
    empleadosAsignados: fila.turno_empleados.map((e) => ({
      empleadoId: e.empleado_id,
      nombreEmpleado: e.nombre_empleado,
    })),
    danios: Object.fromEntries(
      fila.turno_danios.map((d) => [d.zona_id, { tipos: d.tipos, nota: d.nota ?? "" }])
    ),
    fotosDano: fila.turno_fotos_danio.map((f) => f.storage_path),
    // Plan de paneles PPF elegido en el wizard (ver turno_ppf_seleccion,
    // supabase/alter_turno_ppf_seleccion.sql) — [] si el servicio no era PPF.
    panelesPpf: fila.turno_ppf_seleccion.map((p) => p.panel_id),
    // null (no []) hasta que actualizarEstadoTrabajo inserta el snapshot
    // inmutable en turno_ppf_paneles al pasar a "Finalizado" — mismo criterio
    // de guard que recetaAplicada, ver el comentario de abajo.
    panelesPpfAplicados:
      fila.turno_ppf_paneles.length > 0 ? fila.turno_ppf_paneles.map((p) => p.panel_id) : null,
    // null (no []) cuando todavía no hay snapshot: el guard de
    // actualizarEstadoTrabajo es `!turno.recetaAplicada`, y un array vacío
    // es truthy en JS — con null el guard se comporta igual que hoy.
    // Una línea "libre" (insumo_id null, ver RecetaServicioStep.js y
    // ServicioContext.js) no tiene cantidad/unidad — se congeló con
    // costo_estimado en su lugar.
    recetaAplicada:
      fila.turno_receta_aplicada.length > 0
        ? fila.turno_receta_aplicada.map((linea) =>
            linea.insumo_id
              ? {
                  insumoId: linea.insumo_id,
                  nombreInsumo: linea.nombre_insumo,
                  unidad: linea.unidad,
                  cantidad: linea.cantidad,
                  costoUnitarioSnapshot: linea.costo_unitario_snapshot,
                }
              : { libre: true, nombreInsumo: linea.nombre_insumo, costoEstimado: linea.costo_estimado }
          )
        : null,
    // Medición de espesor de pintura (µm), 100% opcional — ver
    // MedicionMicronesModal.js. `null` si el turno no tiene nada cargado.
    medicionMicrones: filasMicronesAMedicion(fila.turno_medicion_micrones),
  };
}

// Migrado a Supabase por completo: `turnos` + sus 4 tablas relacionadas
// (turno_receta_aplicada, turno_danios, turno_empleados, turno_fotos_danio,
// ver supabase/schema.sql). Todas las mutaciones son `async` y escriben de
// verdad contra Supabase antes de tocar el estado local (sin actualización
// optimista, mismo criterio que el resto de los Contexts ya migrados): si
// Supabase devuelve error, se relanza (`throw`) y el estado en memoria no se
// toca — quien llama debe hacer `await` + `try/catch`.
export function TurnoProvider({ children }) {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [errorCargaTurnos, setErrorCargaTurnos] = useState(null);
  const [intentoCargaTurnos, setIntentoCargaTurnos] = useState(0);

  const { getServicioById } = useServicios();
  const { getInsumoById, descontarInsumos } = useData();

  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarTurnos() {
      setCargandoTurnos(true);
      setErrorCargaTurnos(null);

      const { data, error } = await supabase
        .from("turnos")
        .select(COLUMNAS_TURNO)
        .eq("taller_id", user.id)
        .order("created_at", { ascending: true });

      if (cancelado) return;

      if (error) {
        setErrorCargaTurnos(mensajeErrorCarga(error, "los turnos"));
        setCargandoTurnos(false);
        return;
      }

      setTurnos(data.map(filaATurno));
      setCargandoTurnos(false);
    }

    cargarTurnos();
    return () => {
      cancelado = true;
    };
  }, [user?.id, intentoCargaTurnos]);

  function recargarTurnos() {
    setIntentoCargaTurnos((n) => n + 1);
  }

  // Sube las fotos de daño (locales, [{ uri, mimeType }]) al bucket privado
  // fotos-danios (ver supabase/storage_fotos_danios.sql) y recién después
  // inserta sus filas en turno_fotos_danio. Ruta por foto:
  // {taller_id}/{turno_id}/{timestamp}-{indice}.{ext}, con un solo
  // Date.now() compartido por todo el lote (no uno por foto) y el índice
  // disambiguando dentro del lote. Sube de a una (no en paralelo entre sí)
  // para saber con precisión cuáles quedaron subidas si alguna falla a
  // mitad de camino — esas rutas se devuelven igual (`rutas`) aunque haya
  // error, pero por decisión explícita NO se intenta limpiarlas de Storage:
  // si todo el turno se termina borrando por este error (ver agregarTurno),
  // esos archivos quedan huérfanos en el bucket — costo aceptado a
  // propósito (bucket privado, nadie los ve, no amerita más código para un
  // camino de falla poco frecuente).
  async function subirFotosDano(turnoId, fotos) {
    if (!fotos || fotos.length === 0) return { error: null, rutas: [] };

    const marcaTiempo = Date.now();
    const rutas = [];
    for (let indice = 0; indice < fotos.length; indice++) {
      const { uri, mimeType } = fotos[indice];
      const extension = mimeType === "image/png" ? "png" : "jpg";
      const ruta = `${user.id}/${turnoId}/${marcaTiempo}-${indice}.${extension}`;

      const respuesta = await fetch(uri);
      const arrayBuffer = await respuesta.arrayBuffer();
      const { error } = await supabase.storage
        .from("fotos-danios")
        .upload(ruta, arrayBuffer, { contentType: mimeType || "image/jpeg" });
      if (error) return { error, rutas };

      rutas.push(ruta);
    }

    const filas = rutas.map((ruta) => ({ turno_id: turnoId, storage_path: ruta }));
    const { error: errorInsert } = await supabase.from("turno_fotos_danio").insert(filas);
    return { error: errorInsert ?? null, rutas };
  }

  // Daños, empleados asignados y fotos se escriben UNA SOLA VEZ, acá: no
  // existe ninguna pantalla que edite un turno ya guardado, así que a
  // diferencia de servicio_receta_items no hace falta reconciliar
  // (upsert+delete) — son inserts puros (y, para las fotos, además la
  // subida a Storage).
  //
  // Si el insert de turnos confirma pero cualquiera de los tres falla
  // después, se borra el turno recién creado antes de relanzar el error —
  // sin este `DELETE` de compensación, un reintento del usuario (que ve el
  // error y vuelve a guardar) crearía un turno duplicado además del
  // huérfano que hubiera quedado en Supabase.
  async function agregarTurno(datosTurno) {
    const camposDb = turnoACamposDb(datosTurno);
    const { data, error } = await supabase
      .from("turnos")
      .insert({ taller_id: user.id, ...camposDb })
      .select(COLUMNAS_TURNO)
      .single();
    if (error) throw error;

    const filasDanios = Object.entries(datosTurno.danios ?? {}).map(([zonaId, { tipos, nota }]) => ({
      turno_id: data.id,
      zona_id: zonaId,
      tipos,
      nota: nota || null,
    }));
    const filasEmpleados = (datosTurno.empleadosAsignados ?? []).map((e) => ({
      turno_id: data.id,
      empleado_id: e.empleadoId,
      nombre_empleado: e.nombreEmpleado,
    }));
    // Plan de paneles PPF (solo si el servicio elegido es PPF, ver
    // SeleccionPanelesPpfStep.js) — se escribe una sola vez acá, igual que
    // danios/empleados; turno_ppf_paneles (el snapshot con m² congelado)
    // recién se inserta al pasar el trabajo a "Finalizado", ver
    // actualizarEstadoTrabajo más abajo.
    const filasPpfSeleccion = (datosTurno.panelesElegidos ?? []).map((panelId) => ({
      turno_id: data.id,
      panel_id: panelId,
    }));
    // Espesor de pintura (µm), 100% opcional — ver MedicionMicronesModal.js.
    // Se escribe una sola vez acá, igual que danios/empleados/ppfSeleccion:
    // a diferencia de turno_receta_aplicada/turno_ppf_paneles, este valor no
    // se recalcula ni se congela después, lo tipea el taller directo al
    // cargar el check-in.
    const filasMicrones = filasMedicionMicrones(data.id, datosTurno.medicionMicrones);

    const [resultadoDanios, resultadoEmpleados, resultadoFotos, resultadoPpfSeleccion, resultadoMicrones] =
      await Promise.all([
        filasDanios.length > 0
          ? supabase.from("turno_danios").insert(filasDanios)
          : Promise.resolve({ error: null }),
        filasEmpleados.length > 0
          ? supabase.from("turno_empleados").insert(filasEmpleados)
          : Promise.resolve({ error: null }),
        subirFotosDano(data.id, datosTurno.fotosDano),
        filasPpfSeleccion.length > 0
          ? supabase.from("turno_ppf_seleccion").insert(filasPpfSeleccion)
          : Promise.resolve({ error: null }),
        filasMicrones.length > 0
          ? supabase.from("turno_medicion_micrones").insert(filasMicrones)
          : Promise.resolve({ error: null }),
      ]);
    const errorHijos =
      resultadoDanios.error ??
      resultadoEmpleados.error ??
      resultadoFotos.error ??
      resultadoPpfSeleccion.error ??
      resultadoMicrones.error;
    if (errorHijos) {
      await supabase.from("turnos").delete().eq("id", data.id);
      throw errorHijos;
    }

    // fotosDano se normaliza a las rutas de Storage ya subidas (misma forma
    // que devolvería un fetch después, ver filaATurno) en vez de los
    // objetos { uri, mimeType } locales del picker.
    const nuevoTurno = {
      ...filaATurno(data),
      empleadosAsignados: datosTurno.empleadosAsignados ?? [],
      danios: datosTurno.danios ?? {},
      fotosDano: resultadoFotos.rutas,
      panelesPpf: datosTurno.panelesElegidos ?? [],
      panelesPpfAplicados: null,
      medicionMicrones: filasMicrones.length > 0 ? datosTurno.medicionMicrones : null,
    };
    setTurnos((actuales) => [...actuales, nuevoTurno]);
    return nuevoTurno;
  }

  async function actualizarTurno(id, cambios) {
    const camposDb = turnoACamposDb(cambios);
    const { error } = await supabase.from("turnos").update(camposDb).eq("id", id);
    if (error) throw error;

    setTurnos((actuales) => actuales.map((t) => (t.id === id ? { ...t, ...cambios } : t)));
  }

  // Al pasar un trabajo a "Finalizado" por primera vez: descuenta stock
  // según la receta ACTUAL del servicio (DataContext, ya migrado), inserta
  // el snapshot congelado en turno_receta_aplicada, calcula y congela el m²
  // real de PPF en turno_ppf_paneles (si el trabajo tenía paneles elegidos,
  // ver turno_ppf_seleccion/SeleccionPanelesPpfStep.js), y recién si todo
  // eso confirma actualiza el estado del turno — en ese orden, sin
  // transacción real envolviendo los pasos (mismo criterio que
  // descontarInsumos/editarServicio). Los guards `!turno.recetaAplicada` /
  // `!turno.panelesPpfAplicados` evitan repetir cualquiera de los dos
  // snapshots si el trabajo se vuelve a mover a Finalizado tras pasar por
  // otro estado — a propósito no se repone stock ni se recalcula PPF si se
  // revierte hacia atrás.
  async function actualizarEstadoTrabajo(id, nuevoEstado) {
    const turno = getTurnoById(id);
    let recetaAplicadaNueva = null;
    let panelesPpfAplicadosNuevo = null;

    if (nuevoEstado === "Finalizado" && turno) {
      if (!turno.recetaAplicada && turno.servicioId) {
        const servicio = getServicioById(turno.servicioId);
        if (servicio?.receta?.length) {
          await descontarInsumos(servicio.receta);

          // Una línea "libre" (sin ficha en Mis Insumos, ver
          // RecetaServicioStep.js) se congela con su nombre y costo estimado
          // tal como se cargaron, en vez de resolverla contra DataContext.
          const filasReceta = servicio.receta.map((linea) => {
            if (linea.libre) {
              return {
                turno_id: id,
                insumo_id: null,
                nombre_insumo: linea.nombre,
                unidad: null,
                costo_estimado: linea.costoEstimado,
              };
            }
            const insumo = getInsumoById(linea.insumoId);
            // null si el insumo fue borrado o no tiene precio_compra/capacidadTotal
            // cargados: no hay con qué calcular el costo real, se deja sin dato en
            // vez de inventar un valor (ver alter_turno_receta_costo_unitario_snapshot.sql).
            const costoUnitarioSnapshot =
              insumo?.precioCompra != null && insumo?.capacidadTotal > 0
                ? insumo.precioCompra * (linea.cantidad / insumo.capacidadTotal)
                : null;
            return {
              turno_id: id,
              insumo_id: linea.insumoId,
              nombre_insumo: insumo?.nombre ?? "Insumo eliminado",
              unidad: insumo?.capacidadUnidad ?? null,
              cantidad: linea.cantidad,
              costo_unitario_snapshot: costoUnitarioSnapshot,
            };
          });
          const { error: errorReceta } = await supabase.from("turno_receta_aplicada").insert(filasReceta);
          if (errorReceta) throw errorReceta;

          recetaAplicadaNueva = filasReceta.map((fila) =>
            fila.insumo_id
              ? {
                  insumoId: fila.insumo_id,
                  nombreInsumo: fila.nombre_insumo,
                  unidad: fila.unidad,
                  cantidad: fila.cantidad,
                  costoUnitarioSnapshot: fila.costo_unitario_snapshot,
                }
              : { libre: true, nombreInsumo: fila.nombre_insumo, costoEstimado: fila.costo_estimado }
          );
        }
      }

      // m² recalculado contra la matriz VIGENTE en este momento (data/
      // ppfPanelMatrix.js), no contra la que estaba cargada cuando se armó
      // el turno — mismo criterio que costoUnitarioSnapshot de arriba,
      // recalculado contra el precio_compra vigente al finalizar.
      if (!turno.panelesPpfAplicados && turno.panelesPpf?.length > 0) {
        const clavePpf = obtenerClavePpf({
          tipoVehiculo: turno.tipoVehiculo,
          grupo: turno.grupoVehiculo,
          subdivision: turno.subdivisionVehiculo,
        });
        const paneles = clavePpf ? obtenerPanelesPpf(clavePpf.tipoVehiculo, clavePpf.subdivision) : null;
        if (paneles) {
          const filasPpf = turno.panelesPpf
            .map((panelId) => {
              const panel = paneles[panelId];
              // Panel elegido en su momento que ya no existe en la matriz
              // vigente (ej. se renombró/sacó un panel) — se ignora en vez
              // de romper el resto del snapshot.
              if (!panel) return null;
              return { turno_id: id, panel_id: panelId, vista: panelId.split("__")[0], m2: panel.m2ConMerma };
            })
            .filter(Boolean);
          if (filasPpf.length > 0) {
            const { error: errorPpf } = await supabase.from("turno_ppf_paneles").insert(filasPpf);
            if (errorPpf) throw errorPpf;
            panelesPpfAplicadosNuevo = filasPpf.map((fila) => fila.panel_id);
          }
        }
      }
    }

    const { error: errorEstado } = await supabase.from("turnos").update({ estado: nuevoEstado }).eq("id", id);
    if (errorEstado) throw errorEstado;

    setTurnos((actuales) =>
      actuales.map((t) =>
        t.id === id
          ? {
              ...t,
              estado: nuevoEstado,
              ...(recetaAplicadaNueva ? { recetaAplicada: recetaAplicadaNueva } : {}),
              ...(panelesPpfAplicadosNuevo ? { panelesPpfAplicados: panelesPpfAplicadosNuevo } : {}),
            }
          : t
      )
    );
  }

  async function eliminarTurno(id) {
    const { error } = await supabase.from("turnos").delete().eq("id", id);
    if (error) throw error;

    setTurnos((actuales) => actuales.filter((t) => t.id !== id));
  }

  function getTurnoById(id) {
    return turnos.find((t) => t.id === id);
  }

  const value = useMemo(
    () => ({
      turnos,
      cargandoTurnos,
      errorCargaTurnos,
      recargarTurnos,
      agregarTurno,
      actualizarTurno,
      actualizarEstadoTrabajo,
      eliminarTurno,
      getTurnoById,
    }),
    [turnos, cargandoTurnos, errorCargaTurnos]
  );

  return <TurnoContext.Provider value={value}>{children}</TurnoContext.Provider>;
}

export function useTurnos() {
  const contexto = useContext(TurnoContext);
  if (!contexto) {
    throw new Error("useTurnos debe usarse dentro de <TurnoProvider>");
  }
  return contexto;
}
