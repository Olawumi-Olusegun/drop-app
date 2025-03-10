/*
  Warnings:

  - You are about to drop the column `price` on the `Ride` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('pending', 'incomplete', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "verificationType" AS ENUM ('NIN', 'Passport', 'IdCard');

-- AlterTable
ALTER TABLE "Ride" DROP COLUMN "price",
ADD COLUMN     "finalFare" DOUBLE PRECISION DEFAULT 0.0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalCompletedRides" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "totalCompletedRides" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "registrationStatus" "RegistrationStatus" NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "approvedBy" TEXT,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverIdentification" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "issuingCountry" TEXT NOT NULL,
    "documentType" "verificationType" NOT NULL,
    "nin" TEXT,
    "passportPhotoUrl" TEXT,
    "idCardFrontUrl" TEXT,
    "idCardBackUrl" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiryDate" TEXT NOT NULL,
    "licensePhotoUrl" TEXT NOT NULL,
    "selfieWithLicenseUrl" TEXT NOT NULL,

    CONSTRAINT "DriverIdentification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverVehicle" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "carBrand" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "licensePlateNumber" TEXT NOT NULL,
    "carColor" TEXT NOT NULL,
    "carPictureUrl" TEXT,
    "vehicleRegistration" TEXT NOT NULL,
    "roadWorthiness" TEXT,

    CONSTRAINT "DriverVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverIdentification_driverId_key" ON "DriverIdentification"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicle_driverId_key" ON "DriverVehicle"("driverId");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverIdentification" ADD CONSTRAINT "DriverIdentification_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicle" ADD CONSTRAINT "DriverVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
