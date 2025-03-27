/*
  Warnings:

  - You are about to drop the column `deliveryVehicle` on the `Driver` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "deliveryVehicle",
ADD COLUMN     "transportType" "TransactionType";

-- DropEnum
DROP TYPE "DeliveryVehicle";
