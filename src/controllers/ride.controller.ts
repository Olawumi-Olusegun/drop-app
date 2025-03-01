import { Request, Response } from "express";
import prisma from "../config/db";
import { Statuscode } from "../utils/Statuscode";


export const requestRide = async (req: Request, res: Response) => {

    const {  rider, pickupLocation, pickupLongitude, pickupLatitude, dropoffLocation, dropoffLatitude, dropoffLongitude } = req.body;

    try {
  
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: rider }
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
        } });
  
      return res.status(Statuscode.CREATED).json({
       message: "Ride request created successfully",
       data: {
            rideId: ride.id,
            status: ride.status,
       }
      });
  
    } catch (error) {
      console.error("Error requesting ride:", error);
      return res.status(500).json({ message: "Internal server error" });
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
  