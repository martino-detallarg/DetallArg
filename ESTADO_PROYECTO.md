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
- Sin Supabase, Firebase, ni ningún SDK de backend.
- Sin testing configurado (no hay Jest ni ningún otro framework de tests en `package.json`).
- Sin ESLint/Prettier configurado (no hay archivos `.eslintrc*` ni `.prettierrc*` en el repo).
- Gestor de paquetes: **npm** (hay `package-lock.json`, no hay `yarn.lock` ni `pnpm-lock.yaml`).

---

## 2. Estructura de carpetas y archivos

```
detallarg-app/
├── App.js                     # Punto de entrada de la UI: carga fuentes, splash, y el switch manual entre pantallas (splash/login/signup/verify-email/app); anida los 7 Providers de datos (ver sección 5)
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
│   ├── fecha.js                 # Parseo/formateo de fechas "DD/MM/AAAA" para la Agenda y el date picker del wizard (parsearFechaDDMMAAAA, formatearFechaDDMMAAAA, obtenerDiasDeLaSemana, etc.), más parsearHoraHHMM/formatearHoraHHMM para el time picker de Mis Horarios
│   └── formato.js                # formatearPesos(): Intl.NumberFormat es-AR/ARS compartido por las pantallas de Finanzas
│
├── data/                      # "Backend" simulado — toda la data vive acá, en memoria, repartida en un Context por dominio (ver sección 5)
│   ├── DataContext.js         # Context "resto": misInsumos[] (con capacidadTotal/capacidadUnidad por insumo) y costosFijos[] + funciones CRUD-ish, más getInsumoById y descontarInsumos (consumo de stock por receta de servicio, ver sección 5)
│   ├── ClienteContext.js      # Context de clientes[], cada uno con vehiculos[] anidados
│   ├── TurnoContext.js        # Context de turnos[] (agregarTurno, actualizarTurno/actualizarEstadoTrabajo, getTurnoById) — actualizarEstadoTrabajo descuenta insumos y congela `recetaAplicada` al pasar a "Finalizado" (ver sección 5)
│   ├── PedidoContext.js       # Context del carrito de "pedido a proveedor" (agregarAlPedido, quitarDelPedido, estaEnPedido), compartido entre Mis Insumos y Notificaciones
│   ├── TallerContext.js       # Context de datos del taller: nombre/logo, "Mis Datos" del titular, plan de suscripción + límite de empleados (PLANES), y horario de atención (horarios/actualizarHorario, ver Mis Horarios)
│   ├── ServicioContext.js     # Context del catálogo de "Mis Servicios" (agregarServicio, editarServicio, eliminarServicio, getServicioById) — cada servicio incluye duracionEstimada y receta[] de insumos (ver sección 5)
│   ├── EquipoContext.js       # Context de empleados de "Mi Equipo" (agregarEmpleado, editarEmpleado, eliminarEmpleado) — no valida el límite del plan, eso lo hace MiEquipoScreen.js antes de abrir el alta
│   ├── mockData.js            # turnosIniciales + ESTADOS_TRABAJO + helper separarMarcaModelo() (ya no exporta clientes/autos, migrados a ClienteContext)
│   ├── mockInsumos.js / mockFinanzas.js / mockTaller.js / mockServicios.js / mockEquipo.js  # Datos iniciales de insumos, costos fijos, taller/planes/horarios, catálogo de servicios y equipo
│   ├── tiposDanio.js          # Catálogo de tipos de daño (TIPOS_DANIO) para cualquier diagrama de check-in visual
│   └── mockUser.js            # Usuario "logueado" hardcodeado (usuarioActual)
│
├── navigation/
│   └── DashboardNavigator.js  # Drawer navigator: Home, Clientes, Agenda, Mi Taller, Finanzas, Mis Datos/Insumos/Servicios/Horarios, Mi Equipo, Notificaciones, Soporte, Configuración (con sus rutas de Términos/Privacidad) — ya no quedan rutas placeholder
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
│   ├── EmpleadoModal.js                            # Alta/edición de empleado de Mi Equipo, mismo patrón que ClienteModal
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
│   ├── LoginScreen.js           # Login con validación de formato (no autentica contra nada real)
│   ├── SignupScreen.js           # Registro con validación de formato (no crea cuenta real)
│   ├── VerifyEmailScreen.js       # Pantalla "verificá tu email" con botón "reenviar" simulado
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
- Modo "cliente": carga datos del cliente (nombre, teléfono) → carga datos del vehículo → se guardan ambos.
- Modo "vehículo": elige un cliente existente (con buscador) → carga datos del vehículo → se guarda.
- Al terminar de guardar el vehículo, `HomeScreen.js` muestra `components/ConfirmarTrabajoModal.js` ("¿Querés cargar un trabajo nuevo para este cliente?") con dos botones:
  - "Sí" → abre el wizard de Trabajo Nuevo con el cliente/vehículo ya preseleccionados (salteando esos pasos de selección ahí).
  - "No" → cierra el flujo y vuelve a Home. El cliente y el vehículo ya quedaron guardados en ambos casos, porque el guardado ocurre antes de mostrar esta pregunta.
- Validaciones de campos obligatorios en cada paso (nombre/teléfono del cliente, patente/marca-modelo del vehículo), con formateo automático de patente tipo `AB 123 CD`. El año del vehículo es opcional.

**Wizard "Trabajo nuevo" (`screens/trabajoNuevo/`):**
- Si no viene con cliente/vehículo preseleccionados: elegir cliente (buscador) → elegir vehículo de ese cliente. Son 4 pasos numerados en ese caso (3 si se saltea la selección).
- Datos del servicio (`DatosServicioStep.js`): el servicio se elige como chip del catálogo de `ServicioContext` (ya no es texto libre — si todavía no se cargó ningún servicio en Mis Servicios, se muestra un aviso en vez de la lista); fecha y hora con **date/time picker nativo** (`DateTimePicker` de `@react-native-community/datetimepicker`, mismo criterio para ambos: diálogo en Android, bottom-sheet propio en iOS vía `SelectorFechaModal`/`SelectorHoraModal`, ver sección 1); tiempo estimado sigue siendo texto libre; observaciones opcional.
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
- Header con logo (editable) y nombre del taller, con acceso a `EditarTallerModal` (cambiar nombre y logo vía `expo-image-picker`).
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
- Listado de empleados (nombre, rol, teléfono), con alta/edición (`EmpleadoModal`) y borrado. Arranca vacío.
- El alta está limitada por el plan de suscripción del taller (`TallerContext`): Básico permite 0 empleados, Intermedio 1, PRO 3 (`PLANES` en `data/mockTaller.js`). Al llegar al límite, el botón "+" se oculta y se muestra un aviso con el plan actual y su límite.
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
- **Cuenta**: tarjeta de solo lectura con nombre/empresa/email (`usuarioActual`) y el plan actual (`TallerContext`), más un acceso "Editar mis datos" que navega a `MisDatosScreen` (no duplica esos campos acá).
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
- Autenticación real (ver sección 5 y 6) — hoy es 100% simulada.
- Persistencia de datos: todo vive en memoria (React state), se pierde al cerrar sesión o recargar la app.
- **Borrado de turnos:** `TurnoContext.js` sigue sin exponer ninguna función de delete — solo `agregarTurno`/`actualizarTurno`. Para clientes/vehículos ya no es el caso: `ClienteContext.js` expone `eliminarCliente`/`eliminarVehiculo` y **ya están conectados a la UI** (botón "Eliminar cliente" en `ClienteModal`, tacho por vehículo en `VehiculosClienteModal`).
- Cálculo real de ingresos: `INGRESOS_DEL_MES` en `HomeScreen.js` (Home) e `INGRESOS_EJEMPLO` en `FinanzasScreen.js` son valores fijos/inventados, no se calculan a partir de turnos ni de ningún dato real. Lo mismo pasa con "costos variables" en Finanzas (`COSTOS_VARIABLES_EJEMPLO`).
- Recuperación de contraseña: el link "¿Olvidaste tu contraseña?" en `LoginScreen.js` no tiene `onPress` (no hace nada).
- Perfil de usuario editable: `usuarioActual` en `data/mockUser.js` está hardcodeado y no se actualiza con los datos que carga el usuario en Signup.
- **Restringir horas por horario de atención:** hoy Mis Horarios (`MisHorariosScreen.js`, `TallerContext.js`) es solo informativo (ver sección 3) — no está conectado al wizard de Trabajo Nuevo de ninguna forma. Fecha y hora ya tienen date/time picker nativo (ver sección 1 y 3); queda pendiente cruzar la fecha elegida con el día de semana correspondiente en `horarios` para restringir las horas seleccionables (o avisar si ese día está marcado como cerrado).
- **Reversión de "Finalizado" no repone stock (limitación consciente):** si un trabajo se mueve de "Finalizado" a otro estado anterior desde `TrabajoDetalleModal`, el stock que se descontó al finalizarlo **no se repone automáticamente** — `TurnoContext.actualizarEstadoTrabajo` solo descuenta una vez (guardado en `turno.recetaAplicada`) y nunca resta en sentido inverso. Si hace falta corregir el stock en ese caso, el ajuste se hace a mano desde Mis Insumos.
- **Sin bloqueo por stock insuficiente:** al finalizar un trabajo, si algún insumo de la receta no tiene stock suficiente, `nivel` simplemente clampea a 0 (no puede quedar negativo) — no se bloquea el pasaje a "Finalizado" ni se muestra un aviso aparte del que ya existe para stock bajo en Notificaciones.
- Pagos / flujo de compra de plan real: el plan de suscripción del taller (Básico/Intermedio/PRO) hoy solo se puede cambiar desde el panel de pruebas de desarrollo (`PanelPruebasPlan.js` en Mi Equipo), no hay ningún flujo de compra ni checkout.
- Envío real del pedido a proveedor (Mis Insumos/Notificaciones) y del "reportar un problema" de Soporte: ambos son placeholders de UI — el pedido arma un resumen local sin enviarlo a ningún lado, y "reportar un problema" abre el cliente de mail del usuario (`mailto:`) en vez de mandar algo a un backend propio.

---

## 5. Decisiones de arquitectura importantes

**Manejo de estado — patrón de un Context por dominio:**
- El estado de negocio no vive en un único Context genérico. Cada dominio tiene su propio Context + Provider, todos con la misma forma interna (`useState` en memoria, sin `useReducer` ni librería externa, `value` memoizado con `useMemo`):
  - **`data/ClienteContext.js`** (`useClientes()`): clientes, cada uno con sus vehículos **anidados** en `cliente.vehiculos` (no hay una tabla `autos` separada). Expone `agregarCliente`, `editarCliente`, `eliminarCliente`, `agregarVehiculo`, `editarVehiculo`, `eliminarVehiculo`, `getClienteById`, `getVehiculoById` (esta última recorre todos los clientes buscando el vehículo por id, para los casos —como un turno— que solo tienen el id a mano).
  - **`data/TurnoContext.js`** (`useTurnos()`): turnos, expone `agregarTurno`, `actualizarTurno`, `actualizarEstadoTrabajo`, `getTurnoById`. Sin `eliminarTurno` (ver sección 4). `actualizarEstadoTrabajo` ya no es un simple atajo sobre `actualizarTurno` — ver el bloque "Consumo de stock por receta de servicio" más abajo.
  - **`data/TallerContext.js`** (`useTaller()`): datos del taller (`nombreTaller`, `logoTaller`, `actualizarTaller`), los datos personales del titular ("Mis Datos": `misDatos`, `actualizarMisDatos`), el **plan de suscripción** (`plan`, `limiteEmpleados` derivado de `PLANES[plan]` en `data/mockTaller.js`, y `cambiarPlan` — hoy solo lo llama el panel de pruebas de Mi Equipo, sin pagos reales conectados), y el **horario de atención** (`horarios`, array de 7 días con `{ dia, abierto, horaApertura, horaCierre }`, y `actualizarHorario(dia, cambios)` — solo informativo, no lo consume ningún otro Context ni el wizard de Trabajo Nuevo, ver sección 4).
  - **`data/PedidoContext.js`** (`usePedido()`): el carrito de "pedido a proveedor" compartido entre Mis Insumos y Notificaciones — `pedido`, `agregarAlPedido`, `quitarDelPedido`, `estaEnPedido`.
  - **`data/ServicioContext.js`** (`useServicios()`): catálogo de "Mis Servicios" — `servicios`, `agregarServicio`, `editarServicio`, `eliminarServicio`, `getServicioById`. Cada servicio tiene `duracionEstimada` (minutos) y `receta` (`[{ insumoId, cantidad }]`, cantidad en la unidad del insumo referenciado).
  - **`data/EquipoContext.js`** (`useEquipo()`): empleados de "Mi Equipo" — `empleados`, `agregarEmpleado`, `editarEmpleado`, `eliminarEmpleado`. No valida el límite del plan a nivel de Context: esa validación la hace `MiEquipoScreen.js` antes de abrir el alta (oculta el botón "+" si `empleados.length >= limiteEmpleados`).
  - **`data/DataContext.js`** (`useData()`): quedó como el Context "de lo que sobra" — hoy solo `misInsumos` y `costosFijos` (insumos del taller y costos fijos de Finanzas), con `agregarInsumo`, `getInsumoById`, `descontarInsumos`, `agregarCostoFijo`, `actualizarCostoFijo`, `eliminarCostoFijo`. No tiene clientes, autos ni turnos. Cada insumo suma `capacidadTotal`/`capacidadUnidad` (envase) además de `nivel` (0-100).
  - Los **7 Providers** se anidan en `App.js`, todos envolviendo solo la parte autenticada de la app (`pantalla === "app"`), en este orden: `DataProvider > ClienteProvider > ServicioProvider > TurnoProvider > TallerProvider > PedidoProvider > EquipoProvider`. Acá el orden **sí importa**: `TurnoContext` llama a `useServicios()` y `useData()` internamente (para el consumo de stock, ver más abajo), así que `TurnoProvider` tiene que quedar anidado por debajo de `ServicioProvider` y de `DataProvider`. Si se agrega un Context nuevo que necesite datos de otro, hay que anidarlo de la misma forma (por debajo del que provee esos datos).

**Consumo de stock por receta de servicio (`TurnoContext.js` + `ServicioContext.js` + `DataContext.js`):**
- Cuando `actualizarEstadoTrabajo(id, "Finalizado")` se llama sobre un turno que todavía no tiene `recetaAplicada` y tiene `servicioId`, se busca el servicio (`getServicioById`) y, si tiene `receta`, se llama a `descontarInsumos(servicio.receta)` de `DataContext` (convierte cada `cantidad` a puntos de `nivel` usando `capacidadTotal` del insumo, clamp a 0 — nunca bloquea ni queda negativo) y se guarda en el turno una **copia congelada** en `turno.recetaAplicada` (`[{ insumoId, nombreInsumo, unidad, cantidad }]`, con nombre y unidad resueltos en ese momento, no solo el id).
- **Por qué se congela una copia:** si más adelante se edita la receta del servicio (`ServicioModal`), esa edición solo afecta a los próximos trabajos que se finalicen — los turnos ya finalizados guardan su propio snapshot en `recetaAplicada` y no se recalculan ni se ven afectados.
- **Por qué no se descuenta dos veces:** los estados de un trabajo se pueden mover libremente para adelante y atrás desde `TrabajoDetalleModal` (no es una máquina de estados que solo avanza). El guard `!turno.recetaAplicada` asegura que el descuento (y el snapshot) ocurran una única vez por turno, aunque se vuelva a pasar por "Finalizado" más de una vez.
- Turnos sin `servicioId` (los 3 turnos de ejemplo de `mockData.js`) o con `receta` vacía no disparan ningún descuento.
- Si un insumo referenciado en la receta **viva** de un servicio fue borrado de Mis Insumos, `RecetaServicioStep.js` lo muestra aparte como línea de solo lectura ("Insumo eliminado") en vez de romper la pantalla, y `descontarInsumos` simplemente lo ignora (no hay ninguna función de borrado de insumos implementada todavía, pero el código ya contempla el caso).
- Ver limitaciones explícitas relacionadas en la sección 4: no se repone stock al revertir "Finalizado", y no se bloquea el pasaje a "Finalizado" por stock insuficiente.
- **Acoplamiento entre dominios vía IDs, no vía Context:** un turno (`TurnoContext`) no contiene el cliente ni el vehículo completos, solo `clienteId`/`autoId` como referencia. Para resolverlos a datos reales hay que llamar a `getClienteById`/`getVehiculoById` de `useClientes()` por separado — son dos Contexts distintos que un mismo componente (`HomeScreen.js`, `AgendaScreen.js`) tiene que consumir juntos. Si se agrega un campo nuevo a un turno o a un vehículo, hay que revisar ambos Contexts y todos los lugares que cruzan datos de los dos.
- **Al cerrar sesión se destruye todo el estado en memoria** (los 7 Providers se desmontan al salir de `pantalla === "app"`), y al volver a loguearse cada Context arranca de cero con sus datos iniciales — `ClienteContext` arranca con 2 clientes de ejemplo (`c1`, `c2`) y sus vehículos anidados (`a1`, `a2`, `a3`), y `TurnoContext` arranca con `turnosIniciales` de `mockData.js` (ver sección 6). Los IDs de ambos sets de datos de ejemplo están coordinados a propósito para que los turnos de ejemplo muestren cliente y vehículo reales. `EquipoContext` arranca vacío (coherente con el plan Básico por defecto, que no permite ningún empleado).

**Navegación:**
- El flujo superior de pantallas (Splash → Login → Signup → VerifyEmail → App) **no usa React Navigation**. Es un `switch` manual controlado por un `useState("splash")` en `App.js` (variable `pantalla`). Por eso no hay gestos de "volver atrás" nativos ni historial entre esas pantallas — cada transición es una función que cambia ese string.
- Recién dentro de la app autenticada (`pantalla === "app"`) se monta un `NavigationContainer` con un **Drawer Navigator** (`DashboardNavigator.js`) como único navegador. No hay Stack Navigator ni Bottom Tabs.
- Los wizards multi-paso (`NuevoClienteWizard`, `TrabajoNuevoWizard`) y los modales de detalle/formulario (`ClienteModal`, `VehiculosClienteModal`, `TrabajoDetalleModal`, `EmpleadoModal`, `ServicioModal`, `CostoFijoModal`, `EditarTallerModal`, etc.) **tampoco usan React Navigation**: son componentes `<Modal>` nativos de React Native controlados por booleanos (o ids) de estado local en la pantalla que los abre. Cada wizard tiene su propia máquina de estados interna (una variable string `paso`/`fase` que determina qué Step renderizar).

**Backend / base de datos:** no existe ninguno todavía — ver sección 6.

**Autenticación:** no existe ninguna real todavía — ver sección 6. Las pantallas de Login/Signup solo validan formato de campos en el cliente (regex de email, longitud de contraseña, coincidencia de confirmación) y, si pasan la validación, simplemente cambian la pantalla activa. No hay tokens, sesión persistida, ni llamada a ningún servicio.

---

## 6. Backend / base de datos / servicios externos

**No hay ninguno conectado.** Se verificó explícitamente (grep sobre todo el código fuente) que no existen llamadas a `fetch`, `axios`, ni SDKs de Supabase, Firebase, o cualquier otro servicio. Tampoco hay uso de `process.env` en ningún archivo.

Toda la "data" de la app es mock, definida en archivos estáticos y repartida por dominio (ver sección 5):
- `data/mockData.js`: ya **no** exporta clientes ni autos (eso se movió a `ClienteContext.js`). Exporta `turnosIniciales` (3 turnos de ejemplo), `ESTADOS_TRABAJO` (`["Pendiente", "En proceso", "Finalizado", "Entregado"]`, el orden de etapas de un trabajo) y el helper `separarMarcaModelo(texto)` que parte un string tipo "Volkswagen Golf" en `{ marca: "Volkswagen", modelo: "Golf" }`.
  - **Detalle a tener en cuenta:** los `clienteId`/`autoId` (`c1`, `c2`, `a1`, `a3`, `a2`) de los turnos de ejemplo en `turnosIniciales` están coordinados a mano con los clientes/vehículos de ejemplo hardcodeados en `ClienteContext.js` — si se edita uno de los dos lados sin el otro, esos turnos de ejemplo dejan de resolver a un cliente/vehículo real y `TurnoCard` cae al fallback "Cliente sin datos" / "Auto sin datos" que tiene para ese caso.
- `data/mockInsumos.js`: catálogo investigado de insumos (`catalogoInsumos`, con marca/pH/dilución/rendimiento/precio de compra) más `misInsumosIniciales`, la estantería de ejemplo con niveles de stock variados y `capacidadTotal`/`capacidadUnidad` de ejemplo (igual criterio que `precioCompra`: valor ilustrativo, no ficha técnica confirmada). Algunas categorías (Protecciones, Interiores, Rejuvenecedores) todavía usan un producto placeholder "A definir" mientras se investigan productos reales.
- `data/mockFinanzas.js`: categorías y `costosFijosIniciales` (3 costos fijos de ejemplo) para Costos Fijos.
- `data/mockTaller.js`: `PLANES` (catálogo de planes de suscripción y su `limiteEmpleados`: Básico 0, Intermedio 1, PRO 3), `tallerInicial` (arranca en plan Básico), `misDatosIniciales` (datos personales del titular, precargados con `usuarioActual`) y `horariosIniciales` (horario de ejemplo: L-V 9 a 18, sábado 9 a 13, domingo cerrado).
- `data/mockServicios.js`: `CATEGORIAS_SERVICIOS` y `serviciosIniciales` — 12 servicios de ejemplo del catálogo de Mis Servicios (dos por categoría), con `duracionEstimada` de ejemplo y `receta: []` (sin recetas reales inventadas).
- `data/mockEquipo.js`: `empleadosIniciales`, hoy un array vacío (coherente con el plan Básico por defecto).
- `data/mockUser.js`: un único usuario hardcodeado (`usuarioActual`), usado para mostrar el nombre en el saludo de Home, el email/empresa en el drawer, y como valores por defecto de "Mis Datos".

Cualquier dato que se carga desde la UI (nuevo cliente, nuevo vehículo, nuevo turno) se guarda **solo en memoria**, vía el `useState` del Context de su dominio correspondiente. No hay ninguna base de datos local (no hay AsyncStorage, SQLite, ni Realm) ni remota.

**Pendiente para cuando se migre a un backend real (ej. Supabase):** hoy "Cerrar sesión" resetea **todos** los datos a los valores de fábrica de cada mock, porque los 7 Providers se desmontan al salir de `pantalla === "app"` (ver sección 5) y no hay ninguna persistencia detrás — es el comportamiento esperado mientras todo vive en memoria. Cuando se conecte un backend real, hay que asegurarse de que "cerrar sesión" pase a significar solo "cerrar el acceso" (invalidar la sesión/token) y **no** borrar ni resetear ningún dato — los datos del taller tienen que sobrevivir al logout y estar ahí de nuevo al volver a loguearse.

---

## 7. Variables de entorno o configuración necesaria

**Hoy no hace falta configurar ninguna variable de entorno para correr el proyecto.** No existe ningún archivo `.env` en el repo, y no se encontró ningún uso de `process.env` en el código — confirmado por búsqueda directa en el código fuente.

El `.gitignore` ya tiene contemplado un patrón `.env*.local` por si en el futuro se agrega algún archivo de entorno, pero actualmente no se usa.

Lo único que hace falta para correr el proyecto localmente es tener el entorno de Expo funcionando (ver sección 10) — no hay claves de API, ni credenciales, ni configuración de terceros que preparar.

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
- **Link "¿Olvidaste tu contraseña?" sin funcionalidad:** en `LoginScreen.js` el `TouchableOpacity` no tiene `onPress` asignado.
- **Sin tests ni linting:** no hay ningún framework de testing configurado, ni ESLint/Prettier (se intentó correr `npx eslint` en esta revisión y falló por falta de `eslint.config.*`, confirmando que no hay configuración). Cualquier verificación de calidad de código hoy es 100% manual.
- **Ingresos y costos hardcodeados:** `INGRESOS_DEL_MES` en `HomeScreen.js`, e `INGRESOS_EJEMPLO`/`COSTOS_VARIABLES_EJEMPLO` en `FinanzasScreen.js`, son valores fijos/inventados de ejemplo — no deben confundirse con un cálculo real (ver sección 4).
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
6. **No hace falta configurar ninguna variable de entorno ni credencial** (ver sección 7) — el proyecto corre standalone con datos mock.
7. Al abrir la app: Splash → Login. **Cualquier email con formato válido y cualquier contraseña no vacía entran** (no hay autenticación real todavía) — no hace falta un usuario/contraseña específico.

### Convenciones a respetar
- Escribir todo en **español** (nombres de variables, funciones, comentarios, textos de UI) para mantener consistencia con el resto del código.
- Usar siempre los tokens de `theme.js` en vez de colores/tamaños hardcodeados.
- Seguir el patrón existente de componentes funcionales + `StyleSheet.create` al final del archivo.
- Si se agrega un paso nuevo a un wizard, seguir el patrón "controlado" (`datos`, `onCambiar`, `onAtras`, `onContinuar`) en vez de que el Step maneje su propio estado global.
- Antes de escribir código que use APIs de Expo o React Native, revisar la doc versionada de Expo SDK indicada en `AGENTS.md` (`https://docs.expo.dev/versions/v57.0.0/`) en vez de asumir comportamientos de memoria — la API cambia seguido entre versiones de Expo.

