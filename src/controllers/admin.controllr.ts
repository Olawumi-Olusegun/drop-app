import { Request, Response } from "express";
import prisma from "../config/db";
import { RegistrationStatus, RideStatus, UserRole } from "@prisma/client";
import { Statuscode } from "../utils/Statuscode";
import { resetPassword } from "./forgot.password.controller";
import { use } from "passport";
import { AuthRequest } from "../types";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      where: { role: UserRole.rider },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.status(Statuscode.SUCCESS).json({ users });
  } catch (error: any) {
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName:  true,
        email:  true,
        phoneNumber:  true,
        isPhoneNumberVerified: true,
        homeAddress:  true,
        longitude:  true,
        latitude:  true,
        isEmailVerified: true,
        isNotification:  true,
        isBlocked:  true,
        onlineStatus: true,
        role:  true,
        modeOfRegistration: true,
        userTimezone:  true,
        country:  true,
        city:  true,
        profileImage:  true,
        isUserVerified: true,
        averageRating:  true,
        totalCompletedRides:  true,
        createdAt:  true,
        updatedAt:  true,
      }
    });

    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ error: "User not found" });
    }

    res.status(Statuscode.SUCCESS).json(user);
  } catch (error) {
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const skip = (page - 1) * limit;
    const drivers = await prisma.user.findMany({
      where: { role: UserRole.driver },
      select: {
        id: true,
        fullName:  true,
        email:  true,
        phoneNumber:  true,
        isPhoneNumberVerified: true,
        homeAddress:  true,
        longitude:  true,
        latitude:  true,
        isEmailVerified: true,
        isNotification:  true,
        isBlocked:  true,
        onlineStatus: true,
        role:  true,
        modeOfRegistration: true,
        userTimezone:  true,
        country:  true,
        city:  true,
        profileImage:  true,
        isUserVerified: true,
        averageRating:  true,
        totalCompletedRides:  true,
        createdAt:  true,
        updatedAt:  true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    res.status(Statuscode.SUCCESS).json(drivers);
  } catch (error: any) {
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

export const getDriver = async (req: Request, res: Response) => {
  try {
    const driverId = req.query.driverId as string;
    const driver = await prisma.driver.findUnique({
      where: { id: driverId, },
      include: { identifications: true, vehicles: true}
    });
  
    if (!driver) {
      return res.status(Statuscode.NOT_FOUND).json({ error: "User not found" });
    }
    
    res.status(Statuscode.SUCCESS).json(driver);
  } catch (error: any) {
    console.log(error)
    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "INTERNAL SERVER ERROR"});
  }
};

export const approveDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.body;
    const adminId = (req as AuthRequest).user?.userId;

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) {
      return res
        .status(Statuscode.NOT_FOUND)
        .json({ error: "Driver not found" });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {

        registrationStatus: RegistrationStatus.approved,
        approvalDate: new Date(),
        approvedBy: adminId,
      },
    });

    await prisma.user.update({
      where: { id: updatedDriver.userId },
      data: { role: UserRole.driver, },
      select: {
        id: true,
        fullName:  true,
        email:  true,
        phoneNumber:  true,
        isPhoneNumberVerified: true,
        homeAddress:  true,
        longitude:  true,
        latitude:  true,
        isEmailVerified: true,
        isNotification:  true,
        isBlocked:  true,
        onlineStatus: true,
        role:  true,
        modeOfRegistration: true,
        userTimezone:  true,
        country:  true,
        city:  true,
        profileImage:  true,
        isUserVerified: true,
        averageRating:  true,
        totalCompletedRides:  true,
        createdAt:  true,
        updatedAt:  true,
      }
    });

    res.status(Statuscode.SUCCESS).json({ updatedDriver });
  } catch (error: any) {
    console.log(error.message);
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const suspendDriver = async(req: Request, res: Response)=>{
    try{
    const {driverId} = req.body

    const findDriver = await prisma.driver.findUnique({
        where: {id: driverId},
    })

    if(!findDriver){
        return res.status(Statuscode.NOT_FOUND).json({error: "User not Found"})
    }

    await prisma.driver.update({
        where: {id: driverId},
        data:{
            registrationStatus: RegistrationStatus.suspended
        }

    
    })
    res.status(Statuscode.SUCCESS).json({message: "Driver suspended Successfully"})
}
    catch(error){

    }
}

export const getAllPendingDrivers = async (req: Request, res: Response) => {
  try {
    const pendingDrivers = await prisma.driver.findMany({
      where: { registrationStatus: RegistrationStatus.pending },
      include: { 
        user: {
          select: {
            id: true,
            fullName:  true,
            email:  true,
            phoneNumber:  true,
            isPhoneNumberVerified: true,
            homeAddress:  true,
            longitude:  true,
            latitude:  true,
            isEmailVerified: true,
            isNotification:  true,
            isBlocked:  true,
            onlineStatus: true,
            role:  true,
            modeOfRegistration: true,
            userTimezone:  true,
            country:  true,
            city:  true,
            profileImage:  true,
            isUserVerified: true,
            averageRating:  true,
            totalCompletedRides:  true,
            createdAt:  true,
            updatedAt:  true,
          }
        }
      },
    });

    res.status(Statuscode.SUCCESS).json(pendingDrivers);
  } catch {
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDrivers = await prisma.driver.count();
    const totalCompletedRides = await prisma.ride.count({
      where: { status: RideStatus.completed },
    });
    const data = { totalUsers, totalDrivers, totalCompletedRides };
    res.status(Statuscode.SUCCESS).json(data);
  } catch (error) {
    res
      .status(Statuscode.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

