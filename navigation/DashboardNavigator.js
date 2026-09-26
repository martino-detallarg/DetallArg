import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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
import SeleccionPlanScreen from "../screens/SeleccionPlanScreen";
import DocumentoLegalScreen from "../screens/DocumentoLegalScreen";
import MenuModal from "../components/MenuModal";
import AccionesRapidasModales from "../components/AccionesRapidasModales";
import RenovacionInsumoModal from "../components/RenovacionInsumoModal";
import { useAccionesRapidas } from "../data/AccionesRapidasContext";
import { colors, fonts, shadow } from "../theme";

const Tab = createBottomTabNavigator();
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
      <TouchableOpacity style={styles.centralBoton} onPress={onPress} activeOpacity={0.85}>
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

function EtiquetaTab({ texto, focused }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActivo]}>{texto}</Text>
  );
}

// Pantalla vacía: nunca se llega a montar de verdad porque tabPress siempre
// hace preventDefault() antes de navegar (ver "NuevoAccion" y "Menu" abajo),
// pero un Tab.Screen necesita sí o sí un component válido.
function PantallaVacia() {
  return null;
}

// Los 5 tabs de abajo (pedido explícito de Augusto: Home / Mi Taller / "+"
// central / Finanzas / menú de hamburguesa con "las cosas que sobran") +
// las pantallas que ya no tienen tab propio pero siguen siendo navegables
// desde el menú del 5to tab (Clientes, Agenda, Soporte, Configuración) o
// desde el ícono de notificaciones del header (Notificaciones) — quedan
// registradas como tabs SIN botón visible (tabBarButton null +
// tabBarItemStyle display:none) para no perder ni el historial de
// navegación ni la posibilidad de un navigation.navigate() plano desde
// cualquier pantalla.
function DashboardTabs({ navigation }) {
  const { abrirOpciones } = useAccionesRapidas();
  const [menuVisible, setMenuVisible] = useState(false);

  // `navigation` acá es el nav del RootStack para la screen "Dashboard" (no
  // el del Tab.Navigator que se renderiza más abajo, adentro de ESTE mismo
  // componente) — un `navigate("Notificaciones")` a secas buscaría esa ruta
  // entre las screens del RootStack ("Dashboard"/"HistorialClientes") y
  // fallaría, porque "Notificaciones" vive un nivel más abajo, adentro del
  // Tab.Navigator. Por eso hace falta la forma anidada `{screen, params}`
  // para todo lo que vive DENTRO del Tab.Navigator — "HistorialClientes" es
  // la única excepción real: vive arriba, como hermana de "Dashboard" en el
  // RootStack (ver el comentario de esa ruta más abajo), así que a esa sí
  // hay que navegarla directo, sin anidar.
  function abrirNotificaciones() {
    navigation.navigate("Dashboard", { screen: "Notificaciones" });
  }

  function navegarDesdeMenu(ruta) {
    setMenuVisible(false);
    if (ruta === "HistorialClientes") {
      navigation.navigate("HistorialClientes");
    } else {
      navigation.navigate("Dashboard", { screen: ruta });
    }
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ focused }) => <IconoTab nombre={focused ? "home" : "home-outline"} focused={focused} />,
            tabBarLabel: ({ focused }) => <EtiquetaTab texto="Inicio" focused={focused} />,
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
          component={PantallaVacia}
          options={{
            tabBarIcon: ({ focused }) => <IconoTab nombre="menu-outline" focused={focused} />,
            tabBarLabel: ({ focused }) => <EtiquetaTab texto="Menú" focused={focused} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setMenuVisible(true);
            },
          }}
        />

        {/* Sin botón visible: solo navegables por navigation.navigate() de
        forma programática, desde el MenuModal o desde el ícono de
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

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} onNavegar={navegarDesdeMenu} />
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
// la pantalla de Mi Taller (MisDatos/ConfiguracionFinanzas desde el menú de
// hamburguesa; Presupuesto además desde el botón "+" central, ver
// OpcionesNuevoModal/AccionesRapidasContext) — por eso viven como tabs de
// nivel superior sin botón visible, mismo criterio que Clientes/Agenda/
// Soporte más abajo. Sus pantallas ya navegaban de vuelta con
// `navigation.navigate("MiTaller")` (no `goBack()`), así que "volver" sigue
// funcionando igual sin cambios ahí. `MiTallerScreen.js` sigue teniendo su
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
