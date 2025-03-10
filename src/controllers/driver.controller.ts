import { Request, Response } from "express";
import {
  acceptRide,
  cancelRideBid,
  completeRide,
  getAvailableDrivers,
  getAvailableRides,
  getDriverDashboard,
  getDriverProfile,
  getDriverWallet,
  getRideDetails,
  getUserDetails,
  notifyArrival,
  rateUser,
  registerDriver,
  startRide,
  updateDriverDocuments,
} from "../services/driver.service";
import { Statuscode } from "../utils/Statuscode";
import haversine from "haversine-distance";
import prisma from "../config/db";
import { getDriverRideHistory } from '../services/driver.service';
import { AuthRequest } from "../types";
import { HttpStatusCode } from "axios";


export const registerDriverController = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      verificationType,
      firstName,
      middleName,
      lastName,
      nationality,
      dateOfBirth,
      address,
      city,
      postalCode,
      country,
      issuingCountry,
      documentType,
      nin,
      licenseNumber,
      licenseExpiryDate,
      carBrand,
      carModel,
      licensePlateNumber,
      carColour,
    } = req.body;

    const result = await registerDriver({
      userId,
      verificationType,
      firstName,
      middleName,
      lastName,
      nationality,
      dateOfBirth,
      address,
      city,
      postalCode,
      country,
      issuingCountry,
      documentType,
      nin,
      licenseNumber,
      licenseExpiryDate,
      carBrand,
      carModel,
      licensePlateNumber,
      carColour,
    });

    res.status(201).json({
      message: "Driver registered Succesfully",
      driver: result.driver,
      uploadUrls: result.preSignedUrls,
    });
  } catch (error: any) {
    if (error.message === "User does not exist") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Driver already exists") {
      return res.status(400).json({ error: error.message });
    }

    console.log(error.message)
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const DocumentUploadController = async (req: Request, res: Response) => {
  try {
    const result = await updateDriverDocuments(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Driver not Found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDriverProfileController = async (req: Request, res: Response) => {
  const userId = req.query.userId as string
  const user = (req as AuthRequest).user?.userId

  try {
    if (user !== userId) {
      throw new Error("Invalid Access")
    }


    const driver = await getDriverProfile(userId)


    return res.status(200).json(driver)
  }
  catch (error: any) {

    if (error.message === "Driver does not exist") {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    res.status(500).json({ error: error.message })
  }
}

export const getDriverDashboardController = async (req: Request, res: Response) => {
  try {

    const driver = (req as AuthRequest).user?.driverId


    const driverId = req.query.driverId as string
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }
    const date = req.query.date as string | undefined
    const dashboard = await getDriverDashboard(driverId, date)
    res.status(200).json(dashboard)
  }
  catch (error: any) {
    if (error.message === "Driver not found") {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
  }
}
export const getAvailableRidesController = async (
  req: Request,
  res: Response
) => {
  try {
    const driverLatitude = parseFloat(req.query.driverLatitude as string);
    const driverLongitude = parseFloat(req.query.driverLongitude as string);
    const maxDistance = req.query.maxDistance
      ? Number(req.query.maxDistance)
      : 10;

    const rides = await getAvailableRides(
      driverLatitude,
      driverLongitude,
      maxDistance
    );
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ error: "Internal Server error" });
  }
};

export const getRideDetailsController = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const ride = await getRideDetails(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not Found" });
    }
    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const getUserDetailsController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userDetails = await getUserDetails(userId);
    res.status(200).json(userDetails);
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const acceptRideController = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId, proposedPrice } = req.body;

    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }


    const result = await acceptRide(rideId, driverId, proposedPrice);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Ride not found") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Ride is no longer available") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    console.log(error.message)
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelRideBidController = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId, bidId } = req.body;

    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }

    const updatedBid = await cancelRideBid(rideId, driverId, bidId);
    res
      .status(200)
      .json({ message: "Bid cancelled successfully", bid: updatedBid });
  } catch (error: any) {
    if (error.message == "No pending bid found for this ride and driver") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    if(error.message === "This bid cannot be cancelled"){
      return res.status(Statuscode.FORBIDDEN).json({error: error.message})
    }
    res.status(500).json({ error: "Internal server error" })

  }
};

