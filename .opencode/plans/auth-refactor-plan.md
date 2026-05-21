# Auth Pages Refactor

## Goal
Extract shared auth UI patterns into reusable components and apply shadcn consistency across all 4 auth pages.

## Shared Components to Create

### 1. `src/components/shared/auth-orb.tsx`
```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthOrbProps {
  className: string;
  delay?: number;
}

export function AuthOrb({ className, delay = 0 }: AuthOrbProps) {
  return (
    <motion.div
      className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -50, 30, 0],
        scale: [1, 1.15, 0.9, 1],
      }}
      transition={{
        duration: 15 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}
```

### 2. `src/components/shared/auth-layout.tsx`
Provides gradient-mesh + orbs + logo + title + subtitle + animated card wrapper.
```tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { AuthOrb } from "./auth-orb";

interface OrbConfig {
  className: string;
  delay?: number;
}

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  orbs?: OrbConfig[];
}

const defaultOrbs: OrbConfig[] = [
  { className: "top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/12" },
  { className: "bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/8", delay: 3 },
  { className: "top-1/2 right-1/3 w-[400px] h-[400px] bg-primary/6", delay: 6 },
];

export function AuthLayout({ children, title, subtitle, orbs = defaultOrbs }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-mesh">
      <div className="absolute inset-0 -z-10">
        {orbs.map((orb, i) => (
          <AuthOrb key={i} className={orb.className} delay={orb.delay} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25"
            >
              <HeartPulse className="h-6 w-6 text-primary-foreground" />
            </motion.div>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-2xl p-8 shadow-2xl shadow-foreground/5"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
```

### 3. `src/components/shared/auth-error.tsx`
```tsx
"use client";

import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

interface AuthErrorProps {
  message: string | null;
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </motion.div>
  );
}
```

### 4. `src/components/shared/password-input.tsx`
```tsx
"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export function PasswordInput({
  id,
  label,
  placeholder = "••••••••",
  error,
  registration,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pl-11 pr-11 h-12 rounded-xl"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors z-10"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

## Per-Page Changes

### 5. `login/page.tsx`
- Remove `Orb` function → import `AuthOrb`
- Replace outer div + orbs + motion wrapper → `AuthLayout` (title="Bienvenido de nuevo", subtitle="Ingresa tus credenciales para continuar")
- Replace raw error div → `AuthError`
- Replace password input block → `PasswordInput` with `register("password")`
- Replace raw `<input type="checkbox">` → shadcn `Checkbox`
- Remove `input-premium` class from email `<Input>`
- Remove `btn-premium` class from submit `<motion.button>`
- Unused imports cleanup

### 6. `register/page.tsx`
- Remove `Orb` function → import `AuthOrb`
- Replace outer div + orbs + motion wrapper → `AuthLayout` with register-specific orb positions and title/subtitle
- Replace raw error div → `AuthError`
- Replace password + confirmPassword blocks → `PasswordInput` (x2)
- Remove `input-premium` from name/email inputs
- Remove `btn-premium` from submit button
- Unused imports cleanup

### 7. `forgot-password/page.tsx`
- Remove `Orb` function → import `AuthOrb`
- Replace outer div + orbs + motion wrapper → `AuthLayout` (same for form view)
- For `isSent` success state: use `AuthLayout` with custom 2-orb array
- Replace raw error div → `AuthError`
- Remove `input-premium` from email input
- Remove `btn-premium` from submit button
- Replace `motion.button` → use same pattern as other pages
- Unused imports cleanup

### 8. `reset-password/page.tsx`
- Remove `Orb` function → import `AuthOrb`
- Replace outer div + orbs → `AuthLayout` wrapping `<Suspense>`
- Replace raw error div → `AuthError`
- Replace password + confirmPassword blocks → `PasswordInput` (x2)
- Remove `input-premium` from inputs
- Remove `btn-premium` from submit button
- Unused imports cleanup

## Verification
- `npm run lint` — no errors
- `npm run build` — compiles successfully
