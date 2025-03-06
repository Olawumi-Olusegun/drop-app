import { Request, Response } from "express";
import prisma from "../config/db";
import { Statuscode } from "../utils/Statuscode";
import { expirationTime } from "../utils/timeExpiry";
import { AuthRequest } from "../types";


export const requestRide = async (req: Request, res: Response) => {

  const userId = (req as AuthRequest).user?.userId!;

  const { rider, pickupLocation, pickupLongitude, pickupLatitude, dropoffLocation, dropoffLatitude, dropoffLongitude, userTimezone } = req.body;

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
        expiresAt: expirationTime(15) //The ride expires after 15 minutes
      }
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

    await prisma.ride.update({
      where: { id: bid.rideId },
      data: {
        driverId: bid.driverId
      }
    })

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
