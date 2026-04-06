-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('MASS', 'CONFESSION', 'MEETING', 'OTHER');

-- CreateTable
CREATE TABLE "church_schedules" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "type" "ScheduleType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "time" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_events" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "church_schedules" ADD CONSTRAINT "church_schedules_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_events" ADD CONSTRAINT "church_events_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
