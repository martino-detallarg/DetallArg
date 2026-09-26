import { createNavigationContainerRef } from "@react-navigation/native";

// AccionesRapidasContext (el "+" central) dispara `navigation.navigate(...)`
// desde un Provider que vive por ENCIMA del Tab.Navigator (ver App.js:
// <AccionesRapidasProvider><DashboardNavigator /></AccionesRapidasProvider>,
// hermano del RootStack.Navigator, no descendiente de ningún Screen) — ahí
// el hook normal `useNavigation()` no tiene ningún NavigationContext cerca
// para encontrar. Este ref, pasado a <NavigationContainer ref={...}> en
// App.js, es el mecanismo oficial de React Navigation para navegar desde
// fuera del árbol de pantallas.
export const navigationRef = createNavigationContainerRef();
