-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ride', 'courier', 'food_delivery');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "serviceDescription" TEXT,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'ride';
