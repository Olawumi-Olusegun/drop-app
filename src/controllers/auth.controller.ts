import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { generateToken } from "../utils/jwt";
import { USER_ROLES } from "../config/constants";
import { verifyGoogleToken } from "../utils/verifyGoogleToken";
import { UserRole } from "../types";

/**
 * @desc Signup
 * @route POST /api/v1/auth/signup
 * @access Pulic
 */

export const signup = async (req: Request, res: Response) => {

  const { email, phoneNumber, googleId, role } = req.body;

  if (!USER_ROLES.includes(role)) {
    return res.status(400).json({ message: "Kindly register as a 'rider' or 'driver'" });
  }

  if (!email && !phoneNumber && !googleId) {
    return res.status(400).json({ message: 'Email, phone number, or Google ID is required' });
  }

  let existingUser;
  let modeOfRegisteration = "";

  try {

      if (email) {
        existingUser = await UserModel.findOne({ email });
        modeOfRegisteration = "email";
      }
    
      if (phoneNumber) {
        existingUser = await UserModel.findOne({ phoneNumber });
        modeOfRegisteration = "phoneNumber";
      }

      if (googleId) {
        existingUser = await UserModel.findOne({ googleId });
        modeOfRegisteration = "googleId";
      }

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new UserModel({
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(googleId && { googleId }),
        role,
        isEmailVerified: true,
        modeOfRegisteration
      });

      const newUser = await user.save();

      return res.status(201).json({ message: "Signed up successfully" });
    
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc Signup
 * @route POST /api/v1/auth/signin
 * @access Pulic
 */
export const signin = async (req: Request, res: Response) => {

  const { email, password, googleToken, phoneNumber } = req.body;

    let user;

  try {

    if (googleToken) {
      // **Google OAuth Sign-In**
      const googleData = await verifyGoogleToken(googleToken);

      if (!googleData) {
        return res.status(400).json({ message: "Invalid Google token" });
      }

      user = await UserModel.findOne({ email: googleData.email, password }).select("-password");
      
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await user.isValidPassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
    }

    if (phoneNumber) {
      // **PhoneNumber Authentication
      user = await UserModel.findOne({ phoneNumber, password }).select("-password");

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await user.isValidPassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

    }

    if (email) {
      // **Email Authentication
      user = await UserModel.findOne({ email, password }).select("-password");

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await user.isValidPassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

    }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accessToken = generateToken({ userId: user.id, role: UserRole.RIDER });
      const refreshToken = generateToken({ userId: user.id, role: UserRole.RIDER, expiresIn: "7d" });

      return res.status(200).json({
        message: "Login successful",
        data: {
          ...user,
          accessToken,
          refreshToken,
        }
      });
    
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
