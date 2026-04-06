-- AlterTable: replace nullable single integer with integer array on church_schedules
ALTER TABLE "church_schedules" DROP COLUMN "dayOfWeek";
ALTER TABLE "church_schedules" ADD COLUMN "daysOfWeek" INTEGER[] NOT NULL DEFAULT '{}';
