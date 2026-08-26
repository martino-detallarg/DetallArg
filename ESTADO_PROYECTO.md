# Estado del proyecto — DetallArg App

Documento de referencia para nuevos colaboradores. Describe el estado real del código a la fecha de escritura (agosto 2026), basado en inspección directa de los archivos del repo, no en supuestos.

---

## 1. Stack tecnológico

App móvil hecha con **Expo** (React Native), con **Supabase** (Postgres + Auth + Storage) como backend — conectado para autenticación, taller/horarios, clientes/vehículos y equipo (ver sección 6); el resto de los datos de negocio (turnos, servicios, insumos, pedido) todavía es mock en memoria. Todo el código es JavaScript plano (`.js` con JSX) — **no hay TypeScript** configurado en el proyecto.

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
- `@react-navigation/drawer` `^7.13.8` — menú lateral tipo "hamburguesa", navegador raíz de la app autenticada.
- `@react-navigation/native-stack` `^7.18.9` — anidado dentro del Drawer para los grupos pantalla-padre + pantallas-hijas (Mi Taller, Finanzas, Configuración), da el gesto nativo de swipe-back de iOS (ver sección 5). No hay Bottom Tabs.
- `react-native-screens` `~4.16.0`, `react-native-safe-area-context` `~5.6.0`, `react-native-gesture-handler` `~2.28.0` — dependencias que pide React Navigation por debajo; `gesture-handler` además se usa a mano en `components/wizard/SwipeVolver.js` (swipe-back manual de los wizards, ver sección 5).

### Animaciones / gestos
- `react-native-reanimated` `~4.1.1`
- `react-native-worklets` `0.5.1` (dependencia que exige Reanimated 4)
- Configurado como plugin de Babel (`babel.config.js`: `"react-native-reanimated/plugin"`).

### Gráficos e íconos
- `react-native-svg` `15.12.1` — usado a mano (sin librería de charts) en varios lugares: `components/wizard/FuelGauge.js` (medidor de nafta, arco SVG con gesto táctil vía `PanResponder`), `components/GraficoDonut.js` y `components/GraficoBarras.js` (gráficos de la pantalla Finanzas), y los diagramas de check-in visual — el genérico de Frente (`components/wizard/DamageDiagram.js`) y el de paneles reales por carrocería (`components/diagrams/vehicles/PickupCabinaSimpleDiagram.js`).
- `@expo/vector-icons` `^15.0.3` — usa los sets `Ionicons` y `MaterialCommunityIcons` en toda la app.

### Fuentes
- `@expo-google-fonts/archivo` `^0.4.2` (Archivo ExtraBold 800 / Black 900 — títulos)
- `@expo-google-fonts/inter` `^0.4.2` (Inter 400/500/600/700 — texto de cuerpo)
- `@expo-google-fonts/jetbrains-mono` `^0.4.1` (JetBrains Mono 400/500 — labels, badges, contadores de paso)
- `expo-font` `~14.0.12` — carga las fuentes vía `useFonts` en `App.js`.
- `expo-splash-screen` `~31.0.13` — mantiene la splash nativa visible hasta que las fuentes cargan (`preventAutoHideAsync` / `hideAsync`).

### Otros
- `@react-native-community/datetimepicker` `8.4.4` — date/time picker nativo para los campos "Fecha" y "Hora" del wizard de Trabajo Nuevo (`screens/trabajoNuevo/DatosServicioStep.js`) y para "Desde"/"Hasta" de Mis Horarios (`screens/MisHorariosScreen.js`). En Android es el diálogo imperativo del sistema; en iOS se muestra dentro de un bottom-sheet propio (`components/wizard/SelectorFechaModal.js` para fecha, `components/SelectorHoraModal.js` para hora) porque iOS no tiene un modo "diálogo" equivalente para `mode="date"`/`mode="time"`. El valor se sigue guardando como string (`"DD/MM/AAAA"` para fecha, `"HH:MM"` para hora — helpers en `utils/fecha.js`), no como `Date`/ISO.
- `expo-image-picker` `~17.0.11` — usado para adjuntar fotos de daños del vehículo (wizard de Trabajo Nuevo) y para elegir el logo del taller (`components/EditarTallerModal.js`).
- `expo-status-bar` `~3.0.9` — barra de estado, seteada en `style="light"` (texto claro) en todas las pantallas.

### Lo que **no** hay
- Sin gestor de estado externo (Redux, Zustand, Jotai, etc.) — todo es `useState`/`Context` de React puro.
- Sin cliente HTTP (`axios`, `fetch` a APIs propias) — se verificó por grep, no hay ninguna llamada de red en el código.
- `@supabase/supabase-js` sí está instalado (ver sección 6): autenticación real (signup/login/logout/persistencia de sesión, recuperación de contraseña con OTP), `TallerContext` (taller + horarios de atención + logo en Storage), `ClienteContext` (clientes + vehículos) y `EquipoContext` (empleados) ya usan Supabase con CRUD completo. El resto de los Contexts de negocio (turnos, servicios, insumos, pedido) siguen 100% en memoria, sin conectar. Sin Firebase ni ningún otro SDK de backend.
- Sin testing configurado (no hay Jest ni ningún otro framework de tests en `package.json`).
- Sin ESLint/Prettier configurado (no hay archivos `.eslintrc*` ni `.prettierrc*` en el repo).
- Gestor de paquetes: **npm** (hay `package-lock.json`, no hay `yarn.lock` ni `pnpm-lock.yaml`).

---

## 2. Estructura de carpetas y archivos

