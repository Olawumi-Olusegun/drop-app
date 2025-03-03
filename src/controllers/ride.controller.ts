import { Request, Response } from "express";
import prisma from "../config/db";
import { Statuscode } from "../utils/Statuscode";
import { expirationTime } from "../utils/timeExpiry";
import { AuthRequest } from "../types";
import haversineDistance from "haversine-distance";


export const requestRide = async (req: Request, res: Response) => {

  const userId = (req as AuthRequest).user?.userId!;

    const {  rider, pickupLocation, pickupLongitude, pickupLatitude, dropoffLocation, dropoffLatitude, dropoffLongitude, userTimezone, price } = req.body;

    try {
  
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: rider }
      });
  
      if (!user || userId !== user.id) {
        res.status(404).json({ message: "User not found" });
        return 
      }
  
      if (user.role === "driver") {
        res.status(Statuscode.FORBIDDEN).json({ message: "Your role cannot request a ride" });
        return 
      }

  // Create a new ride request
    const ride = await prisma.ride.create({
        data: {
            userId: rider,
            status: "pending",
            pickupLocation,
            pickupLongitude,
            pickupLatitude,
            dropoffLocation,
            dropoffLatitude,
            dropoffLongitude,
            userTimezone,
            // price,
            expiresAt: expirationTime(15) //The ride expires after 15 minutes
        } });
  
     res.status(Statuscode.CREATED).json({
       message: "Ride request created successfully",
       data: {
            rideId: ride.id,
            status: ride.status,
            timezone: ride.userTimezone,
       }
      });
      return 
    } catch (error) {
      console.error("Error requesting ride:", error);
      res.status(500).json({ message: "Internal server error" });
      return 
    }
  };

  


export const cancelRide = async (req: Request, res: Response) => {

    try {

      const { userId, rideId, reason } = req.body;
  
      // Check if ride exists
      const ride = await prisma.ride.findUnique({ where: { id: rideId } });

      if (!ride) {
        return res.status(Statuscode.NOT_FOUND).json({ message: "Ride not found" });
      }
  
      // Create cancellation record
      const rideCancel = await prisma.rideCancel.create({
        data: { userId, rideId, reason },
      });
  
      return res.status(Statuscode.CREATED).json({ data: { rideCancel } });
    } catch (error) {
      console.error(error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };
  

export const getCancelledRides = async (req: Request, res: Response) => {
  try {
    
    const cancelledRides = await prisma.rideCancel.findMany({
      include: { user: true },
    });

    return res.status(Statuscode.SUCCESS).json({ data: { cancelledRides }});

  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error.", error });
  }
};


export const getRideBids = async (req: Request, res: Response) => {

  const { rideId } = req.params;
  
    try {
      // Fetch all bids for a ride
      const bids = await prisma.rideBid.findMany({
        where: { rideId },
        include: { driver: true },
      });
  
      return res.status(Statuscode.SUCCESS).json({ data: { bids } });
    } catch (error) {
      console.error(error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };
  

  export const acceptBid = async (req: Request, res: Response) => {

    const { bidId } = req.body;

    try {
      // Update the bid status to "accepted"
      const bid = await prisma.rideBid.update({
        where: { id: bidId },
        data: { status: "accepted" },
      });
  
      return res.status(Statuscode.SUCCESS).json({ message: "Bid accepted", data: { bid } });
    } catch (error) {
      console.error(error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };
  

  export const rejectBid = async (req: Request, res: Response) => {
    
    const { bidId } = req.body;

    try {
  
      // Update the bid status to "rejected"
      const bid = await prisma.rideBid.update({
        where: { id: bidId },
        data: { status: "rejected" },
      });
  
      return res.status(200).json({ message: "Bid rejected", bid });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  

  export const searchAvailableRides = async (req: Request, res: Response) => {
    try {

      const { latitude, longitude } = req.query;
  
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
      }
  
      const userLocation = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
      };
  
      // Fetch all pending rides from the database
      const rides = await prisma.ride.findMany({
        where: { status: "pending" },
        select: {
          id: true,
          pickupLocation: true,
          dropoffLocation: true,
          pickupLatitude: true,
          pickupLongitude: true,
          user: true,
        },
      });
  
      // Filter rides within a 5km radius and calculate distance
      const nearbyRides = rides
        .map((ride) => {
          const rideLocation = {
            latitude: ride.pickupLatitude,
            longitude: ride.pickupLongitude,
          };
  
          const distance = haversineDistance(userLocation, rideLocation) / 1000; // Convert meters to km
  
          return {
            id: ride.id,
            fullName: ride.user.fullName ?? "",
            farePrice: "5000",
            pickupLocation: ride.pickupLocation,
            dropoffLocation: ride.dropoffLocation,
            pickupLatitude: ride.pickupLatitude,
            pickupLongitude: ride.pickupLongitude,
            distance: {
              value: parseFloat(distance.toFixed(2)), // Round to 2 decimal places
              unit: "km",
            },
          };
        })
        .filter((ride) => ride.distance.value <= 5); // Filter rides within 5km
  
      return res.json({ 
        message: "Available drivers", 
        data: { rides: nearbyRides }
      });
    } catch (error) {
      console.error("Error searching for rides:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };