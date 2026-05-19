# CitasMed - Sistema de Gestión de Citas Médicas

Sistema profesional de gestión de citas médicas construido con Next.js 16.2.6, TypeScript y arquitectura moderna.

## 🚀 Características

- **Autenticación segura** con NextAuth.js y JWT
- **Gestión de usuarios** con roles (Admin, Especialista, Recepcionista, Paciente)
- **Dashboard profesional** con estadísticas en tiempo real
- **Diseño premium** inspirado en Linear, Stripe y Vercel
- **Dark/Light mode** con next-themes
- **TypeScript** estricto con validaciones Zod
- **Responsive** para todos los dispositivos

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
- SQLite (desarrollo) / PostgreSQL (producción)
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
│   │   ├── home/          # Página de inicio
│   │   ├── booking/       # Reserva de citas
│   │   └── booking/
│   │       └── confirmation/ # Confirmación de reserva
│   ├── (dashboard)/       # Dashboard protegido
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
├── features/             # Arquitectura feature-based
│   ├── auth/              # Autenticación y Server Actions
│   ├── booking/           # Reservas públicas (sin autenticación)
│   ├── dashboard/         # Dashboard con estadísticas
│   ├── appointments/      # Gestión de citas
│   ├── patients/          # Gestión de pacientes
│   ├── schedules/         # Horarios de especialistas
│   ├── specialists/       # Gestión de especialistas
│   └── settings/          # Configuración del sistema
├── lib/                  # Utilidades y configuración
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma client
│   └── utils.ts         # Helpers
├── schemas/              # Zod schemas
├── store/                # Zustand stores
├── types/               # TypeScript types
└── prisma/              # Prisma schema y seed
    └── schema.prisma
```

## 🏃‍♂️ Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd agenda-citas-app-v2.0

# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Crear base de datos
npx prisma db push

# Ejecutar seed (opcional)
npm run db:seed
```

### Variables de Entorno

Crear `.env`:

```env
DATABASE_URL="file:./dev.db"
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

*El rol Recepcionista está disponible en los datos de prueba pero requiere configuración adicional en el esquema.*

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

### SQLite (Desarrollo)
```bash
npx prisma db push
```

### PostgreSQL (Producción)
Cambiar `provider = "sqlite"` a `"postgresql"` en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📄 Licencia

MIT License - feel free to use this project.