import { auth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session?.user?.name || "Usuario"}
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}