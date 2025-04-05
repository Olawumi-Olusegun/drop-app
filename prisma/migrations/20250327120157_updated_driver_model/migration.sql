/*
  Warnings:

  - Added the required column `driverType` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeliveryVehicle" AS ENUM ('car', 'motorCycle');

-- CreateEnum
CREATE TYPE "DriverType" AS ENUM ('instantRide', 'courier', 'freight', 'professionalDriver');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "deliveryVehicle" "DeliveryVehicle",
ADD COLUMN     "driverType" "DriverType" NOT NULL;

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'card';
