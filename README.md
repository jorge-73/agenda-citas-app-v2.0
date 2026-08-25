# CitasMed - Sistema de Gestión de Citas Médicas

Sistema profesional de gestión de citas médicas construido con Next.js 16.2.6, TypeScript y arquitectura moderna.

## 🚀 Características

- **Autenticación segura** con NextAuth.js y JWT
- **Gestión de usuarios** con roles (Admin, Especialista, Recepcionista, Paciente)
- **Dashboard profesional** con estadísticas en tiempo real y 4 tipos de gráficos (Recharts)
- **Booking público** wizard de 4 pasos para pacientes sin cuenta
- **Gestión de reservas** en dashboard (confirmar/cancelar)
- **Calendario de citas** con vistas día/semana/mes
- **Gestión de horarios** por especialista y día de semana
- **RBAC** con 4 roles (Admin, Especialista, Recepcionista, Paciente) y 17 permisos
- **Notificaciones por email** (confirmación booking, cambio estado, reset password)
- **Rate limiting** en login, registro y reset de contraseña
- **Zona horaria dinámica** por usuario (guardada en preferencias + JWT)
- **Recordarme** en login (sesión extendida 30 días)
- **Exportación CSV** de citas, pacientes y especialistas
- **Dark/Light mode** con next-themes
- **Asistente virtual** global (IA) con contexto por rol y página, sin datos médicos
- **Diseño premium** con animaciones Framer Motion, glass effect y gradientes
- **Responsive** para todos los dispositivos
- **TypeScript** estricto con validaciones Zod (+150 tests unitarios)

## 🛠️ Tech Stack

### Frontend
- Next.js 16.2.6 (App Router)
- TypeScript
- TailwindCSS 4
- shadcn/ui (Radix UI)
- Framer Motion
- React Hook Form + Zod 4.4.3
- Zustand (state management)
- Lucide Icons

### Backend
- Next.js Server Actions
- Prisma ORM
- PostgreSQL (Neon serverless — producción / Docker — desarrollo)
- NextAuth.js v5

## 📁 Estructura del Proyecto

```
src/
├── proxy.ts               # Middleware alternativo (auth + RBAC)
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (public)/           # Rutas públicas (sin autenticación)
│   │   ├── booking/       # Reserva de citas
│   │   │   └── confirmation/
│   │   └── page.tsx       # Landing page
│   ├── dashboard/          # Dashboard protegido (10 secciones)
│   │   ├── appointments/
│   │   ├── bookings/      # Gestión de reservas online
│   │   ├── patients/
│   │   ├── specialists/
│   │   ├── schedules/
│   │   ├── blocked-dates/
│   │   ├── users/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/[...nextauth]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/               # Componentes base shadcn
│   ├── layout/           # Sidebar, Navbar, PageTransition, etc.
│   ├── shared/           # EmptyState, LoadingState (reutilizables)
│   └── providers.tsx     # ThemeProvider
├── features/             # Arquitectura feature-based (12 módulos)
│   ├── auth/              # Autenticación y Server Actions (rate limit + rememberMe)
│   ├── booking/           # Reservas públicas + gestión dashboard
│   ├── chatbot/           # Asistente virtual (IA, KB, rate limit, contexto)
│   ├── dashboard/         # Dashboard con estadísticas y gráficos
│   ├── appointments/      # Gestión de citas (calendario multi-vista)
│   ├── patients/          # Gestión de pacientes
│   ├── schedules/         # Horarios de especialistas
│   ├── specialists/       # Gestión de especialistas
│   ├── blocked-dates/     # Fechas bloqueadas
│   ├── users/             # Administración de usuarios
│   ├── settings/          # Configuración del sistema
│   └── shared/            # Constantes y utilidades compartidas
├── lib/                  # Utilidades y configuración
│   ├── auth.ts          # NextAuth config (JWT + timezone + rememberMe)
│   ├── db.ts            # Prisma client (singleton)
│   ├── email.ts         # Resend REST API (reset password, confirmaciones)
│   ├── export.ts        # Exportación CSV
│   ├── permissions.ts   # RBAC con 4 roles y 17 permisos
│   ├── rate-limit.ts    # Rate limiter persistente (login, register, reset)
│   ├── date-utils.ts    # Utilidades timezone (toUTC, fromUTC, formatInTz)
│   ├── constants.ts     # Constantes (MAX_LIMIT, PHONE_REGEX, TIME_REGEX)
│   ├── action-helpers.ts# Helpers para server actions (requireAuth, requirePermission)
│   └── utils.ts         # Helpers (cn, getInitials, etc.)
├── store/               # Zustand stores (auth, ui, chatbot)
├── schemas/              # Zod schemas de autenticación
├── types/               # TypeScript types y augmentación NextAuth
├── scripts/              # Mantenimiento puntual de datos
└── prisma/              # Schema, seed y migraciones
    ├── schema.prisma
    ├── seed.ts
    └── migrations/
```

