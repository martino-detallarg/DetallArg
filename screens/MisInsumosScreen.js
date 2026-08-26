import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
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
import AgregarInsumoModal from "../components/AgregarInsumoModal";
import CategoriaInsumosModal from "../components/CategoriaInsumosModal";
import MoverCategoriaModal from "../components/MoverCategoriaModal";
import ProductoCasillero from "../components/ProductoCasillero";
import { useData } from "../data/DataContext";
import { CATEGORIAS, ORDEN_CATEGORIAS, PAGINAS_ESTANTERIA } from "../data/mockInsumos";
import { colors, continuousCorner, fonts, radii, shadow, shadowSubtle } from "../theme";

const COLUMNAS = 3;
const MAX_COMPACTO = 3;
const PADDING_GRILLA = 20;
const ESPACIO_CASILLERO = 12;

function CategoriaSection({ categoriaKey, productos, tamanoCasillero, onAbrir, onSeleccionarProducto }) {
  const categoria = CATEGORIAS[categoriaKey];
  const visibles = productos.slice(0, MAX_COMPACTO);

  return (
    <View style={styles.seccion}>
      <TouchableOpacity style={styles.seccionHeader} onPress={onAbrir} activeOpacity={0.7}>
        <Text style={styles.seccionTitulo} numberOfLines={1}>
          {categoria.etiqueta} <Text style={styles.seccionCantidad}>({productos.length})</Text>
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {productos.length === 0 ? (
        <View style={styles.vacioCategoria}>
          <Text style={styles.vacioCategoriaTexto}>Sin productos cargados todavía</Text>
        </View>
      ) : (
        <View style={styles.filaCasilleros}>
          {visibles.map((producto) => (
            <ProductoCasillero
              key={producto.id}
              producto={producto}
              tamano={tamanoCasillero}
              onPress={onSeleccionarProducto}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function MisInsumosScreen({ navigation }) {
  const { misInsumos } = useData();
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaAbierta, setCategoriaAbierta] = useState(null);
  const [paginaActiva, setPaginaActiva] = useState(0);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const tamanoCasillero =
    (width - PADDING_GRILLA * 2 - ESPACIO_CASILLERO * (COLUMNAS - 1)) / COLUMNAS;

  const productosPorCategoria = useMemo(() => {
    const mapa = {};
    ORDEN_CATEGORIAS.forEach((clave) => {
      mapa[clave] = [];
    });
    misInsumos.forEach((insumo) => {
      if (mapa[insumo.categoria]) {
        mapa[insumo.categoria].push(insumo);
      }
    });
    return mapa;
  }, [misInsumos]);

  function handleScrollFin(evento) {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / width);
    setPaginaActiva(indice);
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style="light" />
      <ScreenHeader onVolver={() => navigation.navigate("MiTaller")} />

      <Text style={styles.titulo}>Mis Insumos</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollFin}
        style={styles.estanteria}
      >
        {PAGINAS_ESTANTERIA.map((categoriasPagina, indicePagina) => (
          <ScrollView
            key={indicePagina}
            style={{ width }}
            contentContainerStyle={styles.pagina}
            showsVerticalScrollIndicator={false}
          >
            {categoriasPagina.map((claveCategoria, indice) => (
              <View key={claveCategoria}>
                <CategoriaSection
                  categoriaKey={claveCategoria}
                  productos={productosPorCategoria[claveCategoria]}
                  tamanoCasillero={tamanoCasillero}
                  onAbrir={() => setCategoriaAbierta(claveCategoria)}
                  onSeleccionarProducto={setProductoSeleccionado}
                />
                {indice < categoriasPagina.length - 1 && <View style={styles.repisa} />}
              </View>
            ))}
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.puntos}>
        {PAGINAS_ESTANTERIA.map((_, indice) => (
          <View key={indice} style={[styles.punto, indice === paginaActiva && styles.puntoActivo]} />
        ))}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <AgregarInsumoModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <CategoriaInsumosModal
        visible={categoriaAbierta !== null}
        categoriaKey={categoriaAbierta}
        productos={categoriaAbierta ? productosPorCategoria[categoriaAbierta] : []}
        onClose={() => setCategoriaAbierta(null)}
      />

      {/* Instancia propia para los casilleros de la estantería compacta (no
          los de CategoriaInsumosModal, que maneja la suya para poder ocultar
          su propio Modal de pantalla completa mientras este está abierto —
          ver el comentario en CategoriaInsumosModal.js). Nunca coexisten
          visibles: los casilleros de acá solo son tocables cuando ningún
          Modal de pantalla completa (CategoriaInsumosModal/AgregarInsumoModal)
          está cubriendo la pantalla. */}
      <MoverCategoriaModal
        visible={productoSeleccionado !== null}
        insumo={productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
      />
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
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  estanteria: {
    flex: 1,
  },
  pagina: {
    paddingHorizontal: PADDING_GRILLA,
    paddingBottom: 20,
  },
  seccion: {
    marginBottom: 4,
  },
  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  seccionTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  seccionCantidad: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
  },
  filaCasilleros: {
    flexDirection: "row",
    gap: ESPACIO_CASILLERO,
  },
  vacioCategoria: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderSubtle,
    borderRadius: radii.card,
    ...continuousCorner,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  vacioCategoriaTexto: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  // Barra metálica que separa cada sección de categoría, simulando las
  // repisas de una estantería industrial de taller.
  repisa: {
    height: 14,
    backgroundColor: colors.surface2,
    borderTopWidth: 1,
    borderTopColor: colors.borderAccent,
    borderBottomWidth: 3,
    borderBottomColor: colors.accentDark,
    borderRadius: 4,
    marginVertical: ESPACIO_CASILLERO,
    ...shadowSubtle,
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  fabTexto: {
    color: colors.bg,
    fontSize: 30,
    fontWeight: "400",
    marginTop: -2,
  },
});
