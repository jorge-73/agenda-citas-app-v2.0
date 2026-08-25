-- Link appointments created from online bookings and improve slot lookups.
ALTER TABLE "Appointment" ADD COLUMN "bookingId" TEXT;

CREATE UNIQUE INDEX "Appointment_bookingId_key" ON "Appointment"("bookingId");
CREATE INDEX "Appointment_specialistId_startTime_idx" ON "Appointment"("specialistId", "startTime");
CREATE INDEX "Booking_specialistId_date_time_idx" ON "Booking"("specialistId", "date", "time");

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
