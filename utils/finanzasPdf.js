// Generación del PDF de "Resumen del mes" de Finanzas — mismo patrón que
// utils/catalogoPdf.js (armar HTML + generarYCompartirPdf de utils/pdf.js),
// pero con una plantilla clara fija (no la plantilla oscura de la app).
// Dos versiones del mismo documento (ver `tipo` en construirHtmlResumenFinanciero):
// "completo" (análisis interno del taller: margen por trabajo, ranking de
// servicios, desglose de costos, punto de equilibrio) y "contador" (solo
// los totales fiscales — facturación, gastos, ganancia neta — sin ninguna
// información estratégica del taller).
import { formatearPesos } from "./formato";
import { escapeHtml, generarYCompartirPdf } from "./pdf";

export { generarYCompartirPdf };

const COLOR_PRIMARIO = "#16232A";
const COLOR_TEXTO_SECUNDARIO = "#5B6B72";
const COLOR_ACENTO = "#3178A6";
const COLOR_BORDE = "#DDE3E6";
const COLOR_NEGATIVO = "#B5564A";

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
      margin-bottom: 28px;
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
      font-size: 24px;
      margin: 0 0 4px 0;
    }
    .periodo {
      font-size: 13px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      margin-bottom: 24px;
      text-transform: capitalize;
    }
    .kpis {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 28px;
    }
    .kpi {
      flex: 1;
      min-width: 150px;
      border: 1px solid ${COLOR_BORDE};
      border-radius: 10px;
      padding: 14px 16px;
    }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${COLOR_TEXTO_SECUNDARIO};
      margin-bottom: 6px;
    }
    .kpi-valor {
      font-size: 20px;
      font-weight: bold;
    }
    .kpi-valor.negativo {
      color: ${COLOR_NEGATIVO};
    }
    .equilibrio {
      font-size: 13px;
      line-height: 1.6;
      color: ${COLOR_TEXTO_SECUNDARIO};
      border: 1px solid ${COLOR_BORDE};
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 28px;
    }
    h2 {
      font-size: 15px;
      margin: 0 0 12px 0;
      padding-top: 8px;
      border-top: 1px solid ${COLOR_BORDE};
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 8px 6px;
      border-bottom: 1px solid ${COLOR_BORDE};
      font-size: 12px;
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
    .footer {
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px solid ${COLOR_BORDE};
      font-size: 11px;
      line-height: 1.7;
      color: ${COLOR_TEXTO_SECUNDARIO};
    }
  `;
}

function bloqueHeader(taller, esCompleto) {
  return `
    <div class="header">
      ${taller?.logoTaller ? `<img src="${taller.logoTaller}" />` : ""}
      <div>
        <div class="header-nombre">${escapeHtml(taller?.nombreTaller)}</div>
        <div class="header-subtitulo">${esCompleto ? "Resumen financiero mensual" : "Resumen para tu contador"}</div>
      </div>
    </div>
  `;
}

function bloqueKpis({ gananciaNetaDelMes, gananciaBrutaDelMes, totalCostosFijos, totalGastosVariablesDelMes }) {
  const negativa = gananciaNetaDelMes < 0 ? "negativo" : "";
  return `
    <div class="kpis">
      <div class="kpi">
        <div class="kpi-label">Ganancia neta del mes</div>
        <div class="kpi-valor ${negativa}">${formatearPesos(gananciaNetaDelMes)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Ganancia bruta del mes</div>
        <div class="kpi-valor">${formatearPesos(gananciaBrutaDelMes)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Costos fijos</div>
        <div class="kpi-valor">${formatearPesos(totalCostosFijos)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Gastos variables</div>
        <div class="kpi-valor">${formatearPesos(totalGastosVariablesDelMes)}</div>
      </div>
    </div>
  `;
}

// Versión "para el contador": desglose real facturado/no-facturado (ver
// calcularDesgloseFacturado en utils/calculosFinanzas.js) en vez de un solo
// número de "Facturación total" que en realidad era todo lo cobrado, tenga
// o no comprobante fiscal formal.
function bloqueKpisContador({ desglose, gananciaNetaDelMes }) {
  const { cobradoFacturado, cobradoNoFacturado, gastosFacturados, gastosNoFacturados, totalCostosFijos } = desglose;
  const negativa = gananciaNetaDelMes < 0 ? "negativo" : "";
  return `
    <div class="kpis">
      <div class="kpi">
        <div class="kpi-label">Cobrado con factura</div>
        <div class="kpi-valor">${formatearPesos(cobradoFacturado)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Cobrado sin factura</div>
        <div class="kpi-valor">${formatearPesos(cobradoNoFacturado)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Gastos con comprobante</div>
        <div class="kpi-valor">${formatearPesos(gastosFacturados + totalCostosFijos)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Gastos sin comprobante</div>
        <div class="kpi-valor">${formatearPesos(gastosNoFacturados)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Ganancia neta (total real)</div>
        <div class="kpi-valor ${negativa}">${formatearPesos(gananciaNetaDelMes)}</div>
      </div>
    </div>
  `;
}

// Solo en la versión "completo" — es información estratégica del taller
// (qué servicio le conviene más ofrecer), no algo para mostrarle a nadie
// afuera. Mismos datos que RankingLista.js en pantalla (ver
// rankingServiciosPorGanancia en utils/calculosFinanzas.js), sin el aviso
// de margen bajo (eso es una alerta de UI, no un dato del documento).
function bloqueRankingServicios(rankingServicios) {
  if (!rankingServicios || rankingServicios.length === 0) {
    return `<h2>Servicios más rentables</h2><p style="font-size:13px;color:${COLOR_TEXTO_SECUNDARIO};">Todavía no hay suficientes cobros para armar este ranking.</p>`;
  }

  const filas = rankingServicios
    .map(
      (s, indice) => `
      <tr>
        <td>${indice + 1}. ${escapeHtml(s.nombre)}</td>
        <td class="numero">${s.cantidad}</td>
        <td class="numero">${formatearPesos(s.monto)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <h2>Servicios más rentables (últimos 6 meses)</h2>
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th class="numero">Ventas</th>
          <th class="numero">Ganancia</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

function bloqueEquilibrio(puntoEquilibrio) {
  const texto = puntoEquilibrio
    ? `Para cubrir los costos fijos de este mes hacía falta facturar ${formatearPesos(puntoEquilibrio.facturacion)} (o hacer ~${puntoEquilibrio.trabajos} ${puntoEquilibrio.trabajos === 1 ? "trabajo" : "trabajos"}).`
    : "Todavía no había suficientes trabajos cobrados para calcular el punto de equilibrio.";
  return `<div class="equilibrio"><strong>Punto de equilibrio:</strong> ${texto}</div>`;
}

function bloqueTrabajos(trabajosDelMes) {
  if (trabajosDelMes.length === 0) {
    return `<h2>Trabajos del mes</h2><p style="font-size:13px;color:${COLOR_TEXTO_SECUNDARIO};">Todavía no se cobró ningún trabajo este mes.</p>`;
  }

  const filas = trabajosDelMes
    .map(
      (t) => `
      <tr>
        <td>${escapeHtml(t.nombre)}</td>
        <td>${escapeHtml(t.cobro.fecha)}</td>
        <td class="numero">${formatearPesos(t.cobro.monto)}</td>
        <td class="numero">${formatearPesos(t.costoInsumos)}</td>
        <td class="numero">${formatearPesos(t.margen)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <h2>Trabajos del mes (${trabajosDelMes.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Fecha</th>
          <th class="numero">Cobrado</th>
          <th class="numero">Costo insumos</th>
          <th class="numero">Margen</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

// Solo en la versión "contador" — aclara que "con factura/sin factura" y
// "con comprobante/sin comprobante" son marcas manuales del taller (ver
// facturado en cobros/gastos_variables), no una validación fiscal real.
function bloqueAvisoContador() {
  return `
    <div class="equilibrio">
      Este resumen es información de gestión interna del taller, generada desde la app — no reemplaza ni constituye documentación fiscal formal (facturas, libro IVA, etc.). La marca "con factura / sin factura" y "con comprobante / sin comprobante" la carga el taller a mano en cada cobro y gasto; no está validada contra AFIP/ARCA.
    </div>
  `;
}

function bloqueFooter(taller) {
  const contacto = [taller?.misDatos?.correo, taller?.misDatos?.telefono].filter(Boolean).map(escapeHtml).join(" · ");
  return `
    <div class="footer">
      ${taller?.misDatos?.ubicacion ? `<div>${escapeHtml(taller.misDatos.ubicacion)}</div>` : ""}
      ${contacto ? `<div>${contacto}</div>` : ""}
      <div>Generado desde DetallArg el ${new Date().toLocaleDateString("es-AR")}.</div>
    </div>
  `;
}

// HTML de una página con el resumen financiero del mes, en una de dos
// versiones según `tipo`:
// - "completo" — para uso interno del taller: KPIs completos (incluye
//   ganancia bruta y el desglose costos fijos/variables), punto de
//   equilibrio, ranking de servicios más rentables, y margen por trabajo.
// - "contador" — solo los 3 totales fiscales (facturación, gastos totales,
//   ganancia neta), sin nada de lo anterior: es información estratégica
//   del taller, no algo que el contador necesite ver.
// `mesEtiqueta` ya viene formateado (ej. "Septiembre 2026", ver
// utils/fecha.js formatearMesAnio) desde FinanzasScreen.js.
export function construirHtmlResumenFinanciero({
  tipo,
  taller,
  mesEtiqueta,
  gananciaNetaDelMes,
  gananciaBrutaDelMes,
  totalCostosFijos,
  totalGastosVariablesDelMes,
  puntoEquilibrio,
  trabajosDelMes,
  rankingServicios,
  desglose,
}) {
  const esCompleto = tipo === "completo";

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${estilos()}</style>
      </head>
      <body>
        <div class="pagina">
          ${bloqueHeader(taller, esCompleto)}
          <h1>Resumen financiero</h1>
          <div class="periodo">${escapeHtml(mesEtiqueta)}</div>

          ${
            esCompleto
              ? bloqueKpis({ gananciaNetaDelMes, gananciaBrutaDelMes, totalCostosFijos, totalGastosVariablesDelMes })
              : bloqueKpisContador({ desglose, gananciaNetaDelMes })
          }
          ${esCompleto ? bloqueEquilibrio(puntoEquilibrio) : ""}
          ${esCompleto ? bloqueRankingServicios(rankingServicios) : ""}
          ${esCompleto ? bloqueTrabajos(trabajosDelMes) : ""}
          ${!esCompleto ? bloqueAvisoContador() : ""}
          ${bloqueFooter(taller)}
        </div>
      </body>
    </html>
  `;
}
