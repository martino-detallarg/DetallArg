# Estado del proyecto — DetallArg App

Documento de referencia para nuevos colaboradores. Describe el estado real del código a la fecha de escritura (agosto 2026), basado en inspección directa de los archivos del repo, no en supuestos.

---

## 1. Stack tecnológico

App móvil hecha con **Expo** (React Native), sin backend propio todavía. Todo el código es JavaScript plano (`.js` con JSX) — **no hay TypeScript** configurado en el proyecto.

### Núcleo
| Paquete | Versión | Uso |
|---|---|---|
| `expo` | `~54.0.37` (instalado: `54.0.37`) | Framework/runtime base |
| `react` | `19.1.0` | — |
| `react-native` | `0.81.5` | — |
| `babel-preset-expo` | `~54.0.10` | Config de Babel |

> **Importante (viene marcado en `AGENTS.md`):** Expo cambió mucho de versión a versión. Antes de escribir código nuevo hay que revisar la documentación versionada exacta en `https://docs.expo.dev/versions/v57.0.0/` — no asumir comportamientos de versiones viejas de Expo/RN.

### Navegación
- `@react-navigation/native` `^7.3.16`
- `@react-navigation/drawer` `^7.13.8` — es el único tipo de navegador de React Navigation usado (menú lateral tipo "hamburguesa"). No hay stack navigator ni bottom tabs.
- `react-native-screens` `~4.16.0`, `react-native-safe-area-context` `~5.6.0`, `react-native-gesture-handler` `~2.28.0` — dependencias que pide React Navigation por debajo.

### Animaciones / gestos
- `react-native-reanimated` `~4.1.1`
- `react-native-worklets` `0.5.1` (dependencia que exige Reanimated 4)
- Configurado como plugin de Babel (`babel.config.js`: `"react-native-reanimated/plugin"`).

### Gráficos e íconos
- `react-native-svg` `15.12.1` — usado a mano en `components/wizard/FuelGauge.js` para dibujar el medidor de nafta (arco SVG con gesto táctil vía `PanResponder`).
- `@expo/vector-icons` `^15.0.3` — usa los sets `Ionicons` y `MaterialCommunityIcons` en toda la app.

### Fuentes
- `@expo-google-fonts/archivo` `^0.4.2` (Archivo ExtraBold 800 / Black 900 — títulos)
- `@expo-google-fonts/inter` `^0.4.2` (Inter 400/500/600/700 — texto de cuerpo)
- `@expo-google-fonts/jetbrains-mono` `^0.4.1` (JetBrains Mono 400/500 — labels, badges, contadores de paso)
- `expo-font` `~14.0.12` — carga las fuentes vía `useFonts` en `App.js`.
- `expo-splash-screen` `~31.0.13` — mantiene la splash nativa visible hasta que las fuentes cargan (`preventAutoHideAsync` / `hideAsync`).

### Otros
- `expo-image-picker` `~17.0.11` — usado en el wizard de Trabajo Nuevo para adjuntar fotos de daños del vehículo.
- `expo-status-bar` `~3.0.9` — barra de estado, seteada en `style="light"` (texto claro) en casi todas las pantallas.

### Lo que **no** hay
- Sin gestor de estado externo (Redux, Zustand, Jotai, etc.) — todo es `useState`/`Context` de React puro.
- Sin cliente HTTP (`axios`, `fetch` a APIs propias) — se verificó por grep, no hay ninguna llamada de red en el código.
- Sin Supabase, Firebase, ni ningún SDK de backend.
- Sin testing configurado (no hay Jest ni ningún otro framework de tests en `package.json`).
- Sin ESLint/Prettier configurado (no hay archivos `.eslintrc*` ni `.prettierrc*` en el repo).
- Gestor de paquetes: **npm** (hay `package-lock.json`, no hay `yarn.lock` ni `pnpm-lock.yaml`).

---

## 2. Estructura de carpetas y archivos

