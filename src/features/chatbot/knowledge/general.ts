export const GENERAL_KB = `
## Información general del sistema

CitasMed es un sistema de gestión de citas médicas con los siguientes módulos reales: dashboard con estadísticas, gestión de citas con calendario, pacientes, especialistas, horarios por especialista, días bloqueados, reservas online (booking público) y su gestión, usuarios y configuración.

Roles existentes: ADMIN (acceso completo, incluye gestión de usuarios), SPECIALIST (médico: citas, horarios, pacientes, reservas), RECEPTIONIST (recepción: citas, pacientes, especialistas, horarios, días bloqueados, reservas), PATIENT (paciente con cuenta: vista de dashboard, citas y configuración).

## Autenticación

- Registro: en /register se crea una cuenta con nombre, email y contraseña. El rol asignado es siempre paciente. El registro inicia sesión automáticamente.
- Inicio de sesión: en /login con email y contraseña. La opción "Recordarme" extiende la sesión a 30 días.
- Recuperación de contraseña: en /forgot-password se solicita un enlace por email; desde ese enlace se define la nueva contraseña en /reset-password.
- Cambio de contraseña: desde Dashboard → Configuración → pestaña Seguridad (requiere la contraseña actual).

## Reserva online pública (sin necesidad de cuenta)

- Flujo de 6 pasos en /booking: 1) elegir especialidad, 2) elegir profesional disponible, 3) elegir fecha, 4) elegir horario disponible, 5) ingresar datos personales (nombre, apellido, email, teléfono), 6) confirmar.
- Al confirmar se muestra una pantalla de confirmación con el resumen de la reserva.
- Los horarios disponibles dependen de los horarios configurados del especialista y de las fechas bloqueadas.
- Se envía una notificación por email con la reserva. Nota de esta versión demo: los emails se envían únicamente a la dirección verificada del administrador del sistema.
`;

export const DASHBOARD_KB = `
## Dashboard

El panel principal muestra:
- Métricas: total de citas en el período, ingresos estimados (suma del precio de consulta de los especialistas), citas canceladas, pacientes nuevos, reservas online nuevas y especialistas activos.
- Gráficos: citas por día, reservas online por día, ingresos por especialista y distribución por especialidad.
- Listados: citas de hoy, pacientes recientes y actividad reciente del sistema.
- Se puede filtrar por rango de fechas desde el selector superior.
- Acceso restringido por rol mediante permisos de visualización.
`;

export const APPOINTMENTS_KB = `
## Gestión de citas (Dashboard → Citas)

- Vista de calendario con tres vistas: día, semana y mes, con navegación entre períodos y botón "Hoy".
- Filtros disponibles: estado, especialista, paciente y rango de fechas.
- Crear cita: botón "Nueva cita" abre un formulario con paciente, especialista, fecha/hora de inicio y fin, motivo y notas.
- Editar cita: al hacer clic en una cita del calendario se abre el formulario con los mismos campos; permite también cambiar el estado.
- Estados reales de las citas: PENDIENTE, CONFIRMADO, CANCELADO, FINALIZADO y AUSENTE.
- Eliminar cita: disponible al editar, con confirmación.
- Exportación: botón para exportar el listado a CSV.
- Permisos: ver citas (view:appointments) y gestionarlas (manage:appointments). Los pacientes con cuenta pueden ver la sección de citas pero no gestionarlas.
`;

export const PATIENTS_KB = `
## Pacientes (Dashboard → Pacientes)

- Listado con búsqueda y exportación a CSV.
- Crear paciente: formulario con nombre, email, teléfono, tipo de sangre, documento, fecha de nacimiento, dirección y contacto de emergencia.
- Editar y eliminar paciente desde las acciones de cada fila.
- Ficha de detalle: desde el listado se abre la ficha del paciente con sus datos personales y sus citas asociadas.
- Permisos: ver pacientes (view:patients) y gestionarlos (manage:patients).
`;

export const SPECIALISTS_KB = `
## Especialistas (Dashboard → Especialistas)

- Listado con búsqueda y exportación a CSV.
- Crear especialista: formulario con nombre, email, especialidad, licencia, teléfono, precio de consulta, disponibilidad para citas (interruptor) y biografía.
- Editar y eliminar especialista desde las acciones de cada fila.
- El interruptor "Disponible para citas" controla si el especialista aparece en el flujo de reserva online público.
- Ficha de detalle: datos del especialista y sus horarios.
- Permisos: ver especialistas (view:specialists) y gestionarlos (manage:specialists).
`;

export const SCHEDULES_KB = `
## Horarios (Dashboard → Horarios)

- Los horarios se configuran por especialista y por día de la semana (de lunes a domingo).
- Para cada día se define hora de inicio y hora de fin, y se puede activar o desactivar el horario.
- Estos horarios determinan los turnos disponibles en la reserva online y en el calendario de citas.
- Permisos: ver horarios (view:schedules) y gestionarlos (manage:schedules). Los especialistas pueden gestionar sus propios horarios.
`;

export const BLOCKED_DATES_KB = `
## Días bloqueados (Dashboard → Días bloqueados)

- Permite bloquear fechas no laborables (feriados, vacaciones).
- Al crear un bloqueo se ingresa la fecha y un motivo.
- Opción "Recurrente cada año": el bloqueo se aplica automáticamente todos los años en la misma fecha.
- Los días bloqueados se respetan en el flujo de reserva online y en la generación de turnos.
- Permisos: ver (view:blocked-dates) y gestionar (manage:blocked-dates) días bloqueados.
`;

export const BOOKINGS_KB = `
## Reservas online (Dashboard → Reservas)

- Lista las reservas recibidas desde el flujo público de /booking.
- Estados reales de las reservas: PENDIENTE, CONFIRMADA y CANCELADA.
- Acciones disponibles: confirmar una reserva pendiente y cancelar una reserva.
- Los datos de la reserva incluyen datos del paciente, especialidad, especialista, fecha, horario y motivo.
- Permisos: ver reservas (view:bookings) y gestionarlas (manage:bookings).
`;

export const USERS_KB = `
## Usuarios (Dashboard → Usuarios)

- Sección exclusiva del rol ADMIN.
- Crear usuario: nombre, email, contraseña y rol (Administrador, Especialista, Recepcionista o Paciente).
- Cambiar el rol de un usuario existente y eliminar usuarios.
- No se puede eliminar un usuario que tenga citas asociadas; primero deben desasociarse las citas.
- Los permisos de cada rol se aplican automáticamente al iniciar sesión (control de acceso por rol en rutas y acciones).
- Permisos: ver usuarios (view:users) y gestionarlos (manage:users).
`;

export const SETTINGS_KB = `
## Configuración (Dashboard → Configuración)

- Perfil: nombre, email, teléfono y zona horaria.
- Seguridad: cambio de contraseña (requiere la contraseña actual).
- Preferencias: notificaciones por email, recordatorios de citas, alertas de nuevas reservas y resumen semanal de actividad.
- Tema: alternar entre modo claro y oscuro (también disponible desde la barra superior).
`;

export const EXPORTS_KB = `
## Exportaciones

- Las tablas de citas, pacientes y especialistas incluyen un botón de exportación a CSV desde sus respectivas secciones del dashboard.
- El archivo se descarga con los datos del listado actual.
`;