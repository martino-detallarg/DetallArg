import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import ClientesScreen from "../screens/ClientesScreen";
import AgendaScreen from "../screens/AgendaScreen";
import MiTallerScreen from "../screens/MiTallerScreen";
import MisDatosScreen from "../screens/MisDatosScreen";
import MisInsumosScreen from "../screens/MisInsumosScreen";
import MisServiciosScreen from "../screens/MisServiciosScreen";
import MiEquipoScreen from "../screens/MiEquipoScreen";
import FinanzasScreen from "../screens/FinanzasScreen";
import CostosFijosScreen from "../screens/CostosFijosScreen";
import NotificacionesScreen from "../screens/NotificacionesScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import DrawerContent from "../components/DrawerContent";
import { colors } from "../theme";

const Drawer = createDrawerNavigator();

// Pantallas del menú del drawer que todavía no tienen funcionalidad propia.
const PANTALLAS_PLACEHOLDER = [
  { ruta: "Configuracion", titulo: "Configuración" },
  { ruta: "Soporte", titulo: "Soporte" },
];

// Pantallas a las que solo se llega desde adentro de "Mi Taller", no están
// listadas como ítems propios del drawer.
const PANTALLAS_MI_TALLER_PLACEHOLDER = [
  { ruta: "MisHorarios", titulo: "Mis Horarios", volverA: "MiTaller" },
];

export default function DashboardNavigator({ onLogout }) {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.surface, width: "80%" },
        overlayColor: "rgba(4, 3, 3, 0.7)",
      }}
      drawerContent={(props) => <DrawerContent {...props} onLogout={onLogout} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Clientes" component={ClientesScreen} />
      <Drawer.Screen name="Agenda" component={AgendaScreen} />
      <Drawer.Screen name="MiTaller" component={MiTallerScreen} />
      <Drawer.Screen name="Finanzas" component={FinanzasScreen} />
      <Drawer.Screen name="CostosFijos" component={CostosFijosScreen} />
      <Drawer.Screen name="MisDatos" component={MisDatosScreen} />
      <Drawer.Screen name="MisInsumos" component={MisInsumosScreen} />
      <Drawer.Screen name="MisServicios" component={MisServiciosScreen} />
      <Drawer.Screen name="MiEquipo" component={MiEquipoScreen} />
      <Drawer.Screen name="Notificaciones" component={NotificacionesScreen} />
      {PANTALLAS_PLACEHOLDER.map(({ ruta, titulo }) => (
        <Drawer.Screen
          key={ruta}
          name={ruta}
          component={PlaceholderScreen}
          initialParams={{ titulo }}
        />
      ))}
      {PANTALLAS_MI_TALLER_PLACEHOLDER.map(({ ruta, titulo, volverA }) => (
        <Drawer.Screen
          key={ruta}
          name={ruta}
          component={PlaceholderScreen}
          initialParams={{ titulo, volverA }}
        />
      ))}
    </Drawer.Navigator>
  );
}
