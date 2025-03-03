
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
      res.status(500).json({message: error})
  }
}

export const DocumentUploadController = async(req: Request, res: Response)=>{
  const payload = req.body
  const result = await updateDriverDocuments(payload)
}









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
