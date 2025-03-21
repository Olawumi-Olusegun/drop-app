import { Request, Response } from "express";
import prisma from "../../../config/db";
import { Statuscode } from "../../../utils/Statuscode";
import { generateOTP } from "../../../utils/generateOTP";
import { expirationTime } from "../../../utils/timeExpiry";
import { AuthRequest } from "../../../types";
import { PackageType, PaymentMethod, TransportType } from "@prisma/client";

// Create a new courier order
export const createCourier = async (req: Request, res: Response) => {

    const user = (req as AuthRequest)?.user;

  try {

    const {
        packageType,
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        dropoffLocation,
        dropoffLatitude,
        dropoffLongitude,
        userTimezone,
        expiresAt,
        transportType,
        paymentMethod,
        senderName,
        senderPhoneNumber,
        receiverName,
        receiverPhoneNumber,
        packageDescription,
        userId
    } = req.body;

    if(!user || !user.userId || user.userId !== userId) {
        return res.status(Statuscode.NOT_FOUND).json({ message: "User not found "});
    }

    const otp = generateOTP();

    const courier = await prisma.courierService.create({
      data: {
        pickupLocation,
        pickupLatitude,
        pickupLongitude,
        dropoffLocation,
        dropoffLatitude,
        dropoffLongitude,
        userTimezone: userTimezone ?? undefined,
        expiresAt: expiresAt ?? undefined,
        senderName,
        senderPhoneNumber,
        receiverName,
        receiverPhoneNumber,
        packageDescription,
        otp,
        userId,
        packageType: PackageType[packageType as keyof typeof PackageType],
        transportType: TransportType[transportType as keyof typeof TransportType],
        paymentMethod: PaymentMethod[paymentMethod as keyof typeof PaymentMethod],
      },
    });

    // SEND OTP TO USER
    const createdOTP = await prisma.oTP.upsert({
        where: { userId: user.userId },
        update: { otp, expiresAt: expirationTime() },
        create: { otp, expiresAt: expirationTime(), user: { connect: { id: user.userId } } },
    });

    // send OTP Phone message

    return res.status(Statuscode.CREATED).json({ message: "Courier created", courier });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message:  "Unknown error" });
  }
};

// Get all courier orders
export const getCouriers = async (req: Request, res: Response) => {
  try {
    const couriers = await prisma.courierService.findMany({
      include: {
        user: {
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                fullName: true,
                createdAt: true,
                homeAddress: true,
            }
        }, 
        payment: true },
    });

    return res.status(Statuscode.SUCCESS).json({ couriers });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch couriers" });
  }
};

// Get a single courier by ID
export const getCourierById = async (req: Request, res: Response) => {
  try {

    const { courierId } = req.params;
    
    const courier = await prisma.courierService.findUnique({
      where: { id: courierId },
      include: { 
        user: {
        select: {
            id: true,
            email: true,
            phoneNumber: true,
            fullName: true,
            createdAt: true,
            homeAddress: true,
        }
    }, 
    payment: true 
},
    });

    if (!courier) {
        return res.status(Statuscode.NOT_FOUND).json({ error: "Courier not found" });
    }

    return res.status(Statuscode.SUCCESS).json({courier});
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch courier" });
  }
};

// Update a courier order
export const updateCourier = async (req: Request, res: Response) => {
  try {

    const { courierId } = req.params;

    const updatedCourier = await prisma.courierService.update({
      where: { id: courierId },
      data: req.body,
    });

    return res.status(Statuscode.SUCCESS).json({ message: "Courier updated", updatedCourier });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message:  "Unknown error" });
  }
};

// Delete a courier order
export const deleteCourier = async (req: Request, res: Response) => {
  try {

    const { courierId } = req.params;

    const deletedCourier = await prisma.courierService.delete({ where: { id: courierId } });

    if(!deletedCourier) {
        return res.status(Statuscode.BAD_REQUEST).json({ message:  "Unable to delete courier service" });
    }

    return res.status(Statuscode.SUCCESS).json({ message: "Courier deleted successfully" });

  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Unknown error" });
  }
};
