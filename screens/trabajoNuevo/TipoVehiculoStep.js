import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Button from "../../components/Button";
import Input from "../../components/Input";
import FuelGauge from "../../components/wizard/FuelGauge";
import { DIAGRAMAS_POR_TIPO_VEHICULO, obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { useScrollAlHabilitar } from "../../hooks/useScrollAlHabilitar";
import { colors, continuousCorner, fonts, radii } from "../../theme";

// Íconos outline/finos de MaterialCommunityIcons — mismo criterio "trazo
// fino, minimalista" que las siluetas de Mi Equipo (Ionicons man-outline/
// woman-outline). "car-outline" y "truck-outline" son variantes outline
// reales del set; MaterialCommunityIcons no tiene una variante outline para
// SUV/estate ni para moto, así que "car-estate" y "motorbike" quedan como
// están (son ya el glyph más simple disponible para esa forma en este set).
const TIPOS_VEHICULO = {
  auto: {
    etiqueta: "Auto",
    icono: "car-outline",
    grupos: [
      { grupo: "2 puertas", opciones: ["Coupé", "Descapotable"] },
      { grupo: "4 puertas", opciones: ["Sedán", "Hatchback", "Familiar"] },
    ],
  },
  camioneta: {
    etiqueta: "Camioneta",
    icono: "truck-outline",
    grupos: [
      { grupo: "Cabina simple", opciones: ["Chico", "Mediano"] },
      { grupo: "Doble cabina", opciones: ["Chico", "Mediano", "Grande"] },
      { grupo: "Utilitario acarrozado", opciones: ["Chico", "Mediano", "Grande"] },
    ],
  },
  suv: {
    etiqueta: "SUV",
    icono: "car-estate",
    grupos: [{ grupo: null, opciones: ["Compacto", "Grande"] }],
  },
  moto: {
    etiqueta: "Moto",
    icono: "motorbike",
    grupos: [{ grupo: null, opciones: ["Naked", "Sport", "Motocross", "Enduro/Calle", "Scooter"] }],
  },
};

const TIPOS = Object.entries(TIPOS_VEHICULO).map(([id, valor]) => ({ id, ...valor }));

// Pantalla 1 de la inspección: elige la forma del vehículo (tipo,
// subdivisión) y el nivel de nafta. La parte visual de daños (diagramas,
// foto, guardar) quedó en InspeccionVisualStep.
export default function TipoVehiculoStep({ datos, paso, totalPasos, onCambiar, onAtras, onContinuar }) {
  const [errores, setErrores] = useState({});
  const scrollRef = useRef(null);

  function elegirTipo(tipoId) {
    onCambiar({ tipoVehiculo: tipoId, grupo: null, subdivision: null });
  }

  function elegirSubdivision(grupo, opcion) {
    onCambiar({ grupo, subdivision: opcion });
  }

  const tipoInfo = datos.tipoVehiculo ? TIPOS_VEHICULO[datos.tipoVehiculo] : null;
  const puedeContinuar = !!datos.subdivision && !!datos.kilometraje?.trim();
  const onLayoutBoton = useScrollAlHabilitar(scrollRef, puedeContinuar);
  const claveDiagrama = obtenerClaveDiagrama(datos);
  const tieneDiagramaEspecifico = !!DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama];

  // Mismo patrón que DatosServicioStep: el botón ya queda deshabilitado sin
  // kilometraje (puedeContinuar de arriba), pero además se valida al
  // intentar avanzar para mostrar el error inline, no solo un botón
  // apagado sin explicación.
  function validar() {
    const nuevosErrores = {};
    // Mismo criterio que puedeContinuar de arriba (que ya bloquea el
    // botón sin subdivisión) — acá solo se hace visible CUÁL de las dos
    // reglas ya existentes es la que falta, no se agrega ninguna nueva.
    if (!datos.tipoVehiculo) {
      nuevosErrores.tipoVehiculo = "Elegí el tipo de vehículo";
    } else if (!datos.subdivision) {
      nuevosErrores.subdivision = "Elegí la subdivisión";
    }
    if (!datos.kilometraje?.trim()) nuevosErrores.kilometraje = "Ingresá el kilometraje";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleContinuar() {
    if (validar()) onContinuar();
  }

  return (
    <View style={styles.pantalla}>
      <WizardHeader titulo="Tipo de Vehículo" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.contenido}>
          <Text style={styles.texto}>Seleccioná el tipo de vehículo</Text>

          <View style={styles.grid}>
            {TIPOS.map((t) => {
              const seleccionado = datos.tipoVehiculo === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tarjetaTipo, seleccionado && styles.tarjetaTipoSeleccionada]}
                  onPress={() => elegirTipo(t.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={t.icono}
                    size={32}
                    color={seleccionado ? colors.bg : colors.textSecondary}
                  />
                  <Text style={[styles.tarjetaTexto, seleccionado && styles.tarjetaTextoSeleccionado]}>
                    {t.etiqueta}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errores.tipoVehiculo && <Text style={styles.error}>{errores.tipoVehiculo}</Text>}

          <Input
            label="Kilometraje"
            value={datos.kilometraje ?? ""}
            onChangeText={(v) => onCambiar({ kilometraje: v.replace(/[^0-9]/g, "") })}
            placeholder="0"
            keyboardType="numeric"
            sufijo="km"
            error={errores.kilometraje}
          />

          {tipoInfo && (
            <View style={styles.subdivisiones}>
              <Text style={styles.texto}>Elegí la subdivisión</Text>
              {tipoInfo.grupos.map((g) => (
                <View key={g.grupo ?? "unico"} style={styles.grupo}>
                  {g.grupo && <Text style={styles.grupoTitulo}>{g.grupo}</Text>}
                  <View style={styles.bloquesSubdivision}>
                    {g.opciones.map((opcion) => {
                      const seleccionada = datos.grupo === g.grupo && datos.subdivision === opcion;
                      return (
                        <TouchableOpacity
                          key={opcion}
                          style={[styles.bloqueSubdivision, seleccionada && styles.bloqueSubdivisionSeleccionado]}
                          onPress={() => elegirSubdivision(g.grupo, opcion)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.bloqueSubdivisionTexto,
                              seleccionada && styles.bloqueSubdivisionTextoSeleccionado,
                            ]}
                          >
                            {opcion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
              {errores.subdivision && <Text style={styles.error}>{errores.subdivision}</Text>}

              {tieneDiagramaEspecifico ? (
                <View style={styles.bannerConfirmacion}>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.accentLight} />
                  <Text style={styles.bannerConfirmacionTexto}>
                    Esta carrocería ya tiene su propio diagrama de paneles reales.
                  </Text>
                </View>
              ) : (
                <Text style={styles.notaPlaceholder}>
                  {datos.tipoVehiculo === "moto"
                    ? "Próximamente — todavía estamos preparando el diagrama de esta categoría de moto."
                    : "Por ahora esta carrocería usa el diagrama genérico, con solo la vista de Frente disponible — más adelante se suman las otras vistas y su modelo real."}
                </Text>
              )}
            </View>
          )}

          {datos.subdivision && (
            <>
              <Text style={styles.texto}>Nivel de nafta</Text>
              <FuelGauge nivel={datos.nivelNafta} onCambiar={(n) => onCambiar({ nivelNafta: n })} />
            </>
          )}

          <View style={styles.boton} onLayout={onLayoutBoton}>
            <Button title="Siguiente" onPress={handleContinuar} disabled={!puedeContinuar} />
          </View>
        </ScrollView>
      </SwipeVolver>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  texto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  tarjetaTipo: {
    width: "47%",
    aspectRatio: 1.3,
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tarjetaTipoSeleccionada: {
    backgroundColor: colors.accent,
  },
  tarjetaTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tarjetaTextoSeleccionado: {
    fontFamily: fonts.bodyBold,
    color: colors.bg,
  },
  subdivisiones: {
    marginTop: 4,
  },
  grupo: {
    marginTop: 10,
  },
  grupoTitulo: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
  // Mismo criterio visual que tarjetaTipo/tarjetaTipoSeleccionada de arriba
  // (fondo sólido colors.accent si está elegida, surface2 si no, radii.card,
  // sin bordes) — para que ambos selectores de esta pantalla se lean como
  // un mismo sistema, no dos estilos distintos.
  bloquesSubdivision: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloqueSubdivision: {
    backgroundColor: colors.surface2,
    borderRadius: radii.card,
    ...continuousCorner,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bloqueSubdivisionSeleccionado: {
    backgroundColor: colors.accent,
  },
  bloqueSubdivisionTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bloqueSubdivisionTextoSeleccionado: {
    fontFamily: fonts.bodyBold,
    color: colors.bg,
  },
  notaPlaceholder: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 10,
    fontStyle: "italic",
  },
  bannerConfirmacion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accentTint,
    borderRadius: radii.button,
    ...continuousCorner,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  bannerConfirmacionTexto: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.accentLight,
  },
  boton: {
    marginTop: 28,
  },
});
