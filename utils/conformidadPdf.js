// Generación del PDF de "Consentimiento + Conformidad" (check-in de Trabajo
// Nuevo) — mismo patrón que utils/finanzasPdf.js: plantilla clara fija (no
// la plantilla oscura de la app), pensada para imprimirse o mandarse por
// WhatsApp y quedar como respaldo firmado, no para verse en pantalla.
import { formatearPesos } from "./formato";
import { TEXTO_CLAUSULA_CONFORMIDAD } from "./textoLegalConformidad";
import { escapeHtml, generarYCompartirPdf } from "./pdf";

export { generarYCompartirPdf };

const COLOR_PRIMARIO = "#16232A";
const COLOR_TEXTO_SECUNDARIO = "#5B6B72";
const COLOR_ACENTO = "#3178A6";
const COLOR_BORDE = "#DDE3E6";

function estilos() {
  return `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #FFFFFF;
      color: ${COLOR_PRIMARIO};
      font-family: -apple-system, Helvetica, Arial, sans-serif;
    }
    .pagina {
      padding: 40px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid ${COLOR_ACENTO};
    }
    .header img {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      object-fit: cover;
    }
    .header-nombre {
      font-size: 15px;
      font-weight: bold;
      color: ${COLOR_PRIMARIO};
    }
    .header-subtitulo {
      font-size: 12px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      margin-top: 2px;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 20px 0;
    }
    h2 {
      font-size: 14px;
      margin: 0 0 12px 0;
      padding-top: 10px;
      border-top: 1px solid ${COLOR_BORDE};
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: ${COLOR_TEXTO_SECUNDARIO};
    }
    .datos {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 8px;
    }
    .dato {
      min-width: 140px;
    }
    .dato-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      margin-bottom: 3px;
    }
    .dato-valor {
      font-size: 13px;
      font-weight: 600;
    }
    .servicio-fila {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid ${COLOR_BORDE};
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 8px;
    }
    .servicio-nombre {
      font-size: 14px;
      font-weight: 600;
    }
    .servicio-precio {
      font-size: 14px;
      font-weight: bold;
      color: ${COLOR_ACENTO};
    }
    .vista {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .vista-titulo {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .vista-contenido {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .vista-imagen {
      width: 240px;
      max-width: 45%;
      border: 1px solid ${COLOR_BORDE};
      border-radius: 10px;
    }
    .vista-danios {
      flex: 1;
      font-size: 12px;
    }
    .danio-zona {
      margin-bottom: 6px;
    }
    .danio-zona-nombre {
      font-weight: 600;
    }
    .danio-tipo {
      color: ${COLOR_TEXTO_SECUNDARIO};
    }
    .sin-danios, .nota {
      font-size: 12px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      font-style: italic;
    }
    .clausula {
      font-size: 12px;
      line-height: 1.7;
      color: ${COLOR_TEXTO_SECUNDARIO};
      background: #F7F9FA;
      border: 1px solid ${COLOR_BORDE};
      border-radius: 10px;
      padding: 16px;
      margin-top: 4px;
    }
    .firma-bloque {
      margin-top: 28px;
      display: flex;
      gap: 24px;
      align-items: flex-end;
    }
    .firma-imagen {
      width: 220px;
      height: 90px;
      object-fit: contain;
      border-bottom: 1px solid ${COLOR_PRIMARIO};
    }
    .firma-datos {
      font-size: 12px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      line-height: 1.6;
    }
    .firma-aclaracion {
      font-size: 13px;
      font-weight: 600;
      color: ${COLOR_PRIMARIO};
    }
  `;
}

function bloqueHeader(taller) {
  return `
    <div class="header">
      ${taller?.logoTaller ? `<img src="${taller.logoTaller}" />` : ""}
      <div>
        <div class="header-nombre">${escapeHtml(taller?.nombreTaller)}</div>
        <div class="header-subtitulo">Consentimiento y conformidad de servicio</div>
      </div>
    </div>
  `;
}

