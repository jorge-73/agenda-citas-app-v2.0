import type { ChatPageContext } from "../types";

export const PAGE_CONTEXT: Record<string, ChatPageContext> = {
  "/": {
    pathname: "/",
    title: "Página principal",
    description:
      "El usuario se encuentra en la página de inicio pública de CitasMed, con presentación del sistema y acceso al flujo de reserva online.",
  },
  "/booking": {
    pathname: "/booking",
    title: "Reserva online",
    description:
      "El usuario se encuentra en el asistente de reserva online pública de 6 pasos: especialidad, profesional, fecha, horario, datos del paciente y confirmación.",
  },
  "/booking/confirmation": {
    pathname: "/booking/confirmation",
    title: "Confirmación de reserva",
    description:
      "El usuario acaba de completar una reserva online y se encuentra en la pantalla de confirmación.",
  },
  "/login": {
    pathname: "/login",
    title: "Inicio de sesión",
    description:
      "El usuario se encuentra en el formulario de inicio de sesión.",
  },
  "/register": {
    pathname: "/register",
    title: "Registro",
    description:
      "El usuario se encuentra en el formulario de registro de una cuenta nueva (rol paciente).",
  },
  "/forgot-password": {
    pathname: "/forgot-password",
    title: "Recuperar contraseña",
    description:
      "El usuario se encuentra en el formulario para solicitar la recuperación de contraseña.",
  },
  "/reset-password": {
    pathname: "/reset-password",
    title: "Nueva contraseña",
    description:
      "El usuario se encuentra en el formulario para definir una nueva contraseña con un token recibido por email.",
  },
  "/dashboard": {
    pathname: "/dashboard",
    title: "Dashboard",
    description:
      "El usuario se encuentra en el panel principal con métricas, gráficos y actividad reciente del sistema.",
  },
  "/dashboard/appointments": {
    pathname: "/dashboard/appointments",
    title: "Gestión de citas",
    description:
      "El usuario se encuentra en la sección donde se visualizan y gestionan las citas: calendario día/semana/mes, filtros, creación, edición y eliminación.",
  },
  "/dashboard/patients": {
    pathname: "/dashboard/patients",
    title: "Pacientes",
    description:
      "El usuario se encuentra en la sección de gestión de pacientes: listado, búsqueda, creación, edición y exportación.",
  },
  "/dashboard/patients/[id]": {
    pathname: "/dashboard/patients/[id]",
    title: "Detalle de paciente",
    description:
      "El usuario se encuentra en la ficha de detalle de un paciente, con sus datos personales y citas asociadas.",
  },
  "/dashboard/specialists": {
    pathname: "/dashboard/specialists",
    title: "Especialistas",
    description:
      "El usuario se encuentra en la sección de gestión de especialistas: listado, creación, edición, disponibilidad y exportación.",
  },
  "/dashboard/specialists/[id]": {
    pathname: "/dashboard/specialists/[id]",
    title: "Detalle de especialista",
    description:
      "El usuario se encuentra en la ficha de detalle de un especialista, con sus datos y horarios.",
  },
  "/dashboard/schedules": {
    pathname: "/dashboard/schedules",
    title: "Horarios",
    description:
      "El usuario se encuentra en la sección de configuración y gestión de horarios de los especialistas por día de la semana.",
  },
  "/dashboard/blocked-dates": {
    pathname: "/dashboard/blocked-dates",
    title: "Días bloqueados",
    description:
      "El usuario se encuentra en la sección de fechas bloqueadas (días no laborables), con opción de recurrencia anual.",
  },
  "/dashboard/bookings": {
    pathname: "/dashboard/bookings",
    title: "Reservas online",
    description:
      "El usuario se encuentra en la sección de gestión de reservas online recibidas: confirmación y cancelación.",
  },
  "/dashboard/users": {
    pathname: "/dashboard/users",
    title: "Usuarios",
    description:
      "El usuario se encuentra en la sección de administración de usuarios: creación, cambio de rol y eliminación (solo administradores).",
  },
  "/dashboard/settings": {
    pathname: "/dashboard/settings",
    title: "Configuración",
    description:
      "El usuario se encuentra en la sección de configuración: perfil, contraseña, preferencias de notificación y tema.",
  },
};

const DETAIL_PREFIXES: Record<string, ChatPageContext> = {
  "/dashboard/patients": PAGE_CONTEXT["/dashboard/patients/[id]"],
  "/dashboard/specialists": PAGE_CONTEXT["/dashboard/specialists/[id]"],
};

export function resolvePageContext(pathname: string): ChatPageContext {
  if (PAGE_CONTEXT[pathname]) {
    return PAGE_CONTEXT[pathname];
  }

  for (const [prefix, context] of Object.entries(DETAIL_PREFIXES)) {
    if (pathname.startsWith(prefix + "/")) {
      return context;
    }
  }

  const orderedRoutes = Object.entries(PAGE_CONTEXT).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [route, context] of orderedRoutes) {
    if (route !== "/" && pathname.startsWith(route + "/")) {
      return context;
    }
  }

  return {
    pathname,
    title: "CitasMed",
    description:
      "El usuario se encuentra en una sección de CitasMed sin contexto específico registrado.",
  };
}