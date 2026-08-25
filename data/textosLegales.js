// Borradores de trabajo de Términos y Condiciones / Política de Privacidad,
// todavía pendientes de revisión legal (ver el banner de aviso en
// DocumentoLegalScreen.js) — no son la versión definitiva.

export const TERMINOS_Y_CONDICIONES = `DETALLARG — TÉRMINOS Y CONDICIONES (BORRADOR)
Última actualización: [completar fecha]

NOTA: Este es un borrador de trabajo generado como punto de partida. Antes de publicarlo
como versión oficial, debe ser revisado por un abogado, en particular en lo referido a
tratamiento de datos personales (Ley 25.326) y a la normativa de defensa del consumidor
aplicable en Argentina.

1. QUIÉNES SOMOS
DetallArg es una aplicación destinada a talleres de detailing en Argentina para la gestión
de clientes, vehículos, turnos, check-in con fotos y firma digital, insumos y finanzas.
[Completar: razón social, CUIT, domicilio legal una vez constituida la SAS]

2. ACEPTACIÓN DE LOS TÉRMINOS
Al crear una cuenta en DetallArg, el usuario declara haber leído, comprendido y aceptado
estos Términos y Condiciones y la Política de Privacidad. Si no está de acuerdo, no debe
utilizar la aplicación.

3. USO DE LA APLICACIÓN
- DetallArg está destinada a talleres de detailing y personal autorizado por estos.
- El usuario es responsable de la veracidad de los datos que carga (propios, de su taller,
  de sus clientes y de los vehículos).
- El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
- Está prohibido usar la aplicación para fines ilícitos o que infrinjan derechos de terceros.

4. DATOS DE CLIENTES DEL TALLER
El usuario (taller) carga en la aplicación datos personales de sus propios clientes
(nombre, teléfono, datos del vehículo, fotos del estado del vehículo, firma digital).
El taller actúa como responsable de esos datos frente a sus clientes, y DetallArg actúa
como proveedor de la herramienta. [Completar con el abogado: rol de encargado/responsable
de tratamiento según Ley 25.326, y si corresponde un acuerdo de tratamiento de datos
entre DetallArg y el taller]

5. PLANES Y SUSCRIPCIÓN
[Completar cuando exista un flujo de pago real: planes disponibles, precios, forma de
pago, política de cancelación y reembolsos]

6. PROPIEDAD INTELECTUAL
La aplicación, su marca, diseño y código son propiedad de DetallArg / [razón social] y
no pueden reproducirse, copiarse ni distribuirse sin autorización.

7. LIMITACIÓN DE RESPONSABILIDAD
DetallArg se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida del
servicio. [Completar con el abogado: alcance de la limitación de responsabilidad por
pérdida de datos, dado que hoy no hay persistencia real ni backups]

8. MODIFICACIONES
Podemos modificar estos Términos en cualquier momento. Los cambios relevantes se
notificarán dentro de la aplicación.

9. LEY APLICABLE Y JURISDICCIÓN
Estos Términos se rigen por las leyes de la República Argentina. [Completar: jurisdicción
específica, ej. tribunales ordinarios de la ciudad de [completar]]

10. CONTACTO
soporte@detallarg.com`;

export const POLITICA_PRIVACIDAD = `DETALLARG — POLÍTICA DE PRIVACIDAD (BORRADOR)
Última actualización: [completar fecha]

NOTA: Borrador de partida, pendiente de revisión legal. En Argentina rige la Ley 25.326
de Protección de Datos Personales — este texto no reemplaza el asesoramiento de un
abogado especializado.

1. RESPONSABLE DEL TRATAMIENTO
[Completar: razón social, CUIT, domicilio, email de contacto para temas de privacidad]

2. QUÉ DATOS RECOLECTAMOS
a) Datos del usuario (persona del taller que usa la app):
   nombre, email, teléfono, datos de la cuenta.
b) Datos que el taller carga sobre sus propios clientes:
   nombre, teléfono, datos del vehículo (marca, modelo, patente, año, color), fotos del
   estado del vehículo (check-in), firma digital, historial de turnos y servicios.
c) Datos técnicos: [completar si en el futuro se agrega analytics, crash reporting, etc.
   — hoy no hay ninguno integrado].

3. PARA QUÉ USAMOS LOS DATOS
- Brindar el servicio de gestión de turnos, clientes, vehículos e insumos.
- Generar comprobantes de check-in con fotos y firma digital.
- Comunicarnos con el usuario por soporte o novedades del producto.
- [Completar si se usan datos con fines estadísticos o de mejora del producto]

4. DÓNDE SE ALMACENAN LOS DATOS
[Completar una vez definida la infraestructura real: hoy en desarrollo (main) los datos
no se persisten (viven solo en memoria mientras la app está abierta); la migración a
Supabase, en curso, va a persistir los datos en una base de datos real. Especificar
proveedor de hosting, ubicación de los servidores y si hay transferencia internacional
de datos.]

5. CON QUIÉN COMPARTIMOS LOS DATOS
No vendemos datos personales a terceros. [Completar: si se usan proveedores de
infraestructura (ej. Supabase) como encargados de tratamiento, listarlos acá]

6. DERECHOS DEL USUARIO (Ley 25.326)
El usuario y, en su caso, los clientes del taller, tienen derecho a acceder, rectificar,
actualizar y suprimir sus datos personales. Para ejercer estos derechos pueden escribir a
soporte@detallarg.com. La Agencia de Acceso a la Información Pública, en su carácter de
Órgano de Control de la Ley 25.326, tiene la atribución de atender denuncias y reclamos
que interpongan quienes resulten afectados en sus derechos.

7. SEGURIDAD
[Completar con las medidas técnicas reales una vez migrado a Supabase: autenticación,
cifrado, políticas de acceso (RLS), etc.]

8. FOTOS Y FIRMA DIGITAL
Las fotos de check-in y la firma digital se utilizan exclusivamente para documentar el
estado del vehículo al momento del ingreso/egreso del taller. [Completar: tiempo de
retención de estas fotos]

9. MENORES DE EDAD
La aplicación no está destinada a menores de edad.

10. CAMBIOS EN ESTA POLÍTICA
Podemos actualizar esta política. Los cambios relevantes se notificarán dentro de la
aplicación.

11. CONTACTO
Para consultas sobre privacidad: soporte@detallarg.com`;
