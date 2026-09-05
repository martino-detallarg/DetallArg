// "Exportar mis datos" (ver MiTallerScreen.js): arma un .zip con un CSV por
// tabla a partir de los arrays ya cargados en memoria por los contextos
// existentes (no dispara ningún fetch nuevo) y lo comparte con el mismo
// mecanismo que los PDFs de Catálogo/Finanzas (expo-sharing).
//
// Los nombres de columna de cada CSV son los que usa la app en camelCase
// (no el snake_case de Supabase) — es para que el taller lo pueda leer o
// abrir en una planilla, no pensado para reimportarlo tal cual.
import JSZip from "jszip";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { formatearFechaDDMMAAAA } from "./fecha";

function filaACsv(valor) {
  const texto = String(valor ?? "");
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function construirCsv(filas, columnas) {
  const encabezado = columnas.map((c) => c.etiqueta).join(",");
  const lineas = filas.map((fila) => columnas.map((c) => filaACsv(fila[c.clave])).join(","));
  return [encabezado, ...lineas].join("\n");
}

const COLUMNAS_CLIENTE = [
  { clave: "id", etiqueta: "id" },
  { clave: "nombre", etiqueta: "nombre" },
  { clave: "telefono", etiqueta: "telefono" },
];

const COLUMNAS_VEHICULO = [
  { clave: "id", etiqueta: "id" },
  { clave: "clienteId", etiqueta: "clienteId" },
  { clave: "marca", etiqueta: "marca" },
  { clave: "modelo", etiqueta: "modelo" },
  { clave: "anio", etiqueta: "anio" },
  { clave: "patente", etiqueta: "patente" },
  { clave: "color", etiqueta: "color" },
];

const COLUMNAS_TURNO = [
  { clave: "id", etiqueta: "id" },
  { clave: "clienteId", etiqueta: "clienteId" },
  { clave: "autoId", etiqueta: "autoId" },
  { clave: "servicio", etiqueta: "servicio" },
  { clave: "servicioId", etiqueta: "servicioId" },
  { clave: "precio", etiqueta: "precio" },
  { clave: "fecha", etiqueta: "fecha" },
  { clave: "hora", etiqueta: "hora" },
  { clave: "tiempoEstimado", etiqueta: "tiempoEstimado" },
  { clave: "observaciones", etiqueta: "observaciones" },
  { clave: "estado", etiqueta: "estado" },
  { clave: "tipoVehiculo", etiqueta: "tipoVehiculo" },
  { clave: "grupoVehiculo", etiqueta: "grupoVehiculo" },
  { clave: "subdivisionVehiculo", etiqueta: "subdivisionVehiculo" },
  { clave: "kilometraje", etiqueta: "kilometraje" },
  { clave: "nivelNafta", etiqueta: "nivelNafta" },
];

const COLUMNAS_SERVICIO = [
  { clave: "id", etiqueta: "id" },
  { clave: "nombre", etiqueta: "nombre" },
  { clave: "descripcion", etiqueta: "descripcion" },
  { clave: "precio", etiqueta: "precio" },
  { clave: "duracionValor", etiqueta: "duracionValor" },
  { clave: "duracionUnidad", etiqueta: "duracionUnidad" },
];

const COLUMNAS_INSUMO = [
  { clave: "id", etiqueta: "id" },
  { clave: "marca", etiqueta: "marca" },
  { clave: "nombre", etiqueta: "nombre" },
  { clave: "categoria", etiqueta: "categoria" },
  { clave: "rendimiento", etiqueta: "rendimiento" },
  { clave: "precioCompra", etiqueta: "precioCompra" },
  { clave: "capacidadTotal", etiqueta: "capacidadTotal" },
  { clave: "capacidadUnidad", etiqueta: "capacidadUnidad" },
  { clave: "cantidadActual", etiqueta: "cantidadActual" },
  { clave: "nivel", etiqueta: "nivel" },
  { clave: "esPersonalizado", etiqueta: "esPersonalizado" },
];

const COLUMNAS_COBRO = [
  { clave: "id", etiqueta: "id" },
  { clave: "turnoId", etiqueta: "turnoId" },
  { clave: "monto", etiqueta: "monto" },
  { clave: "fecha", etiqueta: "fecha" },
  { clave: "formaPago", etiqueta: "formaPago" },
  { clave: "facturado", etiqueta: "facturado" },
];

const COLUMNAS_GASTO_VARIABLE = [
  { clave: "id", etiqueta: "id" },
  { clave: "monto", etiqueta: "monto" },
  { clave: "categoria", etiqueta: "categoria" },
  { clave: "fecha", etiqueta: "fecha" },
  { clave: "descripcion", etiqueta: "descripcion" },
  { clave: "facturado", etiqueta: "facturado" },
  { clave: "comprobantePath", etiqueta: "comprobantePath" },
];

const COLUMNAS_COSTO_FIJO = [
  { clave: "id", etiqueta: "id" },
  { clave: "nombre", etiqueta: "nombre" },
  { clave: "monto", etiqueta: "monto" },
];

function csvClientes(clientes) {
  return construirCsv(clientes, COLUMNAS_CLIENTE);
}

// Recorre cliente.vehiculos de cada cliente y agrega clienteId: cliente.id a
// cada fila — los vehículos no viven en un array propio en ningún contexto,
// solo anidados dentro de cada cliente (ver ClienteContext.js).
function csvVehiculos(clientes) {
  const filas = clientes.flatMap((cliente) =>
    cliente.vehiculos.map((vehiculo) => ({ ...vehiculo, clienteId: cliente.id }))
  );
  return construirCsv(filas, COLUMNAS_VEHICULO);
}

function csvTurnos(turnos) {
  return construirCsv(turnos, COLUMNAS_TURNO);
}

function csvServicios(servicios) {
  return construirCsv(servicios, COLUMNAS_SERVICIO);
}

function csvInsumos(insumos) {
  return construirCsv(insumos, COLUMNAS_INSUMO);
}

function csvCobros(cobros) {
  return construirCsv(cobros, COLUMNAS_COBRO);
}

function csvGastosVariables(gastosVariables) {
  return construirCsv(gastosVariables, COLUMNAS_GASTO_VARIABLE);
}

function csvCostosFijos(costosFijos) {
  return construirCsv(costosFijos, COLUMNAS_COSTO_FIJO);
}

// Arma el .zip con los 8 CSV y lo comparte. Recibe ya los arrays cargados de
// cada contexto (clientes, turnos, servicios, misInsumos, costosFijos,
// cobros, gastosVariables) — no dispara ningún fetch nuevo, usa lo que ya
// está en memoria.
export async function generarYCompartirBackup(nombreTaller, datos) {
  const { clientes, turnos, servicios, insumos, costosFijos, cobros, gastosVariables } = datos;

  const zip = new JSZip();
  zip.file("clientes.csv", csvClientes(clientes));
  zip.file("vehiculos.csv", csvVehiculos(clientes));
  zip.file("turnos.csv", csvTurnos(turnos));
  zip.file("servicios.csv", csvServicios(servicios));
  zip.file("insumos.csv", csvInsumos(insumos));
  zip.file("cobros.csv", csvCobros(cobros));
  zip.file("gastosVariables.csv", csvGastosVariables(gastosVariables));
  zip.file("costosFijos.csv", csvCostosFijos(costosFijos));

  const base64Zip = await zip.generateAsync({ type: "base64" });

  const fecha = formatearFechaDDMMAAAA(new Date()).replace(/\//g, "-");
  const nombreArchivo = `${nombreTaller} - Backup ${fecha}.zip`;
  const nombreSeguro = nombreArchivo.replace(/[\\/:*?"<>|]/g, "-");

  const archivo = new File(Paths.cache, nombreSeguro);
  archivo.create({ overwrite: true });
  archivo.write(base64Zip, { encoding: "base64" });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(archivo.uri, { mimeType: "application/zip" });
  }
}