```
detallarg-app/
├── App.js                     # Punto de entrada de la UI: carga fuentes, envuelve todo en AuthProvider, y adentro (componente FlujoApp) el switch entre pantallas (splash/login/signup/verify-email/app) según haya o no sesión real; anida los 7 Providers de negocio dentro de "app" (ver sección 5 y 6)
├── index.js                   # Entry point real de Expo (registerRootComponent)
├── app.json                   # Config de Expo (nombre, ícono, splash, plugins de expo-font/expo-image-picker/datetimepicker)
├── babel.config.js            # Preset de Expo + plugin de Reanimated
├── theme.js                   # Design tokens centralizados: colores, radios, sombras, fuentes
├── package.json / package-lock.json
├── AGENTS.md                  # Instrucciones para agentes de IA (aviso sobre versión de Expo)
├── CLAUDE.md                  # Solo referencia a AGENTS.md
│
├── assets/                    # Íconos de la app, splash icon, logos (blanco/negro) en PNG
│
├── utils/                      # Helpers puros sin estado, compartidos entre pantallas
│   ├── fecha.js                 # Parseo/formateo de fechas "DD/MM/AAAA" para la Agenda y el date picker del wizard (parsearFechaDDMMAAAA, formatearFechaDDMMAAAA, obtenerDiasDeLaSemana, etc.), parsearHoraHHMM/formatearHoraHHMM para el time picker de Mis Horarios/wizard, y obtenerDiaSemanaHorario (nombre de día "Lunes".."Domingo" a partir de un Date) para cruzar la hora del wizard contra TallerContext.horarios
│   ├── formato.js                # formatearPesos(): Intl.NumberFormat es-AR/ARS compartido por las pantallas de Finanzas
│   ├── auth.js                   # mensajeErrorAuth(): traduce errores de Supabase Auth (en inglés) a español, usado por Login/Signup/VerifyEmail
│   ├── patente.js                 # normalizarPatente/esPatenteValida/formatearPatente: acepta formato viejo (3 letras + 3 números) y Mercosur (2 letras + 3 números + 2 letras), usado por VehiculosClienteModal.js y DatosVehiculoStep.js (wizard de Cliente nuevo)
│   └── errores.js                 # mensajeErrorCarga(error, quePlural): mismo criterio que mensajeErrorAuth pero genérico para cualquier SELECT fallido (Taller, Horarios, Clientes, Equipo, ver sección 6)
│
├── data/                      # Contexts de negocio, en memoria (ver sección 5) + AuthContext.js, que sí es real (Supabase Auth, ver sección 6)
│   ├── DataContext.js         # Context "resto": misInsumos[] (con capacidadTotal/capacidadUnidad por insumo) y costosFijos[] + funciones CRUD-ish, más getInsumoById y descontarInsumos (consumo de stock por receta de servicio, ver sección 5)
│   ├── ClienteContext.js      # Context de clientes[], cada uno con vehiculos[] anidados
│   ├── TurnoContext.js        # Context de turnos[] (agregarTurno, actualizarTurno/actualizarEstadoTrabajo, getTurnoById) — actualizarEstadoTrabajo descuenta insumos y congela `recetaAplicada` al pasar a "Finalizado" (ver sección 5)
│   ├── PedidoContext.js       # Context del carrito de "pedido a proveedor" (agregarAlPedido, quitarDelPedido, estaEnPedido), compartido entre Mis Insumos y Notificaciones
│   ├── TallerContext.js       # Context de datos del taller: nombre/logo, "Mis Datos" del titular, plan de suscripción + límite de empleados (PLANES), y horario de atención (horarios/actualizarHorario, ver Mis Horarios)
│   ├── ServicioContext.js     # Context del catálogo de "Mis Servicios" (agregarServicio, editarServicio, eliminarServicio, getServicioById) — cada servicio incluye duracionEstimada y receta[] de insumos (ver sección 5)
│   ├── EquipoContext.js       # Context de empleados de "Mi Equipo" (agregarEmpleado, editarEmpleado, eliminarEmpleado) — no valida el límite del plan, eso lo hace MiEquipoScreen.js antes de abrir el alta
│   ├── AuthContext.js         # Context de autenticación real (useAuth()): session/user/cargando, signIn/signUp/signOut/resendConfirmation vía Supabase Auth. Envuelve TODO App.js, no solo la parte logueada (ver sección 5 y 6)
│   ├── mockData.js            # turnosIniciales + ESTADOS_TRABAJO + helper separarMarcaModelo() (ya no exporta clientes/autos, migrados a ClienteContext)
│   ├── mockInsumos.js / mockFinanzas.js / mockTaller.js / mockServicios.js  # Datos iniciales de insumos, costos fijos, taller/planes/horarios y catálogo de servicios (mockTaller.js ya no incluye tallerInicial/misDatosIniciales; mockEquipo.js se borró al migrar EquipoContext, ver sección 6)
│   └── tiposDanio.js          # Catálogo de tipos de daño (TIPOS_DANIO) para cualquier diagrama de check-in visual
│
├── lib/
│   └── supabase.js            # Cliente de Supabase (createClient con AsyncStorage + url-polyfill), lee EXPO_PUBLIC_SUPABASE_URL/ANON_KEY de .env (ver sección 6 y 7)
│
├── supabase/                  # SQL corrido a mano en el SQL Editor de Supabase (no hay CLI de Supabase configurada en el repo)
│   ├── schema.sql              # Las 13 tablas del esquema (ver sección 6)
│   ├── trigger_nuevo_usuario.sql  # Trigger de alta (handle_new_user) + política mínima de RLS de `talleres` (ver sección 6)
│   └── rls_tablas_negocio.sql     # Políticas de RLS de las otras 12 tablas (ver sección 6)
│
├── navigation/
│   └── DashboardNavigator.js  # Drawer navigator: Home, Clientes, Agenda, Mi Taller, Finanzas, Mis Datos/Insumos/Servicios/Horarios, Mi Equipo, Notificaciones, Soporte, Configuración (con sus rutas de Términos/Privacidad) — ya no quedan rutas placeholder. Mi Taller/Finanzas/Configuración van cada uno en su propio Stack.Navigator (native-stack) anidado dentro del Drawer, para el swipe-back nativo (ver sección 5)
│
├── components/                # Componentes reutilizables, uno por archivo
│   ├── Button.js                     # Botón primario/secundario con loading/disabled
│   ├── Input.js                       # Input de texto con label, error, y toggle de mostrar/ocultar password
│   ├── Logo.js                        # Logo de la marca (imagen)
│   ├── ScreenHeader.js                 # Header superior con botón de menú (o "volver", si la pantalla no es de primer nivel) + logo
│   ├── DrawerContent.js                 # Contenido custom del menú lateral (perfil, links, cerrar sesión)
│   ├── StatCard.js                       # Tarjeta de estadística (usada en Home: "Turnos de hoy", "Ingresos del mes")
│   ├── TurnoCard.js                       # Tarjeta de turno, reusada en Home y en Agenda
│   ├── TrabajoDetalleModal.js              # Detalle de un turno (ficha de cliente + vehículo) con selector de estado para avanzar/volver el trabajo de etapa, más sección de solo lectura "Insumos usados" si el turno ya tiene `recetaAplicada`
│   ├── ClienteModal.js                      # Formulario de alta/edición de cliente (nombre, teléfono), con botón "Eliminar cliente" cuando edita
│   ├── VehiculosClienteModal.js              # Detalle de un cliente: sus datos + alta/edición/borrado de sus vehículos (marca, modelo, año, patente, color) en el mismo modal
│   ├── ClienteNuevoSubmenu.js                 # Modal bottom-sheet: elegir "Cliente nuevo" vs "Vehículo nuevo"
│   ├── OpcionesNuevoModal.js                   # Modal bottom-sheet del botón "+" de Home: "Cliente nuevo" vs "Trabajo nuevo"
│   ├── ConfirmarTrabajoModal.js                 # "¿Querés cargar un trabajo para este cliente?" tras guardar un cliente/vehículo nuevo desde Home
│   ├── EditarTallerModal.js                      # Editar nombre y logo del taller (usa expo-image-picker), desde Mi Taller
│   ├── SelectorHoraModal.js                       # Wrapper bottom-sheet del time picker nativo, solo para iOS — análogo a wizard/SelectorFechaModal.js, usado por Mis Horarios
│   ├── PanelPruebasPlan.js                        # Panel temporal de desarrollo en Mi Equipo: cambiar el plan del taller a mano para probar los límites (sin pagos reales)
│   ├── EmpleadoModal.js                            # Alta/edición de empleado de Mi Equipo, mismo patrón que ClienteModal, más avatar de silueta (ver SelectorSiluetaModal) y switch de activo/inactivo (separado del botón de eliminar)
│   ├── SelectorSiluetaModal.js                      # Bottom-sheet para elegir el avatar del empleado (hombre/mujer, Ionicons man-outline/woman-outline) desde EmpleadoModal; también exporta el mapeo silueta→ícono que usa MiEquipoScreen para pintar el listado
│   ├── EstadoCarga.js                               # Envuelve el cuerpo de una pantalla: spinner si está cargando, ícono+mensaje+"Reintentar" si hay error, o el contenido normal si no — usado por Mi Taller, Clientes y Mi Equipo (ver sección 6)
│   ├── ServicioModal.js                             # Alta/edición de un servicio del catálogo de Mis Servicios — mini-wizard de 2 pasos: datos (nombre/precio/categoría/duración) y receta de insumos (components/servicio/RecetaServicioStep.js)
│   ├── CostoFijoModal.js                             # Alta/edición de un costo fijo mensual (Costos Fijos)
│   ├── GraficoDonut.js                                # Dona de "Costos del mes" (fijos/variables) en Finanzas, hecha a mano con react-native-svg
│   ├── GraficoBarras.js                                # Barras de "Ingresos · últimos 6 meses" en Finanzas, hecha a mano con react-native-svg
│   ├── AgregarInsumoModal.js                           # Buscar en el catálogo (data/mockInsumos.js) y agregar un insumo a "Mis Insumos", cargando también capacidad total del envase + unidad (ml/g/unidades)
│   ├── CategoriaInsumosModal.js                         # Ver el listado completo de una categoría de insumos (la estantería solo muestra 3 por categoría)
│   ├── ProductoCasillero.js                              # Casillero de producto con relleno según nivel de stock, reusado en la estantería y en el modal de categoría
│   ├── NotificacionStockBajoCard.js                       # Tarjeta de alerta de stock bajo en Notificaciones, con estimación de usos restantes
│   ├── SolicitarPedidoModal.js                             # Resumen del carrito de pedido a proveedor (PedidoContext) antes de "solicitarlo"
│   ├── servicio/                                            # Sub-componentes específicos de ServicioModal
│   │   └── RecetaServicioStep.js                             # Paso 2 de ServicioModal: marcar insumos (de DataContext) y cantidad por uso; muestra aparte, de solo lectura, cualquier línea de receta cuyo insumo ya no exista en Mis Insumos ("Insumo eliminado")
│   └── wizard/                                              # Sub-componentes específicos de los wizards de "Cliente nuevo" y "Trabajo nuevo"
│       ├── WizardHeader.js                                   # Header compartido de todos los wizards: back, título, "paso/total", barra de progreso
│       ├── SwipeVolver.js                                     # Gesto de borde (react-native-gesture-handler) que envuelve el contenido de cada Step y dispara el mismo onAtras que el botón de WizardHeader — swipe-back manual para los wizards, que al ser <Modal> con pasos por estado local no se benefician del native-stack del Drawer (ver sección 5)
│       ├── FuelGauge.js                                       # Medidor de nafta dibujado a mano con SVG + gesto táctil (arco 0-180°)
│       ├── SelectorFechaModal.js                               # Wrapper bottom-sheet del date picker nativo, solo para iOS (ver sección 1)
│       ├── DamageDiagram.js                                     # Diagrama genérico de check-in visual — solo vista "Frente" con foto de referencia (frenteReferenciaImagen.js), fallback para cualquier carrocería sin diagrama propio
│       ├── frenteReferenciaImagen.js                             # Imagen de referencia (base64) usada por DamageDiagram, temporal
│       └── DiagramaDanios.js                                     # Envuelve al diagrama que corresponda (específico de components/diagrams/vehicles o el genérico) y le suma el selector de tipos de daño por panel + la lista resumen "Daños registrados"
│
├── components/diagrams/vehicles/   # Registro de diagramas de paneles reales por tipo de carrocería
│   ├── index.js                      # DIAGRAMAS_POR_TIPO_VEHICULO (mapeo tipo de vehículo -> componente) + obtenerClaveDiagrama(); si un tipo no está acá, DiagramaDanios cae al genérico
│   └── PickupCabinaSimpleDiagram.js   # Único diagrama de paneles reales implementado hasta ahora: pickup cabina simple, 12 paneles tocables vectorizados de una foto de referencia real
│
├── screens/
│   ├── SplashScreen.js         # Pantalla de carga inicial (1.5s, luego pasa a Login)
│   ├── LoginScreen.js           # Login real vía Supabase Auth (useAuth().signIn), con validación de formato antes de llamar
│   ├── SignupScreen.js           # Registro real vía Supabase Auth (useAuth().signUp), con validación de formato antes de llamar
│   ├── VerifyEmailScreen.js       # Pantalla "verificá tu email" con botón "reenviar" real (supabase.auth.resend)
│   ├── HomeScreen.js               # Dashboard principal (turnos de hoy, stats, FAB "+")
│   ├── ClientesScreen.js            # Listado + búsqueda de clientes, abre ClienteModal / VehiculosClienteModal
│   ├── AgendaScreen.js               # Turnos organizados por día, con selector de semana (ver sección 3)
│   ├── MiTallerScreen.js              # Hub: nombre/logo del taller (editable) + accesos a Mis Datos, Mi Equipo, Mis Insumos, Mis Horarios, Mis Servicios
│   ├── MisDatosScreen.js               # Datos personales/de contacto del titular del taller (formulario, no un hub)
│   ├── MisServiciosScreen.js            # Catálogo de servicios de detailing que se ofrecen (precio, categoría, duración estimada y receta de insumos)
│   ├── MisHorariosScreen.js              # Horario de atención por día (abierto/cerrado + apertura/cierre con time picker nativo), solo informativo (ver sección 3 y 4)
│   ├── MiEquipoScreen.js                 # Empleados del taller, con límite según el plan de suscripción
│   ├── MisInsumosScreen.js                # "Estantería" de insumos por categoría, con niveles de stock
│   ├── FinanzasScreen.js                   # Costos del mes (dona) + ingresos de ejemplo (barras), en un pager de 2 páginas
│   ├── CostosFijosScreen.js                 # Alta/edición/borrado de costos fijos mensuales, accedida desde Finanzas
│   ├── NotificacionesScreen.js               # Alertas de stock bajo (con botón "Solicitar pedido") + placeholder de recordatorios a clientes, en un pager de 2 páginas
│   ├── SoporteScreen.js                       # Contacto (WhatsApp/mail), preguntas frecuentes en acordeón, y "reportar un problema" vía mailto (ver sección 3)
│   ├── ConfiguracionScreen.js                  # Cuenta (datos de solo lectura + acceso a Mis Datos), Legal, Acerca de, y Cerrar sesión (ver sección 3)
│   ├── DocumentoLegalScreen.js                  # Pantalla genérica de "documento sin redactar todavía", reusada por Términos y por Privacidad (ver sección 4)
│   │
│   ├── nuevoCliente/                 # Wizard de "Cliente nuevo" / "Vehículo nuevo"
│   │   ├── NuevoClienteWizard.js      # Componente contenedor con la máquina de estados del wizard
│   │   ├── DatosClienteStep.js         # Paso: datos del cliente (nombre, teléfono)
│   │   ├── DatosVehiculoStep.js         # Paso: datos del vehículo (patente con auto-formato, marca y modelo en un solo campo, año opcional, color)
│   │   ├── SeleccionarClienteStep.js     # Paso: elegir un cliente existente de una lista con buscador (compartido también por Trabajo Nuevo)
│   │   └── SeleccionarVehiculoStep.js     # Paso: elegir un vehículo de un cliente (compartido también por Trabajo Nuevo)
│   │
│   └── trabajoNuevo/                  # Wizard de "Trabajo nuevo"
│       ├── TrabajoNuevoWizard.js       # Componente contenedor con la máquina de estados del wizard (hasta 4 pasos numerados, más una fase de confirmación)
│       ├── DatosServicioStep.js         # Paso: servicio (chips desde ServicioContext), fecha y hora (ambos con date/time picker nativo), tiempo estimado, observaciones
│       ├── TipoVehiculoStep.js           # Paso: tipo de vehículo y subdivisión de carrocería, más nivel de nafta
│       ├── InspeccionVisualStep.js        # Paso: diagrama de daños (carrusel de vistas, hoy solo "Frente"), con selector de tipos de daño y fotos
│       └── ConfirmacionTrabajoStep.js      # Paso final: pantalla de "¡Trabajo guardado!" que se auto-cierra a los 1.8s
│
└── .claude/                    # Config local de Claude Code (settings.json, settings.local.json)
```

No hay carpetas `ios/` ni `android/` en el repo (están en `.gitignore` — se generan si se hace un build nativo/prebuild).

---

## 3. Funcionalidades ya implementadas y funcionando

**Flujo de arranque y autenticación (real, vía Supabase Auth — ver sección 6):**
- Splash screen con logo (1.5s) → Login.
- Login con validación de formato de email y contraseña no vacía.
- Registro (Signup) con validación de nombre, email, teléfono, contraseña (mínimo 6 caracteres) y confirmación de contraseña.
- Pantalla de "Verificá tu email" con botón de reenvío real (`supabase.auth.resend`), con loading y manejo de error.
- "¿Olvidaste tu contraseña?" con código de 6 dígitos por mail (`OlvidePasswordScreen.js` → `RestablecerPasswordScreen.js`, ver sección 6) en vez de link mágico.
- Logout desde el menú lateral, que vuelve a la pantalla de Login.

