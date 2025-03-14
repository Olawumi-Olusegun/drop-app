import { Request, Response } from "express";
import prisma from "../config/db";
import { Statuscode } from "../utils/Statuscode";

export const scheduleRide = async (req: Request, res: Response) => {

  try {
    const { 
        riderId,
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        dropoffLocation,
        dropoffLatitude,
        dropoffLongitude,
        userTimezone,
        scheduledDateTime,
    } = req.body;

    const scheduledRide = await prisma.scheduledRide.create({
      data: {
        riderId,
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        dropoffLocation,
        dropoffLatitude,
        dropoffLongitude,
        userTimezone,
        scheduledDateTime: new Date(scheduledDateTime),
      },
    });

    res.status(201).json({ message: "Ride scheduled successfully", scheduledRide });
    return;
  } catch (error) {
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Failed to schedule ride" });
  }
};

export const getScheduledRides = async (req: Request, res: Response) => {

  try {
    const rides = await prisma.scheduledRide.findMany({
      where: { status: "pending" },
      orderBy: { scheduledDateTime: "asc" },
    });

    res.status(Statuscode.SUCCESS).json({ rides });
    return;
  } catch (error) {
    console.error(error)
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch scheduled rides" });
  }
};

export const acceptScheduledRide = async (req: Request, res: Response) => {

  try {

    const { rideId, driverId } = req.body;

    console.log({ rideId, driverId })

    const driver = await prisma.driver.findFirst({
      where: { id: driverId },
    });

    console.log("Driver Object", driver);
    console.log("Driver ID", );

    if(!driver || !driver?.id) {
      res.status(Statuscode.NOT_FOUND).json({ message: "Driver not found" });
      return;
    }

    const ride = await prisma.scheduledRide.update({
      where: { id: rideId },
      data: { driverId: driver?.id, status: "accepted" },
    });

    res.status(Statuscode.SUCCESS).json({ message: "Ride accepted", ride });
    return;
  } catch (error) {
    console.log(error)
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Failed to accept ride" });
    return;
  }
};


export const cancelScheduledRide = async (req: Request, res: Response) => {
  try {

    const { rideId } = req.params;

    await prisma.scheduledRide.update({
      where: { id: rideId },
      data: { status: "canceled" },
    });

    res.status(Statuscode.SUCCESS).json({ message: "Ride canceled" });
    return;
  } catch (error) {
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Failed to cancel ride" });
  }
};


export const placeScheduledRideBid = async (req: Request, res: Response) => {

    try {
      const { driverId, amount } = req.body;
      const { scheduledRideId } = req.params;

      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });
  
      if (!driver) {
       res.status(Statuscode.NOT_FOUND).json({ message: "Driver does not exist" });
       return;
      }
  

      const scheduledRide = await prisma.scheduledRide.findUnique({
        where: { id: scheduledRideId },
      });
  
      if (!scheduledRide) {
        res.status(Statuscode.NOT_FOUND).json({ message: "Scheduled ride not found" });
        return;  
    }
  
      const existingBid = await prisma.rideBid.findFirst({
        where: {
          driverId,
          scheduledId: scheduledRideId,
        },
      });
  
      if (existingBid) {
        res.status(Statuscode.BAD_REQUEST).json({ message: "You have already placed a bid for this ride" });
        return;
      }
  
      const bid = await prisma.rideBid.create({
        data: {
          scheduledId: scheduledRideId,
          driverId,
          amount,
          biddingType: "scheduled",
        },
        select: {
          id: true,
          driverId: true,
          amount: true,
          status: true,
          createdAt: true,
          biddingType: true,
          scheduledId: true,
        },
      });
  
      res.status(Statuscode.CREATED).json({
        message: "Bid placed successfully",
        bid,
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      return;
    }
  };
  

  export const getScheduledRideBids = async (req: Request, res: Response) => {
    try {

      const { scheduledRideId } = req.params;
  
      const bids = await prisma.rideBid.findMany({
        where: { scheduledId: scheduledRideId },
        include: { driver: true },
      });
  
      return res.status(Statuscode.SUCCESS).json({ bids });
    } catch (error) {
      console.error(error);
      res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error });
      return;
    }
  };
  

  export const acceptScheduledRideBid = async (req: Request, res: Response) => {

    try {

      const { rideId, bidId } = req.params;

      const bid = await prisma.rideBid.findUnique({
        where: { id: bidId },
        include: { driver: true },
      });

      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const scheduledRide = await prisma.scheduledRide.update({
        where: { id: rideId },
        data: {
          driverId: bid.driverId,
          finalFare: bid.amount,
          status: "accepted",
        },
      });

      // Update bid status
      await prisma.rideBid.update({
        where: { id: bidId },
        data: { status: "accepted" },
      });

      res.status(200).json({
        message: "Bid accepted successfully",
        scheduledRide,
      });
      return;
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  