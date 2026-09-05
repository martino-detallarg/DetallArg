// Generación del PDF de la Calculadora de Presupuesto — mismo patrón que
// utils/finanzasPdf.js/utils/conformidadPdf.js: plantilla clara fija (no la
// oscura de la app), pensada para mandarse a un cliente potencial. A
// propósito NO incluye costo de insumos ni margen — eso es solo para la
// pantalla, ver screens/PresupuestoScreen.js.
import { formatearPesos } from "./formato";
import { escapeHtml, generarYCompartirPdf } from "./pdf";

export { generarYCompartirPdf };

const COLOR_PRIMARIO = "#16232A";
const COLOR_TEXTO_SECUNDARIO = "#5B6B72";
const COLOR_ACENTO = "#3178A6";
const COLOR_BORDE = "#DDE3E6";
const COLOR_AMBER = "#D9A441";

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
      margin: 0 0 4px 0;
    }
    .fecha {
      font-size: 12px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      margin-bottom: 20px;
    }
    .dato-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      margin-bottom: 3px;
    }
    .dato-valor {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th, td {
      text-align: left;
      padding: 10px 6px;
      border-bottom: 1px solid ${COLOR_BORDE};
      font-size: 13px;
    }
    th {
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-size: 10px;
      color: ${COLOR_TEXTO_SECUNDARIO};
    }
    td.numero, th.numero {
      text-align: right;
    }
    .totales {
      margin-left: auto;
      width: 260px;
    }
    .totales-fila {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 6px 0;
    }
    .totales-fila.descuento {
      color: ${COLOR_ACENTO};
    }
    .totales-fila.recargo {
      color: ${COLOR_AMBER};
    }
    .totales-fila.final {
      border-top: 2px solid ${COLOR_PRIMARIO};
      margin-top: 6px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid ${COLOR_BORDE};
      font-size: 11px;
      line-height: 1.7;
      color: ${COLOR_TEXTO_SECUNDARIO};
    }
  `;
}

function bloqueHeader(taller) {
  return `
    <div class="header">
      ${taller?.logoTaller ? `<img src="${taller.logoTaller}" />` : ""}
      <div>
        <div class="header-nombre">${escapeHtml(taller?.nombreTaller)}</div>
        <div class="header-subtitulo">Presupuesto</div>
      </div>
    </div>
  `;
}

function bloqueCliente(descripcionCliente) {
  if (!descripcionCliente) return "";
  return `
    <div class="dato-label">Cliente / vehículo</div>
    <div class="dato-valor">${escapeHtml(descripcionCliente)}</div>
  `;
}

function bloqueServicios(servicios) {
  const filas = servicios
    .map(
      (s) => `
      <tr>
        <td>${escapeHtml(s.nombre)}</td>
        <td class="numero">${formatearPesos(s.precio)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <table>
      <thead>
        <tr><th>Servicio</th><th class="numero">Precio</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

function bloqueTotales({ totalServicios, recargo, descuento, precioFinal }) {
  const filaRecargo = recargo
    ? `
      <div class="totales-fila recargo">
        <span>Recargo (${recargo.valor}%)</span>
        <span>+${formatearPesos(recargo.monto)}</span>
      </div>
    `
    : "";

  const filaDescuento = descuento
    ? `
      <div class="totales-fila descuento">
        <span>Descuento (${descuento.tipo === "porcentaje" ? `${descuento.valor}%` : "monto fijo"})</span>
        <span>-${formatearPesos(descuento.monto)}</span>
      </div>
    `
    : "";

  return `
    <div class="totales">
      <div class="totales-fila">
        <span>Subtotal</span>
        <span>${formatearPesos(totalServicios)}</span>
      </div>
      ${filaRecargo}
      ${filaDescuento}
      <div class="totales-fila final">
        <span>Total</span>
        <span>${formatearPesos(precioFinal)}</span>
      </div>
    </div>
  `;
}

function bloqueFooter(taller) {
  const contacto = [taller?.misDatos?.correo, taller?.misDatos?.telefono].filter(Boolean).map(escapeHtml).join(" · ");
  return `
    <div class="footer">
      ${taller?.misDatos?.ubicacion ? `<div>${escapeHtml(taller.misDatos.ubicacion)}</div>` : ""}
      ${contacto ? `<div>${contacto}</div>` : ""}
    </div>
  `;
}

// HTML de una página con el presupuesto — pensado para mandarse a un
// cliente potencial. A propósito no recibe costo de insumos ni margen: esos
// datos son solo para la pantalla (uso interno del taller), nunca para este
// documento. `descripcionCliente` es texto libre (no un Cliente real, ver
// screens/PresupuestoScreen.js) y se omite del todo si no se cargó.
// `recargo` es `{ valor, monto }` (siempre %, ver PresupuestoScreen.js) o
// `null` si no se aplicó ninguno. `descuento` es `{ tipo: "monto" |
// "porcentaje", valor, monto }` o `null` si no se aplicó ninguno.
export function construirHtmlPresupuesto({
  taller,
  descripcionCliente,
  servicios,
  totalServicios,
  recargo,
  descuento,
  precioFinal,
}) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${estilos()}</style>
      </head>
      <body>
        <div class="pagina">
          ${bloqueHeader(taller)}
          <h1>Presupuesto</h1>
          <div class="fecha">${new Date().toLocaleDateString("es-AR")}</div>

          ${bloqueCliente(descripcionCliente)}
          ${bloqueServicios(servicios)}
          ${bloqueTotales({ totalServicios, recargo, descuento, precioFinal })}
          ${bloqueFooter(taller)}
        </div>
      </body>
    </html>
  `;
}
