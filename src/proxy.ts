import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": "view:dashboard",
  "/dashboard/appointments": "view:appointments",
  "/dashboard/patients": "view:patients",
  "/dashboard/specialists": "view:specialists",
  "/dashboard/schedules": "view:schedules",
  "/dashboard/blocked-dates": "view:blocked-dates",
  "/dashboard/users": "view:users",
  "/dashboard/settings": "view:settings",
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = (session.user as { role?: string }).role;
  const route = Object.keys(ROUTE_PERMISSIONS).find((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (route) {
    const permission = ROUTE_PERMISSIONS[route];
    if (!hasPermission(role as any, permission)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};