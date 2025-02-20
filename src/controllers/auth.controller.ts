import { Request, Response } from "express";
import { generateToken } from "../utils/jwt";
import { USER_ROLES } from "../config/constants";
import { verifyGoogleToken } from "../utils/verifyGoogleToken";
import { AuthRequest, UserRole } from "../types";
import prisma from "../config/db";
import { generateOTP } from "../utils/generateOTP";
import { sendOTPEmail } from "../utils/emailService";

/**
 * @desc signupWithPhoneNumber
 * @route POST /api/v1/auth/signup-with-phone-number
 * @access Pulic
 */

export const signupWithPhoneNumber = async (req: AuthRequest, res: Response) => {
  const { phoneNumber, role } = req.body;
  const modeOfRegistration = "phoneNumber";

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const phoneNumberOTP = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    // Create user and OTP in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          phoneNumber,
          role,
          modeOfRegistration,
          onlineStatus: "offline",
        },
      });

      await tx.oTP.create({
        data: {
          userId: createdUser.id,
          otp: phoneNumberOTP,
          expiresAt: otpExpiresAt,
        },
      });

      return createdUser;
    });

    if (!newUser) {
      return res.status(400).json({ message: "Unable to create user account" });
    }

    // Send OTP (e.g., via SMS)
    // await sendOTPSMS(phoneNumber, phoneNumberOTP);

    return res.status(201).json({ message: "Signed up successfully. OTP sent to your phone." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};


/**
 * @desc signupWithEmail
 * @route POST /api/v1/auth/signup-with-email
 * @access Pulic
 */
export const signupWithEmail = async (req: AuthRequest, res: Response) => {
  const { email, role } = req.body;
  const modeOfRegistration = "email";

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const emailOTP = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Create user and OTP in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          role,
          modeOfRegistration,
          onlineStatus: "offline",
        },
      });

      await tx.oTP.create({
        data: {
          userId: createdUser.id,
          otp: emailOTP,
          expiresAt: otpExpiresAt,
        },
      });

      return createdUser;
    });

    if (!newUser) {
      return res.status(400).json({ message: "Unable to create user account" });
    }
    // Send OTP via email
    // await sendOTPEmail(email, emailOTP);

    return res.status(201).json({ message: "Signed up successfully. OTP sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc signupWithGoogle
 * @route POST /api/v1/auth/signup-with-google
 * @access Pulic
 */
export const signupWithGoogle = async (req: AuthRequest, res: Response) => {
  const { email, role } = req.body;
  const modeOfRegistration = "googleId";

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        role,
        modeOfRegistration,
        onlineStatus: "offline",
        isUserVerified: true, // Since Google authentication is verified, mark user as verified
      },
    });

    return res.status(201).json({ message: "Signed up successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};



// export const signin = async (req: Request, res: Response) => {

//   const { email, password, googleToken, phoneNumber } = req.body;

//     let user;
   
//   try {

//     if (googleToken) {
//       // **Google OAuth Sign-In**
//       const googleData = await verifyGoogleToken(googleToken);

//       if (!googleData) {
//         return res.status(400).json({ message: "Invalid Google token" });
//       }

//       user = await UserModel.findOne({ email: googleData.email, password }).select("-password");
      
//       if (!user) {
//         return res.status(400).json({ message: "Invalid credentials" });
//       }

//       const isValidPassword = await user.isValidPassword(password);

//       if (!isValidPassword) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
  
//     }

//     if (phoneNumber) {
//       // **PhoneNumber Authentication
//       user = await UserModel.findOne({ phoneNumber, password }).select("-password");

//       if (!user) {
//         return res.status(400).json({ message: "Invalid credentials" });
//       }

//       const isValidPassword = await user.isValidPassword(password);

//       if (!isValidPassword) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//     }

//     if (email) {
//       // **Email Authentication
//       user = await UserModel.findOne({ email, password }).select("-password");

//       if (!user) {
//         return res.status(400).json({ message: "Invalid credentials" });
//       }

//       const isValidPassword = await user.isValidPassword(password);

//       if (!isValidPassword) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//     }

//       if (!user) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const accessToken = generateToken({ userId: user.id, role: UserRole.RIDER });
//       const refreshToken = generateToken({ userId: user.id, role: UserRole.RIDER, expiresIn: "7d" });

//       return res.status(200).json({
//         message: "Login successful",
//         data: {
//           ...user,
//           accessToken,
//           refreshToken,
//         }
//       });
    
//   } catch (error) {
//     return res.status(500).json({ message: "Server error", error });
//   }
// };