```
detallarg-app/
├── App.js                     # Punto de entrada de la UI: carga fuentes, splash, y el switch manual entre pantallas (splash/login/signup/verify-email/app)
├── index.js                   # Entry point real de Expo (registerRootComponent)
├── app.json                   # Config de Expo (nombre, ícono, splash, plugins de expo-image-picker/expo-font)
├── babel.config.js            # Preset de Expo + plugin de Reanimated
├── theme.js                   # Design tokens centralizados: colores, radios, sombras, fuentes
├── package.json / package-lock.json
├── AGENTS.md                  # Instrucciones para agentes de IA (aviso sobre versión de Expo)
├── CLAUDE.md                  # Solo referencia a AGENTS.md
│
├── assets/                    # Íconos de la app, splash icon, logos (blanco/negro) en PNG
│
├── data/                      # "Backend" simulado — toda la data vive acá, en memoria, repartida en un Context por dominio (ver sección 5)
│   ├── DataContext.js         # Context "resto": misInsumos[] y costosFijos[] + funciones CRUD-ish
│   ├── ClienteContext.js      # Context de clientes[], cada uno con vehiculos[] anidados
│   ├── TurnoContext.js        # Context de turnos[] (agregarTurno, actualizarTurno/actualizarEstadoTrabajo, getTurnoById)
│   ├── PedidoContext.js       # Context de pedidos a proveedores (no detallado en este documento)
│   ├── TallerContext.js       # Context de datos del taller (no detallado en este documento)
│   ├── mockData.js            # turnosIniciales + ESTADOS_TRABAJO + helper separarMarcaModelo() (ya no exporta clientes/autos, migrados a ClienteContext)
│   ├── mockInsumos.js / mockFinanzas.js / mockTaller.js  # Datos iniciales de insumos, costos fijos y taller
│   ├── tiposDanio.js          # Catálogo de tipos de daño para el diagrama de inspección
│   └── mockUser.js            # Usuario "logueado" hardcodeado (usuarioActual)
│
├── navigation/
│   └── DashboardNavigator.js  # Drawer navigator: Home, Clientes, y 8 pantallas placeholder
│
├── components/                # Componentes reutilizables, uno por archivo
│   ├── Button.js               # Botón primario/secundario con loading/disabled
│   ├── Input.js                 # Input de texto con label, error, y toggle de mostrar/ocultar password
│   ├── Logo.js                  # Logo de la marca (imagen)
│   ├── ScreenHeader.js           # Header superior con botón de menú + logo, usado en pantallas del drawer
│   ├── StatCard.js               # Tarjeta de estadística (usada en Home: "Turnos de hoy", "Ingresos del mes")
│   ├── TurnoCard.js               # Tarjeta de turno en la lista de Home
│   ├── DetalleTurnoModal.js        # Modal de solo lectura con ficha de cliente + auto de un turno
│   ├── ClienteDetalleModal.js       # Modal para VER y EDITAR un cliente y sus vehículos
│   ├── ClienteNuevoSubmenu.js        # Modal bottom-sheet: elegir "Cliente nuevo" vs "Vehículo nuevo"
│   ├── OpcionesNuevoModal.js          # Modal bottom-sheet del botón "+" de Home: "Cliente nuevo" vs "Trabajo nuevo"
│   ├── DrawerContent.js               # Contenido custom del menú lateral (perfil, links, cerrar sesión)
│   └── wizard/                        # Sub-componentes específicos de los wizards de "Trabajo nuevo"
│       ├── WizardHeader.js             # Header compartido de todos los wizards: back, título, "paso/total", barra de progreso
│       ├── FuelGauge.js                 # Medidor de nafta dibujado a mano con SVG + gesto táctil (arco 0-180°)
│       └── DamageDiagram.js              # Diagrama genérico de auto (frente/atrás/laterales/techo) para marcar daños
│
├── screens/
│   ├── SplashScreen.js         # Pantalla de carga inicial (1.5s, luego pasa a Login)
│   ├── LoginScreen.js           # Login con validación de formato (no autentica contra nada real)
│   ├── SignupScreen.js           # Registro con validación de formato (no crea cuenta real)
│   ├── VerifyEmailScreen.js       # Pantalla "verificá tu email" con botón "reenviar" simulado
│   ├── HomeScreen.js               # Dashboard principal (turnos de hoy, stats, FAB "+")
│   ├── ClientesScreen.js            # Listado + búsqueda de clientes, abre ClienteDetalleModal
│   ├── PlaceholderScreen.js          # Pantalla genérica "Próximamente" reusada por las 8 rutas placeholder del drawer
│   │
│   ├── nuevoCliente/                 # Wizard de "Cliente nuevo" / "Vehículo nuevo"
│   │   ├── NuevoClienteWizard.js      # Componente contenedor con la máquina de estados del wizard
│   │   ├── DatosClienteStep.js         # Paso: datos del cliente (nombre, teléfono, dirección)
│   │   ├── DatosVehiculoStep.js         # Paso: datos del vehículo (patente, marca/modelo, color, km, obs)
│   │   ├── SeleccionarClienteStep.js     # Paso: elegir un cliente existente de una lista con buscador (compartido también por Trabajo Nuevo)
│   │   ├── SeleccionarVehiculoStep.js     # Paso: elegir un vehículo de un cliente (compartido también por Trabajo Nuevo)
│   │   └── PreguntaTrabajoStep.js          # Paso final: "¿Querés cargar un trabajo ahora?" (agregado recientemente)
│   │
│   └── trabajoNuevo/                  # Wizard de "Trabajo nuevo"
│       ├── TrabajoNuevoWizard.js       # Componente contenedor con la máquina de estados del wizard
│       ├── DatosServicioStep.js         # Paso: tipo de servicio (chips), fecha, hora, tiempo estimado, observaciones
│       ├── SeleccionVehiculoStep.js      # Paso de "inspección": tipo de vehículo, subdivisión, nivel de nafta, diagrama de daños, fotos
│       └── ConfirmacionTrabajoStep.js     # Paso final: pantalla de "¡Trabajo guardado!" que se auto-cierra a los 1.8s
│
└── .claude/                    # Config local de Claude Code (settings.json, settings.local.json)
```

No hay carpetas `ios/` ni `android/` en el repo (están en `.gitignore` — se generan si se hace un build nativo/prebuild).

---

## 3. Funcionalidades ya implementadas y funcionando

**Flujo de arranque y autenticación (front-end únicamente, ver sección 5):**
- Splash screen con logo (1.5s) → Login.
- Login con validación de formato de email y contraseña no vacía.
- Registro (Signup) con validación de nombre, email, teléfono, contraseña (mínimo 6 caracteres) y confirmación de contraseña.
- Pantalla de "Verificá tu email" con botón de reenvío simulado (cambia texto por 3s).
- Logout desde el menú lateral, que vuelve a la pantalla de Login.

**Dashboard / Home (`HomeScreen.js`):**
- Lista de "Turnos de hoy" ordenados por hora, con tarjeta (`TurnoCard`) que muestra hora, cliente, auto y estado (Pendiente / En proceso / Terminado, con color distinto por estado).
- Dos `StatCard`: cantidad de turnos de hoy e ingresos del mes (este último es un número fijo hardcodeado, no calculado — ver sección 4).
- Botón flotante "+" que abre un modal de opciones: "Cliente nuevo" o "Trabajo nuevo".
- Modal de detalle de turno (`TrabajoDetalleModal.js`, antes `DetalleTurnoModal.js`): ficha del cliente y del auto asociado, más un selector de estado (chips con las etapas de `ESTADOS_TRABAJO`) para avanzar o volver el turno de estado — ya **no** es de solo lectura.

**Wizard "Cliente nuevo / Vehículo nuevo" (`screens/nuevoCliente/`):**
- Submenú para elegir si es un cliente 100% nuevo o si se le agrega un vehículo a uno existente.
- Modo "cliente": carga datos del cliente → carga datos del vehículo → se guardan ambos.
- Modo "vehículo": elige un cliente existente (con buscador) → carga datos del vehículo → se guarda.
- **Cambio reciente:** al terminar de guardar el vehículo, ya no salta directo al wizard de Trabajo Nuevo. Ahora se muestra `PreguntaTrabajoStep` ("¿Querés cargar un trabajo ahora?") con dos botones:
  - "Sí, cargar trabajo" → abre el wizard de Trabajo Nuevo con el cliente/vehículo ya preseleccionados (salteando esos pasos de selección ahí).
  - "No, por ahora no" → cierra el wizard y vuelve a Home. El cliente y el vehículo ya quedaron guardados en ambos casos, porque el guardado ocurre antes de mostrar esta pregunta.
- Validaciones de campos obligatorios en cada paso (nombre/teléfono del cliente, patente/marca-modelo del vehículo), con formateo automático de patente tipo `AB 123 CD`.

**Wizard "Trabajo nuevo" (`screens/trabajoNuevo/`):**
- Si no viene con cliente/vehículo preseleccionados: elegir cliente (buscador) → elegir vehículo de ese cliente.
- Datos del servicio: tipo (chips seleccionables: Lavado exterior, Lavado completo, Pulido, Ceramic coating, Detailing interior), fecha, hora, tiempo estimado, observaciones — todo como texto libre (sin date/time picker nativo).
- Paso de "inspección": elegir tipo de vehículo (Auto/Camioneta/SUV/Moto) y su subdivisión (ej. Sedán, Coupé, etc.), medidor de nivel de nafta interactivo (arco SVG arrastrable), diagrama de daños tocando zonas (frente/atrás/izquierdo/derecho/techo), y opción de adjuntar fotos del daño desde la galería (solo habilitado si se marcó al menos un daño).
- Al finalizar, guarda el turno (vía callback `onGuardarTrabajo` que recibe `HomeScreen`) y muestra una pantalla de confirmación que se auto-cierra.

**Sección Clientes (`ClientesScreen.js`):**
- Listado de todos los clientes con buscador por nombre.
- Cada fila muestra nombre, teléfono y cantidad de vehículos.
- Al tocar un cliente se abre `ClienteDetalleModal`: permite editar sus datos (nombre, teléfono, dirección) y los datos de cada uno de sus vehículos (marca, modelo, patente, color) en la misma pantalla, con botón "Guardar cambios".

**Navegación y menú lateral:**
- Drawer con: Home, Clientes, Configuración, Datos Principales, Mi Equipo, Mis Insumos, Mis Horarios, Mis Servicios, Soporte, Notificaciones.
- Header con nombre de empresa y email del usuario, resaltado de la ruta activa, botón de cerrar sesión.

**Sistema de diseño:**
- Look & feel dark theme, consistente entre todas las pantallas (ver sección 8).

---

## 4. Funcionalidades a medio hacer o pendientes

**A medio hacer:**
- **8 pantallas del drawer son placeholders**: Configuración, Datos Principales, Mi Equipo, Mis Insumos, Mis Horarios, Mis Servicios, Soporte, Notificaciones — todas renderizan el mismo `PlaceholderScreen.js` con un ícono y el texto "Próximamente". No tienen ninguna lógica ni UI propia todavía.
- **Diagrama de daños genérico**: hay un comentario explícito en el código (`SeleccionVehiculoStep.js`) que dice que "por ahora todas las subdivisiones usan el mismo diagrama genérico — más adelante se puede reemplazar por el modelo real de cada una". No hay diagramas específicos por modelo de vehículo.
- **Agenda**: el historial de commits menciona un "módulo de Agenda", pero en el código actual no existe una pantalla de agenda propiamente dicha más allá de la lista de "Turnos de hoy" en Home. No hay vista de calendario, ni de otros días, ni forma de navegar a fechas pasadas/futuras.

**Totalmente pendiente / no implementado:**
- Autenticación real (ver sección 5 y 6) — hoy es 100% simulada.
- Persistencia de datos: todo vive en memoria (React state), se pierde al cerrar sesión o recargar la app.
- **Borrado de turnos:** `TurnoContext.js` no expone ninguna función de delete — solo `agregarTurno`/`actualizarTurno`. Para clientes/vehículos la situación es distinta: `ClienteContext.js` sí expone `eliminarCliente`/`eliminarVehiculo` (no se verificó en esta revisión si ya están conectados a algún botón de la UI de Clientes).
- Cálculo real de ingresos: `INGRESOS_DEL_MES` en `HomeScreen.js` es una constante fija (`1245000`), no se calcula a partir de turnos ni de ningún dato real.
- Recuperación de contraseña: el link "¿Olvidaste tu contraseña?" en `LoginScreen.js` no tiene `onPress` (no hace nada).
- Perfil de usuario editable: `usuarioActual` en `data/mockUser.js` está hardcodeado y no se actualiza con los datos que carga el usuario en Signup.
- Selector nativo de fecha/hora en el wizard de Trabajo Nuevo: hoy fecha y hora son inputs de texto libre, sin validación de formato ni date picker.

---

## 5. Decisiones de arquitectura importantes

