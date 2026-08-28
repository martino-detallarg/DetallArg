import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WizardHeader from "../../components/wizard/WizardHeader";
import SwipeVolver from "../../components/wizard/SwipeVolver";
import Button from "../../components/Button";
import ChipGroup from "../../components/ChipGroup";
import FuelGauge from "../../components/wizard/FuelGauge";
import { DIAGRAMAS_POR_TIPO_VEHICULO, obtenerClaveDiagrama } from "../../components/diagrams/vehicles";
import { colors, continuousCorner, fonts, radii } from "../../theme";

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
    icono: "car-pickup",
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
  function elegirTipo(tipoId) {
    onCambiar({ tipoVehiculo: tipoId, grupo: null, subdivision: null });
  }

  function elegirSubdivision(grupo, opcion) {
    onCambiar({ grupo, subdivision: opcion });
  }

  const tipoInfo = datos.tipoVehiculo ? TIPOS_VEHICULO[datos.tipoVehiculo] : null;
  const puedeContinuar = !!datos.subdivision;
  const claveDiagrama = obtenerClaveDiagrama(datos);
  const tieneDiagramaEspecifico = !!DIAGRAMAS_POR_TIPO_VEHICULO[claveDiagrama];

  return (
    <View style={styles.pantalla}>
      <WizardHeader titulo="Tipo de Vehículo" paso={paso} totalPasos={totalPasos} onAtras={onAtras} />

      <SwipeVolver onAtras={onAtras}>
        <ScrollView contentContainerStyle={styles.contenido}>
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
                    size={28}
                    color={seleccionado ? colors.accentLight : colors.textSecondary}
                  />
                  <Text style={[styles.tarjetaTexto, seleccionado && styles.tarjetaTextoSeleccionado]}>
                    {t.etiqueta}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {tipoInfo && (
            <View style={styles.subdivisiones}>
              <Text style={styles.texto}>Elegí la subdivisión</Text>
              {tipoInfo.grupos.map((g) => (
                <View key={g.grupo ?? "unico"} style={styles.grupo}>
                  {g.grupo && <Text style={styles.grupoTitulo}>{g.grupo}</Text>}
                  <ChipGroup
                    options={g.opciones.map((opcion) => ({
                      value: opcion,
                      label: opcion,
                      selected: datos.grupo === g.grupo && datos.subdivision === opcion,
                    }))}
                    onPress={(opcion) => elegirSubdivision(g.grupo, opcion)}
                  />
                </View>
              ))}

              <Text style={styles.notaPlaceholder}>
                {tieneDiagramaEspecifico
                  ? "Esta carrocería ya tiene su propio diagrama de paneles reales."
                  : datos.tipoVehiculo === "moto"
                  ? "Próximamente — todavía estamos preparando el diagrama de esta categoría de moto."
                  : "Por ahora esta carrocería usa el diagrama genérico, con solo la vista de Frente disponible — más adelante se suman las otras vistas y su modelo real."}
              </Text>
            </View>
          )}

          {datos.subdivision && (
            <>
              <Text style={styles.texto}>Nivel de nafta</Text>
              <FuelGauge nivel={datos.nivelNafta} onCambiar={(n) => onCambiar({ nivelNafta: n })} />
            </>
          )}

          <View style={styles.boton}>
            <Button title="Siguiente" onPress={onContinuar} disabled={!puedeContinuar} />
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
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tarjetaTipoSeleccionada: {
    backgroundColor: colors.surface2,
    borderColor: colors.accent,
  },
  tarjetaTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tarjetaTextoSeleccionado: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
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
  notaPlaceholder: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 10,
    fontStyle: "italic",
  },
  boton: {
    marginTop: 28,
  },
});
