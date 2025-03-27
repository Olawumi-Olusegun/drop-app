import { Request, Response } from "express";
import { Statuscode } from "../utils/Statuscode";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import prisma from "../config/db";
import { saveCardDetails, saveOrUpateBankDetails } from '../services/user.service';


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
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to update user location" });
      }
  
      return res.status(Statuscode.SUCCESS).json({ message: "Location updated successfully" });
    } catch (error) {
        console.log(error)
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
  };
  
export const saveCardDetailController = async( req: Request, res: Response)=>{
  try{
    const {userId, reference} = req.body
    
    const updatedUser = await saveCardDetails(userId, reference)
    res.status(200).json({updatedUser})
  }
  catch(error: any){
    console.log('Error saving card details', error.message)
    res.status(500).json({error: "Internal servor error"})
  }
}


export const saveBankDetails = async (req: Request, res: Response)=>{
  try{
    const { userId, accountNumber, bankCode, accountName} = req.body
    

    const bankdetail = await saveOrUpateBankDetails(userId, accountNumber, bankCode,accountName)

    res.status(Statuscode.SUCCESS).json(bankdetail)
  }
  catch(error: any){
    console.error("Error savig bank Details", error.message)
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({error: "INTERNAL SERVER ERROR"})

  }
}



