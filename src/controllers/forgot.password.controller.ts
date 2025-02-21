import { Request, Response } from "express";
import prisma from "../config/db";
import { hashPassword } from "../utils/hashPassword";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";
import { sendEmail } from "../utils/postMarkEmailService";

export const forgotPassword = async (req: Request, res: Response) => {

    const { email, phoneNumber } = req.body;

    let user;

    try {

      if(phoneNumber) {
        user = await prisma.user.findUnique({ where: { phoneNumber } });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      }
  
      if (!user) {
        return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
      }
  
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Store OTP in the database
      await prisma.oTP.upsert({
        where: { userId: user.id },
        update: { otp, expiresAt: otpExpiresAt },
        create: { userId: user.id, otp, expiresAt: otpExpiresAt },
      });
  
      // Send OTP via email or phoneNumber
      if(phoneNumber) {
        //Implement mobile messaging
      } else if (email) {
        if(!user.email) {
           return res.status(Statuscode.NOT_FOUND).json({ message: "No email found for this user" });
        }
        await sendEmail(user.email, "Password Reset OTP", `Your OTP is ${otp}`);
      }

      return res.status(Statuscode.SUCCESS).json({ message: "Check your email for OTP" });
    } catch (error) {
      return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
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
      if (userOTP.expiresAt < new Date()) {
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
  