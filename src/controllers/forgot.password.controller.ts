import { Request, Response } from "express";
import prisma from "../config/db";
import { hashPassword } from "../utils/hashPassword";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";
import { sendEmail } from "../utils/postMarkEmailService";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import { expirationTime } from "../utils/timeExpiry";


export const forgotPassword = async (req: Request, res: Response) => {

  const { email, phoneNumber } = req.body;

  try {

    let user = null;
    let formattedPhoneNumber = null;
    
    if (phoneNumber) {
      formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      user = await prisma.user.findFirst({ where: { phoneNumber: formattedPhoneNumber } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
    }

    // Generate OTP & Expiry
    const otp = generateOTP();

    // Store OTP in the database
    await prisma.oTP.upsert({
      where: { userId: user.id },
      update: { otp, expiresAt: expirationTime().toISOString() },
      create: { userId: user.id, otp, expiresAt: expirationTime().toISOString() },
    });

    // Send OTP via Email or SMS
    if (formattedPhoneNumber) {
      // const smsResponse = await sendSMSWithKudiSMS(phoneNumber, `Your OTP is ${otp}. It expires in 10 minutes.`);
      // if (!smsResponse) {
      //   return res.status(Statuscode.BAD_REQUEST).json({ message: "Failed to send OTP via SMS" });
      // }
    } else if (email) {
      await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}. It expires in 10 minutes.`);
    }

    return res.status(Statuscode.SUCCESS).json({ message: "OTP sent successfully. Check your email or phone." });
  } catch (error) {
    console.log(error)
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again later." });
  }
};


export const resetPassword = async (req: Request, res: Response) => {

    const { otp, password, confirmPassword } = req.body;
  
    try {

        const userOTP = await prisma.oTP.findFirst({
            where: { otp },
            include: { user: true }
        });

        if(!password || !confirmPassword) {
            return res.status(Statuscode.NOT_FOUND).json({ message: "Password do not match" });
        }

        if(!userOTP || !userOTP.user.id) {
            return res.status(Statuscode.NOT_FOUND).json({ message: "Invalid OTP or user not found" });
        }
  
        if (!userOTP || !userOTP.otp) {
          return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid OTP or user not found" });
        }
  
        // Check OTP expiration
        if (new Date(userOTP.expiresAt) < new Date()) {
          return res.status(Statuscode.BAD_REQUEST).json({ message: "OTP has expired, request a new one" });
        }
    
        // Verify OTP
        if (userOTP.otp !== otp) {
          return res.status(Statuscode.BAD_REQUEST).json({ message: "Incorrect OTP" });
        }
  
      // Hash the new password
      const hashedPassword = await hashPassword(password);
  
      // Update user password and delete OTP
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userOTP.userId },
          data: { password: hashedPassword },
        }),
        prisma.oTP.delete({ where: { userId: userOTP.userId } }),
      ]);
  
      return res.status(Statuscode.SUCCESS).json({ message: "Password reset successful" });
    } catch (error) {
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
    }
  };
  