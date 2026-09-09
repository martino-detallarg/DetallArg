import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Button from "../../components/Button";
import SelectorPanelesPpf from "../../components/wizard/SelectorPanelesPpf";
import { DIAGRAMAS_POR_TIPO_VEHICULO, obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { obtenerClavePpf, obtenerPanelesPpf } from "../../utils/calculosPpf";
import { colors, fonts } from "../../theme";

const PADDING_PANTALLA = 20;

// Paso extra del wizard de Trabajo Nuevo, solo cuando el servicio elegido es
// de tipo PPF (servicio.esPpf, ver DatosServicioStep/ServicioContext): en vez
// de (o además de) documentar daños previos, el taller marca qué paneles va
// a proteger — mismo diagrama de paneles reales que Inspección Visual, en
// modo selección (ver components/wizard/SelectorPanelesPpf.js). El resultado
// (`panelesElegidos`) se guarda en datos.ppf y alimenta tanto la Pantalla de
// Presupuesto PPF (paso siguiente) como el snapshot de turno_ppf_paneles al
// finalizar el trabajo (ver TurnoContext.actualizarEstadoTrabajo).
export default function SeleccionPanelesPpfStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const { width } = useWindowDimensions();
  const [vistaActiva, setVistaActiva] = useState(0);
  const anchoDiagrama = width - PADDING_PANTALLA * 2;

  const claveDiagrama = obtenerClaveDiagrama(datos);
  const diagramaVehiculo = DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama];
  const clavePpf = obtenerClavePpf(datos);
  const panelesDisponibles = clavePpf ? obtenerPanelesPpf(clavePpf.tipoVehiculo, clavePpf.subdivision) : null;

  const vistas = diagramaVehiculo
    ? Object.entries(diagramaVehiculo.vistas).map(([id, v]) => ({ id, etiqueta: v.etiqueta }))
    : [];

  const panelesElegidos = datos.panelesElegidos ?? [];

  function handleTogglePanel(id) {
    const nuevos = panelesElegidos.includes(id)
      ? panelesElegidos.filter((p) => p !== id)
      : [...panelesElegidos, id];
    onCambiar({ panelesElegidos: nuevos });
  }

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setVistaActiva(indice);
  }

  return (
    <View style={styles.pantalla}>
      <WizardHeader titulo="Paneles a proteger" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        {!panelesDisponibles ? (
          <View style={styles.proximamente}>
            <Text style={styles.proximamenteTitulo}>Próximamente</Text>
            <Text style={styles.proximamenteTexto}>
              Todavía estamos preparando la matriz de paneles de PPF para esta carrocería. Podés
              seguir cargando el trabajo igual — el presupuesto de PPF lo armás por fuera de la
              app por ahora.
            </Text>
            <View style={styles.boton}>
              <Button title="Continuar" onPress={() => onContinuar()} />
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollFin}
              style={styles.pager}
            >
              {vistas.map((vista) => (
                <ScrollView
                  key={vista.id}
                  style={{ width }}
                  contentContainerStyle={styles.pagina}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.vistaTitulo}>Vista: {vista.etiqueta}</Text>
                  <SelectorPanelesPpf
                    claveVehiculo={claveDiagrama}
                    vista={vista.id}
                    panelesDisponibles={panelesDisponibles}
                    panelesElegidos={panelesElegidos}
                    onTogglePanel={handleTogglePanel}
                    ancho={anchoDiagrama}
                  />
                </ScrollView>
              ))}
            </ScrollView>

            <View style={styles.puntos}>
              {vistas.map((vista, indice) => (
                <View key={vista.id} style={[styles.punto, indice === vistaActiva && styles.puntoActivo]} />
              ))}
            </View>

            <View style={styles.acciones}>
              <Text style={styles.contador}>
                {panelesElegidos.length === 0
                  ? "Todavía no elegiste ningún panel"
                  : `${panelesElegidos.length} panel${panelesElegidos.length > 1 ? "es" : ""} elegido${panelesElegidos.length > 1 ? "s" : ""}`}
              </Text>
              <Button title="Continuar a Presupuesto" onPress={() => onContinuar()} disabled={panelesElegidos.length === 0} />
            </View>
          </>
        )}
      </SwipeVolver>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pager: {
    flex: 1,
  },
  pagina: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  vistaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  puntoActivo: {
    width: 18,
    backgroundColor: colors.accent,
  },
  proximamente: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: PADDING_PANTALLA + 20,
    paddingBottom: 40,
  },
  proximamenteTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  proximamenteTexto: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  boton: {
    marginTop: 20,
    alignSelf: "stretch",
  },
  acciones: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 20,
  },
  contador: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 10,
  },
});
