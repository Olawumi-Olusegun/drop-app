import { Request, Response } from "express";
import { generateToken, verifyJwtToken } from "../utils/jwt";
import { AuthRequest, UserRole } from "../types";
import prisma from "../config/db";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";
import { hashPassword, isPasswordValid } from "../utils/hashPassword";
import { sendEmail } from "../utils/postMarkEmailService";

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
      return res.status(Statuscode.BAD_REQUEST).json({ message: "User already exists" });
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
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to create user account" });
    }

    // Send OTP via email
    //Implement mobile messaging
    // await sendOTPToEmail(newUser?.email, "Your OTP Code", phoneNumberOTP);

    return res.status(Statuscode.CREATED).json({ message: "Signed up successfully. OTP sent to your phone." });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
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
      return res.status(Statuscode.BAD_REQUEST).json({ message: "User already exists" });
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

    if (!newUser || !newUser.email) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to create user account" });
    }

    // Send OTP via email
    await sendEmail(newUser?.email, "Your OTP Code", emailOTP);
    return res.status(Statuscode.CREATED).json({ message: "Signed up successfully. OTP sent to your email." });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
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

    if (!newUser) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to create user account" });
    }

    return res.status(Statuscode.CREATED).json({ message: "Signed up successfully" });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};

export const createPassword = async (req: AuthRequest, res: Response) => {
  
  const { email, googleId, phoneNumber, password, confirmPassword, } = req.body;

  let user;

  try {

    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber },
          {
            AND: [{ email }, { googleId }],
          },
        ],
      },
    });
    

    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
    }

    if(user.password) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Password already exist" });
    }

    if(password !== confirmPassword) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Passwords do not match" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return res.status(Statuscode.CREATED).json({ message: "Password created successfully", });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};


export const signIn = async (req: Request, res: Response) => {

  // `identifier` can be either email or phoneNumber
   const { identifier, password } = req.body;
 
   try {
     // Find user by email or phoneNumber
     
     const user = await prisma.user.findFirst({
       where: {
         OR: [{ email: identifier }, { phoneNumber: identifier }],
       },
     });
 
     if (!user || !user.password) {
       return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
     }
 
     const { password: appPassword, ...userWithoutPassword } = user;
 
     // Check if password is correct
     const isValidPassword = await isPasswordValid(password, appPassword);
  
     if (!isValidPassword) {
       return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
     }

      const accessToken = generateToken({ userId: user.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: UserRole.RIDER });
      const refreshToken = generateToken({ userId: user.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: UserRole.RIDER, expiresIn: "30d" });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

     return res.status(Statuscode.SUCCESS).json({ message: "Sign-in successful",
      data: { user: {...userWithoutPassword, accessToken, refreshToken, }
     }});
  
   } catch (error) {
     console.error("Sign-in error:", error);
     return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
   }
 };


 export const refreshToken = async (req: AuthRequest, res: Response) => {
  
  const authHeader = req.headers["authorization"];

  let user;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token is required" });
  }

  const accessToken = authHeader.split(" ")[1];

  if(!accessToken) {
    return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid access token" }); 
  }

  // Verify accesstoken
  const verifyToken = verifyJwtToken({ token: accessToken, secret: process.env.JWT_ACCESS_TOKEN_SECRET })

  if(!verifyToken) {
    return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid access token" }); 
  }

  if (verifyToken.valid && verifyToken.payload?.userId) {
    user = await prisma.user.findUnique({ where: { id: verifyToken.payload.userId } });
  }

  try {

    if (!user) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Please login" });
    }

    if(!user || !user.refreshToken) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Please login" });
    }

    const verifyToken = verifyJwtToken({ token: user.refreshToken, secret: process.env.JWT_REFRESH_TOKEN_SECRET })

    if(!verifyToken.valid) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: verifyToken.error })
    }

    const newAccessToken = generateToken({ userId: user.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: UserRole.RIDER });
    const newRefreshToken = generateToken({ userId: user.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: UserRole.RIDER, expiresIn: "30d" });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

   return res.status(Statuscode.SUCCESS).json({
    message: "Token refreshed successfully",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
   }});

  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};
