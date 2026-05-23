import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const hp = (s: string) => bcrypt.hash(s, 12);

  // ── Users ──
  const adminPw = await hp("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@citamed.com" },
    update: {},
    create: {
      email: "admin@citamed.com",
      name: "Administrador",
      password: adminPw,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  const docPw = await hp("doctor123");
  type SpecDef = { name: string; specialty: string; license: string; bio: string; price: number };

  const specialists: SpecDef[] = [
    { name: "Dr. Juan Pérez", specialty: "Medicina General", license: "MP-12345", bio: "Médico general con más de 10 años de experiencia en atención primaria.", price: 2500 },
    { name: "Dra. Laura Martínez", specialty: "Cardiología", license: "MP-23456", bio: "Cardióloga especialista en prevención y tratamiento de enfermedades cardiovasculares.", price: 3500 },
    { name: "Dr. Carlos Gómez", specialty: "Pediatría", license: "MP-34567", bio: "Pediatra dedicado al cuidado integral de niños y adolescentes.", price: 3000 },
    { name: "Dra. Ana Rodríguez", specialty: "Dermatología", license: "MP-45678", bio: "Dermatóloga con experiencia en tratamientos estéticos y clínicos.", price: 3200 },
    { name: "Dr. Pablo Fernández", specialty: "Traumatología", license: "MP-56789", bio: "Traumatólogo especializado en lesiones deportivas y cirugía ortopédica.", price: 3800 },
    { name: "Dra. Sofía López", specialty: "Psicología", license: "MP-67890", bio: "Psicóloga clínica especializada en terapia cognitivo-conductual.", price: 2800 },
  ];

  const createdSpecialists: { id: string; name: string; specialty: string }[] = [];

  for (const spec of specialists) {
    const email = `${spec.name.toLowerCase().replace(/\s+/g, ".").replace("dr.", "dr").replace("dra.", "dra")}@citamed.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: spec.name,
        password: docPw,
        role: "SPECIALIST",
        specialist: {
          create: {
            specialty: spec.specialty,
            license: spec.license,
            phone: "+54111234567",
            bio: spec.bio,
            price: spec.price,
            isAvailable: true,
            consultationDuration: 30,
          },
        },
      },
      include: { specialist: true },
    });
    createdSpecialists.push({ id: user.specialist!.id, name: spec.name, specialty: spec.specialty });
    console.log(`✅ Specialist: ${spec.name} (${spec.specialty})`);
  }

  // ── Schedules (Monday to Friday, 9:00-17:00) ──
  const days = [1, 2, 3, 4, 5];
  for (const spec of createdSpecialists) {
    for (const day of days) {
      await prisma.schedule.upsert({
        where: { specialistId_dayOfWeek: { specialistId: spec.id, dayOfWeek: day } },
        update: {},
        create: {
          specialistId: spec.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isActive: true,
        },
      });
    }
    console.log(`   Schedule M-F 9-17 → ${spec.name}`);
  }

  // ── Receptionist ──
  const recPw = await hp("recep123");
  const receptionist = await prisma.user.upsert({
    where: { email: "recepcion@citamed.com" },
    update: {},
    create: {
      email: "recepcion@citamed.com",
      name: "María González",
      password: recPw,
      role: "RECEPTIONIST",
    },
  });
  console.log("✅ Receptionist:", receptionist.email);

  // ── Patient ──
  const patPw = await hp("paciente123");
  const patientUser = await prisma.user.upsert({
    where: { email: "paciente@test.com" },
    update: {},
    create: {
      email: "paciente@test.com",
      name: "Pedro Test",
      password: patPw,
      role: "PATIENT",
      patient: {
        create: {
          phone: "+54111234568",
          document: "DNI 12345678",
          insurance: "OSDE",
        },
      },
    },
    include: { patient: true },
  });
  console.log("✅ Patient:", patientUser.email);

  // ── Appointments (today and tomorrow) ──
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < Math.min(3, createdSpecialists.length); i++) {
    const start = new Date(today);
    start.setHours(10 + i, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    await prisma.appointment.create({
      data: {
        patientId: patientUser.patient!.id,
        specialistId: createdSpecialists[i].id,
        startTime: start,
        endTime: end,
        reason: `Consulta de prueba con ${createdSpecialists[i].name}`,
        status: "PENDING",
      },
    });
    console.log(`   Appointment today 10:${i}0 → ${createdSpecialists[i].name}`);
  }

  // ── Bookings (online reservations) ──
  for (let i = 0; i < Math.min(2, createdSpecialists.length); i++) {
    const bookingDate = new Date(tomorrow);
    bookingDate.setHours(0, 0, 0, 0);

    await prisma.booking.create({
      data: {
        patientName: "Juan Reserva",
        patientLastname: "García",
        patientEmail: "juan.reserva@test.com",
        patientPhone: "+54111234569",
        specialistId: createdSpecialists[i].id,
        specialty: createdSpecialists[i].specialty,
        date: bookingDate,
        time: `${10 + i}:00`,
        status: "PENDING",
      },
    });
    console.log(`   Booking tomorrow ${10 + i}:00 → ${createdSpecialists[i].name}`);
  }

  console.log("\n📋 Login credentials:");
  console.log("   Admin:          admin@citamed.com / admin123");
  console.log("   Doctor (Gen):   dr.juan.perez@citamed.com / doctor123");
  console.log("   Doctor (Card):  dra.laura.martinez@citamed.com / doctor123");
  console.log("   Doctor (Pedi):  dr.carlos.gomez@citamed.com / doctor123");
  console.log("   Doctor (Derma): dra.ana.rodriguez@citamed.com / doctor123");
  console.log("   Doctor (Traum): dr.pablo.fernandez@citamed.com / doctor123");
  console.log("   Doctor (Psic):  dra.sofia.lopez@citamed.com / doctor123");
  console.log("   Recepcionista:  recepcion@citamed.com / recep123");
  console.log("   Paciente:       paciente@test.com / paciente123");

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