**Dashboard / Home (`HomeScreen.js`):**
- Lista de "Turnos de hoy" ordenados por hora, con tarjeta (`TurnoCard`) que muestra hora, cliente, auto, estado (Pendiente / En proceso / Terminado, con color distinto por estado) y, si el turno tiene `empleadosAsignados`, sus nombres (truncados con "+N" si son varios, ver más abajo). Arranca vacía: `turnosIniciales` es un array vacío a propósito (ver sección 6), ya no hay turnos de ejemplo precargados.
- Un único `StatCard` centrado con la cantidad de turnos de hoy — el de "Ingresos del mes" (valor hardcodeado, no calculado) se sacó del todo, no solo se dejó de mostrar (ver sección 4 para el resto de los datos de ejemplo pendientes de reemplazar por cálculos reales, como los de Finanzas).
- Botón flotante "+" que abre un modal de opciones: "Cliente nuevo" o "Trabajo nuevo".
- Modal de detalle de turno (`TrabajoDetalleModal.js`, antes `DetalleTurnoModal.js`): ficha del cliente y del auto asociado, sección de empleados asignados (si el turno tiene `empleadosAsignados`, ver más abajo) y un selector de estado (chips con las etapas de `ESTADOS_TRABAJO`) para avanzar o volver el turno de estado — ya **no** es de solo lectura.

**Wizard "Cliente nuevo / Vehículo nuevo" (`screens/nuevoCliente/`):**
- Submenú (`ClienteNuevoSubmenu.js`) para elegir si es un cliente 100% nuevo o si se le agrega un vehículo a uno existente — visualmente diferenciado del menú anterior (`OpcionesNuevoModal`, el del botón "+" de Home) con su propio título, breadcrumb con flecha de "volver" y animación de entrada desde el costado (en vez de desde abajo), para que se lea como un segundo paso del flujo y no como si el mismo menú se reabriera.
- Modo "cliente": carga datos del cliente (nombre, teléfono) → carga datos del vehículo → se guardan ambos.
- Modo "vehículo": elige un cliente existente (con buscador) → carga datos del vehículo → se guarda.
- Al terminar de guardar el vehículo, `HomeScreen.js` muestra `components/ConfirmarTrabajoModal.js` ("¿Querés cargar un trabajo nuevo para este cliente?") con dos botones:
  - "Sí" → abre el wizard de Trabajo Nuevo con el cliente/vehículo ya preseleccionados (salteando esos pasos de selección ahí).
  - "No" → cierra el flujo y vuelve a Home. El cliente y el vehículo ya quedaron guardados en ambos casos, porque el guardado ocurre antes de mostrar esta pregunta.
- Validaciones de campos obligatorios en cada paso (nombre/teléfono del cliente, patente/marca-modelo del vehículo). El año del vehículo es opcional.
- **Patente (`utils/patente.js`, compartido con `VehiculosClienteModal.js`):** valida y formatea tanto el formato viejo (3 letras + 3 números, ej. `AAA123`) como el Mercosur (2 letras + 3 números + 2 letras, ej. `AB123CD`), con auto-formato mientras se tipea (espacios en las posiciones correctas) y un texto de ayuda debajo del campo mostrando ambos formatos válidos. Switch "Todavía no tiene patente" para permitir guardar el vehículo sin ese dato (oculta el campo y su texto de ayuda mientras está activo).

**Wizard "Trabajo nuevo" (`screens/trabajoNuevo/`):**
- Si no viene con cliente/vehículo preseleccionados: elegir cliente (buscador) → elegir vehículo de ese cliente. Son 4 pasos numerados en ese caso (3 si se saltea la selección).
- Datos del servicio (`DatosServicioStep.js`): el servicio se elige como chip del catálogo de `ServicioContext` (ya no es texto libre — si todavía no se cargó ningún servicio en Mis Servicios, se muestra un aviso en vez de la lista); **selector multi-choice de empleados asignados** (chips de `useEquipo()`, solo empleados activos), bloqueado con un candado si el plan del taller es Básico (no incluye empleados) y oculto del todo si el taller todavía no cargó ninguno — guarda `empleadosAsignados` en el turno como `[{ empleadoId, nombreEmpleado }]` con el nombre congelado al asignar, mismo criterio que `recetaAplicada` (ver sección 5); fecha y hora con **date/time picker nativo** (`DateTimePicker` de `@react-native-community/datetimepicker`, mismo criterio para ambos: diálogo en Android, bottom-sheet propio en iOS vía `SelectorFechaModal`/`SelectorHoraModal`, ver sección 1); tiempo estimado sigue siendo texto libre; observaciones opcional. **La hora se valida contra el horario de atención real** (`useTaller().horarios`): en cuanto fecha y hora están cargadas, si ese día está marcado como cerrado o la hora cae fuera del rango `horaApertura`-`horaCierre`, aparece un error debajo del campo y "Continuar a Inspección" queda deshabilitado — la validación se recalcula en cada render (no solo al tocar "Continuar"), porque a diferencia de los demás campos acá no alcanza con mirar el picker para darse cuenta de que el valor es inválido. No bloquea el selector nativo en sí (la librería no permite restringir horas ni deshabilitar días de la semana dentro del propio picker), solo el avance del wizard.
- Paso "Tipo de Vehículo" (`TipoVehiculoStep.js`): elegir tipo (Auto/Camioneta/SUV/Moto) y su subdivisión (ej. Sedán, Coupé, "Cabina simple", etc.), y el medidor de nivel de nafta interactivo (arco SVG arrastrable).
- Paso "Inspección Visual" (`InspeccionVisualStep.js`): diagrama de daños de check-in visual, en un carrusel de vistas (hoy solo la vista "Frente" está lista; el carrusel ya soporta sumar más vistas más adelante). El diagrama que se muestra depende de la carrocería elegida: para "Camioneta / Cabina simple" es el diagrama real de 12 paneles vectorizados de `PickupCabinaSimpleDiagram.js`; para cualquier otra combinación sigue siendo el diagrama genérico de 7 zonas de `DamageDiagram.js` (solo vista Frente, con una foto de referencia de fondo). Cada zona/panel admite **varios tipos de daño a la vez** (rayón, abolladura, óxido, etc., más "otro" con nota de texto libre), y hay una lista resumen "Daños registrados" debajo. También se puede adjuntar foto del daño desde la galería, habilitado solo si ya se marcó al menos un daño.
- Al finalizar, guarda el turno (vía callback `onGuardarTrabajo` que recibe `HomeScreen`) y muestra una pantalla de confirmación que se auto-cierra.

**Sección Clientes (`ClientesScreen.js`):**
- Listado de todos los clientes, con buscador que filtra por nombre del cliente **o** por patente/marca/modelo de cualquiera de sus vehículos.
- Cada fila muestra nombre, teléfono y cantidad de vehículos.
- Al tocar un cliente se abre `VehiculosClienteModal`: ficha del cliente + lista de sus vehículos, con alta/edición/borrado de vehículos (marca, modelo, año, patente, color) en el mismo modal, y un botón de lápiz que abre `ClienteModal` para editar nombre/teléfono (o borrar el cliente entero). **Tanto el borrado de cliente como el de vehículo ya están conectados a la UI** (botón "Eliminar cliente" en `ClienteModal`, ícono de tacho por vehículo en `VehiculosClienteModal`) — llaman a `eliminarCliente`/`eliminarVehiculo` de `ClienteContext`.

**Agenda (`AgendaScreen.js`):**
- Selector de semana (flechas ←/→ de a 7 días) con los 7 días de lunes a domingo como chips tocables; el día de hoy se resalta y hay un atajo "Hoy" cuando se está viendo otro día.
- Debajo, los turnos del día seleccionado (ordenados por hora), y una sección aparte "Sin fecha asignada" para turnos cuyo campo `fecha` no matchea el formato `DD/MM/AAAA` (parseo best-effort vía `utils/fecha.js`).
- Reusa `TurnoCard` y `TrabajoDetalleModal` (mismo modal de detalle/cambio de estado que usa Home).

**Mi Taller (`MiTallerScreen.js`) — hub:**
- Header con logo (editable) y nombre del taller, con acceso a `EditarTallerModal` (cambiar nombre y logo vía `expo-image-picker`; el logo se sube de verdad a Supabase Storage, ver sección 6).
- Lista de accesos a Mis Datos, Mi Equipo, Mis Insumos, Mis Horarios y Mis Servicios.

**Mis Datos (`MisDatosScreen.js`):**
- Formulario (no un hub) con los datos personales/de contacto del titular: nombre personal, web, correo, teléfono, ubicación, y situación fiscal opcional (chips: Monotributista, Responsable Inscripto, Exento, Consumidor Final, Prefiero no decir). Guarda en `TallerContext` (`misDatos`).

**Mis Servicios (`MisServiciosScreen.js`):**
- Catálogo de servicios de detailing que ofrece el taller (nombre, precio, categoría, duración estimada en minutos), con alta/edición (`ServicioModal`, mini-wizard de 2 pasos) y borrado. Arranca con 12 servicios de ejemplo (`data/mockServicios.js`, dos por categoría, con `receta: []`). Este catálogo es el que alimenta los chips de "Servicio" del wizard de Trabajo Nuevo.
- **Receta de insumos por servicio:** el paso 2 de `ServicioModal` (`components/servicio/RecetaServicioStep.js`) permite marcar qué insumos de "Mis Insumos" usa el servicio y en qué cantidad (en la unidad del insumo, ej. "50 ml"). Esa receta es la que se descuenta del stock al completar un trabajo — ver el bloque "Consumo de stock por receta de servicio" en la sección 5 para el detalle completo (por qué se congela una copia por trabajo, qué pasa si se borra un insumo referenciado, y la limitación consciente de no reponer stock al revertir un estado).

**Mis Horarios (`MisHorariosScreen.js`):**
- Horario de atención por día de la semana: un `Switch` para abierto/cerrado, y si está abierto, dos botones "Desde"/"Hasta" que abren un time picker nativo (mismo mecanismo que la fecha del wizard: diálogo en Android, bottom-sheet propio en iOS vía `SelectorHoraModal`). Se guarda en `TallerContext` (`horarios`, `actualizarHorario`). Arranca con un horario de ejemplo (L-V 9 a 18, sábado 9 a 13, domingo cerrado).
- **Es solo informativo:** no restringe en absoluto qué horas se pueden elegir al cargar un turno en el wizard de Trabajo Nuevo — el time picker de "Hora" en `DatosServicioStep.js` deja elegir cualquier hora del reloj, sin cruzar ese valor con este horario de atención — ver sección 4.

**Mi Equipo (`MiEquipoScreen.js`) — con límite por plan:**
- Listado de empleados (nombre, rol, teléfono, avatar de silueta), con alta/edición (`EmpleadoModal`) y borrado. Arranca vacío.
- **Activo/inactivo (`EquipoContext.cambiarEstadoEmpleado`):** cada empleado tiene un campo `activo` (default `true`). `EmpleadoModal` suma un switch para activar/desactivar, separado del botón de eliminar (con texto de ayuda aclarando que desactivar no borra el registro), y `MiEquipoScreen` muestra los inactivos atenuados con una etiqueta en vez de ocultarlos — el límite de empleados del plan cuenta solo los activos.
- **Avatar de silueta (`SelectorSiluetaModal.js`):** hombre/mujer (Ionicons `man-outline`/`woman-outline`), elegido en `EmpleadoModal` y persistido en la columna `avatar` de `empleados` (`'hombre' | 'mujer' | null`). El listado pinta el ícono correspondiente por fila; el mapeo silueta→ícono vive centralizado como export de `SelectorSiluetaModal.js`.
- El alta está limitada por el plan de suscripción del taller (`TallerContext`): Básico permite 0 empleados, Intermedio 1, PRO 3 (`PLANES` en `data/mockTaller.js`). Al llegar al límite (contando solo activos), el botón "+" se oculta y se muestra un aviso con el plan actual y su límite. El selector multi-choice de empleados del wizard de Trabajo Nuevo (ver más arriba) también respeta el plan: queda bloqueado con candado en el plan Básico.
- Como todavía no hay pagos reales conectados, `components/PanelPruebasPlan.js` (marcado explícitamente como panel temporal de desarrollo) permite cambiar el plan a mano para poder probar los tres límites.

**Finanzas (`FinanzasScreen.js`) y Costos Fijos (`CostosFijosScreen.js`):**
- Finanzas es un pager de 2 páginas (swipe horizontal, con puntos indicadores): "Costos del mes" (dona con Fijos vs. Variables, tocable para navegar a Costos Fijos) e "Ingresos · últimos 6 meses" (barras). **Ambos son datos de ejemplo**: los ingresos son una constante inventada (`INGRESOS_EJEMPLO`) y los "costos variables" son un placeholder fijo (`COSTOS_VARIABLES_EJEMPLO`, comentado explícitamente en el código) — solo el total de costos fijos sale de datos reales (`DataContext`).
- Costos Fijos: alta/edición (`CostoFijoModal`)/borrado de costos fijos mensuales por categoría (alquiler, sueldos, servicios, mantenimiento, seguro, otro), con el total mensual destacado arriba.

**Mis Insumos (`MisInsumosScreen.js`) y Notificaciones de stock (`NotificacionesScreen.js`):**
- Mis Insumos muestra una "estantería" paginada (2 páginas, swipe) agrupada por categoría (desengrasantes, shampoo, pulidores, protecciones, interiores, rejuvenecedores), con hasta 3 productos visibles por categoría en la vista compacta y un modal (`CategoriaInsumosModal`) para ver el listado completo. Cada producto se agrega desde `AgregarInsumoModal`, buscando en un catálogo investigado (`data/mockInsumos.js`, con fichas técnicas reales de marcas como CarPro, Koch Chemie, Sonax, Vonixx, Menzerna — algunas categorías todavía usan un producto placeholder "A definir" mientras se investigan productos reales).
- Cada insumo tiene un `nivel` de stock (0-100) y, desde la receta de servicios, también `capacidadTotal` + `capacidadUnidad` (ml/g/unidades) del envase — se cargan al agregarlo desde `AgregarInsumoModal` y son los que permiten convertir una cantidad de receta (ej. "50ml") en puntos de `nivel` a descontar. Notificaciones muestra, en su primera página, los insumos con `nivel <= UMBRAL_STOCK_BAJO` (25); la segunda página es un placeholder de "recordatorios para clientes".
- Flujo de pedido a proveedor: desde una alerta de stock bajo se puede sumar el insumo a un carrito (`PedidoContext`, compartido entre ambas pantallas); si el carrito tiene ítems, aparece un botón flotante "Solicitar pedido (n)" que abre `SolicitarPedidoModal` con el resumen. No hay envío real a ningún proveedor: es un armado de lista, no una integración.

**Soporte (`SoporteScreen.js`):**
- Tres secciones de solo lectura / acciones externas, sin backend: Contacto (WhatsApp vía `wa.me` y mail vía `mailto:` a `soporte@detallarg.com`), Preguntas frecuentes (acordeón con 5 preguntas fijas sobre el uso de la app) y "Reportar un problema" (botón que abre `mailto:` con asunto prellenado — mismo mail que Contacto, no hay un canal separado). El número de WhatsApp es un placeholder inventado hasta que se defina el real (comentario explícito en el código marcando dónde reemplazarlo).

**Configuración (`ConfiguracionScreen.js`):**
- **Cuenta**: tarjeta de solo lectura con nombre (`useTaller().misDatos.nombrePersonal`), empresa (`useTaller().nombreTaller`), email (`useAuth().user.email`, dato real de la sesión) y el plan actual (`TallerContext`), más un acceso "Editar mis datos" que navega a `MisDatosScreen` (no duplica esos campos acá).
- **Legal**: "Términos y condiciones" y "Política de privacidad", ambos navegan a `DocumentoLegalScreen.js` — una pantalla genérica con el mismo texto de relleno ("Este documento todavía no fue redactado") porque no hay contenido legal real todavía.
- **Acerca de**: versión de la app (`VERSION_APP = "1.0.0"`, constante hardcodeada a mano — no hay `expo-constants` instalado para leer `app.json` en runtime, hay que mantenerla sincronizada manualmente).
- **Cerrar sesión**: mismo `onLogout` que ya existe en el drawer (`DashboardNavigator.js` se lo pasa a `ConfiguracionScreen` como prop, vía función hija de `<Drawer.Screen>` en vez de `component`) — es intencional que el logout esté accesible desde los dos lugares.

**Navegación y menú lateral:**
- Drawer con: Home, Clientes, Mi Taller, Finanzas, Agenda, Configuración, Soporte, Notificaciones (`components/DrawerContent.js`, array `ITEMS_PRINCIPALES`). Mis Datos, Mi Equipo, Mis Insumos, Mis Horarios y Mis Servicios no son ítems propios del drawer: se llega a ellos desde el hub Mi Taller. Costos Fijos tampoco es ítem del drawer: se llega desde Finanzas. Términos y Privacidad tampoco: se llega desde Configuración.
- Header con nombre de empresa y email del usuario, resaltado de la ruta activa, botón de cerrar sesión.

**Sistema de diseño:**
- Look & feel dark theme, consistente entre todas las pantallas (ver sección 8).

---

## 4. Funcionalidades a medio hacer o pendientes

**A medio hacer:**
- **Ya no queda ninguna pantalla placeholder** (ni en el drawer ni fuera de él): Configuración, la última, ya tiene UI propia — ver sección 3. `PlaceholderScreen.js` se borró del repo por quedar sin ningún uso.
- **Términos y condiciones / Política de privacidad sin contenido real:** ambas rutas (`Terminos`, `Privacidad`) navegan a la misma pantalla genérica (`DocumentoLegalScreen.js`) con un texto de relleno ("Este documento todavía no fue redactado"), solo para dejar el enganche de navegación listo desde Configuración.
- **Diagrama de daños específico por carrocería, parcial:** ya no es 100% genérico — `components/diagrams/vehicles/PickupCabinaSimpleDiagram.js` es un diagrama real de 12 paneles para "Camioneta / Cabina simple", vectorizado de una foto de referencia. El registro (`components/diagrams/vehicles/index.js`) está preparado para sumar más carrocerías, pero por ahora es la única implementada: el resto de las combinaciones de tipo/subdivisión siguen cayendo al diagrama genérico de 7 zonas (`DamageDiagram.js`, solo vista "Frente").
- **Carrusel de vistas de inspección con una sola vista:** `InspeccionVisualStep.js` ya soporta un carrusel de varias vistas (Frente/Techo/Izquierda/Derecha/Atrás), pero `VISTAS_INSPECCION` hoy solo tiene "Frente" cargada.

**Totalmente pendiente / no implementado:**
- **Migración de los Contexts de negocio a Supabase:** `ClienteContext` y `EquipoContext` ya están migrados (ver sección 5 y 6). `TurnoContext`, `ServicioContext`, `DataContext` (insumos/costos fijos) y `PedidoContext` siguen 100% en memoria (`useState` con datos mock) — persistencia de esos datos de negocio: se pierde al cerrar sesión o recargar la app, igual que antes.
- **Borrado de turnos:** `TurnoContext.js` sigue sin exponer ninguna función de delete — solo `agregarTurno`/`actualizarTurno`. Para clientes/vehículos ya no es el caso: `ClienteContext.js` expone `eliminarCliente`/`eliminarVehiculo` y **ya están conectados a la UI** (botón "Eliminar cliente" en `ClienteModal`, tacho por vehículo en `VehiculosClienteModal`).
- Cálculo real de ingresos: `INGRESOS_EJEMPLO` en `FinanzasScreen.js` es un valor fijo/inventado, no se calcula a partir de turnos ni de ningún dato real (el StatCard equivalente de Home, `INGRESOS_DEL_MES`, se sacó directamente — ver sección 3). Lo mismo pasa con "costos variables" en Finanzas (`COSTOS_VARIABLES_EJEMPLO`).
- **Reversión de "Finalizado" no repone stock (limitación consciente):** si un trabajo se mueve de "Finalizado" a otro estado anterior desde `TrabajoDetalleModal`, el stock que se descontó al finalizarlo **no se repone automáticamente** — `TurnoContext.actualizarEstadoTrabajo` solo descuenta una vez (guardado en `turno.recetaAplicada`) y nunca resta en sentido inverso. Si hace falta corregir el stock en ese caso, el ajuste se hace a mano desde Mis Insumos.
- **Sin bloqueo por stock insuficiente:** al finalizar un trabajo, si algún insumo de la receta no tiene stock suficiente, `nivel` simplemente clampea a 0 (no puede quedar negativo) — no se bloquea el pasaje a "Finalizado" ni se muestra un aviso aparte del que ya existe para stock bajo en Notificaciones.
- Pagos / flujo de compra de plan real: el plan de suscripción del taller (Básico/Intermedio/PRO) hoy solo se puede cambiar desde el panel de pruebas de desarrollo (`PanelPruebasPlan.js` en Mi Equipo), no hay ningún flujo de compra ni checkout.
- **Autocompletado de direcciones (Google Places) — backend preparado, sin conectar al cliente todavía:** se agregaron las columnas `ubicacion_place_id`/`ubicacion_lat`/`ubicacion_lng` a `talleres` (`supabase/schema.sql`) y la Edge Function `supabase/functions/places-proxy/index.ts` (acciones `autocomplete`/`details`, intermediario hacia Google Places porque las Web Service APIs de Google no se pueden restringir por app — la key vive como secreto server-side, ver sección 6). Falta: habilitar Places API + facturación en Google Cloud, deployar la función, e integrar el componente cliente en `MisDatosScreen.js`/`TallerContext.js` (hoy `ubicacion` en "Mis Datos" sigue siendo un campo de texto libre, sin autocompletado).
- Envío real del pedido a proveedor (Mis Insumos/Notificaciones) y del "reportar un problema" de Soporte: ambos son placeholders de UI — el pedido arma un resumen local sin enviarlo a ningún lado, y "reportar un problema" abre el cliente de mail del usuario (`mailto:`) en vez de mandar algo a un backend propio.

---

## 5. Decisiones de arquitectura importantes

**Manejo de estado — patrón de un Context por dominio:**
- El estado de negocio no vive en un único Context genérico. Cada dominio tiene su propio Context + Provider, todos con la misma forma interna (`useState` en memoria, sin `useReducer` ni librería externa, `value` memoizado con `useMemo`):
  - **`data/ClienteContext.js`** (`useClientes()`): clientes, cada uno con sus vehículos **anidados** en `cliente.vehiculos` en memoria (no hay una tabla `autos` separada a nivel de la app, aunque en Supabase sí son dos tablas con FK — ver sección 6). Expone `agregarCliente`, `editarCliente`, `eliminarCliente`, `agregarVehiculo`, `editarVehiculo`, `eliminarVehiculo`, `getClienteById`, `getVehiculoById` (esta última recorre todos los clientes buscando el vehículo por id, para los casos —como un turno— que solo tienen el id a mano; opera sobre lo ya cargado en memoria, no dispara ningún request nuevo). **Migrado a Supabase, igual que `TallerContext`:** el fetch inicial trae clientes + vehículos en una sola query con embedded resource de PostgREST (`clientes(...vehiculos(...))`), reconstruyendo la misma forma anidada de antes — expone `cargandoClientes`. Todas las mutaciones son `async` y escriben de verdad (sin actualización optimista: el estado local solo cambia si Supabase confirma, igual que `TallerContext`).
  - **`data/TurnoContext.js`** (`useTurnos()`): turnos, expone `agregarTurno`, `actualizarTurno`, `actualizarEstadoTrabajo`, `getTurnoById`. Sin `eliminarTurno` (ver sección 4). `actualizarEstadoTrabajo` ya no es un simple atajo sobre `actualizarTurno` — ver el bloque "Consumo de stock por receta de servicio" más abajo. Un turno puede tener `empleadosAsignados` (`[{ empleadoId, nombreEmpleado }]`, nombre congelado al asignar, mismo criterio que `recetaAplicada`), cargado desde el selector multi-choice de `DatosServicioStep.js` (wizard de Trabajo Nuevo, ver sección 3) — sigue siendo un array en memoria, no una tabla propia en Supabase, porque `TurnoContext` en su conjunto sigue sin migrar.
  - **`data/TallerContext.js`** (`useTaller()`): datos del taller (`nombreTaller`, `logoTaller`, `actualizarTaller`), los datos personales del titular ("Mis Datos": `misDatos`, `actualizarMisDatos`), el **plan de suscripción** (`plan`, `limiteEmpleados` derivado de `PLANES[plan]` en `data/mockTaller.js`, y `cambiarPlan` — hoy solo lo llama el panel de pruebas de Mi Equipo, sin pagos reales conectados), y el **horario de atención** (`horarios`, array de 7 días con `{ dia, abierto, horaApertura, horaCierre }`, y `actualizarHorario(dia, cambios)` — ya conectado al wizard de Trabajo Nuevo, `DatosServicioStep.js` lo usa para validar la hora elegida, ver sección 3). Bootstrap real de Supabase en **dos `useEffect` separados**: uno para `talleres` (`SELECT ... WHERE id = user.id`, siembra `nombreTaller`/`logoTaller`/`misDatos`/`plan`, expone `cargandoTaller`) y otro para `horarios_atencion` (`SELECT ... WHERE taller_id = user.id`; si viene vacío —taller nuevo o ya existente de antes de esta migración—, hace `upsert` de las 7 filas default con `ignoreDuplicates: true` y vuelve a leer; expone `cargandoHorarios`). **Escritura real:** `actualizarMisDatos`, la parte de `nombre` de `actualizarTaller`, y ahora también `actualizarHorario` son `async` y hacen `UPDATE`/`upsert` de verdad (tiran si hay error — quien llama hace `await` + `try/catch`; `MisHorariosScreen.js` no tiene un botón "Guardar" único, cada toque de switch u hora dispara el guardado al instante, así que el control visual no se mueve hasta que Supabase confirma). Sigue **solo en memoria, a propósito**: `logo` de `actualizarTaller` (sin Supabase Storage todavía, ver sección 4) y `cambiarPlan` (solo lo llama el panel de pruebas de Mi Equipo). Ver sección 6.
  - **`data/AuthContext.js`** (`useAuth()`) — Context nuevo, distinto a los demás: envuelve **toda** `App.js` (por encima de los 7 Providers de negocio, incluso durante Splash/Login/Signup), no solo la parte autenticada. Es la única fuente de verdad de si hay sesión (`session`, `user`, `cargando`) y expone `signIn`, `signUp`, `signOut`, `resendConfirmation` — todos llaman a `supabase.auth.*` de `lib/supabase.js`. Se suscribe a `supabase.auth.onAuthStateChange` para mantenerse sincronizado (login, logout, refresh de token). Ver sección 6.
  - **`data/PedidoContext.js`** (`usePedido()`): el carrito de "pedido a proveedor" compartido entre Mis Insumos y Notificaciones — `pedido`, `agregarAlPedido`, `quitarDelPedido`, `estaEnPedido`.
  - **`data/ServicioContext.js`** (`useServicios()`): catálogo de "Mis Servicios" — `servicios`, `agregarServicio`, `editarServicio`, `eliminarServicio`, `getServicioById`. Cada servicio tiene `duracionEstimada` (minutos) y `receta` (`[{ insumoId, cantidad }]`, cantidad en la unidad del insumo referenciado).
  - **`data/EquipoContext.js`** (`useEquipo()`): empleados de "Mi Equipo" — `empleados`, `agregarEmpleado`, `editarEmpleado`, `eliminarEmpleado`. No valida el límite del plan a nivel de Context: esa validación la hace `MiEquipoScreen.js` antes de abrir el alta (oculta el botón "+" si `empleados.length >= limiteEmpleados`, y también mientras `cargandoEquipo` es `true`, para no destellar el botón antes de tener el conteo real). **Migrado a Supabase, mismo criterio que `TallerContext`/`ClienteContext`:** fetch inicial ordenado por `nombre` (la tabla no tiene `created_at`), expone `cargandoEquipo`, mutaciones `async` sin actualización optimista. El límite por plan sigue siendo **puramente client-side** — no hay ningún `CHECK`/trigger en Supabase que lo valide (sin pagos reales conectados), no cambió con esta migración.
  - **`data/DataContext.js`** (`useData()`): quedó como el Context "de lo que sobra" — hoy solo `misInsumos` y `costosFijos` (insumos del taller y costos fijos de Finanzas), con `agregarInsumo`, `getInsumoById`, `descontarInsumos`, `agregarCostoFijo`, `actualizarCostoFijo`, `eliminarCostoFijo`. No tiene clientes, autos ni turnos. Cada insumo suma `capacidadTotal`/`capacidadUnidad` (envase) además de `nivel` (0-100).
  - Los **7 Providers de negocio** se anidan en `App.js` (dentro del componente `FlujoApp`), envolviendo solo la parte autenticada (`pantalla === "app"`), en este orden: `DataProvider > ClienteProvider > ServicioProvider > TurnoProvider > TallerProvider > PedidoProvider > EquipoProvider`. Acá el orden **sí importa**: `TurnoContext` llama a `useServicios()` y `useData()` internamente (para el consumo de stock, ver más abajo), y `TallerContext` llama a `useAuth()` (para el bootstrap de Supabase) — así que `TurnoProvider` tiene que quedar por debajo de `ServicioProvider`/`DataProvider`, y todo tiene que quedar por debajo de `AuthProvider`. Si se agrega un Context nuevo que necesite datos de otro, hay que anidarlo de la misma forma (por debajo del que provee esos datos).
  - Por encima de los 7 (y de todo `App.js`, incluido el splash y las pantallas sin sesión) va **`AuthProvider`** — es el único Provider de los 8 que no es "de negocio", envuelve literalmente todo. Ver bullet de `AuthContext` arriba.

**Consumo de stock por receta de servicio (`TurnoContext.js` + `ServicioContext.js` + `DataContext.js`):**
- Cuando `actualizarEstadoTrabajo(id, "Finalizado")` se llama sobre un turno que todavía no tiene `recetaAplicada` y tiene `servicioId`, se busca el servicio (`getServicioById`) y, si tiene `receta`, se llama a `descontarInsumos(servicio.receta)` de `DataContext` (convierte cada `cantidad` a puntos de `nivel` usando `capacidadTotal` del insumo, clamp a 0 — nunca bloquea ni queda negativo) y se guarda en el turno una **copia congelada** en `turno.recetaAplicada` (`[{ insumoId, nombreInsumo, unidad, cantidad }]`, con nombre y unidad resueltos en ese momento, no solo el id).
- **Por qué se congela una copia:** si más adelante se edita la receta del servicio (`ServicioModal`), esa edición solo afecta a los próximos trabajos que se finalicen — los turnos ya finalizados guardan su propio snapshot en `recetaAplicada` y no se recalculan ni se ven afectados.
- **Por qué no se descuenta dos veces:** los estados de un trabajo se pueden mover libremente para adelante y atrás desde `TrabajoDetalleModal` (no es una máquina de estados que solo avanza). El guard `!turno.recetaAplicada` asegura que el descuento (y el snapshot) ocurran una única vez por turno, aunque se vuelva a pasar por "Finalizado" más de una vez.
- Turnos sin `servicioId` o con `receta` vacía no disparan ningún descuento (hoy `mockData.js` arranca sin ningún turno de ejemplo, ver sección 6).
- Si un insumo referenciado en la receta **viva** de un servicio fue borrado de Mis Insumos, `RecetaServicioStep.js` lo muestra aparte como línea de solo lectura ("Insumo eliminado") en vez de romper la pantalla, y `descontarInsumos` simplemente lo ignora (no hay ninguna función de borrado de insumos implementada todavía, pero el código ya contempla el caso).
- Ver limitaciones explícitas relacionadas en la sección 4: no se repone stock al revertir "Finalizado", y no se bloquea el pasaje a "Finalizado" por stock insuficiente.
- **Acoplamiento entre dominios vía IDs, no vía Context:** un turno (`TurnoContext`) no contiene el cliente ni el vehículo completos, solo `clienteId`/`autoId` como referencia. Para resolverlos a datos reales hay que llamar a `getClienteById`/`getVehiculoById` de `useClientes()` por separado — son dos Contexts distintos que un mismo componente (`HomeScreen.js`, `AgendaScreen.js`) tiene que consumir juntos. Si se agrega un campo nuevo a un turno o a un vehículo, hay que revisar ambos Contexts y todos los lugares que cruzan datos de los dos.
- **Al cerrar sesión se destruye todo el estado en memoria de los Providers de negocio que siguen sin migrar** (se desmontan al salir de `pantalla === "app"`), y al volver a loguearse cada uno arranca de cero con sus datos iniciales — `TurnoContext` arranca con `turnosIniciales` vacío (`mockData.js`, ver sección 6): Home/Agenda vuelven a mostrarse sin ningún turno hasta que se cargue el primero a mano. **`TallerContext`, `ClienteContext` y `EquipoContext` son las excepciones**: como su estado inicial viene de Supabase (no de un mock), sus datos base sobreviven al logout. `ClienteContext` y `EquipoContext` además persisten todas sus escrituras de verdad (ver sección 6). De `TallerContext` persisten `actualizarMisDatos`, el `nombre` de `actualizarTaller` y ahora también `actualizarHorario` — solo `logo` y `cambiarPlan` siguen sin guardarse a ningún lado.

**Navegación:**
- El flujo superior de pantallas (Splash → Login → Signup → VerifyEmail → App) **no usa React Navigation**. Es un `switch` manual controlado por un `useState("login")` en el componente `FlujoApp` (dentro de `App.js`, variable `pantalla`). Por eso no hay gestos de "volver atrás" nativos ni historial entre esas pantallas — cada transición es una función que cambia ese string, salvo el paso a `"app"`, que ahora lo decide automáticamente un `useEffect` que mira `useAuth().session` (ver sección 6), no una pantalla llamando a un callback a mano.
- Recién dentro de la app autenticada (`pantalla === "app"`) se monta un `NavigationContainer` con un **Drawer Navigator** (`DashboardNavigator.js`) como navegador raíz. No hay Bottom Tabs.
- **Swipe-back nativo en las pantallas con "volver" (`DashboardNavigator.js`):** los grupos pantalla-padre + pantallas-hijas (Mi Taller, Finanzas, Configuración) están anidados en su propio `Stack.Navigator` de `@react-navigation/native-stack` dentro del Drawer, lo que da gratis el gesto de iOS de deslizar desde el borde para volver (vía `UINavigationController`) — el Drawer plano no podía darlo por no tener noción de pila. El menú lateral pasa a abrirse solo con el ícono de hamburguesa (`swipeEnabled: false` en el Drawer), porque el swipe desde el borde queda reservado para "volver" dentro de cada stack.
- Los wizards multi-paso (`NuevoClienteWizard`, `TrabajoNuevoWizard`) y los modales de detalle/formulario (`ClienteModal`, `VehiculosClienteModal`, `TrabajoDetalleModal`, `EmpleadoModal`, `ServicioModal`, `CostoFijoModal`, `EditarTallerModal`, etc.) **tampoco usan React Navigation**: son componentes `<Modal>` nativos de React Native controlados por booleanos (o ids) de estado local en la pantalla que los abre, así que no se benefician del native-stack de arriba. Cada wizard tiene su propia máquina de estados interna (una variable string `paso`/`fase` que determina qué Step renderizar). Para no perder el swipe-back ahí, cada Step de ambos wizards está envuelto en `components/wizard/SwipeVolver.js` (gesto de borde manual con `react-native-gesture-handler`, con su propio `GestureHandlerRootView` dentro del `<Modal>` porque gesture-handler no llega ahí a través del root de `App.js`) que dispara el mismo `onAtras` que ya usa `WizardHeader`.

