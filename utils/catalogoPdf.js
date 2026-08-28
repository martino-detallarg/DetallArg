// Generación de PDFs de Catálogo: dos armadores de HTML (ficha individual y
// catálogo completo) más el paso final de "generar y compartir" el PDF.
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

// TODO: cuando Nico confirme el esquema nuevo de servicios (duracionValor +
// duracionUnidad en vez de duracionEstimada en minutos), reemplazar esta
// conversión por el valor+unidad que venga directo de la base.
export function formatearDuracion(servicio) {
  const minutos = servicio.duracionEstimada;
  if (minutos === null || minutos === undefined) return "";
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

function formatearPrecioCatalogo(precio, monedaCobro) {
  const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(precio ?? 0);
  return `${monedaCobro ?? "ARS $"} ${numero}`;
}

// Escapa texto libre (nombre del taller, ubicación, etc.) antes de
// insertarlo en el HTML, para que un "&" o "<" cargado a mano no rompa el
// documento.
function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Reúne los medios de contacto cargados en Mis Datos (correo/teléfono/web),
// solo los que existan, separados por "·".
function medioDeContacto(misDatos) {
  return [misDatos?.correo, misDatos?.telefono, misDatos?.web]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" &nbsp;·&nbsp; ");
}

function estilosBase(plantilla) {
  return `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${plantilla.colorFondo};
      color: ${plantilla.colorTexto};
      font-family: ${plantilla.fontCuerpo};
    }
    .pagina {
      padding: 48px 40px;
      min-height: 100vh;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 36px;
      padding-bottom: 18px;
      border-bottom: 1px solid ${plantilla.colorAcento}55;
    }
    .header img {
      width: 52px;
      height: 52px;
      border-radius: 26px;
      object-fit: cover;
    }
    .header-nombre {
      font-family: ${plantilla.fontTitulo};
      font-size: 20px;
      font-weight: bold;
      color: ${plantilla.colorPrimario};
    }
    .titulo-servicio {
      font-family: ${plantilla.fontTitulo};
      font-size: 34px;
      font-weight: bold;
      color: ${plantilla.colorPrimario};
      margin: 0 0 18px 0;
    }
    .badges {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: bold;
    }
    .badge-precio {
      background: ${plantilla.colorAcento};
      color: ${plantilla.colorFondo};
    }
    .badge-duracion {
      background: transparent;
      border: 1px solid ${plantilla.colorAcento};
      color: ${plantilla.colorPrimario};
    }
    .descripcion {
      font-size: 15px;
      line-height: 1.6;
      color: ${plantilla.colorTextoSecundario};
      margin-bottom: 28px;
    }
    .galeria {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 28px;
    }
    .galeria-par {
      display: flex;
      gap: 12px;
    }
    .galeria-columna {
      flex: 1;
      text-align: center;
    }
    .galeria-columna img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 10px;
    }
    .galeria-etiqueta {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${plantilla.colorTextoSecundario};
      margin-top: 6px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid ${plantilla.colorAcento}55;
      font-size: 12px;
      line-height: 1.8;
      color: ${plantilla.colorTextoSecundario};
    }
    .salto-pagina {
      page-break-before: always;
    }
    .portada {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .portada img {
      width: 140px;
      height: 140px;
      border-radius: 70px;
      object-fit: cover;
      margin-bottom: 24px;
    }
    .portada-nombre {
      font-family: ${plantilla.fontTitulo};
      font-size: 38px;
      font-weight: bold;
      color: ${plantilla.colorPrimario};
      margin-bottom: 14px;
    }
    .portada-info {
      font-size: 14px;
      line-height: 1.9;
      color: ${plantilla.colorTextoSecundario};
    }
    table.indice {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    table.indice th, table.indice td {
      text-align: left;
      padding: 10px 8px;
      border-bottom: 1px solid ${plantilla.colorAcento}33;
      font-size: 13px;
    }
    table.indice th {
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 11px;
      color: ${plantilla.colorTextoSecundario};
    }
  `;
}

function bloqueHeader(taller, plantilla) {
  return `
    <div class="header">
      ${taller?.logoTaller ? `<img src="${taller.logoTaller}" />` : ""}
      <div class="header-nombre">${escapeHtml(taller?.nombreTaller)}</div>
    </div>
  `;
}

