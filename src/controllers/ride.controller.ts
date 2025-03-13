import { Request, Response } from "express";
import prisma from "../config/db";
import { Statuscode } from "../utils/Statuscode";
import { expirationTime } from "../utils/timeExpiry";
import { AuthRequest } from "../types";
import haversineDistance from "haversine-distance";
import { Prisma } from "@prisma/client";


export const requestRide = async (req: Request, res: Response) => {

  const userId = (req as AuthRequest).user?.userId as string;

    const {  
      riderId, 
      pickupLocation, 
      pickupLongitude, 
      pickupLatitude, 
      dropoffLocation, 
      dropoffLatitude, 
      dropoffLongitude, 
      userTimezone, 
      price 
    } = req.body;

    try {
  
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: riderId }
      });
  
      if (!user || !userId || userId !== user.id) {
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
        userId: riderId,
        status: "pending",
        pickupLocation,
        pickupLongitude,
        pickupLatitude,
        dropoffLocation,
        dropoffLatitude,
        dropoffLongitude,
        userTimezone,
        finalFare: parseFloat(price),
        expiresAt: expirationTime(15), // The ride expires after 15 minutes
        driverId: null,
      },
    });
  
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
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
       const rideCancel = await tx.rideCancel.create({ data: { userId, rideId, reason }, });
       await tx.ride.update({ where: { id: rideId }, data: { status: "canceled" } });
       return rideCancel;
      });

      return res.status(Statuscode.CREATED).json({ success: true, message: "Ride canceled" });
    } catch (error) {
      console.error(error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };


  export const getRideDetails = async (req: Request, res: Response) => {

    try {
  
        const {  rideId } = req.params;
    
        // Check if ride exists
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  
        if (!ride) {
          return res.status(Statuscode.NOT_FOUND).json({ message: "Ride not found" });
        }
  
        return res.status(Statuscode.CREATED).json({ success: true, data: { ride } });
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

    return res.status(Statuscode.SUCCESS).json({ data: { cancelledRides } });

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
        include: {
          driver: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                  onlineStatus: true,
                  role: true,
                  userTimezone: true,
                  profileImage: true,
                  country: true,
                  city: true,
                  averageRating: true,
                  totalCompletedRides: true,
                  createdAt: true,
                }
              },
            },
          },
        },
      });


      // Restructure the data
      const formattedRideBids = bids.map(({ id, driver, ...rest }) => ({
        id, ...rest, driverId: driver?.id, ...(driver?.user ?? {}),
      }));

      return res.status(Statuscode.SUCCESS).json({ data: { bids: formattedRideBids } });
    } catch (error) {
      console.error(error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

  // Rider accepts a bid
  export const acceptBid = async (req: Request, res: Response) => {
    try {
      const { rideId, bidId } = req.body;
  
      const bid = await prisma.rideBid.findUnique({ where: { id: bidId } });
  
      if (!bid) {
        return res.status(Statuscode.NOT_FOUND).json({ success: false, message: "Bid not found" });
      }
  
      // Check if the driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: bid.driverId },
      });
  
      if (!driver) {
        return res.status(Statuscode.NOT_FOUND).json({ success: false, message: "Driver not found" });
      }
  
      // Update the ride with the driver and fare
      await prisma.ride.update({
        where: { id: rideId },
        data: { driverId: bid.driverId, finalFare: bid.amount, status: "accepted" },
      });
  
      // Reject all other bids for this ride
      await prisma.rideBid.updateMany({
        where: { rideId, id: { not: bidId } },
        data: { status: "rejected" },
      });
  
      return res.status(Statuscode.SUCCESS).json({ success: true, message: "Bid accepted" });
    } catch (error) {
      console.error("Error accepting bid:", error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error", error });
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
  
      return res.status(Statuscode.SUCCESS).json({ message: "Bid rejected", bid });
    } catch (error) {
      console.error(error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};
  
// Rider gets all available drivers
export const searchAvailableRides = async (req: Request, res: Response) => {
    try {

      const { latitude, longitude } = req.query;
  
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Can't find your location" });
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
        message: "Available rides", 
        data: { rides: nearbyRides }
      });
    } catch (error) {
      console.error("Error searching for rides:", error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
};


  // Driver places a bid
export const placeBid = async (req: Request, res: Response) => {

  const { rideId, driverId, amount } = req.body;

  try {

    // Check if the ride exists
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "Ride not found" });
    }

    // Check if a driver has bided for the ride once
    const existingBid = await prisma.rideBid.findFirst({
      where: {
        driverId,
        OR: [
          { status: "pending" },
          { status: "accepted" },
          { status: "rejected" },
        ],
      },
    });

    // Reject the driver from bidding again
    if(existingBid) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "You already bidded for this ride" });
    }

    // Create bid
    const bid = await prisma.rideBid.create({
      data: { rideId, driverId, amount: parseFloat(amount) },
    });

    return res.status(Statuscode.CREATED).json({ success: true, data: { bid } });

  } catch (error) {
    console.error("Error unable to bid ride:", error);
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal server error" });
  }
};


// Get available rides for drivers to bid on
export const getAvailableRides = async (req: Request, res: Response) => {

  try {

    const rides = await prisma.ride.findMany({
      where: { status: "pending" },
      include: { user: true, bids: true },
    });

    return res.status(Statuscode.CREATED).json({ success: true, rides });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal server error" });
  }
};


// Driver Mark ride as completed
export const completeRide = async (req: Request, res: Response) => {
  try {

    const { rideId } = req.params;
    const driverId = (req as AuthRequest)?.user?.userId;

    // Fetch the ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "Ride not found" });
    }

    // Ensure only the assigned driver can complete the ride
    if (ride.driverId !== driverId) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized action" });
    }

    // Update ride status to completed
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { status: "completed" },
    });

    return res.status(Statuscode.SUCCESS).json({
      message: "Ride marked as completed",
      ride: updatedRide,
    });
  } catch (error) {
    console.log("Unable to cancel ride", error)
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal server error" });
  }
};