**Backend / base de datos:** Supabase (Postgres) — ver sección 6 para el detalle completo del esquema. Hoy están conectados con CRUD real `talleres` + `horarios_atencion`, `clientes` + `vehiculos` y `empleados`; el resto de las tablas (`insumos`, `costos_fijos`, `servicios`, `servicio_receta_items`, `turnos`, `turno_danios`, `turno_fotos_danio`, `turno_receta_aplicada`) existen en la base pero ningún Context de negocio las lee ni escribe todavía.

**Autenticación:** real, vía Supabase Auth (`data/AuthContext.js` + `lib/supabase.js`) — ver sección 6 para el detalle completo (signup, login, verificación de email, persistencia de sesión, trigger de alta).

---

## 6. Backend / base de datos / servicios externos

**Supabase (Postgres + Auth + Storage) está conectado** para autenticación (incluida recuperación de contraseña con código OTP), `talleres` + `horarios_atencion` (bootstrap de lectura + escritura real, incluido el logo vía Storage — parcial solo por `cambiarPlan`, que sigue siendo puramente client-side, ver sección 5), y `ClienteContext` (clientes + vehículos) y `EquipoContext` (empleados) con CRUD completo real. El resto de los datos de negocio (turnos, servicios, insumos, pedido) siguen siendo 100% mock en memoria — ver sección 5 y el detalle de cada Context.

**`ClienteContext.js` — primer Context de negocio migrado del todo (lectura + escritura):**
- Fetch inicial: `supabase.from("clientes").select("id, nombre, telefono, vehiculos(id, marca, modelo, anio, patente, color)").eq("taller_id", user.id).order("nombre")` — un embedded resource de PostgREST que trae clientes y vehículos en una sola query (join por la FK `vehiculos.cliente_id`), devolviendo ya la forma anidada `{ ...cliente, vehiculos: [...] }` que espera el resto de la app, sin transformación manual (los nombres de columna en `schema.sql` ya coinciden con los campos que usa el código). Un cliente sin vehículos vuelve con `vehiculos: []` (no es inner join).
- `agregarCliente`/`agregarVehiculo` hacen `INSERT` + `.select().single()` para recuperar el `id` real generado por Supabase antes de tocar el estado local — necesario porque `NuevoClienteWizard.js` encadena `agregarCliente(...).id` → `agregarVehiculo(clienteId, ...)` → `onListo(clienteId, vehiculo.id)`, ahora todo con `await`.
- `eliminarCliente` depende de que el `DELETE ON CASCADE` de `vehiculos.cliente_id` pueda ejecutarse contra Postgres — y eso a su vez depende de que `vehiculos` tenga policy de `DELETE` en RLS (`vehiculos_delete_propio`, ver sección 6 más abajo): sin esa policy, borrar un cliente con vehículos fallaría silenciosamente.
- Consumidores de solo lectura (`ClientesScreen.js`, `SeleccionarClienteStep.js`, `HomeScreen.js`/`AgendaScreen.js` vía `getClienteById`/`getVehiculoById`, `TrabajoNuevoWizard.js`) **no se tocaron** — la forma de `clientes` en memoria quedó idéntica a la de antes de migrar. Sí se tocaron los consumidores de escritura (`ClienteModal.js`, `VehiculosClienteModal.js`, `NuevoClienteWizard.js` + `DatosVehiculoStep.js`, que sumó props `cargando`/`error` nuevas) para hacer `await` + mostrar loading/error, mismo patrón que `MisDatosScreen.js`/`EditarTallerModal.js`.

**`data/EquipoContext.js` — segundo Context de negocio migrado del todo:**
- Fetch inicial: `supabase.from("empleados").select("id, nombre, rol, telefono, activo, avatar").eq("taller_id", user.id).order("nombre")` — la tabla `empleados` no tiene `created_at`, así que se ordena alfabético. Expone `cargandoEquipo`. Mutaciones `async`, mismo criterio sin optimistic update.
- **`activo`** (boolean, default `true`) y **`avatar`** (`'hombre' | 'mujer' | null`) son columnas propias de esta migración, no del esquema original: `cambiarEstadoEmpleado` hace `UPDATE` de `activo` (desactivar en vez de borrar conserva el historial de turnos ya asignados a ese empleado, ver más abajo), y `agregarEmpleado`/`editarEmpleado` guardan `avatar` igual que el resto de los campos.
- **El límite de empleados por plan sigue siendo enteramente client-side, sin cambios:** `MiEquipoScreen.js` sigue calculando `alLimite = empleados.length >= limiteEmpleados` (con `limiteEmpleados` real desde `TallerContext`) — no hay ningún `CHECK`/trigger en `schema.sql` que lo valide en Supabase. Como parte de esta migración se sumó un guard nuevo: el botón "+" ahora también se oculta mientras `cargandoEquipo` es `true`, para no destellarlo brevemente (con `empleados` todavía en `[]`) antes de tener el conteo real de la base.
- `data/mockEquipo.js` se borró (quedó sin ningún uso, igual que pasó con `mockUser.js` al migrar la autenticación).

**`horarios_atencion` (dentro de `TallerContext.js`) — sin trigger, alta desde la app:**
- Se decidió explícitamente **no** sumar la siembra de las 7 filas al trigger `handle_new_user` (a diferencia de `talleres`): las cuentas de prueba usadas en esta conversación ya existían de antes de esta migración y no tienen fila en `talleres` creada con lógica de horarios — si se hubiera resuelto solo vía trigger, esas cuentas se hubieran quedado sin horarios igual, salvo un backfill manual aparte. Con el mecanismo elegido (la propia app crea las filas si no existen, en el bootstrap de `TallerContext`), cualquier cuenta —nueva o vieja— se autorepara sola la primera vez que abre la app después del cambio.
- `filasDbAHorarios()` (helper interno de `TallerContext.js`) hace dos cosas al traducir las filas de Supabase de vuelta a la forma que usa la UI: recorta `hora_apertura`/`hora_cierre` de `"09:00:00"` (formato `time` de Postgres) a `"09:00"` (compatible con `parsearHoraHHMM`/`formatearHoraHHMM` de `utils/fecha.js`), y reordena Lunes→Domingo según `ORDEN_DIAS` (derivado de `horariosIniciales`), porque Supabase no garantiza el orden de filas de un `SELECT` sin `ORDER BY` explícito por ese criterio.
- `MisHorariosScreen.js` no tiene un botón "Guardar" único — cada toque del `Switch` de un día o cada hora elegida en el picker dispara `actualizarHorario` al instante. Sumó un banner de error simple (mismo criterio que `MiEquipoScreen.js`) si algún guardado falla.

**Logo del taller — Supabase Storage (`supabase/storage_logos.sql`, ya corrido):**
- Bucket `logos`, **público** (es solo un logo de negocio, no info sensible — evita manejar signed URLs con expiración solo para mostrar algo que de por sí se quiere que se vea), con `file_size_limit` de 2MB y `allowed_mime_types` restringido a `image/jpeg`/`image/png`.
- Un único archivo por taller, nombre fijo `{taller_id}.{ext}` (`ext` = `jpg` o `png` según el `mimeType` real del asset que devuelve `expo-image-picker` — no se confía en parsear la URI, en Android puede venir como `content://` sin extensión). Se sube con `upsert: true`, así siempre hay un solo archivo predecible por taller (si un taller cambia de extensión entre una subida y otra, el archivo viejo queda huérfano en el bucket — limitación aceptada a propósito, no vale la pena una limpieza extra para un caso tan infrecuente).
- Políticas de `storage.objects`, mismo estilo `_propio` que `rls_tablas_negocio.sql`: `logos_select_publico` (lectura abierta a todo el bucket), `logos_insert_propio`/`logos_update_propio` (`to authenticated`, solo si el nombre del archivo matchea `{auth.uid()}.jpg|jpeg|png`). Sin `DELETE`: no existe ningún "quitar logo" en la UI.
- `TallerContext.subirLogo({ uri, mimeType })` hace `fetch(uri)` → `.arrayBuffer()` → `supabase.storage.from("logos").upload(...)` → `getPublicUrl()`, y le agrega `?t=${Date.now()}` a la URL antes de devolverla — necesario porque con `upsert` la URL pública no cambia al reemplazar el archivo, así que sin ese cache-busting la app seguiría mostrando la imagen vieja cacheada. `actualizarTaller({ nombre, logo })` sigue el mismo criterio sin optimistic update que el resto de las mutaciones de este archivo: si la subida a Storage o el `update` de `logo_url` fallan, no se toca `logoTaller` en memoria.
- `EditarTallerModal.js` guarda la elección del picker como `{ uri, mimeType }` (no solo la URI) para poder decidir extensión/`contentType` al subir, y de paso se corrigió `mediaTypes: ImagePicker.MediaTypeOptions.Images` (deprecado) a `mediaTypes: ["images"]`.

**Recuperación de contraseña — código OTP en vez de link mágico:**
- Se eligió código de 6 dígitos (`supabase.auth.verifyOtp({ type: "recovery" })`) en vez de link mágico con deep link porque el proyecto todavía se prueba con Expo Go, que no maneja deep links de forma confiable sin un build de EAS (Expo Go usa un scheme `exp://host:puerto` que cambia en cada sesión, sin URL estable para la allow-list de Supabase).
- Flujo: `OlvidePasswordScreen.js` (pide el email, llama `solicitarRecuperacion` → `supabase.auth.resetPasswordForEmail`) → `RestablecerPasswordScreen.js` (código + contraseña nueva + confirmar contraseña nueva, llama `confirmarRecuperacion` → `verifyOtp(type: "recovery")` y, si eso deja sesión activa, `updateUser({ password })`). Como `verifyOtp` ya deja una sesión activa, `FlujoApp` (`App.js`) pasa solo a `"app"` apenas se confirma el código, sin necesidad de volver a loguear a mano.
- Requiere un cambio manual en el dashboard de Supabase (ya hecho): la plantilla de mail "Reset Password" editada para mostrar `{{ .Token }}` como texto plano en vez de/además de sacar el botón `{{ .ConfirmationURL }}` — sin ese cambio, el mail seguiría mandando solo el link mágico. SMTP configurado con Zoho.