## 🏃‍♂️ Inicio Rápido

### Prerrequisitos
- Node.js 20.9+
- npm o yarn
- PostgreSQL 16 (nativo o Docker)

### Instalación

**Opción A — PostgreSQL nativo (recomendado en Windows):**

```bash
# Clonar el repositorio
git clone <repo-url>
cd agenda-citas-app-v2.0

# Instalar dependencias
npm install

# Asegurar que PostgreSQL 17 está iniciado
# (Servicio: postgresql-x64-17)

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Ejecutar seed (opcional)
npm run db:seed
```

**Opción B — PostgreSQL con Docker:**

```bash
docker run --name citamed-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=citamed_db -p 5432:5432 -d postgres:16
npx prisma generate
npx prisma db push
npm run db:seed
```

### Variables de Entorno

Crear `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citamed_db?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/citamed_db?schema=public
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Resend (API Key — https://resend.com/api-keys)
SMTP_PASSWORD=re_your_resend_api_key
EMAIL_FROM="CitasMed <onboarding@resend.dev>"

# Asistente virtual (Gemini API Key — https://aistudio.google.com/apikey)
AI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-3.1-flash-lite
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

### Ejecutar Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 👤 Usuarios de Prueba

El seed crea usuarios de desarrollo con emails conocidos, pero toma sus contraseñas de
`SEED_ADMIN_PASSWORD`, `SEED_SPECIALIST_PASSWORD`, `SEED_RECEPTIONIST_PASSWORD` y
`SEED_PATIENT_PASSWORD`. Usa valores únicos de al menos 12 caracteres y nunca reutilices
contraseñas de desarrollo en producción.

## 🗄️ Modelos de Base de Datos

| Modelo | Descripción |
|--------|-------------|
| User | Usuarios del sistema (Admin, Especialista, Paciente) |
| Specialist | Datos del especialista (especialidad, licencia, precio) |
| Patient | Datos del paciente (teléfono, documento, historial médico) |
| Appointment | Citas programadas entre paciente y especialista |
| Schedule | Horarios disponibles por especialista |
| BlockedDate | Fechas bloqueadas (días festivos) |
| Booking | Reservas públicas sin cuenta de usuario |
| UserPreference | Preferencias de usuario (notificaciones, timezone) |
| PasswordResetToken | Tokens para restablecimiento de contraseña |
| RateLimit | Ventanas de rate limiting persistentes |

## 📝 Scripts Disponibles

```bash
npm run dev            # Iniciar desarrollo
npm run build          # Construir producción (incluye prisma generate)
npm run start          # Iniciar producción
npm run lint           # Lint code
npm run test           # Tests en watch mode
npm run test:run       # Tests una sola vez (CI)
npm run test:coverage  # Tests con reporte de cobertura
npm run db:seed        # Ejecutar seed
npm run db:backfill-bookings       # Auditar bookings confirmadas sin appointment
npm run db:backfill-bookings -- --apply  # Aplicar el backfill auditado
npm run db:studio      # Abrir Prisma Studio
```

## 🚀 Deploy en Producción

### Stack
- **Hosting**: [Vercel](https://vercel.com) (Next.js full-stack)
- **Base de datos**: [Neon](https://neon.tech) (PostgreSQL serverless)
- **Email**: [Resend](https://resend.com) API REST

### Pasos

1. Conectar el repositorio de GitHub en Vercel e importar el proyecto
2. En Vercel → Storage → Conectar Neon Postgres (crea la DB y agrega `DATABASE_URL` automáticamente)
3. Agregar `DIRECT_URL` manualmente en Vercel (usar el valor `DATABASE_URL_UNPOOLED` de Neon)
4. Configurar Resend y agregar API Key en Vercel (`SMTP_PASSWORD`)
5. Agregar `NEXTAUTH_SECRET` y `NEXTAUTH_URL` en Vercel
6. Agregar `AI_API_KEY` en Vercel (asistente virtual; `AI_MODEL` y `AI_BASE_URL` opcionales)
7. Ejecutar migraciones y seed contra Neon: `npx prisma migrate deploy && npm run db:seed`
8. Auditar bookings confirmadas sin appointment: `npm run db:backfill-bookings`
9. Aplicar el backfill auditado: `npm run db:backfill-bookings -- --apply`
10. Hacer push a `main` — Vercel deploya automáticamente

### Variables de Entorno en Vercel

| Variable | Fuente |
|----------|--------|
| `DATABASE_URL` | Neon (integrado automáticamente) |
| `DIRECT_URL` | Neon (`DATABASE_URL_UNPOOLED`) |
| `NEXTAUTH_SECRET` | Generar con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` |
| `SMTP_PASSWORD` | Resend API Key (ej. `re_...`) |
| `EMAIL_FROM` | `CitasMed <onboarding@resend.dev>` o dominio verificado |
| `AI_API_KEY` | Google AI Studio (Gemini API Key) |
| `AI_MODEL` | `gemini-3.1-flash-lite` (por defecto) |
| `AI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |

> **Nota**: El plan gratuito de Resend solo envía a direcciones verificadas. Para enviar a cualquier destinatario, verificar un dominio propio.
>
> **Nota**: El rate limiter usa PostgreSQL para compartir límites entre instancias serverless. Si la tabla `RateLimit` no existe, las acciones protegidas fallan de forma segura hasta aplicar las migraciones.

## 🤖 Asistente Virtual (IA)

El asistente CitasMed es un chatbot global visible en todas las páginas (excepto las de autenticación), accesible desde el botón flotante inferior derecho.

- **Proveedor**: Google Gemini (Free Tier) mediante API compatible con OpenAI (`AI_BASE_URL`/`AI_MODEL` configurables, abstracción lista para otros proveedores).
- **Contexto**: la respuesta se personaliza con el rol y permisos reales del usuario (resuelto en servidor) y la sección donde se encuentra.
- **Seguridad**: rate limit de 10 mensajes/minuto por cuenta o IP; validación Zod de mensajes; nunca se envía a la IA información médica, datos de pacientes ni de otros usuarios.
- **Limitaciones del Free Tier**: cuotas de uso (RPM/RPD) limitadas por proyecto; Google puede usar los prompts para mejorar sus modelos. Si el modelo no está disponible, configurar `AI_MODEL=gemini-2.5-flash-lite`.
- **Sin persistencia**: el historial de conversación vive en memoria (se pierde al recargar la página).

## 🔄 Base de Datos

### PostgreSQL Nativo (recomendado en Windows)

```powershell
# Verificar estado del servicio
Get-Service postgresql-x64-17

# Iniciar servicio si está detenido
Start-Service postgresql-x64-17

# Aplicar migraciones
npx prisma db push

# Crear migración (después de cambios en schema.prisma)
npx prisma migrate dev --name descripcion_cambio

# Abrir Prisma Studio
npm run db:studio
```

### PostgreSQL con Docker (alternativa)

```bash
docker start citamed-pg
docker stop citamed-pg
npx prisma db push
npx prisma migrate dev --name descripcion_cambio
npm run db:studio
```

## 📄 Licencia

MIT License - feel free to use this project.
