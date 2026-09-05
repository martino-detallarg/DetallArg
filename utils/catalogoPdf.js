// Generación de PDFs de Catálogo: dos armadores de HTML (ficha individual y
// catálogo completo). El paso final de "generar y compartir" y el escapado
// de HTML viven en utils/pdf.js, compartidos con utils/finanzasPdf.js.
import { formatearDuracion } from "./formato";
import { escapeHtml } from "./pdf";

export { generarYCompartirPdf } from "./pdf";

// <link> a Google Fonts por CDN (plan A, más simple que embeber el archivo
// de fuente en base64). Si en la práctica con expo-print/Expo Go no carga
// bien (timing o sin conexión al generar), el plan B es @font-face con la
// fuente embebida en base64 — no implementado todavía, ver aviso a Augusto.
function bloqueFuentes(plantilla) {
  return plantilla.googleFontsHref ? `<link rel="stylesheet" href="${plantilla.googleFontsHref}" />` : "";
}

function formatearPrecioCatalogo(precio, monedaCobro) {
  const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(precio ?? 0);
  return `${monedaCobro ?? "ARS $"} ${numero}`;
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
    .portada img.portada-foto {
      width: 100%;
      height: 320px;
      border-radius: 16px;
      margin-bottom: 32px;
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
  // Fallback al nombre por si el taller todavía no cargó descripción para
  // este servicio (el campo es opcional en la base).
  const descripcion = servicio.descripcion || servicio.nombre;

  return `
    ${bloqueHeader(taller, plantilla)}
    <h1 class="titulo-servicio">${escapeHtml(servicio.nombre)}</h1>
    <div class="badges">
      <span class="badge badge-precio">${formatearPrecioCatalogo(servicio.precio, datosOperativos?.monedaCobro)}</span>
      <span class="badge badge-duracion">${escapeHtml(formatearDuracion(servicio.duracionValor, servicio.duracionUnidad))}</span>
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
        ${bloqueFuentes(plantilla)}
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
// `personalizacion` ({ fotoPortada, textoLibre1, textoLibre2 }) viene del
// Editor de Catálogo (ver CatalogoContext.js/EditorCatalogoScreen.js) — solo
// se usa en la portada, las fichas individuales no la reciben porque no
// tienen portada. `itemsCatalogo` debe llegar ya filtrado por
// serviciosOcultos y ordenado por ordenServicios (lo hace CatalogoScreen.js
// antes de llamar a esta función, no responsabilidad de este archivo).
export function construirHtmlCatalogoCompleto(
  itemsCatalogo,
  servicios,
  taller,
  datosOperativos,
  plantilla,
  personalizacion
) {
  const { fotoPortada, textoLibre1, textoLibre2 } = personalizacion ?? {};
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
        <td>${escapeHtml(formatearDuracion(servicio.duracionValor, servicio.duracionUnidad))}</td>
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
        ${bloqueFuentes(plantilla)}
        <style>${estilosBase(plantilla)}</style>
      </head>
      <body>
        <div class="pagina portada">
          ${fotoPortada ? `<img class="portada-foto" src="${fotoPortada}" />` : ""}
          ${taller?.logoTaller ? `<img src="${taller.logoTaller}" />` : ""}
          <div class="portada-nombre">${escapeHtml(taller?.nombreTaller)}</div>
          <div class="portada-info">
            ${textoLibre1 ? `<div>${escapeHtml(textoLibre1)}</div>` : ""}
            ${taller?.misDatos?.ubicacion ? `<div>${escapeHtml(taller.misDatos.ubicacion)}</div>` : ""}
            ${contacto ? `<div>${contacto}</div>` : ""}
            ${datosOperativos?.formaTrabajo ? `<div>Forma de trabajo: ${escapeHtml(datosOperativos.formaTrabajo)}</div>` : ""}
            ${textoLibre2 ? `<div>${escapeHtml(textoLibre2)}</div>` : ""}
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
