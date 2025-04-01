import { Prisma } from "@prisma/client";
import prisma from "../config/db";

type FindDriver = {
    longitudeToFloat: number;
    latitudeToFloat: number;
    driverIdToString: string;
}


export const findDriver = async ({ driverIdToString, longitudeToFloat, latitudeToFloat }: FindDriver) => {
    try {
        const driverData = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
         
            const driver = await tx.driver.findUnique({
                where: { id: driverIdToString },
                select: { userId: true, user: true }
            });

            // If no driver found, return null
            if (!driver || !driver.userId) {
                return { user: null, driver: null }
            };

            // Update user's location
            const user = await tx.user.update({
                where: { id: driver.userId },
                data: { longitude: longitudeToFloat, latitude: latitudeToFloat },
                select: { id: true, longitude: true, latitude: true }
            });

            return { user, driver };
        });

        return driverData;
    } catch (error) {
        console.error("Error in findDriver:", error);
        return null;
    }
}