export const notifyArrivalController = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;
    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }

    const result = await notifyArrival(rideId, driverId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Ride not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const startRideController = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;
    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }
    const updatedRide = await startRide(rideId, driverId);

    res.status(200).json(updatedRide);
  } catch (error: any) {
    if (error.message === "Ride not found") {
      return res.status(404).json({ error: error.message });
    }
    if (
      error.message === "Ride cannot be started" ||
      error.message === "Driver is not authorized to start this ride"
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const completeRideController = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;
    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }
    const finalFare = req.body.finalFare as string
    const updatedRide = await completeRide(rideId, driverId, finalFare);
    res.status(200).json(updatedRide);
  } catch (error: any) {
    if (error.message == "Ride not found") {
      return res.status(404).json({ error: error.message });
    }
    if (
      error.message === "Ride is not in progress" ||
      error.message === "Driver is not authorized to end this ride"
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rateUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { driverId, rating, comment } = req.body;
    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }

    const newRating = await rateUser(userId, driverId, rating, comment);
    res.status(200).json(newRating);
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getDriverWalletController = async (req: Request, res: Response) => {
  try {
    const driverId = req.query.driverId as string;
    const wallet = await getDriverWallet(driverId)
    res.status(200).json(wallet)

  }
  catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getDriverRideHistoryController = async (req: Request, res: Response) => {

  try {
    const driverId = req.query.driverId as string;
    const driver = (req as AuthRequest).user?.driverId
    if (driverId !== driver) {
      throw new Error("Invalid Access")
    }
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10

    const { rides, totalCount } = await getDriverRideHistory(driverId, page, limit)
    res.status(200).json({ rides, totalCount, page, limit })
  }
  catch (error: any) {
    if (error.message === "Invalid Access") {
      return res.status(Statuscode.UNAUTHORIZED).json({ error: error.message })
    }
    res.status(500).json({ error: "Internal Server Error" })
  }
}





export const getDriversController = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;
    const maxDistance = Number(req.query.maxDistance) || 10; // Default to 10 km
    const unit = (req.query.unit as string) || "km"; // Default to kilometers

    // Validate riderId
    if (!riderId) {
      return res
        .status(Statuscode.BAD_REQUEST)
        .json({ message: "Rider ID is required." });
    }

    // Fetch available drivers
    const drivers = await getAvailableDrivers(riderId, maxDistance, unit);

    res.status(Statuscode.SUCCESS).json({ message: "Drivers", drivers });
    return
  } catch (error) {
    console.error("Error in getDriversController:", error);
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export const getAllRidesWithinADriverLocation = async (
  req: Request,
  res: Response
) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude || !radius) {
    return res
      .status(400)
      .json({ error: "Latitude, longitude, and radius are required" });
  }

  const driverLocation = {
    latitude: parseFloat(latitude as string),
    longitude: parseFloat(longitude as string),
  };

  const searchRadius = parseFloat(radius as string) * 1000;

  const a = { latitude: 37.8136, longitude: 144.9631 };
  const b = { latitude: 33.865, longitude: 151.2094 };

  try {
    // Fetch all pending rides
    const availableRides = await prisma.ride.findMany({
      where: { status: "pending" },
    });

    // Filter rides based on location
    const nearbyRides = availableRides.filter((ride) => {
      const rideLocation = {
        latitude: ride.pickupLatitude,
        longitude: ride.pickupLongitude,
      };
      const distance = haversine(driverLocation, rideLocation); // Distance in meters
      return distance <= searchRadius;
    });

    return res.json({ data: { nearbyRides } });
  } catch (error) {
    console.log(error);
    return res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

export const createBid = async (req: Request, res: Response) => {
  try {
    const { rideId, driverId, amount } = req.body;

    // Check if the ride exists
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      return res
        .status(Statuscode.NOT_FOUND)
        .json({ message: "Ride not found" });
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
    if (existingBid) {
      return res
        .status(Statuscode.BAD_REQUEST)
        .json({ message: "You already bidded for this ride" });
    }

    // Create bid
    const bid = await prisma.rideBid.create({
      data: {
        rideId,
        driverId,
        amount: parseFloat(amount),
      },
    });

    return res.status(Statuscode.CREATED).json({ data: { bid } });
  } catch (error) {
    return res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
