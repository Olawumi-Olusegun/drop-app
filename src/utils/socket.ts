import { Server, Socket } from "socket.io";
import prisma from "../config/db";
import { findDriver } from "../services/socket.service";


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

    // Broadcast to riders who are subscribed to this driver
    io.emit(`driverLocation:${driverIdToString}`, { latitude: latitudeToFloat, longitude: longitudeToFloat });

        const driverData = await findDriver({ driverIdToString, longitudeToFloat, latitudeToFloat });

        if (!driverData || !driverData.user) {
            latitudeToFloat = latitudeToFloat;
            longitudeToFloat = longitudeToFloat;
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

        const driver = await prisma.driver.findUnique({
            where: { id: driverIdToString },
            select: {
                id: true,
                userId: true,
                user: {
                    select: {
                        id: true,
                        longitude: true,
                        latitude: true
                    }
            } }
        });

        if(driver && driver.id && driver.user.latitude && driver.user.latitude) {
            latitudeToFloat = driver.user.latitude ?? latitudeToFloat;
            longitudeToFloat = driver.user.longitude ?? longitudeToFloat;
            const location  = { latitude: latitudeToFloat, longitude: longitudeToFloat };
            socket.emit(`driverLocation:${driverIdToString}`, location);
        } else {
            const location  = { latitude: latitudeToFloat, longitude: longitudeToFloat };
            socket.emit(`driverLocation:${driverIdToString}`, location);
        }

    });

    // Handle joining ride room
    socket.on("join_ride", async (data) => {
        try {
            const rideIdToString = String(data.rideId);
            socket.join(rideIdToString);
            console.log(`Socket ${socket.id} joined ride room ${rideIdToString}`);
        } catch (error) {
            console.error("Error joining ride room:", error);
        }
    });
    
    // Handle sending a message
    socket.on("send_message", async (data) => {
        try {
    
            // Validate required fields
            if (!data.senderId || !data.receiverId || !data.rideId || !data.content) {
                throw new Error("Missing required message fields");
            }
    
            // Convert data to strings
            const messageData = {
                senderId: String(data.senderId),
                receiverId: String(data.receiverId),
                rideId: String(data.rideId),
                content: String(data.content),
                timestamp: new Date()
            };
    
            // Save message to database (uncomment when ready)
            const message = await prisma.message.create({
              data: {
                senderId: messageData.senderId,
                receiverId: messageData.receiverId,
                rideId: messageData.rideId,
                content: messageData.content,
                isOpen: true
              },
              select: {
                id: true,
                senderId: true,
                receiverId: true,
                rideId: true,
                content: true,
                isOpen: true,
                createdAt: true,
              }
            });
    
            // Emit message to ride room
            io.to(messageData.rideId).emit("receive_message", message ?? messageData);
    
        } catch (error: any) {
            console.error("Error handling message:", error);
            socket.emit("message_error", {
                error: error?.message || "Failed to send message"
            });
        }
    });


    socket.on("disconnect", () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });

    });

 }
 
export default socketIo;