### Partes delicadas que no conviene romper sin querer
- **La data está repartida en 7 Context (ver sección 5), no en uno solo:** `ClienteContext.js` es la fuente de verdad de clientes/vehículos, `TurnoContext.js` la de turnos, `TallerContext.js` la del taller/plan, `ServicioContext.js`/`EquipoContext.js` la de servicios/empleados. `DataContext.js` ya no tiene nada que ver con ninguno de esos. Cualquier cambio en la forma de los objetos `cliente`/`vehículo` (en `ClienteContext.js`) o `turno` (en `TurnoContext.js`) hay que propagarlo a todos los lugares que los leen — y como un turno solo guarda `clienteId`/`autoId` como referencia (no los datos completos), cualquier componente que muestre un turno con su cliente/auto (`HomeScreen`, `AgendaScreen`, `TurnoCard`, `TrabajoDetalleModal`) necesita consumir **ambos** Contexts (`useTurnos()` + `useClientes()`) a la vez.
- **Los wizards y formularios controlados por `visible` (`NuevoClienteWizard`, `TrabajoNuevoWizard`, `ClienteModal`, `VehiculosClienteModal`, `EditarTallerModal`, etc.) se resetean por `useEffect` cuando `visible` pasa a `true`** — si se agrega un nuevo campo de estado a alguno, hay que acordarse de resetearlo ahí también, o va a persistir de una apertura del modal/wizard a la siguiente.
- **El flujo de "Cliente nuevo" → `ConfirmarTrabajoModal` → "Trabajo nuevo"** depende de que `handleFinalizarVehiculo` en `NuevoClienteWizard.js` guarde el cliente/vehículo **antes** de llamar a `onListo(clienteId, vehiculoId)` (que en `HomeScreen.js` es lo que dispara la pregunta) — si se reordena esa lógica, hay que asegurarse de que el guardado siga ocurriendo independientemente de si el usuario responde "Sí" o "No" en el modal.
- **El límite de empleados por plan se valida en la pantalla, no en el Context:** `MiEquipoScreen.js` compara `empleados.length` contra `useTaller().limiteEmpleados` para decidir si mostrar el botón "+". `EquipoContext.js` no conoce el plan y agregaría un empleado igual si se lo llamara directo — cualquier otro punto de entrada nuevo para agregar empleados (por ejemplo, una futura API) tendría que repetir esa misma validación.
- **`App.js` es el único lugar donde se decide si el usuario está "autenticado"** (variable `pantalla`). Si en el futuro se conecta un backend real de auth, este es el punto de entrada a modificar (hoy no hay ningún guard real, es solo UI).