**Manejo de estado — patrón de un Context por dominio:**
- Desde agosto de 2026 el estado de negocio ya **no** vive en un único Context genérico. Cada dominio tiene su propio Context + Provider, todos con la misma forma interna (`useState` en memoria, sin `useReducer` ni librería externa, `value` memoizado con `useMemo`):
  - **`data/ClienteContext.js`** (`useClientes()`): clientes, cada uno con sus vehículos **anidados** en `cliente.vehiculos` (ya no hay una tabla `autos` separada). Expone `agregarCliente`, `editarCliente`, `eliminarCliente`, `agregarVehiculo`, `editarVehiculo`, `eliminarVehiculo`, `getClienteById`, `getVehiculoById` (esta última recorre todos los clientes buscando el vehículo por id, para los casos —como un turno— que solo tienen el id a mano).
  - **`data/TurnoContext.js`** (`useTurnos()`): turnos, expone `agregarTurno`, `actualizarTurno`, `actualizarEstadoTrabajo` (atajo sobre `actualizarTurno` para cambiar solo el campo `estado`), `getTurnoById`.
  - **`data/PedidoContext.js`** (`usePedidos()`) y **`data/TallerContext.js`**: mismo patrón, para pedidos a proveedores y datos del taller respectivamente (no se detallan en este documento, fuera del alcance de esta revisión).
  - **`data/DataContext.js`** (`useData()`): quedó como el Context "de lo que sobra" — hoy solo `misInsumos` y `costosFijos` (insumos del taller y costos fijos de Finanzas), con `agregarInsumo`, `agregarCostoFijo`, `actualizarCostoFijo`, `eliminarCostoFijo`. Ya **no** tiene clientes, autos ni turnos.
  - Los cinco Providers se anidan en `App.js`, todos envolviendo solo la parte autenticada de la app (`pantalla === "app"`): `DataProvider > ClienteProvider > TurnoProvider > TallerProvider > PedidoProvider`. El orden de anidado no importa funcionalmente hoy (ningún Context lee de otro directamente), pero si en el futuro alguno necesita datos de otro, hay que anidarlo por debajo del que provee esos datos.
- **Acoplamiento entre dominios vía IDs, no vía Context:** un turno (`TurnoContext`) no contiene el cliente ni el vehículo completos, solo `clienteId`/`autoId` como referencia. Para resolverlos a datos reales hay que llamar a `getClienteById`/`getVehiculoById` de `useClientes()` por separado — son dos Contexts distintos que un mismo componente (hoy, `HomeScreen.js`) tiene que consumir juntos. Si se agrega un campo nuevo a un turno o a un vehículo, hay que revisar ambos Contexts y todos los lugares que cruzan datos de los dos.
- **Al cerrar sesión se destruye todo el estado en memoria** (los cinco Providers se desmontan al salir de `pantalla === "app"`), y al volver a loguearse cada Context arranca de cero con sus datos iniciales — `ClienteContext` arranca **vacío** (`useState([])`, sin mock), mientras que `TurnoContext` sí arranca con `turnosIniciales` de `mockData.js` (ver sección 6, incluye una nota sobre por qué esos turnos de ejemplo quedan con referencias que no resuelven a ningún cliente real).

**Navegación:**
- El flujo superior de pantallas (Splash → Login → Signup → VerifyEmail → App) **no usa React Navigation**. Es un `switch` manual controlado por un `useState("splash")` en `App.js` (variable `pantalla`). Por eso no hay gestos de "volver atrás" nativos ni historial entre esas pantallas — cada transición es una función que cambia ese string.
- Recién dentro de la app autenticada (`pantalla === "app"`) se monta un `NavigationContainer` con un **Drawer Navigator** (`DashboardNavigator.js`) como único navegador. No hay Stack Navigator ni Bottom Tabs.
- Los wizards multi-paso (`NuevoClienteWizard`, `TrabajoNuevoWizard`) y los modales de detalle (`ClienteDetalleModal`, `DetalleTurnoModal`) **tampoco usan React Navigation**: son componentes `<Modal>` nativos de React Native controlados por booleanos de estado local en la pantalla que los abre (`HomeScreen.js` o `ClientesScreen.js`). Cada wizard tiene su propia máquina de estados interna (una variable string `paso`/`fase` que determina qué Step renderizar).

**Backend / base de datos:** no existe ninguno todavía — ver sección 6.

**Autenticación:** no existe ninguna real todavía — ver sección 6. Las pantallas de Login/Signup solo validan formato de campos en el cliente (regex de email, longitud de contraseña, coincidencia de confirmación) y, si pasan la validación, simplemente cambian la pantalla activa. No hay tokens, sesión persistida, ni llamada a ningún servicio.

