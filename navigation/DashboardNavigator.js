import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import ClientesScreen from "../screens/ClientesScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import DrawerContent from "../components/DrawerContent";
import { colors } from "../theme";

const Drawer = createDrawerNavigator();

const PANTALLAS_PLACEHOLDER = [
  { ruta: "Configuracion", titulo: "Configuración" },
  { ruta: "DatosPrincipales", titulo: "Datos Principales" },
  { ruta: "MiEquipo", titulo: "Mi Equipo" },
  { ruta: "MisInsumos", titulo: "Mis Insumos" },
  { ruta: "MisHorarios", titulo: "Mis Horarios" },
  { ruta: "MisServicios", titulo: "Mis Servicios" },
  { ruta: "Soporte", titulo: "Soporte" },
  { ruta: "Notificaciones", titulo: "Notificaciones" },
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
      {PANTALLAS_PLACEHOLDER.map(({ ruta, titulo }) => (
        <Drawer.Screen
          key={ruta}
          name={ruta}
          component={PlaceholderScreen}
          initialParams={{ titulo }}
        />
      ))}
    </Drawer.Navigator>
  );
}
