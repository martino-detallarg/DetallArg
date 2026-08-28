import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ClientesScreen from "../screens/ClientesScreen";
import AgendaScreen from "../screens/AgendaScreen";
import MiTallerScreen from "../screens/MiTallerScreen";
import MisDatosScreen from "../screens/MisDatosScreen";
import MisInsumosScreen from "../screens/MisInsumosScreen";
import MisServiciosScreen from "../screens/MisServiciosScreen";
import CatalogoScreen from "../screens/CatalogoScreen";
import MiEquipoScreen from "../screens/MiEquipoScreen";
import FinanzasScreen from "../screens/FinanzasScreen";
import CostosFijosScreen from "../screens/CostosFijosScreen";
import NotificacionesScreen from "../screens/NotificacionesScreen";
import SoporteScreen from "../screens/SoporteScreen";
import MisHorariosScreen from "../screens/MisHorariosScreen";
import ConfiguracionScreen from "../screens/ConfiguracionScreen";
import DocumentoLegalScreen from "../screens/DocumentoLegalScreen";
import DrawerContent from "../components/DrawerContent";
import { colors } from "../theme";

const Drawer = createDrawerNavigator();
const MiTallerStack = createNativeStackNavigator();
const FinanzasStack = createNativeStackNavigator();
const ConfiguracionStack = createNativeStackNavigator();

// Documentos legales sin contenido real todavía: ambos reusan la misma
// pantalla genérica (ver DocumentoLegalScreen.js), solo cambia el título.
const PANTALLAS_LEGAL = [
  { ruta: "Terminos", titulo: "Términos y condiciones" },
  { ruta: "Privacidad", titulo: "Política de privacidad" },
];

// Estos 3 stacks anidados existen solo para darle a sus pantallas hijas el
// gesto nativo de iOS de "deslizar desde el borde para volver" (viene gratis
// de native-stack, que en iOS corre sobre UINavigationController). El Drawer
// no tiene noción de pila, así que ese gesto no existe si las pantallas son
// hermanas planas del Drawer — de ahí la necesidad de anidar un Stack por
// cada grupo pantalla-padre + pantallas-hijas con botón "volver".
// headerShown en false porque cada pantalla ya dibuja su propio
// ScreenHeader/WizardHeader.
function MiTallerStackNavigator() {
  return (
    <MiTallerStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <MiTallerStack.Screen name="MiTaller" component={MiTallerScreen} />
      <MiTallerStack.Screen name="MisDatos" component={MisDatosScreen} />
      <MiTallerStack.Screen name="MiEquipo" component={MiEquipoScreen} />
      <MiTallerStack.Screen name="MisInsumos" component={MisInsumosScreen} />
      <MiTallerStack.Screen name="MisHorarios" component={MisHorariosScreen} />
      <MiTallerStack.Screen name="MisServicios" component={MisServiciosScreen} />
      <MiTallerStack.Screen name="Catalogo" component={CatalogoScreen} />
    </MiTallerStack.Navigator>
  );
}

function FinanzasStackNavigator() {
  return (
    <FinanzasStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <FinanzasStack.Screen name="Finanzas" component={FinanzasScreen} />
      <FinanzasStack.Screen name="CostosFijos" component={CostosFijosScreen} />
    </FinanzasStack.Navigator>
  );
}

function ConfiguracionStackNavigator() {
  return (
    <ConfiguracionStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <ConfiguracionStack.Screen name="Configuracion" component={ConfiguracionScreen} />
      {PANTALLAS_LEGAL.map(({ ruta, titulo }) => (
        <ConfiguracionStack.Screen
          key={ruta}
          name={ruta}
          component={DocumentoLegalScreen}
          initialParams={{ titulo }}
        />
      ))}
    </ConfiguracionStack.Navigator>
  );
}

export default function DashboardNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        // Global: el menú lateral solo se abre tocando el ícono de
        // hamburguesa (ScreenHeader -> navigation.openDrawer()), nunca con
        // swipe — ese gesto quedó reservado para "volver" dentro de los
        // stacks anidados de arriba.
        swipeEnabled: false,
        drawerStyle: { backgroundColor: colors.surface, width: "80%" },
        overlayColor: "rgba(4, 3, 3, 0.7)",
        // Contenedor de la escena activa del propio Drawer: sin esto, el
        // fondo por defecto (blanco) puede asomar en el destello del
        // gesto/transición antes de que el Stack anidado pinte el suyo.
        sceneStyle: { backgroundColor: colors.bg },
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Clientes" component={ClientesScreen} />
      <Drawer.Screen name="Agenda" component={AgendaScreen} />
      <Drawer.Screen
        name="MiTaller"
        component={MiTallerStackNavigator}
        // Si el usuario se fue con el stack apilado en una pantalla hija
        // (ej. MisDatos) y vuelve a entrar por el drawer, que arranque
        // siempre desde la lista de Mi Taller, no donde lo dejó.
        options={{ unmountOnBlur: true }}
      />
      <Drawer.Screen
        name="Finanzas"
        component={FinanzasStackNavigator}
        options={{ unmountOnBlur: true }}
      />
      <Drawer.Screen name="Notificaciones" component={NotificacionesScreen} />
      <Drawer.Screen name="Soporte" component={SoporteScreen} />
      <Drawer.Screen
        name="Configuracion"
        component={ConfiguracionStackNavigator}
        options={{ unmountOnBlur: true }}
      />
    </Drawer.Navigator>
  );
}