---

## 6. Backend / base de datos / servicios externos

**No hay ninguno conectado.** Se verificó explícitamente (grep sobre todo el código fuente) que no existen llamadas a `fetch`, `axios`, ni SDKs de Supabase, Firebase, o cualquier otro servicio. Tampoco hay uso de `process.env` en ningún archivo.

Toda la "data" de la app es mock, definida en archivos estáticos y repartida por dominio (ver sección 5):
- `data/mockData.js`: ya **no** exporta clientes ni autos (eso se movió a `ClienteContext.js`, que arranca vacío). Exporta `turnosIniciales` (3 turnos de ejemplo), `ESTADOS_TRABAJO` (`["Pendiente", "En proceso", "Finalizado", "Entregado"]`, el orden de etapas de un trabajo) y el helper `separarMarcaModelo(texto)` que parte un string tipo "Volkswagen Golf" en `{ marca: "Volkswagen", modelo: "Golf" }`.
  - **Detalle a tener en cuenta:** como `ClienteContext` arranca vacío, los `clienteId`/`autoId` (`c1`, `c2`, `a1`, `a3`, `a2`) de los turnos de ejemplo en `turnosIniciales` no resuelven a ningún cliente/vehículo real hasta que se cargue uno desde la UI. `TurnoCard` ya contempla ese caso mostrando "Cliente sin datos" / "Auto sin datos" (hay un comentario explícito sobre esto en `mockData.js`).
- `data/mockInsumos.js`, `data/mockFinanzas.js`, `data/mockTaller.js`: datos iniciales de insumos, costos fijos y taller respectivamente (no detallados en este documento).
- `data/mockUser.js`: un único usuario hardcodeado (`usuarioActual`), usado para mostrar el nombre en el saludo de Home y el email/empresa en el drawer.

Cualquier dato que se carga desde la UI (nuevo cliente, nuevo vehículo, nuevo turno) se guarda **solo en memoria**, vía el `useState` del Context de su dominio correspondiente. No hay ninguna base de datos local (no hay AsyncStorage, SQLite, ni Realm) ni remota.

---

## 7. Variables de entorno o configuración necesaria

**Hoy no hace falta configurar ninguna variable de entorno para correr el proyecto.** No existe ningún archivo `.env` en el repo, y no se encontró ningún uso de `process.env` en el código — confirmado por búsqueda directa en el código fuente.

El `.gitignore` ya tiene contemplado un patrón `.env*.local` por si en el futuro se agrega algún archivo de entorno, pero actualmente no se usa.

Lo único que hace falta para correr el proyecto localmente es tener el entorno de Expo funcionando (ver sección 10) — no hay claves de API, ni credenciales, ni configuración de terceros que preparar.

---

## 8. Convenciones que se están siguiendo

**Idioma:** todo el código está en **español** (nombres de variables, funciones, componentes, comentarios y textos de la UI). Ejemplos: `handleFinalizarVehiculo`, `agregarCliente`, `onAtras`, `onContinuar`, `esVehiculoNuevo`. Un colaborador nuevo debería seguir esta misma convención al agregar código, no mezclar inglés.

**Nombres de archivos:**
- Componentes y pantallas: `PascalCase.js` (ej. `Button.js`, `HomeScreen.js`, `ClienteDetalleModal.js`).
- Carpetas de flujos multi-paso: `camelCase/` (ej. `screens/nuevoCliente/`, `screens/trabajoNuevo/`).
- Los archivos "Step" siguen el patrón `<Nombre>Step.js` y viven dentro de la carpeta del wizard al que pertenecen.

**Estilo de componentes:**
- 100% componentes funcionales con hooks — no hay clases en ningún lado.
- Cada archivo define su propio `StyleSheet.create({...})` al final del archivo — no hay hojas de estilo separadas ni CSS-in-JS externo.
- Los estilos consumen los tokens de `theme.js` (colores, radios, sombras, fuentes) en vez de valores hardcodeados, salvo casos puntuales (ej. algún color de overlay `rgba(4, 3, 3, 0.7)` repetido en los modales bottom-sheet).

