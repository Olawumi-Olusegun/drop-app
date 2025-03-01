import express from 'express';
import dotenv from "dotenv";
import prisma from "../config/db";
import { Statuscode } from '../utils/Statuscode';
import { generateToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';
import { OAuth2Client } from "google-auth-library";

dotenv.config();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

router.post("/google/callback", async (req, res) => {
    
    const { googleToken } = req.body;

    if (!googleToken) {
        return res.status(Statuscode.FORBIDDEN).json({ message: "Invalid token" });
    }


    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload?.sub;

        let user = await prisma.user.findUnique({
            where: { googleId },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId,
                    email: payload?.email || "",
                    fullName: payload?.name || "",
                    profileImage: payload?.picture || "",
                    onlineStatus: "offline",
                    role: "rider",
                    modeOfRegistration: "googleId"
                },
            });
        }

        const accessToken = generateToken({ userId: user.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role: UserRole.rider });
        const refreshToken = generateToken({ userId: user.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role: UserRole.rider, expiresIn: "30d" });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        const { password: appPassword, ...userWithoutPassword } = user;

        return res.status(Statuscode.SUCCESS).json({
            message: "Sign-in successful",
            data: {
                user: { ...userWithoutPassword, accessToken, refreshToken }
            }
        });
    } catch (error) {
        return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Authentication failed" });
    }
});