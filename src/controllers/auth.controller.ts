import { Request, Response } from "express";
import { generateToken, verifyJwtToken } from "../utils/jwt";
import { AuthRequest, UserRole } from "../types";
import prisma from "../config/db";
import { generateOTP } from "../utils/generateOTP";
import { Statuscode } from "../utils/Statuscode";
import { hashPassword, isPasswordValid } from "../utils/hashPassword";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import { sendEmail } from "../utils/postMarkEmailService";
import { PlatformType, Prisma } from "@prisma/client";
import { expirationTime } from "../utils/timeExpiry";
// import { sendSMSWithInfoBip } from "../utils/sendSMSWithInfoBip";
import { sendPushNotification } from "../utils/push-notification/sendNotification";

/**
 * @desc signupWithPhoneNumber
 * @route POST /api/v1/auth/signup-with-phone-number
 * @access Pulic
 */

export const testCreateUser = async (req: Request, res: Response) => {
 
  const forms = {
    fullName: "John Doe++", //Add preferred name here
    password: "$2a$12$NlMGXt1Qs5zcAvT3to92cu/3FDkOUfSv9gXgmtGLZ9QD7vEsQU/M6", //password123
    email: "email@mail.com",     // add new email here
    phoneNumber: "+2348122510760",   //Add phone number here
    isPhoneNumberVerified: true,
    isEmailVerified: true,
    isUserVerified: true,
}

  try {

    const createdUser = await prisma.user.create({
      data: {...forms, onlineStatus: "online", role: "rider", modeOfRegistration:"email"},
    });

    const accessToken = generateToken({ userId: createdUser.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: UserRole.RIDER });
    const refreshToken = generateToken({ userId: createdUser.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: UserRole.RIDER, expiresIn: "30d" });

    await prisma.user.update({
     where: { id: createdUser.id },
     data: { accessToken, refreshToken  }
    });

    return res.status(201).json({ user: createdUser })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error })
  }
}

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
    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
          expiresAt: expirationTime(),
        },
      });

      return createdUser;
    });

    if (!newUser) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to create user account" });
    }

    // Send OTP to phoneNumber via sms
    // const message = `Your OTP is ${phoneNumberOTP}. It will expire in 10 minute. Do not share it with anyone.`;

    // const kudiSmsResponse = await sendSMSWithKudiSMS(formattedPhoneNumber, message);

    // const sendSMSWithKudiSMSResponse = await sendSMSWithTwilio('+2348012345678', `Your OTP is ${phoneNumberOTP}`);

    // if(!sendSMSWithKudiSMSResponse) {
    //   res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to send message to phone number" });
    //   return;
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
    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
          expiresAt: expirationTime().toISOString(),
        },
      });

      await tx.wallet.create({
        data:{
          userId: createdUser.id
        }
      })
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

    await prisma.wallet.create({
      data: {
        userId: newUser.id
      }
    })

    if (!newUser) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Unable to create user account" });
    }

    return res.status(Statuscode.CREATED).json({ message: "Signed up successfully" });
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};

