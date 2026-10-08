import { useCallback, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import HomeScreen from "../screens/HomeScreen";
import ClientesScreen from "../screens/ClientesScreen";
import AgendaScreen from "../screens/AgendaScreen";
import MiTallerScreen from "../screens/MiTallerScreen";
import MisDatosScreen from "../screens/MisDatosScreen";
import MisInsumosScreen from "../screens/MisInsumosScreen";
import MisServiciosScreen from "../screens/MisServiciosScreen";
import CatalogoScreen from "../screens/CatalogoScreen";
import EditorCatalogoScreen from "../screens/EditorCatalogoScreen";
import PresupuestoScreen from "../screens/PresupuestoScreen";
import MiEquipoScreen from "../screens/MiEquipoScreen";
import FinanzasScreen from "../screens/FinanzasScreen";
import FinanzasCostosScreen from "../screens/FinanzasCostosScreen";
import FinanzasRendimientoScreen from "../screens/FinanzasRendimientoScreen";
import FinanzasTendenciasScreen from "../screens/FinanzasTendenciasScreen";
import CostosFijosScreen from "../screens/CostosFijosScreen";
import CuentasPorCobrarScreen from "../screens/CuentasPorCobrarScreen";
import NotificacionesScreen from "../screens/NotificacionesScreen";
import SoporteScreen from "../screens/SoporteScreen";
import MisHorariosScreen from "../screens/MisHorariosScreen";
import ConfiguracionFinanzasScreen from "../screens/ConfiguracionFinanzasScreen";
import HistorialClientesScreen from "../screens/HistorialClientesScreen";
import ConfiguracionScreen from "../screens/ConfiguracionScreen";
import MenuScreen from "../screens/MenuScreen";
import SeleccionPlanScreen from "../screens/SeleccionPlanScreen";
import DocumentoLegalScreen from "../screens/DocumentoLegalScreen";
import AccionesRapidasModales from "../components/AccionesRapidasModales";
import RenovacionInsumoModal from "../components/RenovacionInsumoModal";
import { useAccionesRapidas } from "../data/AccionesRapidasContext";
import { useTourTarget } from "../data/TourTargetContext";
import { colors, fonts, shadow } from "../theme";

const Tab = createBottomTabNavigator();

// "Tap" liviano al tocar un ítem de la barra de abajo (estilo Mercado
// Libre/Spotify). En Android NO se usa selectionAsync: expo-haptics lo
// implementa con el Vibrator directo, que ignora el ajuste "respuesta táctil"
// del sistema. performAndroidHapticsAsync pasa por performHapticFeedback de
// la View, que sí lo respeta (si está apagado, no vibra). En iOS
// selectionAsync ya respeta los ajustes del sistema. El catch es para que un
// fallo del haptic nunca rompa el tap.
function hapticTab() {
  const promesa =
    Platform.OS === "android"
      ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
      : Haptics.selectionAsync();
  promesa?.catch(() => {});
}
const RootStack = createNativeStackNavigator();
const MiTallerStack = createNativeStackNavigator();
const FinanzasStack = createNativeStackNavigator();
const ConfiguracionStack = createNativeStackNavigator();

// Términos y Privacidad reusan la misma pantalla genérica (ver
// DocumentoLegalScreen.js): "tipo" es la clave que usa esa pantalla para
// elegir título + texto desde data/textosLegales.js.
const PANTALLAS_LEGAL = [
  { ruta: "Terminos", tipo: "terminos" },
  { ruta: "Privacidad", tipo: "privacidad" },
];

// Estos 3 stacks anidados existen solo para darle a sus pantallas hijas el
// gesto nativo de iOS de "deslizar desde el borde para volver" (viene gratis
// de native-stack, que en iOS corre sobre UINavigationController). Un
// Tab.Navigator tampoco tiene noción de pila, así que ese gesto no existe si
// las pantallas son hermanas planas del Tab — de ahí la necesidad de anidar
// un Stack por cada grupo pantalla-padre + pantallas-hijas con botón
// "volver". headerShown en false porque cada pantalla ya dibuja su propio
// ScreenHeader/WizardHeader. Las versiones de MiTaller/Finanzas van más
// abajo (…ConNotificaciones): su pantalla raíz necesita el callback del
// ícono de campana del header.
function ConfiguracionStackNavigator() {
  return (
    <ConfiguracionStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <ConfiguracionStack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <ConfiguracionStack.Screen name="SeleccionPlan" component={SeleccionPlanScreen} />
      {PANTALLAS_LEGAL.map(({ ruta, tipo }) => (
        <ConfiguracionStack.Screen
          key={ruta}
          name={ruta}
          component={DocumentoLegalScreen}
          initialParams={{ tipo }}
        />
      ))}
    </ConfiguracionStack.Navigator>
  );
}

// Botón central "+", estilo MercadoPago/QR: no navega a ninguna pantalla,
// solo dispara la acción (ver tabPress interceptado más abajo) — por eso
// tiene su propio tabBarButton en vez del ícono+label chico de los otros 4.
function BotonAccionCentral({ onPress }) {
  return (
    <View style={styles.centralWrap}>
      <TouchableOpacity
        style={styles.centralBoton}
        onPress={() => {
          // Este tabBarButton propio no emite tabPress (no llama al onPress
          // que le pasa el Tab.Navigator), así que screenListeners no lo
          // cubre: el haptic va acá.
          hapticTab();
          onPress();
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={colors.bg} />
      </TouchableOpacity>
    </View>
  );
}

function IconoTab({ nombre, focused }) {
  return (
    <Ionicons
      name={nombre}
      size={22}
      color={focused ? colors.textPrimary : colors.textMuted}
    />
  );
}

function EtiquetaTab({ texto, focused, onLayout }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActivo]} onLayout={onLayout}>
      {texto}
    </Text>
  );
}