**Patrón de los wizards** (`NuevoClienteWizard.js`, `TrabajoNuevoWizard.js`):
- Un componente "contenedor" mantiene el estado global del flujo (`paso`/`fase` como string, y los datos acumulados) y decide qué "Step" renderizar según ese estado.
- Cada Step es "controlado": recibe `datos`, `onCambiar` (para actualizar datos), `onAtras`, y `onContinuar`/`onFinalizar`/`onSeleccionar` según corresponda — no maneja su propio estado global, solo estado de UI local (ej. errores de validación).
- Todos los Steps con formularios usan `WizardHeader` (título + contador "paso/total" + barra de progreso) y el componente `Input` para los campos de texto.

**Componentes base reutilizados en toda la app:**
- `Button` (variantes `"primary"` / `"secondary"`, soporta `loading` y `disabled`).
- `Input` (label, error, soporte de password con ícono de mostrar/ocultar, multiline).
- IDs de entidades nuevas se generan como `` `${prefijo}${Date.now()}` `` (`c...` clientes, `v...` vehículos —antes `a...` autos, cambió al migrar a `ClienteContext`—, `t...` turnos) — no se usa ninguna librería de UUID.

**Sistema de diseño (`theme.js`):**
- **Tema oscuro exclusivamente.** Paleta:
  - `bg`: `#040303` (fondo, casi negro)
  - `surface`: `#0E1315`, `surface2`: `#182023` (superficies elevadas, tarjetas)
  - `textPrimary`: `#FFFFFF`, `textSecondary`: `#C0C9CA`, `textMuted`: `#758386`
  - `accent`: `#529CC1` (azul, color de marca), `accentLight`: `#72B2D5`, `accentDark`: `#36494E`
  - `borderSubtle`: `rgba(192, 201, 202, 0.12)`, `borderAccent`: `rgba(82, 156, 193, 0.38)`
  - `error`: `#B5564A`
- `radii`: `card: 20`, `button: 14`.
- `continuousCorner`: `{ borderCurve: "continuous" }` — esquinas estilo "squircle" de iOS, se aplica siempre (en Android se ignora sin romper nada).
- `shadow` / `shadowSubtle`: dos niveles de sombra predefinidos (el "subtle" para elementos chicos repetidos como inputs).
- `fonts`: `heading` (Archivo ExtraBold), `headingBlack` (Archivo Black, poco usado), `body`/`bodyMedium`/`bodySemiBold`/`bodyBold` (familia Inter), `mono`/`monoMedium` (JetBrains Mono, usado para labels en mayúscula, badges de estado y contadores tipo "2/3").

---

## 9. Bugs conocidos o cosas pendientes de arreglar

- **Inconsistencia en `app.json`:** `"userInterfaceStyle": "light"` está seteado, pero toda la UI está diseñada exclusivamente en modo oscuro (`colors.bg` casi negro, `StatusBar style="light"` en todas las pantallas). Esto puede afectar cómo el sistema operativo trata la interfaz nativa (splash screen, controles del sistema) en algunos casos. Habría que revisar si conviene cambiarlo a `"dark"` o dejarlo así intencionalmente.
- **Sin borrado de turnos:** ver detalle en sección 4 (`TurnoContext.js` no expone función de delete; clientes/vehículos sí tienen `eliminarCliente`/`eliminarVehiculo` en `ClienteContext.js`, aunque no se verificó si están conectados a la UI).
- **`separarMarcaModelo` es ingenuo:** parte el string por espacios y asume que la primera palabra es la marca y el resto el modelo (`data/mockData.js`). Un input como "BMW" (sin modelo) genera `modelo: ""`, y una marca de dos palabras (ej. "Alfa Romeo") se partiría mal (marca: "Alfa", modelo: "Romeo ..."). No hay selector de marca/modelo desde una lista.
- **IDs por `Date.now()`:** en teoría dos registros creados en el mismo milisegundo (poco probable con interacción humana, pero posible en tests automatizados o llamadas programáticas) generarían el mismo ID.
- **Link "¿Olvidaste tu contraseña?" sin funcionalidad:** en `LoginScreen.js` el `TouchableOpacity` no tiene `onPress` asignado.
- **Sin tests ni linting:** no hay ningún framework de testing configurado, ni ESLint/Prettier. Cualquier verificación de calidad de código hoy es 100% manual.
- **`eslint-disable-next-line`** en `ClienteDetalleModal.js` (línea ~32) sobre un `useEffect` con dependencias incompletas a propósito (solo depende de `visible` y `cliente?.id`, no de todo `cliente` ni de `getAutosByClienteId`) — es intencional pero vale la pena que un nuevo colaborador lo tenga presente si toca ese archivo.
- **Ingresos hardcodeados:** `INGRESOS_DEL_MES = 1245000` en `HomeScreen.js` es un valor fijo de ejemplo, no debe confundirse con un cálculo real.

