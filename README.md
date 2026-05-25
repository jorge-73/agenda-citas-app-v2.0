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
- **Diseño premium** con animaciones Framer Motion, glass effect y gradientes
- **Responsive** para todos los dispositivos
- **TypeScript** estricto con validaciones Zod (+70 tests unitarios)

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
├── features/             # Arquitectura feature-based (11 módulos)
│   ├── auth/              # Autenticación y Server Actions (rate limit + rememberMe)
│   ├── booking/           # Reservas públicas + gestión dashboard
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
│   ├── email.ts         # Nodemailer (reset password, confirmaciones)
│   ├── export.ts        # Exportación CSV
│   ├── permissions.ts   # RBAC con 4 roles y 17 permisos
│   ├── rate-limit.ts    # Rate limiter in-memory (login, register, reset)
│   ├── date-utils.ts    # Utilidades timezone (toUTC, fromUTC, formatInTz)
│   ├── constants.ts     # Constantes (MAX_LIMIT, PHONE_REGEX, TIME_REGEX)
│   ├── action-helpers.ts# Helpers para server actions (validateInput)
│   └── utils.ts         # Helpers (cn, getInitials, etc.)
├── store/               # Zustand stores (auth, ui)
├── schemas/              # Zod schemas de autenticación
├── types/               # TypeScript types y augmentación NextAuth
└── prisma/              # Schema, seed y migraciones
    ├── schema.prisma
    ├── seed.ts
    └── migrations/
```

## 🏃‍♂️ Inicio Rápido

### Prerrequisitos
- Node.js 18+
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

# SMTP (opcional — Mailtrap para desarrollo, Resend para producción)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
EMAIL_FROM=noreply@citamed.com
```

### Ejecutar Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@citamed.com | admin123 |
| Med. General | dr.juan.perez@citamed.com | doctor123 |
| Cardióloga | dra.laura.martinez@citamed.com | doctor123 |
| Pediatra | dr.carlos.gomez@citamed.com | doctor123 |
| Dermatóloga | dra.ana.rodriguez@citamed.com | doctor123 |
| Traumatólogo | dr.pablo.fernandez@citamed.com | doctor123 |
| Psicóloga | dra.sofia.lopez@citamed.com | doctor123 |
| Recepcionista | recepcion@citamed.com | recep123 |
| Paciente | paciente@test.com | paciente123 |

> Todos los especialistas usan la misma contraseña `doctor123`.

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
6. Ejecutar migraciones y seed contra Neon: `npx prisma db push && npm run db:seed`
7. Hacer push a `main` — Vercel deploya automáticamente

### Variables de Entorno en Vercel

| Variable | Fuente |
|----------|--------|
| `DATABASE_URL` | Neon (integrado automáticamente) |
| `DIRECT_URL` | Neon (`DATABASE_URL_UNPOOLED`) |
| `NEXTAUTH_SECRET` | Generar con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` |
| `SMTP_PASSWORD` | Resend API Key (ej. `re_...`) |
| `EMAIL_FROM` | `CitasMed <onboarding@resend.dev>` o dominio verificado |

> **Nota**: El plan gratuito de Resend solo envía a direcciones verificadas. Para enviar a cualquier destinatario, verificar un dominio propio.
>
> **Nota**: El rate limiter es in-memory (local). En producción con múltiples instancias serverless, considerar migrar a Redis/Upstash para escalar.

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