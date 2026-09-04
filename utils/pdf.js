// Helpers de generación de PDF compartidos entre utils/catalogoPdf.js y
// utils/finanzasPdf.js: escapar texto libre antes de insertarlo en HTML, y
// el paso final de "generar y compartir" vía expo-print + expo-sharing.
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

// Escapa texto libre (nombre del taller, descripciones, etc.) antes de
// insertarlo en el HTML, para que un "&" o "<" cargado a mano no rompa el
// documento.
export function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