function bloqueDatos({ cliente, auto, kilometraje, fecha, hora }) {
  const vehiculoTexto = auto ? `${auto.marca ?? ""} ${auto.modelo ?? ""}`.trim() : "-";
  return `
    <h2>Datos del cliente y vehículo</h2>
    <div class="datos">
      <div class="dato">
        <div class="dato-label">Cliente</div>
        <div class="dato-valor">${escapeHtml(cliente?.nombre)}</div>
      </div>
      <div class="dato">
        <div class="dato-label">Teléfono</div>
        <div class="dato-valor">${escapeHtml(cliente?.telefono || "-")}</div>
      </div>
      <div class="dato">
        <div class="dato-label">Vehículo</div>
        <div class="dato-valor">${escapeHtml(vehiculoTexto || "-")}</div>
      </div>
      <div class="dato">
        <div class="dato-label">Patente</div>
        <div class="dato-valor">${escapeHtml(auto?.patente || "-")}</div>
      </div>
      <div class="dato">
        <div class="dato-label">Kilometraje</div>
        <div class="dato-valor">${kilometraje != null ? `${kilometraje} km` : "-"}</div>
      </div>
      <div class="dato">
        <div class="dato-label">Fecha / hora de ingreso</div>
        <div class="dato-valor">${escapeHtml(fecha || "-")} ${escapeHtml(hora || "")}</div>
      </div>
    </div>
  `;
}

function bloqueServicio(servicio) {
  return `
    <h2>Servicio a realizar</h2>
    <div class="servicio-fila">
      <div class="servicio-nombre">${escapeHtml(servicio?.tipo || "Servicio no especificado")}</div>
      ${servicio?.precio ? `<div class="servicio-precio">${formatearPesos(servicio.precio)}</div>` : ""}
    </div>
    ${servicio?.observaciones ? `<p class="nota">${escapeHtml(servicio.observaciones)}</p>` : ""}
  `;
}

function bloqueVista({ etiqueta, imagen, danios }) {
  const contenidoDanios =
    danios.length > 0
      ? danios
          .map(
            (d) => `
        <div class="danio-zona">
          <span class="danio-zona-nombre">${escapeHtml(d.zona)}:</span>
          <span class="danio-tipo">${d.tipos
            .map((t) => escapeHtml(t.nota ? `${t.etiqueta} (${t.nota})` : t.etiqueta))
            .join(", ")}</span>
        </div>
      `
          )
          .join("")
      : `<div class="sin-danios">Sin daños registrados en esta vista.</div>`;

  return `
    <div class="vista">
      <div class="vista-titulo">Vista: ${escapeHtml(etiqueta)}</div>
      <div class="vista-contenido">
        ${imagen ? `<img class="vista-imagen" src="${imagen}" />` : ""}
        <div class="vista-danios">${contenidoDanios}</div>
      </div>
    </div>
  `;
}

function bloqueInspeccion(vistas) {
  if (!vistas || vistas.length === 0) {
    return `<h2>Inspección visual</h2><p class="sin-danios">No hay un diagrama disponible para este vehículo todavía.</p>`;
  }
  return `<h2>Inspección visual</h2>${vistas.map(bloqueVista).join("")}`;
}

function bloqueClausula() {
  return `
    <h2>Cláusula de conformidad</h2>
    <div class="clausula">${escapeHtml(TEXTO_CLAUSULA_CONFORMIDAD)}</div>
  `;
}

function bloqueFirma({ imagen, aclaracion, fecha, hora }) {
  return `
    <div class="firma-bloque">
      ${imagen ? `<img class="firma-imagen" src="${imagen}" />` : ""}
      <div class="firma-datos">
        <div class="firma-aclaracion">${escapeHtml(aclaracion)}</div>
        <div>Firmado el ${escapeHtml(fecha)} a las ${escapeHtml(hora)}</div>
      </div>
    </div>
  `;
}

// HTML de una página con el consentimiento + conformidad del check-in —
// pensado para imprimirse o compartirse por WhatsApp con el cliente que
// acaba de firmar. `vistas` es [{ etiqueta, imagen (uri/base64 o null),
// danios: [{ zona, tipos: [{ etiqueta, nota }] }] }], una por vista del
// diagrama (ver utils/resumenDanios.js). `firma` es { imagen, aclaracion,
// fecha, hora }.
export function construirHtmlConformidad({ taller, cliente, auto, kilometraje, fecha, hora, servicio, vistas, firma }) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${estilos()}</style>
      </head>
      <body>
        <div class="pagina">
          ${bloqueHeader(taller)}
          <h1>Consentimiento y conformidad</h1>

          ${bloqueDatos({ cliente, auto, kilometraje, fecha, hora })}
          ${bloqueServicio(servicio)}
          ${bloqueInspeccion(vistas)}
          ${bloqueClausula()}
          ${bloqueFirma(firma)}
        </div>
      </body>
    </html>
  `;
}
