import { Server, Socket } from "socket.io";
import prisma from "../config/db";
import { Prisma } from "@prisma/client";
import { findDriver } from "../services/socket.find.driver.service";

const socketIo = (io: Server) => {

    // const connectedSocketUsers = new Map();

    let driverIdToString = "";
    let latitudeToFloat = 0;
    let longitudeToFloat = 0;

    io.on("connection", (socket: Socket) => {

    // Driver sends location updates
    socket.on("updateLocation", async (data) => {

    const { driverId, latitude, longitude } = JSON.parse(data);

    // Ensure driverId is a string
    driverIdToString = String(driverId);
    latitudeToFloat = parseFloat(latitude);
    longitudeToFloat = parseFloat(longitude);

    if(!driverIdToString || !latitudeToFloat || !longitudeToFloat) return;

    // Broadcast to riders who are subscribed to this driver
    io.emit(`driverLocation:${driverIdToString}`, { latitude: latitudeToFloat, longitude: longitudeToFloat });

      if(!driverIdToString || !latitudeToFloat || !longitudeToFloat) return;

        const driverData = await findDriver({ driverIdToString, longitudeToFloat, latitudeToFloat });

        if (!driverData || !driverData.user) {
            console.log("User not found for driver:", driverId);
        } else {
            latitudeToFloat = driverData.user.latitude ?? latitudeToFloat;
            longitudeToFloat = driverData.user.longitude ?? longitudeToFloat;
        }
    });

    // Rider listens for live driver updates
    socket.on("trackDriver", async (data) => {
        // const location = await redis.get(`driver:${driverId}`);

        const { driverId } = JSON.parse(data);
   
        // Ensure driverId is a string
        const driverIdToString = String(driverId);
        if(!driverIdToString) return;

        const { user } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

            // Find driver by ID
            const driver = await tx.driver.findUnique({ 
                where: { id: driverIdToString },
                select: { userId: true, user: true }
            });

            // If no driver found, return null
            if (!driver || !driver.userId) return { user: null, driver: null };

            // Find user by userId
            const user = await tx.user.findUnique({
                where: { id: driver.userId },
                select: { id: true, latitude: true, longitude: true }
            });

            return { user, driver };
        });

        if (user && user.id && user.latitude && user.longitude) {
            const location  = { latitude: latitudeToFloat, longitude: longitudeToFloat, };
            socket.emit(`driverLocation:${driverIdToString}`, location);
        } else {
            socket.emit(`driverLocation:${driverIdToString}`, "user not found");
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });

    });

 }
 
export default socketIo;