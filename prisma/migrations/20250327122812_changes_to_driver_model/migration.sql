/*
  Warnings:

  - The `transportType` column on the `Driver` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "transportType",
ADD COLUMN     "transportType" "TransportType";
