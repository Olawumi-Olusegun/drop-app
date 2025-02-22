import { Request, Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../types";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import { generateToken } from "../utils/jwt";
import { sendSMSWithKudiSMS } from "../utils/KudiSMS";


export const verifyPhoneNumberOTP = async (req: AuthRequest, res: Response) => {

    const { phoneNumber, phoneNumberOTP } = req.body;

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    try {
      if (!formattedPhoneNumber || !phoneNumberOTP) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Phone number and OTP are required" });
      }

      // Find user by phone number and include OTP relation
      const user = await prisma.user.findUnique({
        where: { phoneNumber: formattedPhoneNumber },
        include: { otp: true },
      });

      if (!user || !user.otp) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP or user not found" });
      }

      // Check if OTP is expired
      if (new Date(user.otp.expiresAt) < new Date()) {
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
    
    let formattedPhoneNumber = phoneNumber ? formatPhoneNumber(phoneNumber) : null;
  
    try {
  
      if (!formattedPhoneNumber && !email) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Phone number or email is required" });
      }
  
      if (phoneNumber && !formattedPhoneNumber) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid phone number format" });
      }
  
      const OTP = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
  
      let user = null;
  
      // Search user by phoneNumber first, if provided. Otherwise, search by email.
      if (formattedPhoneNumber) {
        user = await prisma.user.findUnique({ where: { phoneNumber: formattedPhoneNumber } });
      } 
      if (!user && email) {
        user = await prisma.user.findUnique({ where: { email } });
      }
  
      if (!user) {
        return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
      }
  
      // Upsert OTP
      await prisma.oTP.upsert({
        where: { userId: user.id },
        update: { otp: OTP, expiresAt },
        create: { otp: OTP, expiresAt, user: { connect: { id: user.id } } },
      });
  
      // Send OTP via SMS or Email
      if (formattedPhoneNumber) {
        const message = `Your OTP is ${OTP}. It will expire in 10 minutes. Do not share it with anyone.`;
        // Send OTP to phoneNumber via Kudi SMS (Uncomment when implemented)
        // const kudiSmsResponse = await sendSMSWithKudiSMS(formattedPhoneNumber, message);
        
        // if (!kudiSmsResponse) {
        //   return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to send message to phone number" });
        // }
  
        return res.status(Statuscode.SUCCESS).json({ message: "Kindly check your phone for new OTP" });
      }
  
      return res.status(Statuscode.SUCCESS).json({ message: "Kindly check your email for new OTP" });
  
    } catch (error) {
      console.error("Error generating OTP:", error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };
  

  export const VerifySignInWithPhoneNumber = async (req: Request, res: Response) => {
 
    const { phoneNumber, otp, role } = req.body;
  
    // Format phone number before proceeding with other operations
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  
    if (!formattedPhoneNumber) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Could not process phone number" });
    }
  
    try {
      // Find user and include the OTP model
      const user = await prisma.user.findFirst({
        where: { phoneNumber: formattedPhoneNumber },
        include: { otp: true },
      });
  
      if (!user || !user.isUserVerified) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Your account is not verified" });
      }
  
      // Check if OTP exists
      if (!user.otp || user.otp.otp !== otp) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP" });
      }
  
      // Check if OTP has expired
      if (new Date(user.otp.expiresAt) < new Date()) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "OTP has expired, please signin again" });
      }
  
      // Remove password before sending the user data
      const { password: appPassword, ...userWithoutPassword } = user;
  
      // Generate access and refresh tokens
      const accessToken = generateToken({
        userId: user.id,
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        role,
      });
  
      const refreshToken = generateToken({
        userId: user.id,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        role,
        expiresIn: "30d",
      });
  
      // Update user's refresh token
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { refreshToken },
        }),
        prisma.oTP.delete({ where: { userId: user.id } }),
      ]);
  
      return res.status(Statuscode.SUCCESS).json({
        message: "Sign-in successful",
        data: {
          user: { ...userWithoutPassword, accessToken },
        },
      });
    } catch (error) {
      console.error("Error verifying sign-in:", error);
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };
  


  export const VerifyPhoneNumberUsingOTP = async (req: Request, res: Response) => {
    const { phoneNumber, phoneNumberOTP, role } = req.body;
  
    // Format phone number before proceeding with other operations
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  
    if (!formattedPhoneNumber) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Could not process phone number" });
    }
  
    try {
      // Find user and include the OTP model
      const user = await prisma.user.findFirst({
        where: { phoneNumber: formattedPhoneNumber, role },
        include: { otp: true },
      });

      console.log(user)
  
      if (!user) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "User not found" });
      }
  
      // Check if OTP exists
      if (!user.otp) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP" });
      }
  
      // Check if OTP matches
      if (user.otp.otp !== phoneNumberOTP) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP" });
      }
  
      // Check if OTP has expired
      if (user.otp.expiresAt.getTime() < Date.now()) {
        return res.status(Statuscode.BAD_REQUEST).json({ message: "OTP has expired, please try again" });
      }
  
      // Update user record and delete OTP
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { isPhoneNumberVerified: true },
        }),
        prisma.oTP.delete({ where: { userId: user.id } }),
      ]);
  
      return res.status(Statuscode.SUCCESS).json({ message: "You phone number is now verified" });
  
    } catch (error) {
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };
  