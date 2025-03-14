-- DropForeignKey
ALTER TABLE "ScheduledRide" DROP CONSTRAINT "ScheduledRide_driverId_fkey";

-- AddForeignKey
ALTER TABLE "ScheduledRide" ADD CONSTRAINT "ScheduledRide_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
