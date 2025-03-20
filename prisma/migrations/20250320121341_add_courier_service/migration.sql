-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('sendPackage', 'receivePackage');

-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('motorCycle', 'car');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'bankTransfer';

-- CreateTable
CREATE TABLE "CourierService" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "dropoffLatitude" DOUBLE PRECISION NOT NULL,
    "dropoffLongitude" DOUBLE PRECISION NOT NULL,
    "finalFare" DOUBLE PRECISION DEFAULT 0.0,
    "userTimezone" TEXT,
    "expiresAt" TIMESTAMP(3),
    "transportType" "TransportType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderPhoneNumber" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverPhoneNumber" TEXT NOT NULL,
    "packageDescription" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourierService_paymentId_key" ON "CourierService"("paymentId");

-- AddForeignKey
ALTER TABLE "CourierService" ADD CONSTRAINT "CourierService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierService" ADD CONSTRAINT "CourierService_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
