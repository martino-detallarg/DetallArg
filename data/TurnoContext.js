import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useServicios } from "./ServicioContext";
import { useData } from "./DataContext";
import { mensajeErrorCarga } from "../utils/errores";
import { convertirFechaAISO, convertirFechaDesdeISO } from "../utils/fecha";

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
  nivelNafta: "nivel_nafta",
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
  "subdivision_vehiculo, nivel_nafta, turno_receta_aplicada(insumo_id, nombre_insumo, unidad, cantidad), " +
  "turno_danios(zona_id, tipos, nota), turno_empleados(empleado_id, nombre_empleado)";

// Traduce una fila de `turnos` + sus embeds (turno_receta_aplicada,
// turno_danios, turno_empleados) a la forma que espera el resto de la app.
// `fotosDano` queda en su valor vacío por defecto: turno_fotos_danio todavía
// no se escribe ni se lee desde acá (Etapa D de la migración).
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
    nivelNafta: fila.nivel_nafta,
    empleadosAsignados: fila.turno_empleados.map((e) => ({
      empleadoId: e.empleado_id,
      nombreEmpleado: e.nombre_empleado,
    })),
    danios: Object.fromEntries(
      fila.turno_danios.map((d) => [d.zona_id, { tipos: d.tipos, nota: d.nota ?? "" }])
    ),
    fotosDano: [],
    // null (no []) cuando todavía no hay snapshot: el guard de
    // actualizarEstadoTrabajo es `!turno.recetaAplicada`, y un array vacío
    // es truthy en JS — con null el guard se comporta igual que hoy.
    recetaAplicada:
      fila.turno_receta_aplicada.length > 0
        ? fila.turno_receta_aplicada.map((linea) => ({
            insumoId: linea.insumo_id,
            nombreInsumo: linea.nombre_insumo,
            unidad: linea.unidad,
            cantidad: linea.cantidad,
          }))
        : null,
  };
}

// Migrado a Supabase (tabla `turnos` + snapshot en `turno_receta_aplicada`,
// ver supabase/schema.sql). Todas las mutaciones son `async` y escriben de
// verdad contra Supabase antes de tocar el estado local (sin actualización
// optimista, mismo criterio que el resto de los Contexts ya migrados): si
// Supabase devuelve error, se relanza (`throw`) y el estado en memoria no se
// toca — quien llama debe hacer `await` + `try/catch`.
//
// Fuera de alcance todavía (Etapa D): turno_fotos_danio. Si un turno nuevo
// trae fotos de daños, esos datos quedan solo en memoria de esta sesión —
// se pierden al recargar, igual que pasaba con todo TurnoContext antes de
// migrar.
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

  // Daños y empleados asignados se escriben UNA SOLA VEZ, acá: no existe
  // ninguna pantalla que edite un turno ya guardado, así que a diferencia de
  // servicio_receta_items no hace falta reconciliar (upsert+delete) — es un
  // insert puro.
  //
  // Si el insert de turnos confirma pero el de daños/empleados falla
  // después, se borra el turno recién creado antes de relanzar el error —
  // sin este `DELETE` de compensación, un reintento del usuario (que ve el
  // error y vuelve a guardar) crearía un turno duplicado además del
  // huérfano sin daños/empleados que hubiera quedado en Supabase.
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

    const [resultadoDanios, resultadoEmpleados] = await Promise.all([
      filasDanios.length > 0
        ? supabase.from("turno_danios").insert(filasDanios)
        : Promise.resolve({ error: null }),
      filasEmpleados.length > 0
        ? supabase.from("turno_empleados").insert(filasEmpleados)
        : Promise.resolve({ error: null }),
    ]);
    const errorHijos = resultadoDanios.error ?? resultadoEmpleados.error;
    if (errorHijos) {
      await supabase.from("turnos").delete().eq("id", data.id);
      throw errorHijos;
    }

    // fotosDano no tiene dónde persistir todavía (Etapa D) — se guarda igual
    // en el objeto local para que la sesión actual lo siga mostrando, mismo
    // criterio que cualquier Context que todavía no migró del todo.
    const nuevoTurno = {
      ...filaATurno(data),
      empleadosAsignados: datosTurno.empleadosAsignados ?? [],
      danios: datosTurno.danios ?? {},
      fotosDano: datosTurno.fotosDano ?? [],
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
  // el snapshot congelado en turno_receta_aplicada, y recién si eso confirma
  // actualiza el estado del turno — en ese orden, sin transacción real
  // envolviendo los 3 pasos (mismo criterio que descontarInsumos/
  // editarServicio). El guard `!turno.recetaAplicada` evita descontar dos
  // veces si el trabajo se vuelve a mover a Finalizado tras pasar por otro
  // estado — a propósito no se repone stock si se revierte hacia atrás.
  async function actualizarEstadoTrabajo(id, nuevoEstado) {
    const turno = getTurnoById(id);

    if (nuevoEstado === "Finalizado" && turno && !turno.recetaAplicada && turno.servicioId) {
      const servicio = getServicioById(turno.servicioId);
      if (servicio?.receta?.length) {
        await descontarInsumos(servicio.receta);

        const filasReceta = servicio.receta.map((linea) => {
          const insumo = getInsumoById(linea.insumoId);
          return {
            turno_id: id,
            insumo_id: linea.insumoId,
            nombre_insumo: insumo?.nombre ?? "Insumo eliminado",
            unidad: insumo?.capacidadUnidad ?? null,
            cantidad: linea.cantidad,
          };
        });
        const { error: errorReceta } = await supabase.from("turno_receta_aplicada").insert(filasReceta);
        if (errorReceta) throw errorReceta;

        const { error: errorEstado } = await supabase
          .from("turnos")
          .update({ estado: nuevoEstado })
          .eq("id", id);
        if (errorEstado) throw errorEstado;

        const recetaAplicada = filasReceta.map((fila) => ({
          insumoId: fila.insumo_id,
          nombreInsumo: fila.nombre_insumo,
          unidad: fila.unidad,
          cantidad: fila.cantidad,
        }));
        setTurnos((actuales) =>
          actuales.map((t) => (t.id === id ? { ...t, estado: nuevoEstado, recetaAplicada } : t))
        );
        return;
      }
    }

    await actualizarTurno(id, { estado: nuevoEstado });
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