export const createPassword = async (req: Request, res: Response) => {
  
  const { email, googleId, phoneNumber, password, confirmPassword, modeOfRegistration } = req.body;

 
  let formattedPhoneNumber: string | null = null;

  if(phoneNumber) {
    formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    if (!formattedPhoneNumber) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid phone number format" });
    }
  }


  try {

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(modeOfRegistration === "email" ? [{ email }] : []),
          ...(modeOfRegistration === "googleId" ? [{ email, googleId }] : []),
          ...(modeOfRegistration === "phoneNumber" ? [{ phoneNumber: formattedPhoneNumber }] : []),
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
   const { identifier, password, fcmToken, platform } = req.body;
 
   try {
     // Find user by email or phoneNumber
     const user = await prisma.user.findFirst({
       where: {
         OR: [{ email: identifier }, { phoneNumber: identifier }],
       },
     });

     const testOTP = generateOTP();
    // +12029106163
    //  const sendSMSWithVonageResponse = await sendSMSWithInfoBip({ to: "+2347065066382", text: `Your OTP is ${testOTP}` });
    //  console.log(sendSMSWithVonageResponse)

     if (!user || !user.password) {
       return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
     }
 
     if (user && user.isBlocked) {
       return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Your account has been blocked" });
     }
 
     if (user && !user.isUserVerified) {
       return res.status(Statuscode.BAD_REQUEST).json({ message: "Your account is not verified yet" });
     }
 
     if (user && user.modeOfRegistration !== "email") {
       return res.status(Statuscode.BAD_REQUEST).json({ message: "You signed up with a different identity" });
     }
 
     // Check if password is correct
     const isValidPassword = await isPasswordValid(password, user.password);
  
     if (!isValidPassword) {
       return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
     }
     const driver = await prisma.driver.findUnique({
      where: { userId: user?.id }
    })

    const accessToken = generateToken({ userId: user.id, driverId: driver?.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: user.role });
    const refreshToken = generateToken({ userId: user.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: user.role, expiresIn: "30d" });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken, accessToken, onlineStatus: "online" },
      });

      if(fcmToken?.trim() && platform?.trim()) {
        await prisma.pushNotificationToken.upsert({
          where: { userId: updatedUser.id },
          update: { token: fcmToken, platformType:  PlatformType[platform as keyof typeof PlatformType] },
          create: {
            userId: updatedUser.id,
            token: fcmToken,
            platformType: PlatformType[platform as keyof typeof PlatformType],
          },
        });

        await sendPushNotification({ fcmToken, title: "Drop Ride", body: "Test Notification! You are logged in" })
      }

      const {
        id,
        fullName, 
        email, 
        phoneNumber,
        longitude,
        latitude, 
        onlineStatus, 
        role, 
        modeOfRegistration,
        userTimezone,
        profileImage,
      } = updatedUser;

     res.status(Statuscode.SUCCESS).json({ 
      message: "Signed in successfully",
      data: { 
        user: {
            id,
            fullName, 
            email, 
            phoneNumber,
            longitude,
            latitude, 
            onlineStatus, 
            role, 
            modeOfRegistration,
            userTimezone,
            profileImage,
            accessToken 
      }
     }});

    //  const sendSMSWithKudiSMSResponse = await sendSMSWithTwilio('+2347065066383', `Your OTP is 1234`);
    //  console.log(sendSMSWithKudiSMSResponse)
     return 
   } catch (error) {
    console.log(error)
     return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
   }
 };

 
 export const signInWithPhoneNumber = async (req: Request, res: Response) => {
  
  const { phoneNumber, fcmToken, platform } = req.body;

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

    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
    }

    if (user && user.isBlocked) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Your account has been blocked" });
    }

    if (user && !user.isUserVerified) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Your account is not verified yet" });
    }

    if (user && !user.phoneNumber) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Phonenumber not found" });
    }

    // Generate OTP
    const phoneNumberOTP = generateOTP();
    
    const createdOTP = await prisma.oTP.upsert({
      where: { userId: user.id },
      update: { otp: phoneNumberOTP, expiresAt: expirationTime() },
      create: { otp: phoneNumberOTP, expiresAt: expirationTime(), user: { connect: { id: user.id } } },
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

    if(fcmToken?.trim() && platform?.trim()) {
      await prisma.pushNotificationToken.upsert({
        where: { userId: user.id },
        update: { token: fcmToken,  platformType:  PlatformType[platform as keyof typeof PlatformType] },
        create: {
          userId: user.id,
          token: fcmToken,
          platformType:  PlatformType[platform as keyof typeof PlatformType],
        },
      });
    }

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

    if(accessToken !== user?.accessToken) {
      res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
      return;
    }

    if(!user.refreshToken) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Please login" });
    }

    const verifyToken = verifyJwtToken({ token: user.refreshToken, secret: process.env.JWT_REFRESH_TOKEN_SECRET })

    if(!verifyToken.valid) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: verifyToken.error })
    }
    const driver = await prisma.driver.findUnique({
      where: { userId: user?.id }
    })

    const newAccessToken = generateToken({ userId: user.id, driverId: driver?.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: user.role });
    const newRefreshToken = generateToken({ userId: user.id, driverId: driver?.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: user.role, expiresIn: "30d" });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken, accessToken: newAccessToken },
    });

   return res.status(Statuscode.SUCCESS).json({
    message: "Token refreshed successfully",
    data: {
      accessToken: newAccessToken
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
        OR: [{ email: identifier }, { phoneNumber: formatPhoneNumber(identifier) || "123" }],
      },
    });

    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
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
        // Find user by role and (email or phoneNumber)
        const user = await prisma.user.findFirst({
          where: {
            role,
            OR: [
              { email },
              { phoneNumber: formattedPhoneNumber },
            ],
          },
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            role: true
          }
        });


    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
    }

    if (user && user.phoneNumber === formattedPhoneNumber) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "A user with this phone number already exists" });
    }

    // Generate OTP
    const phoneNumberOTP = generateOTP();

     await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { phoneNumber: formattedPhoneNumber },
      });
      await tx.oTP.upsert({
        where: { userId: updatedUser.id },
        update: { otp: phoneNumberOTP, expiresAt: expirationTime() },
        create: { otp: phoneNumberOTP, expiresAt: expirationTime(), user: { connect: { id: user.id } } },
      });

      return updatedUser;
    });

    // ADD EMAIL SENDING OTP
    return res.status(Statuscode.SUCCESS).json({ message: "A 4-digit OTP has been sent to your phone" });

  } catch (error) {
    console.log(error)
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};



export const updateUserProfile = async (req: Request, res: Response) => {

  const { fullName } = req.body;
  const userId = (req as AuthRequest)?.user?.userId;

  if(!userId) {
    return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Please login" });
  }
 
  try {

    // Find authenticated user
    const user = await prisma.user.findFirst({
      where: { id: userId }
    });

    if (!user) {
      return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid credentials" });
    }

    const formData = {
      ...(fullName && { fullName }),
    }

     await prisma.user.update({
       where: { id: user.id },
       data: { ...formData },
     });

    return res.status(Statuscode.SUCCESS).json({ message: "Profile updated successfully"});
 
  } catch (error) {
    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
}
