import { Request, Response} from "express"
import { getAvailableCourier, registerCourierDriver, updateCourierDriverDocuments } from "../services/driver.service";

export const registerCourierDriverController = async (req: Request, res: Response) =>{
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
          deliveryVehicle
        } = req.body;


         const result = await registerCourierDriver({
              userId,
              verificationType,
              deliveryVehicle,
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
              });
        
            }
            catch(error:any){
            if (error.message === "User does not exist") {
                return res.status(404).json({ message: error.message });
              }
              if (error.message === "Driver already exists") {
                return res.status(400).json({ message: error.message });
              }

              console.log(error.message)
              res.status(500).json({ message: "Internal Server error" });
            }
}

export const DocumentUploadController = async (req: Request, res: Response) => {
  try {
    const result = await updateCourierDriverDocuments(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Driver not Found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({  message: "Internal Server Error" });
  }
};

export const getAvailableCourierController = async(req: Request, res: Response) =>{

    try{
        const driverLatitude = parseFloat(req.query.driverLatitude as string);
        const driverLongitude = parseFloat(req.query.driverLongitude as string);
        const maxDistance = req.query.maxDistance
          ? Number(req.query.maxDistance)
          : 10;

          const courier = await getAvailableCourier(driverLatitude,
            driverLongitude,
            maxDistance
          )

          res.status(200).json({ success: true, courier });
    

    }
    catch(error: any){
        res.status(500).json({ error: "Internal Server error" });


    }
}