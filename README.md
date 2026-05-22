# CitasMed - Sistema de Gestión de Citas Médicas

Sistema profesional de gestión de citas médicas construido con Next.js 16.2.6, TypeScript y arquitectura moderna.

## 🚀 Características

- **Autenticación segura** con NextAuth.js y JWT
- **Gestión de usuarios** con roles (Admin, Especialista, Recepcionista, Paciente)
- **Dashboard profesional** con estadísticas en tiempo real y 4 tipos de gráficos (Recharts)
- **Booking público** wizard de 4 pasos para pacientes sin cuenta
- **Calendario de citas** con vistas día/semana/mes
- **Gestión de horarios** por especialista y día de semana
- **RBAC** con 4 roles (Admin, Especialista, Recepcionista, Paciente) y 15 permisos
- **Notificaciones por email** (confirmación booking, cambio estado, reset password)
- **Exportación CSV** de citas, pacientes y especialistas
- **Dark/Light mode** con next-themes
- **Diseño premium** con animaciones Framer Motion, glass effect y gradientes
- **Responsive** para todos los dispositivos
- **TypeScript** estricto con validaciones Zod

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
- PostgreSQL (desarrollo con Docker / producción)
- NextAuth.js v5

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (public)/           # Rutas públicas (sin autenticación)
│   │   ├── booking/       # Reserva de citas
│   │   │   └── confirmation/
│   │   └── page.tsx       # Landing page
│   ├── dashboard/          # Dashboard protegido (9 secciones)
│   │   ├── appointments/
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
│   ├── layout/           # Sidebar, Navbar, etc.
│   └── providers.tsx     # ThemeProvider
├── features/             # Arquitectura feature-based (11 módulos)
│   ├── auth/              # Autenticación y Server Actions
│   ├── booking/           # Reservas públicas sin cuenta
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
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma client (singleton)
│   ├── email.ts         # Nodemailer (reset password, confirmaciones)
│   ├── export.ts        # Exportación CSV
│   ├── permissions.ts   # RBAC con 4 roles y 15 permisos
│   └── utils.ts         # Helpers (cn, formatDate, etc.)
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
- Docker (para PostgreSQL)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd agenda-citas-app-v2.0

# Instalar dependencias
npm install

# Iniciar PostgreSQL con Docker
docker run --name citamed-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=citamed_db -p 5432:5432 -d postgres:16

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Ejecutar seed (opcional)
npm run db:seed
```

### Variables de Entorno

Crear `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citamed_db?schema=public
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
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
| Especialista | doctor@citamed.com | doctor123 |
| Recepcionista | recepcion@citamed.com | recep123 |

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
npm run dev          # Iniciar desarrollo
npm run build        # Construir producción
npm run start        # Iniciar producción
npm run lint         # Lint code
npm run db:seed      # Ejecutar seed
npm run db:studio    # Abrir Prisma Studio
```

## 🔄 Base de Datos

### PostgreSQL (Docker - Desarrollo y Producción)

El proyecto usa PostgreSQL 16 vía Docker. Para gestionar la base de datos:

```bash
# Iniciar contenedor
docker start citamed-pg

# Detener contenedor
docker stop citamed-pg

# Aplicar migraciones
npx prisma db push

# Crear migración (después de cambios en schema.prisma)
npx prisma migrate dev --name descripcion_cambio

# Abrir Prisma Studio
npm run db:studio
```

> **Nota**: Si tienes PostgreSQL instalado nativamente en Windows, detén el servicio para evitar conflictos de puerto:
> ```powershell
> Stop-Service postgresql-x64-17
> ```

## 📄 Licencia

MIT License - feel free to use this project.