**Estados de carga y error — Taller, Clientes, Equipo (pulido, sin cambiar ninguna mutación):**
- Diagnóstico previo: `cargandoTaller`/`cargandoHorarios`/`cargandoClientes`/`cargandoEquipo` ya existían en los Contexts pero casi ninguna pantalla los usaba (`ClientesScreen.js` ni los destructuraba), y si el fetch inicial fallaba se tragaba con `console.warn` — nunca llegaba al usuario ni había forma de reintentar. Los errores de **mutación** (guardar/borrar) ya estaban bien (mensajes fijos en español, sin mostrar `error.message` crudo) — no se tocaron.
- `components/EstadoCarga.js` (nuevo, reusable): envuelve el cuerpo de una pantalla — spinner centrado si `cargando`, ícono + mensaje + botón "Reintentar" si `error`, o `children` (el contenido normal, con su propio estado de "vacío" si corresponde) si no. El header/título de cada pantalla queda siempre afuera de este componente a propósito, para que no desaparezca durante la carga — en pantallas donde antes título/aviso/lista compartían un mismo `ScrollView` (`MiEquipoScreen.js`, `MisHorariosScreen.js`) se separó el título/aviso a un bloque fijo y solo la lista quedó adentro de un `ScrollView` propio envuelto por `EstadoCarga`.
- `utils/errores.js` (nuevo): `mensajeErrorCarga(error, quePlural)`, mismo criterio que `mensajeErrorAuth` (`utils/auth.js`) pero genérico para cualquier `SELECT` — detecta error de red, si no cae a un fallback tipo `"No pudimos cargar ${quePlural}. Probá de nuevo."`. Usado por los 4 fetches iniciales (Taller, Horarios, Clientes, Equipo) en vez del `console.warn` que había antes.
- Cada Context ahora expone `errorCargaX` (string traducido o `null`) al lado de `cargandoX`, y una función `recargarX()` para el botón "Reintentar" — implementada con un contador (`intentoCargaX`) como dependencia extra del mismo `useEffect` de siempre, sin tocar el guard `cancelado` que ya usan contra condiciones de carrera.
- **Detalle encontrado de paso al tocar estos `useEffect`:** dependían de `user` (el objeto completo) en vez de `user?.id`. Como `AuthContext` arma un objeto `session`/`user` nuevo en cada refresh automático de token (`autoRefreshToken`, ~cada 1h), eso disparaba una recarga de fondo silenciosa en cada refresh — antes inofensiva porque no había spinner, pero ahora sí se notaría como un parpadeo. Se cambió la dependencia a `user?.id` en los 4 efectos (Taller, Horarios, Clientes, Equipo): solo se vuelve a disparar ante un login real, no ante cada refresh de token.
- **Bug real encontrado y arreglado de paso:** `MisDatosScreen.js` copiaba `misDatos` a estado local con `useState(misDatos)` — el initializer corre una sola vez al montar. Si el usuario entraba a "Mis Datos" antes de que `TallerContext` terminara su fetch inicial (asíncrono), el formulario quedaba pegado al valor vacío inicial para siempre, aunque los datos reales ya hubieran llegado. Se agregó un `useEffect(() => { if (!cargandoTaller) setDatos(misDatos); }, [cargandoTaller])` para resincronizar apenas termina la carga.

**Cliente Supabase (`lib/supabase.js`):** crea y exporta `supabase` (`createClient` de `@supabase/supabase-js`), leyendo `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` de `.env` (ver sección 7). Usa `AsyncStorage` (`@react-native-async-storage/async-storage`) como storage de sesión — no existe `localStorage` en React Native — y `react-native-url-polyfill/auto` porque Hermes no trae la Web API `URL` completa que el cliente usa por debajo. Tira un error explícito al importarse si faltan las variables de entorno.

**Autocompletado de direcciones (Google Places) — Edge Function `places-proxy`, backend preparado, sin deployar ni conectar:**
- `talleres` sumó `ubicacion_place_id` (text), `ubicacion_lat`/`ubicacion_lng` (numeric) junto a la `ubicacion` (text) ya existente — pensadas para guardar el resultado de elegir una dirección real vía Google Places en vez de texto libre. Columnas agregadas a mano con `ALTER TABLE` (no hay migraciones incrementales en este repo, ver nota de la sección 6 sobre `schema.sql`).
- `supabase/functions/places-proxy/index.ts` (Deno, Supabase Edge Functions) expone dos acciones por `POST`, `autocomplete` (input de texto → `predictions[]` con `placeId`/`description`, restringido a `country:ar`) y `details` (`placeId` → dirección formateada + lat/lng), ambas proxificando `maps.googleapis.com/maps/api/place/*`. Existe como intermediario porque las Web Service APIs de Google Places no se pueden restringir por `package name`/`bundle id` (esa restricción solo la respetan los SDKs nativos de Maps/Places, no un `fetch()` REST directo) — la `GOOGLE_PLACES_API_KEY` vive como secreto de la función (`supabase secrets set`), nunca en el bundle del cliente. Requiere sesión de Supabase (`supabase.functions.invoke` manda el JWT; la verificación la hace la plataforma antes de correr el código).
- **Pendiente antes de que esto funcione en la app** (ver sección 4): habilitar Places API y facturación en Google Cloud, deployar la función, y construir/conectar el componente cliente de autocompletado en "Mis Datos" — hoy no hay ningún consumidor de `places-proxy` en el código de la app.

**Esquema de base (`supabase/schema.sql`):** 13 tablas, ya corridas y verificadas contra el proyecto real (con RLS activado, sin políticas todavía salvo `talleres`). Modela los 7 Contexts en memoria: `talleres` (Taller + "Mis Datos" del titular, fusionados; `id` = `auth.users.id`), `horarios_atencion`, `clientes`, `vehiculos`, `empleados`, `insumos`, `costos_fijos`, `servicios`, `servicio_receta_items` (receta viva y editable de un servicio), `turnos`, `turno_danios`, `turno_fotos_danio`, y `turno_receta_aplicada` (**copia congelada** de la receta al momento de "Finalizado" — ver el bloque de "Consumo de stock" en la sección 5, mismo principio aplicado a nivel SQL: `servicio_id`/`insumo_id` son punteros vivos, `turno_receta_aplicada` son filas físicas insertadas una sola vez, con nombre/unidad denormalizados). Quedan **fuera de este esquema a propósito**: el catálogo de insumos (`catalogoInsumos`, sigue estático en el JS del cliente) y el carrito de "pedido a proveedor" (`PedidoContext`, sigue siendo solo estado de UI).

**Autenticación y alta de usuario (`supabase/trigger_nuevo_usuario.sql`, ya corrido):**
- Trigger `on_auth_user_created` (`AFTER INSERT ON auth.users`) ejecuta `handle_new_user()`, una función `SECURITY DEFINER` que inserta automáticamente la fila de `talleres` con el mismo `id`. `security definer` es necesario porque no existe (ni debe existir) una policy de `INSERT` para el rol `authenticated` en `talleres` — la función corre con privilegios de `postgres` (que tiene `BYPASSRLS`), así que el insert funciona a pesar de RLS. `nombre` sale de `COALESCE(nombre_taller, nombre_personal, 'Mi taller')` leído de `raw_user_meta_data` (metadata que manda `SignupScreen.js` vía `signUp({ options: { data: {...} } })`).
- **RLS de `talleres`** (`supabase/trigger_nuevo_usuario.sql`): `authenticated` puede `SELECT`/`UPDATE` únicamente su propia fila (`auth.uid() = id`). Sin policy de `INSERT` (la única vía de alta es el trigger) ni de `DELETE`.
- **RLS de las 12 tablas de negocio restantes** (`supabase/rls_tablas_negocio.sql`, ya corrido): mismo criterio que `talleres` — `to authenticated`, `auth.uid() = taller_id` directo en las tablas que tienen esa columna (`horarios_atencion`, `clientes`, `vehiculos`, `empleados`, `insumos`, `costos_fijos`, `servicios`, `turnos`), y `exists (...)` contra la tabla padre en las que no la tienen (`servicio_receta_items` vía `servicios`; `turno_danios`/`turno_fotos_danio`/`turno_receta_aplicada` vía `turnos`). Con **mínimo privilegio**, no CRUD completo parejo en todas: `insumos` y `turnos` no tienen policy de `DELETE` (no existe `eliminarInsumo`/`eliminarTurno` en el código), `turno_fotos_danio` no tiene `UPDATE`/`DELETE` (solo se agregan fotos, nunca se sacan desde la UI), y `turno_receta_aplicada` solo tiene `SELECT`/`INSERT` **a propósito** — es el snapshot congelado, bloquear `UPDATE`/`DELETE` en la base refuerza la invariante de "nunca se toca después de creado" más allá de la convención en el código. El resto de las tablas (`horarios_atencion`, `clientes`, `vehiculos`, `empleados`, `costos_fijos`, `servicios`, `servicio_receta_items`, `turno_danios`) sí tienen CRUD completo porque cada operación corresponde a una función real ya existente en su Context.
- **`data/AuthContext.js`** (`useAuth()`): `signIn(email, password)`, `signUp({ email, password, nombre, telefono, nombreTaller })`, `signOut()`, `resendConfirmation(email)`, `solicitarRecuperacion(email)`, `confirmarRecuperacion({ email, codigo, nuevaPassword })` — wrappers de `supabase.auth.signInWithPassword/signUp/signOut/resend/resetPasswordForEmail/verifyOtp+updateUser`. El proyecto tiene **"Confirm email" activado**: `signUp()` no da sesión hasta que el usuario abre el link del mail: por eso sigue existiendo `VerifyEmailScreen` (ahora con "Reenviar email" real). Después de confirmar el mail, el usuario tiene que volver a la app e iniciar sesión a mano — no hay deep linking configurado para volver automáticamente (mismo motivo por el que "Olvidé mi contraseña" usa código OTP en vez de link mágico, ver más abajo).
- `App.js` (componente `FlujoApp`) ya no decide "pantalla" a mano en base a callbacks de las pantallas: un `useEffect` mira `useAuth().session` y pasa a `"app"` solo cuando hay sesión real — cubre login exitoso y volver de un logout/token vencido.
- Errores de Supabase Auth (credenciales inválidas, email ya registrado, etc.) se traducen a español con `utils/auth.js` (`mensajeErrorAuth`).

El resto de la "data" de negocio (todo salvo clientes/vehículos y talleres) sigue siendo mock, definida en archivos estáticos y repartida por dominio (ver sección 5):
- `data/mockData.js`: ya **no** exporta clientes ni autos — `ClienteContext.js` ahora los trae de Supabase, no de ningún mock (ver arriba). Exporta `turnosIniciales` (**array vacío a propósito**, ver más abajo), `ESTADOS_TRABAJO` (`["Pendiente", "En proceso", "Finalizado", "Entregado"]`, el orden de etapas de un trabajo) y el helper `separarMarcaModelo(texto)` que parte un string tipo "Volkswagen Golf" en `{ marca: "Volkswagen", modelo: "Golf" }`.
  - **`turnosIniciales` se vació a propósito:** antes tenía 3 turnos de ejemplo con `clienteId`/`autoId` (`c1`, `c2`, `a1`, `a3`, `a2`) coordinados a mano con clientes/vehículos que en ese momento vivían hardcodeados en `ClienteContext.js`. Al migrar `ClienteContext` a Supabase esos IDs dejaron de resolver a nada real (quedaban "huérfanos", con `TurnoCard` cayendo al fallback "Cliente sin datos"/"Auto sin datos"), así que se optó por vaciar el array en vez de inventar nuevos IDs de ejemplo: Home/Agenda arrancan sin ningún turno cargado (ver sección 3).
- `data/mockInsumos.js`: catálogo investigado de insumos (`catalogoInsumos`, con marca/pH/dilución/rendimiento/precio de compra) más `misInsumosIniciales`, la estantería de ejemplo con niveles de stock variados y `capacidadTotal`/`capacidadUnidad` de ejemplo (igual criterio que `precioCompra`: valor ilustrativo, no ficha técnica confirmada). Algunas categorías (Protecciones, Interiores, Rejuvenecedores) todavía usan un producto placeholder "A definir" mientras se investigan productos reales.
- `data/mockFinanzas.js`: categorías y `costosFijosIniciales` (3 costos fijos de ejemplo) para Costos Fijos.
- `data/mockTaller.js`: ya **no** exporta `tallerInicial` ni `misDatosIniciales` (`TallerContext` los reemplazó por el bootstrap real de Supabase, ver arriba). Sigue exportando `PLANES` (catálogo de planes de suscripción y su `limiteEmpleados`: Básico 0, Intermedio 1, PRO 3), `ORDEN_PLANES`, `SITUACIONES_FISCALES` y `horariosIniciales` (horario de ejemplo: L-V 9 a 18, sábado 9 a 13, domingo cerrado — `horarios_atencion` existe como tabla en el esquema pero `TallerContext` todavía no la lee, sigue en memoria).
- `data/mockServicios.js`: `CATEGORIAS_SERVICIOS` y `serviciosIniciales` — 12 servicios de ejemplo del catálogo de Mis Servicios (dos por categoría), con `duracionEstimada` de ejemplo y `receta: []` (sin recetas reales inventadas).
- `data/mockEquipo.js` **ya no existe** — se borró al migrar `EquipoContext` a Supabase (ver arriba), quedó sin ningún uso.
- `data/mockUser.js` **ya no existe** — se borró al migrar a auth real (`usuarioActual` está reemplazado por `useAuth().user.email` y `useTaller().misDatos`/`nombreTaller` en `HomeScreen.js`, `DrawerContent.js` y `ConfiguracionScreen.js`).

