
import { Request, Response } from "express";
import { getAvailableDrivers } from "../services/driver.service";
import { Statuscode } from "../utils/Statuscode";


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
