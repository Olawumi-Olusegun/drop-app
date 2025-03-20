/*
  Warnings:

  - The values [ride,food_delivery] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[serviceId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('book_ride', 'courier', 'hire_artisan', 'rent_car', 'hire_driver', 'book_freight');
ALTER TABLE "Payment" ALTER COLUMN "serviceType" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "serviceType" TYPE "ServiceType_new" USING ("serviceType"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
ALTER TABLE "Payment" ALTER COLUMN "serviceType" SET DEFAULT 'book_ride';
COMMIT;

-- AlterTable
ALTER TABLE "CourierService" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "serviceType" SET DEFAULT 'book_ride';

-- CreateIndex
CREATE UNIQUE INDEX "Payment_serviceId_key" ON "Payment"("serviceId");
