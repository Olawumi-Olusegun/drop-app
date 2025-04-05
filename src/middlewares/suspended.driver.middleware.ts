import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../config/db";
import { RegistrationStatus } from "@prisma/client";
import { Statuscode } from "../utils/Statuscode";


export const rejectSuspendedDrivers = async(req: Request, res: Response, next: NextFunction)=>{

    try{

    

    const driverId =  (req as AuthRequest).user?.driverId

    if(!driverId){
        return res.status(Statuscode.UNAUTHORIZED).json({message: "Logged in user is not a valid driver"})
    }
    const driver = await prisma.driver.findUnique({
        where: {id: driverId}
    })

    if(driver?.registrationStatus == RegistrationStatus.suspended){
        return res.status(Statuscode.FORBIDDEN).json({status: false, message: "Driver has been Suspended"})
    }
    next()
}
catch (err: any) {
    console.error(err)
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" })


}
    }