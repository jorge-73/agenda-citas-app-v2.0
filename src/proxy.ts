import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import type { UserRole } from "@/types";

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": "view:dashboard",
  "/dashboard/appointments": "view:appointments",
  "/dashboard/patients": "view:patients",
  "/dashboard/specialists": "view:specialists",
  "/dashboard/schedules": "view:schedules",
  "/dashboard/blocked-dates": "view:blocked-dates",
  "/dashboard/bookings": "view:bookings",
  "/dashboard/users": "view:users",
  "/dashboard/settings": "view:settings",
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth();
  const isAuth = !!session?.user;

  if (isAuth && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = (session.user as { role?: string }).role;
  const route = Object.keys(ROUTE_PERMISSIONS)
    .filter((r) => pathname === r || pathname.startsWith(`${r}/`))
    .sort((a, b) => b.length - a.length)[0];

  if (route) {
    const permission = ROUTE_PERMISSIONS[route];
    if (!hasPermission(role as UserRole, permission)) {
      const fallback = Object.keys(ROUTE_PERMISSIONS).find((r) =>
        hasPermission(role as UserRole, ROUTE_PERMISSIONS[r])
      );
      return NextResponse.redirect(new URL(fallback ?? "/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};