Cualquier dato de negocio que se carga desde la UI (nuevo cliente, nuevo vehículo, nuevo turno) se sigue guardando **solo en memoria**, vía el `useState` del Context de su dominio correspondiente. No hay AsyncStorage/SQLite/Realm para datos de negocio (sí se usa AsyncStorage, pero solo para la sesión de Supabase Auth, ver arriba).

**Pendiente para cuando se migren también los Contexts de negocio a Supabase:** hoy "Cerrar sesión" sigue reseteando **todos los datos de negocio** a los valores de fábrica de cada mock (los 7 Providers se desmontan al salir de `pantalla === "app"`) — es el comportamiento esperado mientras esos Contexts sigan en memoria. La autenticación en sí y los datos de `talleres` ya NO se pierden: los base (sobreviven en Supabase) y ahora también las ediciones de `actualizarMisDatos`/`actualizarTaller.nombre`, que escriben de verdad (ver sección 5) — solo `logo`, `cambiarPlan` y `actualizarHorario` siguen sin persistirse. Cuando se migre cada Context de negocio, hay que asegurarse de que "cerrar sesión" siga significando solo "cerrar el acceso" y no borre ni resetee ningún dato real.

---

## 7. Variables de entorno o configuración necesaria

**Ahora sí hacen falta dos variables de entorno para correr el proyecto**, en un archivo `.env` en la raíz (no versionado — `.gitignore` tiene `.env` explícito, no solo el patrón `.env*.local` de antes):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Se leen en `lib/supabase.js` (`process.env.EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY`) para armar el cliente de Supabase — el prefijo `EXPO_PUBLIC_` es el mecanismo propio de Expo para exponer una env var al bundle del cliente (ver sección 1, Expo SDK 54). Sin este archivo, la app tira un error explícito al arrancar ("Faltan EXPO_PUBLIC_SUPABASE_URL y/o EXPO_PUBLIC_SUPABASE_ANON_KEY...") — no hay ningún fallback mock para auth como sí lo hay para el resto de los datos de negocio.

La `anon key` es pública por diseño (pensada para el cliente, sujeta a RLS) — igual no se commitea porque identifica el proyecto de Supabase. No hace falta la `service_role key` ni ninguna otra credencial para correr la app.

**Aparte, para la Edge Function `places-proxy` (ver sección 6, todavía no deployada):** `GOOGLE_PLACES_API_KEY` — no es una env var del cliente (no lleva prefijo `EXPO_PUBLIC_`), es un secreto del lado del servidor que se setea con `supabase secrets set GOOGLE_PLACES_API_KEY=...` contra el proyecto de Supabase, nunca en `.env` ni en el bundle de la app.

---

## 8. Convenciones que se están siguiendo

**Idioma:** todo el código está en **español** (nombres de variables, funciones, componentes, comentarios y textos de la UI). Ejemplos: `handleFinalizarVehiculo`, `agregarCliente`, `onAtras`, `onContinuar`, `esVehiculoNuevo`. Un colaborador nuevo debería seguir esta misma convención al agregar código, no mezclar inglés.

**Nombres de archivos:**
- Componentes y pantallas: `PascalCase.js` (ej. `Button.js`, `HomeScreen.js`, `ClienteModal.js`).
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
- IDs de entidades nuevas se generan como `` `${prefijo}${Date.now()}` `` (`c...` clientes, `v...` vehículos —antes `a...` autos, cambió al migrar a `ClienteContext`—, `t...` turnos, `mi...` insumos, `cf...` costos fijos, `sv...` servicios, `emp...` empleados) — no se usa ninguna librería de UUID.

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

- **Inconsistencia en `app.json`:** `"userInterfaceStyle": "light"` sigue seteado, pero toda la UI está diseñada exclusivamente en modo oscuro (`colors.bg` casi negro, `StatusBar style="light"` en todas las pantallas). Esto puede afectar cómo el sistema operativo trata la interfaz nativa (splash screen, controles del sistema) en algunos casos. Habría que revisar si conviene cambiarlo a `"dark"` o dejarlo así intencionalmente.
- **Sin borrado de turnos:** ver detalle en sección 4 (`TurnoContext.js` sigue sin exponer función de delete). Para clientes/vehículos ya no aplica esta limitación: `eliminarCliente`/`eliminarVehiculo` de `ClienteContext.js` están conectados a la UI (`ClienteModal.js`, `VehiculosClienteModal.js`).
- **`separarMarcaModelo` es ingenuo:** parte el string por espacios y asume que la primera palabra es la marca y el resto el modelo (`data/mockData.js`, usado desde `NuevoClienteWizard.js`). Un input como "BMW" (sin modelo) genera `modelo: ""`, y una marca de dos palabras (ej. "Alfa Romeo") se partiría mal (marca: "Alfa", modelo: "Romeo ..."). No hay selector de marca/modelo desde una lista. `VehiculosClienteModal.js`, en cambio, ya pide marca y modelo como campos separados — la inconsistencia entre ambos flujos de alta de vehículo (uno con `marcaModelo` combinado, otro con campos separados) vale la pena tenerla presente.
- **IDs por `Date.now()`:** en teoría dos registros creados en el mismo milisegundo (poco probable con interacción humana, pero posible en tests automatizados o llamadas programáticas) generarían el mismo ID. Se usa en todos los dominios (clientes `c...`, vehículos `v...`, turnos `t...`, insumos `mi...`, costos fijos `cf...`, servicios `sv...`, empleados `emp...`).
- **Sin tests ni linting:** no hay ningún framework de testing configurado, ni ESLint/Prettier (se intentó correr `npx eslint` en esta revisión y falló por falta de `eslint.config.*`, confirmando que no hay configuración). Cualquier verificación de calidad de código hoy es 100% manual.
- **Ingresos y costos hardcodeados:** `INGRESOS_EJEMPLO`/`COSTOS_VARIABLES_EJEMPLO` en `FinanzasScreen.js` son valores fijos/inventados de ejemplo — no deben confundirse con un cálculo real (ver sección 4). El equivalente que tenía Home (`INGRESOS_DEL_MES`) ya no existe: se sacó el StatCard entero en vez de dejarlo con un valor de ejemplo.
- **Comentario desactualizado en `utils/fecha.js`:** el comentario de cabecera del archivo dice que el campo `fecha` de un turno es "texto libre cargado a mano... sin date picker todavía", pero eso ya no es así (`DatosServicioStep.js` usa `DateTimePicker` — ver sección 1 y 3). El comentario de `formatearFechaDDMMAAAA`, más abajo en el mismo archivo, sí está al día. No afecta el comportamiento, pero puede confundir a quien lea el archivo de arriba hacia abajo.

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
6. **Hace falta un archivo `.env`** con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` de un proyecto de Supabase real, con el esquema de `supabase/schema.sql` + `supabase/trigger_nuevo_usuario.sql` + `supabase/rls_tablas_negocio.sql` ya corridos (ver sección 7) — sin esto la app no arranca (y sin las políticas de RLS, `talleres` y `clientes`/`vehiculos` quedan bloqueadas para todos, incluso el dueño). El resto de los datos de negocio (turnos, servicios, insumos, etc.) sigue siendo mock, sin nada más que configurar.
7. Al abrir la app: Splash → Login. La autenticación es **real**: hay que registrarse (Signup → confirmar el mail que llega, "Confirm email" está activado → volver e iniciar sesión) o usar una cuenta ya creada en ese proyecto de Supabase. Ya no vale "cualquier email con formato válido".

### Convenciones a respetar
- Escribir todo en **español** (nombres de variables, funciones, comentarios, textos de UI) para mantener consistencia con el resto del código.
- Usar siempre los tokens de `theme.js` en vez de colores/tamaños hardcodeados.
- Seguir el patrón existente de componentes funcionales + `StyleSheet.create` al final del archivo.
- Si se agrega un paso nuevo a un wizard, seguir el patrón "controlado" (`datos`, `onCambiar`, `onAtras`, `onContinuar`) en vez de que el Step maneje su propio estado global.
- Antes de escribir código que use APIs de Expo o React Native, revisar la doc versionada de Expo SDK indicada en `AGENTS.md` (`https://docs.expo.dev/versions/v57.0.0/`) en vez de asumir comportamientos de memoria — la API cambia seguido entre versiones de Expo.

### Partes delicadas que no conviene romper sin querer
- **La data está repartida en 7 Context de negocio + 1 de autenticación (ver sección 5), no en uno solo:** `ClienteContext.js` es la fuente de verdad de clientes/vehículos, `TurnoContext.js` la de turnos, `TallerContext.js` la del taller/plan, `ServicioContext.js`/`EquipoContext.js` la de servicios/empleados. `DataContext.js` ya no tiene nada que ver con ninguno de esos. Cualquier cambio en la forma de los objetos `cliente`/`vehículo` (en `ClienteContext.js`) o `turno` (en `TurnoContext.js`) hay que propagarlo a todos los lugares que los leen — y como un turno solo guarda `clienteId`/`autoId` como referencia (no los datos completos), cualquier componente que muestre un turno con su cliente/auto (`HomeScreen`, `AgendaScreen`, `TurnoCard`, `TrabajoDetalleModal`) necesita consumir **ambos** Contexts (`useTurnos()` + `useClientes()`) a la vez.
- **Los wizards y formularios controlados por `visible` (`NuevoClienteWizard`, `TrabajoNuevoWizard`, `ClienteModal`, `VehiculosClienteModal`, `EditarTallerModal`, etc.) se resetean por `useEffect` cuando `visible` pasa a `true`** — si se agrega un nuevo campo de estado a alguno, hay que acordarse de resetearlo ahí también, o va a persistir de una apertura del modal/wizard a la siguiente.
- **El flujo de "Cliente nuevo" → `ConfirmarTrabajoModal` → "Trabajo nuevo"** depende de que `handleFinalizarVehiculo` en `NuevoClienteWizard.js` guarde el cliente/vehículo **antes** de llamar a `onListo(clienteId, vehiculoId)` (que en `HomeScreen.js` es lo que dispara la pregunta) — si se reordena esa lógica, hay que asegurarse de que el guardado siga ocurriendo independientemente de si el usuario responde "Sí" o "No" en el modal.
- **El límite de empleados por plan se valida en la pantalla, no en el Context:** `MiEquipoScreen.js` filtra `empleadosActivos = empleados.filter(e => e.activo)` y compara `empleadosActivos.length` contra `useTaller().limiteEmpleados` para decidir si mostrar el botón "+" (los inactivos no cuentan para el límite, ver sección 3). `EquipoContext.js` no conoce el plan y agregaría un empleado igual si se lo llamara directo — cualquier otro punto de entrada nuevo para agregar empleados (por ejemplo, una futura API) tendría que repetir esa misma validación.
- **`data/AuthContext.js` es la única fuente de verdad de si el usuario está autenticado** (`session`); `App.js`/`FlujoApp` solo refleja ese estado en la variable `pantalla` vía un `useEffect`, ya no lo decide él mismo. Si se agrega una pantalla nueva que necesite saber si hay sesión (o el email del usuario), usar `useAuth()` — no asumir que `pantalla === "app"` es suficiente por sí sola, es solo la UI reflejando el Context.
- **`TallerContext` depende de `AuthContext` para su bootstrap** (necesita `useAuth().user.id` para el `SELECT` a `talleres`): si algún día se reordenan los Providers en `App.js`, `AuthProvider` tiene que seguir siendo ancestro de `TallerProvider` (y de los otros 6), o `useAuth()` tira el error "debe usarse dentro de AuthProvider".