---

## 10. Qué debería saber un colaborador nuevo antes de tocar código

### Cómo levantar el proyecto desde cero

1. **Requisitos previos:** tener Node.js instalado (este entorno de referencia usa Node v24, pero cualquier versión LTS reciente compatible con Expo SDK 54 debería andar) y la app **Expo Go** instalada en el celular (o un simulador/emulador configurado), si se va a probar en dispositivo.
2. Clonar el repo:
   ```bash
   git clone https://github.com/martino-detallarg/DetallArg.git
   cd DetallArg
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Levantar el servidor de desarrollo:
   ```bash
   npm start
   ```
   Esto ejecuta `expo start`. También existen los scripts `npm run android`, `npm run ios` y `npm run web` para abrir directo en cada plataforma.
5. Escanear el QR con Expo Go (Android) o con la cámara (iOS), o presionar `a`/`i`/`w` en la terminal para abrir en emulador/navegador.
6. **No hace falta configurar ninguna variable de entorno ni credencial** (ver sección 7) — el proyecto corre standalone con datos mock.
7. Al abrir la app: Splash → Login. **Cualquier email con formato válido y cualquier contraseña no vacía entran** (no hay autenticación real todavía) — no hace falta un usuario/contraseña específico.

### Convenciones a respetar
- Escribir todo en **español** (nombres de variables, funciones, comentarios, textos de UI) para mantener consistencia con el resto del código.
- Usar siempre los tokens de `theme.js` en vez de colores/tamaños hardcodeados.
- Seguir el patrón existente de componentes funcionales + `StyleSheet.create` al final del archivo.
- Si se agrega un paso nuevo a un wizard, seguir el patrón "controlado" (`datos`, `onCambiar`, `onAtras`, `onContinuar`) en vez de que el Step maneje su propio estado global.
- Antes de escribir código que use APIs de Expo o React Native, revisar la doc versionada de Expo SDK indicada en `AGENTS.md` (`https://docs.expo.dev/versions/v57.0.0/`) en vez de asumir comportamientos de memoria — la API cambia seguido entre versiones de Expo.

### Partes delicadas que no conviene romper sin querer
- **La data está repartida en varios Context (ver sección 5), no en uno solo:** `ClienteContext.js` es la fuente de verdad de clientes/vehículos, `TurnoContext.js` la de turnos. `DataContext.js` ya no tiene nada que ver con ninguno de los dos. Cualquier cambio en la forma de los objetos `cliente`/`vehículo` (en `ClienteContext.js`) o `turno` (en `TurnoContext.js`) hay que propagarlo a todos los lugares que los leen — y como un turno solo guarda `clienteId`/`autoId` como referencia (no los datos completos), cualquier componente que muestre un turno con su cliente/auto (`HomeScreen`, `TurnoCard`, `TrabajoDetalleModal`) necesita consumir **ambos** Contexts (`useTurnos()` + `useClientes()`) a la vez.
- **Los wizards (`NuevoClienteWizard`, `TrabajoNuevoWizard`) se resetean por `useEffect` cuando `visible` pasa a `true`** — si se agrega un nuevo campo de estado a un wizard, hay que acordarse de resetearlo ahí también, o va a persistir de una apertura del modal a la siguiente.
- **El flujo de "Cliente nuevo" → pregunta → "Trabajo nuevo"** (agregado recientemente) depende de que `handleFinalizarVehiculo` en `NuevoClienteWizard.js` guarde el cliente/auto **antes** de mostrar la pregunta — si se reordena esa lógica, hay que asegurarse de que el guardado siga ocurriendo independientemente de si el usuario responde "Sí" o "No".
- **`App.js` es el único lugar donde se decide si el usuario está "autenticado"** (variable `pantalla`). Si en el futuro se conecta un backend real de auth, este es el punto de entrada a modificar (hoy no hay ningún guard real, es solo UI).
