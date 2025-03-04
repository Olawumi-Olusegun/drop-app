import { Request, Response } from "express";
import { getAvailableDrivers, registerDriver, updateDriverDocuments } from "../services/driver.service";
import { Statuscode } from "../utils/Statuscode";
import { verificationType } from "@prisma/client";
//import { verificationType } from '@prisma/client';



export const registerDriverController = async(req: Request, res: Response)=>{

  try{

 
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
      carColour
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
      carColour
    })

    res.status(201).json({
      message: "Driver registered Succesfully",
      driver: result.driver,
     // uploadUrls: result.preSignedUrls
    })
  }
  catch(error){
      console.log(error)
      res.status(500).json({message: "Internal Server error"})
  }
}

export const DocumentUploadController = async(req: Request, res: Response)=>{
  try{
 
  const result = await updateDriverDocuments(req.body)
  res.status(200).json(result)
  }
  catch(error){
    console.error("Error updating driuver documnets", error)
    res.status(500).json({error: "Internal Server Error"})

  }  
}







import haversine from 'haversine-distance'
import prisma from "../config/db";

export const getDriversController = async (req: Request, res: Response) => {
  try {

    const { riderId } = req.params;
    const maxDistance = Number(req.query.maxDistance) || 10; // Default to 10 km
    const unit = (req.query.unit as string) || "km"; // Default to kilometers

    // Validate riderId
    if (!riderId) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Rider ID is required." });
    }

    // Fetch available drivers
    const drivers = await getAvailableDrivers(riderId, maxDistance, unit);

    return res.status(Statuscode.SUCCESS).json({ message: "Drivers", drivers });
  } catch (error) {
    console.error("Error in getDriversController:", error);
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

export const getAllRidesWithinADriverLocation = async (req: Request, res: Response) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude || !radius) {
    return res.status(400).json({ error: "Latitude, longitude, and radius are required" });
  }

  const driverLocation = { latitude: parseFloat(latitude as string), longitude: parseFloat(longitude as string) };
  
  const searchRadius = parseFloat(radius as string) * 1000;

  const a = { latitude: 37.8136, longitude: 144.9631 }
  const b = { latitude: 33.8650, longitude: 151.2094 }


  try {

      // Fetch all pending rides
      const availableRides = await prisma.ride.findMany({
        where: { status: "pending" },
      });

    // Filter rides based on location
    const nearbyRides = availableRides.filter((ride) => {
      const rideLocation = { latitude: ride.pickupLatitude, longitude: ride.pickupLongitude };
      const distance = haversine(driverLocation, rideLocation); // Distance in meters
      return distance <= searchRadius;
    });

    return res.json({  data: { nearbyRides } });

  } catch (error) {
    console.log(error)
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Server error" });
  }
}

export const createBid = async (req: Request, res: Response) => {

  try {

    const { rideId, driverId, amount } = req.body;

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
      data: {
        rideId,
        driverId,
        amount,
      },
    });

    return res.status(Statuscode.CREATED).json({ data: { bid } });

  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};