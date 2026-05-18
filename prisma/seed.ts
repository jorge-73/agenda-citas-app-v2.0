import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@citamed.com" },
    update: {},
    create: {
      email: "admin@citamed.com",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Created admin user:", admin.email);

  const specialistPassword = await bcrypt.hash("doctor123", 12);
  const specialist = await prisma.user.upsert({
    where: { email: "doctor@citamed.com" },
    update: {},
    create: {
      email: "doctor@citamed.com",
      name: "Dr. Juan Pérez",
      password: specialistPassword,
      role: "SPECIALIST",
      specialist: {
        create: {
          specialty: "Medicina General",
          license: "MP-12345",
          phone: "+1234567890",
          bio: "Médico general con más de 10 años de experiencia en atención primaria.",
        },
      },
    },
  });
  console.log("✅ Created specialist user:", specialist.email);

  const receptionistPassword = await bcrypt.hash("recep123", 12);
  const receptionist = await prisma.user.upsert({
    where: { email: "recepcion@citamed.com" },
    update: {},
    create: {
      email: "recepcion@citamed.com",
      name: "María González",
      password: receptionistPassword,
      role: "RECEPTIONIST",
    },
  });
  console.log("✅ Created receptionist user:", receptionist.email);

  console.log("\n📋 Login credentials:");
  console.log("   Admin: admin@citamed.com / admin123");
  console.log("   Doctor: doctor@citamed.com / doctor123");
  console.log("   Recepcionista: recepcion@citamed.com / recep123");

  console.log("\n✨ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });