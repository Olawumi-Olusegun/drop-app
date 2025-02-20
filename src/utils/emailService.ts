import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { OTPEmailTemplate } from "./OTPEmailTemplate";

dotenv.config();


let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || '',
  port: Number(process.env.EMAIL_PORT) || 0,
  secure: true, // true for 465, false for other ports
  auth: {
  user: process.env.EMAIL_USER, // Your email address
  pass: process.env.EMAIL_PASS, // generated ethereal password
  },
});


/**
 * Send an OTP email to the user
 * @param to - Recipient email
 * @param otp - OTP Code
 */


export const sendOTPToEmail = async (to: string | null, subject: string, otp: string) => {

  if(!to) {
    throw new Error("User's email address required") 
  }
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: OTPEmailTemplate(otp),
    };

    const info = await transporter.sendMail(mailOptions);
  
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
