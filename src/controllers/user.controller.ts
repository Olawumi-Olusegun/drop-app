import { Request, Response } from "express";
import { Statuscode } from "../utils/Statuscode";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import prisma from "../config/db";


export const updateUserLocation = async (req: Request, res: Response) => {

    const { phoneNumber, role, email, longitude, latitude } = req.body;

    let formattedPhoneNumber: string | null = null;

    if(phoneNumber) {
        // Format phone number before proceeding with other operations
        formattedPhoneNumber = formatPhoneNumber(phoneNumber);
        if(!formattedPhoneNumber) {
            return res.status(Statuscode.BAD_REQUEST).json({ message: "Could not process phone number" });
        }
    }

    let updatedUser;
  
    try {

        const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email, role },
                { phoneNumber: formattedPhoneNumber, role },
              ],
            },
          });

        if (user) {
          updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { longitude, latitude },
          });
        }
  
      if (!updatedUser) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to create user account" });
      }
  
      return res.status(Statuscode.SUCCESS).json({ message: "Location updated successfully" });
    } catch (error) {
        console.log(error)
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
  };
  