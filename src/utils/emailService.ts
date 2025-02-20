import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { OTPEmailTemplate } from "./OTPEmailTemplate";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use SMTP configuration
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

/**
 * Send an OTP email to the user
 * @param to - Recipient email
 * @param otp - OTP Code
 */


export const sendOTPEmail = async (to: string, otp: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Your OTP Code",
      html: OTPEmailTemplate(otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
