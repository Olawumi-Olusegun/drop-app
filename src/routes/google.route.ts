import express from "express";
import dotenv from "dotenv";
import passport from "../middlewares/passport.middleware";
import { Statuscode } from "../utils/Statuscode";
import { generateToken } from "../utils/jwt";
import { UserRole } from "../types";
import prisma from "../config/db";
dotenv.config();

const router = express.Router();

// Google OAuth Redirect
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
router.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {

    const user = req.user as any;

    const userExist = await prisma.user.findFirst({
      where: { googleId: user?.googleId },
    });

    if (!userExist || !userExist.googleId) {
        return res.status(Statuscode.NOT_FOUND).json({ message: "Authentication failed: User not found" });
    }

    // Generate JWT AccessToken and RefreshToken
    const accessToken = generateToken({ userId: user?.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: UserRole.RIDER });
    const refreshToken = generateToken({ userId: user.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: UserRole.RIDER, expiresIn: "30d" });

    const updatedUser =  await prisma.user.update({
        where: { id: userExist.id },
        data: { refreshToken },
      });

    if(!updatedUser) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "Authentication failed: Could not get user record" });
    }

    const { password: appPassword, ...userWithoutPassword } = updatedUser;

   // Send token to frontend (redirect or JSON response)
   return res.status(Statuscode.SUCCESS).json({
    message: "Sign-in successful",
    data: { user: {...userWithoutPassword, accessToken, }
   }});

    // res.redirect(`http://localhost:5051/auth?accessToken=${accessToken}`);

  }
);

export default router;
