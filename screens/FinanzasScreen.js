import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import GraficoBarras from "../components/GraficoBarras";
import GraficoDonut from "../components/GraficoDonut";
import { useData } from "../data/DataContext";
import { formatearPesos } from "../utils/formato";
import { colors, continuousCorner, fonts, radii } from "../theme";

const PADDING_PANTALLA = 20;
const CANTIDAD_PAGINAS = 2;

// Datos de ejemplo (inventados) de los últimos 6 meses, solo para ilustrar
// el diseño de la pantalla hasta que se defina de dónde sale la información
// real de facturación.
const INGRESOS_EJEMPLO = [
  { etiqueta: "Mar", valor: 185000 },
  { etiqueta: "Abr", valor: 210000 },
  { etiqueta: "May", valor: 260000 },
  { etiqueta: "Jun", valor: 240000 },
  { etiqueta: "Jul", valor: 300000 },
  { etiqueta: "Ago", valor: 275000 },
].map((item) => ({ ...item, valorTexto: `$${Math.round(item.valor / 1000)}K` }));

// PLACEHOLDER: todavía no existe el cálculo real de costos variables
// (consumo de insumos, comisiones, etc.). Reemplazar por ese cálculo real
// cuando esté definido.
const COSTOS_VARIABLES_EJEMPLO = 95000;

export default function FinanzasScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { costosFijos } = useData();
  const [paginaActiva, setPaginaActiva] = useState(0);
  const anchoGrafico = width - PADDING_PANTALLA * 2 - 32;

  const totalCostosFijos = costosFijos.reduce((suma, c) => suma + c.monto, 0);

  const segmentosDonut = [
    { clave: "fijos", etiqueta: "Fijos", valor: totalCostosFijos, color: colors.accent },
    { clave: "variables", etiqueta: "Variables", valor: COSTOS_VARIABLES_EJEMPLO, color: colors.accentLight },
  ];

  function handlePressSegmento(clave) {
    if (clave === "fijos") {
      navigation.navigate("CostosFijos");
    } else {
      Alert.alert(
        "Costos variables",
        "Todavía no tenemos el cálculo real de costos variables. Próximamente."
      );
    }
  }

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setPaginaActiva(indice);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onAbrirMenu={() => navigation.getParent()?.openDrawer()} />

      <Text style={styles.titulo}>Finanzas</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollFin}
        style={styles.pager}
      >
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.pagina}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaHeaderFila}>
              <Text style={styles.tarjetaTitulo}>Costos del mes</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("CostosFijos")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.accentLight} />
              </TouchableOpacity>
            </View>

            <GraficoDonut segmentos={segmentosDonut} onPressSegmento={handlePressSegmento} />

            <View style={styles.leyenda}>
              {segmentosDonut.map((segmento) => (
                <TouchableOpacity
                  key={segmento.clave}
                  style={styles.leyendaFila}
                  onPress={() => handlePressSegmento(segmento.clave)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.leyendaPunto, { backgroundColor: segmento.color }]} />
                  <Text style={styles.leyendaTexto}>{segmento.etiqueta}</Text>
                  <Text style={styles.leyendaMonto}>{formatearPesos(segmento.valor)}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.nota}>
            &quot;Variables&quot; es un valor de ejemplo: todavía no tenemos el cálculo real de
            costos variables.
          </Text>
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.pagina}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo}>Ingresos · últimos 6 meses</Text>
            <GraficoBarras datos={INGRESOS_EJEMPLO} ancho={anchoGrafico} />
          </View>

          <Text style={styles.nota}>
            Datos de ejemplo para mostrar el diseño. Más adelante se reemplaza por la facturación
            real.
          </Text>
        </ScrollView>
      </ScrollView>

      <View style={styles.puntos}>
        {Array.from({ length: CANTIDAD_PAGINAS }).map((_, indice) => (
          <View key={indice} style={[styles.punto, indice === paginaActiva && styles.puntoActivo]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: PADDING_PANTALLA,
    marginTop: 4,
    marginBottom: 14,
  },
  pager: {
    flex: 1,
  },
  pagina: {
    paddingHorizontal: PADDING_PANTALLA,
    paddingBottom: 20,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  tarjetaHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tarjetaTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  leyenda: {
    marginTop: 18,
    gap: 8,
  },
  leyendaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leyendaPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  leyendaMonto: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  nota: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
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
});
