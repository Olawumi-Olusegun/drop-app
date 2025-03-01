import express from 'express';
import dotenv from "dotenv";
import prisma from "../config/db";
import { Statuscode } from '../utils/Statuscode';
import { generateToken } from '../utils/jwt';
import { OAuth2Client } from "google-auth-library";

dotenv.config();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string || "");

const router = express.Router();

router.post("/google-auth", async (req, res) => {
    
    const { googleToken, role } = req.body;

    if (!googleToken || !role) {
        return res.status(Statuscode.FORBIDDEN).json({ message: "Invalid token" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        if(!ticket) {
            return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid google ID" });
        }

        const payload = ticket.getPayload();
        const googleId = payload?.sub;

        if(!payload || !googleId) {
            return res.status(Statuscode.BAD_REQUEST).json({ message: "Invalid google ID!" });
        }

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

        const accessToken = generateToken({ userId: user.id, secret: process.env.JWT_ACCESS_TOKEN_SECRET, role });
        const refreshToken = generateToken({ userId: user.id, secret: process.env.JWT_REFRESH_TOKEN_SECRET, role, expiresIn: "30d" });

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
        console.log(error);
        return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Authentication failed" });
    }
});