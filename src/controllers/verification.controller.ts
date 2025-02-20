import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../types";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";


export const verifyPhoneNumberOTP = async (req: AuthRequest, res: Response) => {

    const { phoneNumber, phoneNumberOTP } = req.body;

    try {
      if (!phoneNumber || !phoneNumberOTP) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Phone number and OTP are required" });
      }

      // Find user by phone number and include OTP relation
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
        include: { otp: true },
      });

      if (!user || !user.otp) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP or user not found" });
      }

      // Check if OTP is expired
      if (user.otp.expiresAt < new Date()) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "OTP has expired, kindly generate a new OTP" });
      }

      // Verify OTP
      if (user.otp.otp !== phoneNumberOTP) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Incorrect OTP" });
      }
  
      // Check if phone number is already verified
      if (user.isPhoneNumberVerified) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Your phone number is already verified" });
      }

      // Update user verification status and delete OTP
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { isPhoneNumberVerified: true, isUserVerified: true },
        }),
        prisma.oTP.delete({ where: { userId: user.id } }),
      ]);
  
      return res.status(Statuscode.SUCCESS).json({ message: "Phone number verified successfully" });
    } catch (error) {
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
  };
  

  export const verifyEmailOTP = async (req: AuthRequest, res: Response) => {
    const { email, emailOTP } = req.body;
  
    try {
      if (!email || !emailOTP) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Email and OTP are required" });
      }
  
      // Find user by email and include OTP relation
      const user = await prisma.user.findUnique({
        where: { email },
        include: { otp: true },
      });
  
      if (!user || !user.otp) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP or user not found" });
      }
  
      // Check if OTP is expired
      if (user.otp.expiresAt < new Date()) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "OTP has expired" });
      }
  
      // Verify OTP
      if (user.otp.otp !== emailOTP) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Incorrect OTP" });
      }
  
      // Check if the email is already verified
      if (user.isEmailVerified) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Your email is already verified" });
      }
  
      // Update user verification status and delete OTP
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true, isUserVerified: true },
        }),
        prisma.oTP.delete({ where: { userId: user.id } }),
      ]);
  
      return res.status(Statuscode.SUCCESS).json({ message: "Email verified successfully" });
    } catch (error) {
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
  };
  


  export const generateNewOTP = async (req: AuthRequest, res: Response) => {
    const { phoneNumber, email } = req.body;
  
    try {
      if (!phoneNumber && !email) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Phone number or email is required" });
      }
  
      const OTP = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
  
      let user;
      if (phoneNumber) {
        user = await prisma.user.findUnique({ where: { phoneNumber } });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      }
  
      if (!user) {
        return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
      }
  
      // Check if user already has an OTP and update it, otherwise create a new one
      await prisma.oTP.upsert({
        where: { userId: user.id },
        update: { otp: OTP, expiresAt },
        create: { otp: OTP, expiresAt, user: { connect: { id: user.id } } },
      });
  
      return res.status(Statuscode.SUCCESS).json({ message: "Kindly check your email for new OTP" });
    } catch (error) {
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error }); 
    }
  };
  