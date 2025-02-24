import { Request, Response } from "express";
import { generateToken, verifyJwtToken } from "../utils/jwt";
import { AuthRequest, UserRole } from "../types";
import prisma from "../config/db";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";
import { hashPassword, isPasswordValid } from "../utils/hashPassword";
import { sendEmail } from "../utils/postMarkEmailService";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import { sendSMSWithKudiSMS } from "../utils/KudiSMS";


const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration


/**
 * @desc signupWithPhoneNumber
 * @route POST /api/v1/auth/signup-with-phone-number
 * @access Pulic
 */

export const signupWithPhoneNumber = async (req: Request, res: Response) => {

  const { phoneNumber, role } = req.body;
  const modeOfRegistration = "phoneNumber";

  // Format phone number before proceeding with other operations
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  if(!formattedPhoneNumber) {
    return res.status(Statuscode.BAD_REQUEST).json({ message: "Could not process phone number" });
  }

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { phoneNumber: formattedPhoneNumber } });

    if (user) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "User already exists" });
    }

    // Generate OTP
    const phoneNumberOTP = generateOTP();

    // Create user and OTP in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          phoneNumber: formattedPhoneNumber,
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

    // Send OTP to phoneNumber via sms
    const message = `Your OTP is ${phoneNumberOTP}. It will expire in 10 minute. Do not share it with anyone.`;

    // const kudiSmsResponse = await sendSMSWithKudiSMS(formattedPhoneNumber, message);

    // if(!kudiSmsResponse) {
    //   return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to send message to phone number" });
    // }

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
export const signupWithEmail = async (req: Request, res: Response) => {
  
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
export const signupWithGoogle = async (req: Request, res: Response) => {
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

export const createPassword = async (req: Request, res: Response) => {
  
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

    // Users who signed up with google cannot create password
    if(user.googleId) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Please sign in with Google" });
    }

    if(user.password) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "You already have a password" });
    }

    if(password !== confirmPassword) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Passwords do not match" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, isUserVerified: true }
    });

    return res.status(Statuscode.CREATED).json({ message: "Password created successfully", });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};


export const signInWithEmail = async (req: Request, res: Response) => {

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
      data: { user: {...userWithoutPassword, accessToken }
     }});
  
   } catch (error) {
     console.error("Sign-in error:", error);
     return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
   }
 };


 
 export const signInWithPhoneNumber = async (req: Request, res: Response) => {
  
  const { phoneNumber } = req.body;

  // Format phone number
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  if (!formattedPhoneNumber) {
    return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid phone number format" });
  }

  try {
    // Find user by phoneNumber
    const user = await prisma.user.findFirst({
      where: { phoneNumber: formattedPhoneNumber },
    });

    if (!user || !user.isUserVerified) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Your account is not verified" });
    }

    // Generate OTP
    const phoneNumberOTP = generateOTP();
    


    const createdOTP = await prisma.oTP.upsert({
      where: { userId: user.id },
      update: { otp: phoneNumberOTP, expiresAt: otpExpiresAt },
      create: { otp: phoneNumberOTP, expiresAt: otpExpiresAt, user: { connect: { id: user.id } } },
    });

    
    if (!createdOTP) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Failed to generate OTP. Please try again." });
    }

    const message = `Your OTP is ${phoneNumberOTP}. It will expire in 10 minutes. Do not share it with anyone.`;

    // Send OTP via Kudi SMS
    // const smsResponse = await sendSMSWithKudiSMS(formattedPhoneNumber, message);
    // if (!smsResponse) {
    //   return res.status(Statuscode.BAD_REQUEST).json({ message: "Failed to send OTP via SMS" });
    // }

    return res.status(Statuscode.SUCCESS).json({ message: "A 4-digit OTP has been sent to your phone" });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again later." });
  }
};

 export const refreshToken = async (req: Request, res: Response) => {

  let user = null;

  const authHeader = req.headers["authorization"];

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


export const createUsername = async (req: Request, res: Response) => {

  // `identifier` can be either email or phoneNumber
  const { identifier, fullName } = req.body;
 
  try {
    // Find user by email or phoneNumber
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phoneNumber: identifier }],
      },
    });

    if (!user) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
    }

     await prisma.user.update({
       where: { id: user.id },
       data: { fullName,  },
     });

    return res.status(Statuscode.SUCCESS).json({ message: "Username created successful"});
 
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
}

export const AddUserPhoneNumber = async (req: Request, res: Response) => {

  const { email, phoneNumber, role } = req.body;

  // Format phone number before proceeding with other operations
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  if (!formattedPhoneNumber) {
    return res.status(Statuscode.BAD_REQUEST).json({ message: "Could not process phone number" });
  }

  try {
    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: { email, role },
    });

    if (!user) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
    }

    // Check if another user already has this phone number
    const existingPhoneUser = await prisma.user.findFirst({
      where: { phoneNumber: formattedPhoneNumber },
    });

    if (existingPhoneUser) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "A user with this phone number already exists" });
    }

    // Generate OTP
    const phoneNumberOTP = generateOTP();

      await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { phoneNumber: formattedPhoneNumber },
      });

      await tx.oTP.upsert({
        where: { userId: updatedUser.id },
        update: { otp: phoneNumberOTP, expiresAt: otpExpiresAt },
        create: { otp: phoneNumberOTP, expiresAt: otpExpiresAt, user: { connect: { id: user.id } } },
      });

      return updatedUser;
    });

    return res.status(Statuscode.SUCCESS).json({ message: "A 4-digit OTP has been sent to your phone" });

  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

