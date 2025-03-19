-- AlterTable
ALTER TABLE "User" ADD COLUMN     "outstandingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "savedCardAuthCode" TEXT;