function bloqueGaleria(fotos) {
  if (!fotos || fotos.length === 0) return "";
  return `
    <div class="galeria">
      ${fotos
        .map(
          (par) => `
        <div class="galeria-par">
          ${
            par.antes
              ? `<div class="galeria-columna"><img src="${par.antes}" /><div class="galeria-etiqueta">Antes</div></div>`
              : ""
          }
          ${
            par.despues
              ? `<div class="galeria-columna"><img src="${par.despues}" /><div class="galeria-etiqueta">Después</div></div>`
              : ""
          }
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function bloqueFooter(taller, datosOperativos) {
  const contacto = medioDeContacto(taller?.misDatos);
  return `
    <div class="footer">
      ${taller?.misDatos?.ubicacion ? `<div>${escapeHtml(taller.misDatos.ubicacion)}</div>` : ""}
      ${contacto ? `<div>${contacto}</div>` : ""}
      ${datosOperativos?.formaTrabajo ? `<div>Forma de trabajo: ${escapeHtml(datosOperativos.formaTrabajo)}</div>` : ""}
      <div>Moneda de cobro: ${escapeHtml(datosOperativos?.monedaCobro ?? "ARS $")}</div>
    </div>
  `;
}

// Contenido de un servicio (header + título + badges + descripción +
// galería + footer), reusado tanto por la ficha individual como por cada
// sección del catálogo completo.
function bloqueContenidoServicio(servicio, taller, datosOperativos, plantilla, fotos) {
  // TODO: reemplazar por servicio.descripcion cuando el esquema nuevo de
  // servicios lo tenga disponible (hoy no existe ese campo, se usa el
  // nombre como fallback).
  const descripcion = servicio.descripcion ?? servicio.nombre;

  return `
    ${bloqueHeader(taller, plantilla)}
    <h1 class="titulo-servicio">${escapeHtml(servicio.nombre)}</h1>
    <div class="badges">
      <span class="badge badge-precio">${formatearPrecioCatalogo(servicio.precio, datosOperativos?.monedaCobro)}</span>
      <span class="badge badge-duracion">${escapeHtml(formatearDuracion(servicio))}</span>
    </div>
    <div class="descripcion">${escapeHtml(descripcion)}</div>
    ${bloqueGaleria(fotos)}
    ${bloqueFooter(taller, datosOperativos)}
  `;
}

// HTML de una página para la ficha de un solo servicio.
export function construirHtmlFicha(servicio, taller, datosOperativos, plantilla, fotos) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${estilosBase(plantilla)}</style>
      </head>
      <body>
        <div class="pagina">
          ${bloqueContenidoServicio(servicio, taller, datosOperativos, plantilla, fotos)}
        </div>
      </body>
    </html>
  `;
}

// HTML multi-página: portada, índice, y una sección por servicio.
export function construirHtmlCatalogoCompleto(itemsCatalogo, servicios, taller, datosOperativos, plantilla) {
  const contacto = medioDeContacto(taller?.misDatos);

  const itemsConServicio = itemsCatalogo
    .map((item) => ({ item, servicio: servicios.find((s) => s.id === item.servicioId) }))
    .filter(({ servicio }) => !!servicio);

  const filasIndice = itemsConServicio
    .map(
      ({ servicio }) => `
      <tr>
        <td>${escapeHtml(servicio.nombre)}</td>
        <td>${formatearPrecioCatalogo(servicio.precio, datosOperativos?.monedaCobro)}</td>
        <td>${escapeHtml(formatearDuracion(servicio))}</td>
      </tr>
    `
    )
    .join("");

  const secciones = itemsConServicio
    .map(
      ({ item, servicio }) => `
      <div class="pagina salto-pagina">
        ${bloqueContenidoServicio(servicio, taller, datosOperativos, plantilla, item.fotos)}
      </div>
    `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${estilosBase(plantilla)}</style>
      </head>
      <body>
        <div class="pagina portada">
          ${taller?.logoTaller ? `<img src="${taller.logoTaller}" />` : ""}
          <div class="portada-nombre">${escapeHtml(taller?.nombreTaller)}</div>
          <div class="portada-info">
            ${taller?.misDatos?.ubicacion ? `<div>${escapeHtml(taller.misDatos.ubicacion)}</div>` : ""}
            ${contacto ? `<div>${contacto}</div>` : ""}
            ${datosOperativos?.formaTrabajo ? `<div>Forma de trabajo: ${escapeHtml(datosOperativos.formaTrabajo)}</div>` : ""}
          </div>
        </div>

        <div class="pagina salto-pagina">
          <h1 class="titulo-servicio">Servicios</h1>
          <table class="indice">
            <thead>
              <tr><th>Servicio</th><th>Precio</th><th>Duración</th></tr>
            </thead>
            <tbody>
              ${filasIndice}
            </tbody>
          </table>
        </div>

        ${secciones}
      </body>
    </html>
  `;
}

// Mismo patrón de "generar y compartir" usado en el resto de la app:
// Print.printToFileAsync + Sharing.shareAsync. El PDF generado por
// expo-print vive en un archivo temporal con nombre aleatorio, así que se
// copia a un archivo con `nombreArchivo` antes de compartirlo para que la
// hoja de compartir muestre un nombre legible.
export async function generarYCompartirPdf(html, nombreArchivo) {
  const { uri } = await Print.printToFileAsync({ html });

  const nombreSeguro = nombreArchivo.replace(/[\\/:*?"<>|]/g, "-");
  const archivoDestino = new File(Paths.cache, nombreSeguro);
  new File(uri).copy(archivoDestino);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(archivoDestino.uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
  }
}
