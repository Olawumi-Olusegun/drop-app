import express from 'express';
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import prisma from "../config/db";
import { Statuscode } from '../utils/Statuscode';
import { generateToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';
dotenv.config();

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
}, async (accessToken, refreshToken, profile, done) => {

    try {

        let user: { userId: string; role: string, googleId: string } | undefined;

        const userExist = await prisma.user.findUnique({
            where: { googleId: profile.id }
        });

        if (!userExist) {
            const newUser = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value || "",
                    fullName: profile.displayName,
                    profileImage: profile.photos?.[0]?.value || "",
                    onlineStatus: "offline",
                    role: "rider",
                    modeOfRegistration: "googleId"
                }
            });
            user = { userId: newUser.id, role: newUser.role, googleId: newUser?.googleId || "" };
        } else {
            user = { userId: userExist.id, role: userExist.role, googleId: user?.googleId || ""  };
        }
        return done(null, user);
    } catch (error) {
        return done(error, undefined);
    }
}));

router.get("/google/callback", passport.authenticate("google", { 
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
}), async (req, res) => {
        if (!req.user) return res.redirect("/login-failure");
        const userId = (req.user as any)?.userId || "";
        res.redirect(`/login-success?userId=${userId}`);
    }
);

router.get("/login-error", (req, res) => {
    return res.status(Statuscode.FORBIDDEN).json({ message: "Unable to login user" });
});


router.get("/login-success", async (req, res) => {
    
    const userId = req.query.userId as string;

    if(!userId) {
        return res.status(Statuscode.FORBIDDEN).json({ message: "Unauthorized user" });
      }

    const user = await prisma.user.findFirst({
        where: { id: userId },
      });

    if(!user) {
    return res.status(Statuscode.FORBIDDEN).json({ message: "Unable to login user" });
    }
    
    const accessToken = generateToken({ userId: user?.id!, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: UserRole.rider });
    const refreshToken = generateToken({ userId: user?.id!, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: UserRole.rider, expiresIn: "30d" });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: appPassword, ...userWithoutPassword } = user;

   return res.status(Statuscode.SUCCESS).json({
    message: "Sign-in successful",
    data: { 
        user: {...userWithoutPassword, accessToken }
   }});
});

router.get("/api/v1/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

passport.serializeUser((user: any, done) => done(null, user?.id));

passport.deserializeUser(async (id: unknown, done) => {
    try {
        const user = await prisma.user.findFirst({ where: { googleId: id as string } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

router.get('/api/v1/auth/logout',  async (req, res) => {
    try {
        if (req.session) {
            await new Promise<void>((resolve, reject) => {
                req.session.destroy((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        const userId = (req.user as any)?.userId;

        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { refreshToken: null }
            });
        }
        return res.status(Statuscode.SUCCESS).json({ message: "Logout successful" });
    } catch (error) {
        return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Logout failed" });
    }
});
export default router;