// Tutorial relacional, paso "accesos": margen lateral del área medida de la
// barra. Sin esto el marco del recorte iría de borde a borde de la pantalla y
// sus esquinas inferiores quedarían recortadas por las esquinas redondeadas
// del display (iPhone con indicador de inicio). Con 18 (menos los 6px de
// padding del paso) el marco queda a 12px del borde, con todos los tabs
// adentro (cada etiqueta va centrada en su quinto de ancho).
const MARGEN_LATERAL_TOUR_BARRA = 18;

// Pantalla vacía: nunca se llega a montar de verdad porque tabPress siempre
// hace preventDefault() antes de navegar (ver "NuevoAccion" abajo), pero un
// Tab.Screen necesita sí o sí un component válido.
function PantallaVacia() {
  return null;
}

// Los 5 tabs de abajo (pedido explícito de Augusto: Home / Mi Taller / "+"
// central / Finanzas / Menú con "las cosas que sobran") + las pantallas que
// ya no tienen tab propio pero siguen siendo navegables desde la pantalla
// Menú del 5to tab (Clientes, Agenda, Soporte, Configuración, etc.) o desde
// el ícono de notificaciones del header (Notificaciones) — quedan
// registradas como tabs SIN botón visible (tabBarButton null +
// tabBarItemStyle display:none) para no perder ni el historial de
// navegación ni la posibilidad de un navigation.navigate() plano desde
// cualquier pantalla.
function DashboardTabs({ navigation }) {
  const { abrirOpciones } = useAccionesRapidas();
  const tourBarra = useTourTarget("tabs.barra");
  // Distancia desde el tope de la barra hasta la base de las etiquetas.
  // La barra tiene alto fijo (styles.tabBar.height) y bottom-tabs le suma
  // paddingBottom = insets.bottom: en iPhone con indicador de inicio a los
  // tabs les quedan ~38px, pero cada ítem ocupa ~54 (padding 5 + ícono 28 +
  // etiqueta + padding 5), así que las etiquetas desbordan hacia la zona
  // del indicador. Ni la barra entera ni "barra menos inset" sirven para
  // enmarcarlas: se mide la etiqueta real de Inicio (todas están a la misma
  // altura), así también acompaña si el sistema agranda la fuente.
  const [altoHastaEtiquetas, setAltoHastaEtiquetas] = useState(null);
  const medirEtiquetaTab = useCallback((evento) => {
    const { y, height } = evento.nativeEvent.layout;
    // `y` es relativo al botón del tab, que arranca debajo del paddingTop y
    // del borde superior de la barra.
    const alto = styles.tabBar.paddingTop + StyleSheet.hairlineWidth + y + height;
    setAltoHastaEtiquetas((actual) => (actual !== null && Math.abs(actual - alto) < 0.5 ? actual : alto));
  }, []);

  // `navigation` acá es el nav del RootStack para la screen "Dashboard" (no
  // el del Tab.Navigator que se renderiza más abajo, adentro de ESTE mismo
  // componente) — un `navigate("Notificaciones")` a secas buscaría esa ruta
  // entre las screens del RootStack ("Dashboard"/"HistorialClientes") y
  // fallaría, porque "Notificaciones" vive un nivel más abajo, adentro del
  // Tab.Navigator. Por eso hace falta la forma anidada `{screen, params}`.
  // (Las pantallas que viven DENTRO del Tab.Navigator, como MenuScreen, no
  // tienen ese problema: su `navigation` ya es el del Tab.Navigator.)
  function abrirNotificaciones() {
    navigation.navigate("Dashboard", { screen: "Notificaciones" });
  }

  return (
    <>
      <Tab.Navigator
        // "Volver" (goBack de cada pantalla + botón atrás de Android) vuelve
        // al tab visitado anteriormente, no siempre a Inicio (el default de
        // v7 es "firstRoute"). Necesario desde que Menú es una pantalla real:
        // Clientes/Agenda/Soporte/Configuración/Mis Datos/etc. abiertas desde
        // el Menú vuelven al Menú, y Notificaciones vuelve al tab desde el que
        // se tocó la campanita. "history" deduplica: cada tab aparece una sola
        // vez en el historial (la última visita). El tutorial relacional
        // recorta el historial a solo Inicio al cerrarse (ver cerrarTour en
        // data/TourManager.js), para que el botón atrás no recorra su trayecto.
        backBehavior="history"
        // Haptic en cada toque de un tab de la barra (Inicio, Mi Taller,
        // Finanzas, Menú), también al re-tocar el tab actual. El "+" va
        // aparte, en BotonAccionCentral. Los tabs ocultos (tabBarButton null)
        // nunca emiten tabPress.
        screenListeners={{ tabPress: hapticTab }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          // Fondo de la barra (mismo color que styles.tabBar, visualmente no
          // cambia nada) + un View transparente que es lo que mide el
          // tutorial relacional (último paso, "tus 5 accesos"): desde el
          // tope de la barra hasta la base de las etiquetas (ver
          // altoHastaEtiquetas), con margen lateral. Hasta medir la
          // etiqueta, cubre la barra entera.
          tabBarBackground: () => (
            <View pointerEvents="none" style={styles.tabBarFondo}>
              <View
                ref={tourBarra.ref}
                onLayout={tourBarra.onLayout}
                collapsable={false}
                style={[
                  styles.tabBarAreaTour,
                  altoHastaEtiquetas !== null ? { height: altoHastaEtiquetas } : { bottom: 0 },
                ]}
              />
            </View>
          ),
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ focused }) => <IconoTab nombre={focused ? "home" : "home-outline"} focused={focused} />,
            tabBarLabel: ({ focused }) => (
              <EtiquetaTab texto="Inicio" focused={focused} onLayout={medirEtiquetaTab} />
            ),
          }}
        >
          {(props) => <HomeScreen {...props} onAbrirNotificaciones={abrirNotificaciones} />}
        </Tab.Screen>

        <Tab.Screen
          name="MiTaller"
          options={{
            tabBarIcon: ({ focused }) => (
              <IconoTab nombre={focused ? "storefront" : "storefront-outline"} focused={focused} />
            ),
            tabBarLabel: ({ focused }) => <EtiquetaTab texto="Mi Taller" focused={focused} />,
            // Si el usuario se fue con el stack apilado en una pantalla hija
            // (ej. MisDatos) y vuelve a entrar por el tab, que arranque
            // siempre desde la lista de Mi Taller, no donde lo dejó.
            unmountOnBlur: true,
          }}
        >
          {() => <MiTallerStackNavigatorConNotificaciones onAbrirNotificaciones={abrirNotificaciones} />}
        </Tab.Screen>

        <Tab.Screen
          name="NuevoAccion"
          component={PantallaVacia}
          options={{
            tabBarButton: () => <BotonAccionCentral onPress={abrirOpciones} />,
          }}
          listeners={{
            tabPress: (e) => e.preventDefault(),
          }}
        />

        <Tab.Screen
          name="Finanzas"
          options={{
            tabBarIcon: ({ focused }) => (
              <IconoTab nombre={focused ? "stats-chart" : "stats-chart-outline"} focused={focused} />
            ),
            tabBarLabel: ({ focused }) => <EtiquetaTab texto="Finanzas" focused={focused} />,
            unmountOnBlur: true,
          }}
        >
          {() => <FinanzasStackNavigatorConNotificaciones onAbrirNotificaciones={abrirNotificaciones} />}
        </Tab.Screen>

        <Tab.Screen
          name="Menu"
          options={{
            tabBarIcon: ({ focused }) => <IconoTab nombre={focused ? "grid" : "grid-outline"} focused={focused} />,
            tabBarLabel: ({ focused }) => <EtiquetaTab texto="Menú" focused={focused} />,
          }}
        >
          {(props) => <MenuScreen {...props} onAbrirNotificaciones={abrirNotificaciones} />}
        </Tab.Screen>

        {/* Sin botón visible: solo navegables por navigation.navigate() de
        forma programática, desde la pantalla Menú o desde el ícono de
        notificaciones del header. */}
        <Tab.Screen
          name="Clientes"
          component={ClientesScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
        <Tab.Screen
          name="Agenda"
          component={AgendaScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
        <Tab.Screen
          name="Soporte"
          component={SoporteScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
        <Tab.Screen
          name="MisDatos"
          component={MisDatosScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
        <Tab.Screen
          name="ConfiguracionFinanzas"
          component={ConfiguracionFinanzasScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
        <Tab.Screen
          name="Presupuesto"
          component={PresupuestoScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
        <Tab.Screen
          name="ConfiguracionStack"
          component={ConfiguracionStackNavigator}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto, unmountOnBlur: true }}
        />
        <Tab.Screen
          name="Notificaciones"
          component={NotificacionesScreen}
          options={{ tabBarButton: () => null, tabBarItemStyle: styles.tabOculto }}
        />
      </Tab.Navigator>
    </>
  );
}

// MiTaller/Finanzas son stacks anidados (para el swipe-back de iOS): su
// pantalla raíz necesita el callback de notificaciones para el header, pero
// las pantallas hijas (MiEquipo, FinanzasCostos, etc.) siguen con su
// ScreenHeader de "volver" de siempre, sin tocar.
//
// MisDatos, ConfiguracionFinanzas y Presupuesto NO están en este stack
// (pedido explícito de Augusto, 2026-09-26): aunque conceptualmente son
// parte de Mi Taller, hay que llegar a ellas desde otro lado sin pasar por
// la pantalla de Mi Taller (MisDatos/ConfiguracionFinanzas desde la pantalla
// Menú del 5to tab; Presupuesto además desde el botón "+" central, ver
// OpcionesNuevoModal/AccionesRapidasContext) — por eso viven como tabs de
// nivel superior sin botón visible, mismo criterio que Clientes/Agenda/
// Soporte más abajo. MisDatos/ConfiguracionFinanzas vuelven con `goBack()`
// (desde 2026-09-27, con backBehavior="history": regresan al Menú, o a
// Configuración si se entró desde "Editar mis datos"); Presupuesto sigue
// volviendo con `navigation.navigate("MiTaller")`. `MiTallerScreen.js` sigue teniendo su
// propio acceso a "Presupuesto" en `ITEMS_MENU` — ese `navigate("Presupuesto")`
// ahora hace bubbling hacia el tab oculto en vez de resolver dentro de este
// stack, mismo resultado visible para el taller.
function MiTallerStackNavigatorConNotificaciones({ onAbrirNotificaciones }) {
  return (
    <MiTallerStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <MiTallerStack.Screen name="MiTaller">
        {(props) => <MiTallerScreen {...props} onAbrirNotificaciones={onAbrirNotificaciones} />}
      </MiTallerStack.Screen>
      <MiTallerStack.Screen name="MiEquipo" component={MiEquipoScreen} />
      <MiTallerStack.Screen name="MisInsumos" component={MisInsumosScreen} />
      <MiTallerStack.Screen name="MisHorarios" component={MisHorariosScreen} />
      <MiTallerStack.Screen name="MisServicios" component={MisServiciosScreen} />
      <MiTallerStack.Screen name="Catalogo" component={CatalogoScreen} />
      <MiTallerStack.Screen name="EditorCatalogo" component={EditorCatalogoScreen} />
    </MiTallerStack.Navigator>
  );
}

function FinanzasStackNavigatorConNotificaciones({ onAbrirNotificaciones }) {
  return (
    <FinanzasStack.Navigator
      initialRouteName="FinanzasHome"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
    >
      <FinanzasStack.Screen name="FinanzasHome">
        {(props) => <FinanzasScreen {...props} onAbrirNotificaciones={onAbrirNotificaciones} />}
      </FinanzasStack.Screen>
      <FinanzasStack.Screen name="FinanzasCostos" component={FinanzasCostosScreen} />
      <FinanzasStack.Screen name="FinanzasRendimiento" component={FinanzasRendimientoScreen} />
      <FinanzasStack.Screen name="FinanzasTendencias" component={FinanzasTendenciasScreen} />
      <FinanzasStack.Screen name="CostosFijos" component={CostosFijosScreen} />
      <FinanzasStack.Screen name="CuentasPorCobrar" component={CuentasPorCobrarScreen} />
    </FinanzasStack.Navigator>
  );
}

// HistorialClientes vive acá, por ENCIMA de todo el Tab.Navigator (no
// anidada dentro de MiTallerStack), porque se llega a ella desde tres
// lugares que no comparten ningún Stack entre sí (Home, la ficha de un
// cliente dentro de Clientes, y el menú de Mi Taller): si viviera dentro de
// un Stack de una sola rama, "volver" solo sabría resolver hacia la raíz de
// ESE Stack, sin importar el origen real (ver el bug que esto arreglaba). Al
// vivir acá arriba, cualquier pantalla puede pedir
// navigation.navigate("HistorialClientes", params) sin indicar navigator —
// React Navigation hace bubbling de la acción hacia arriba hasta
// encontrarla — y los tabs de abajo nunca se resetean ni se desmontan
// mientras tanto, así que un simple navigation.goBack() en
// HistorialClientesScreen siempre vuelve a la pantalla real desde la que se
// entró.
export default function DashboardNavigator() {
  return (
    <>
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <RootStack.Screen name="Dashboard" component={DashboardTabs} />
      <RootStack.Screen name="HistorialClientes" component={HistorialClientesScreen} />
    </RootStack.Navigator>
    <AccionesRapidasModales />
    {/* Fuera del Stack a propósito, mismo criterio que HistorialClientes de
    arriba pero todavía más arriba: tiene que poder mostrarse sin importar
    en qué pantalla/tab esté parado el taller cuando finaliza un trabajo
    (Home o Agenda) — ver DataContext.insumosParaRenovar. */}
    <RenovacionInsumoModal />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    paddingTop: 6,
    backgroundColor: colors.surface,
    borderTopColor: colors.borderSubtle,
  },
  tabBarFondo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
  tabBarAreaTour: {
    position: "absolute",
    top: 0,
    left: MARGEN_LATERAL_TOUR_BARRA,
    right: MARGEN_LATERAL_TOUR_BARRA,
  },
  tabLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
  tabOculto: {
    display: "none",
  },
  centralWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  centralBoton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginTop: -22,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
});
