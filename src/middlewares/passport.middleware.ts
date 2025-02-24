import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import prisma from "../config/db";

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
}, async (accessToken, refreshToken, profile, done) => {

    try {

        let user: { userId: string; role: string } | undefined;

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

            user = { userId: newUser.id, role: newUser.role };
        } else {
            user = { userId: userExist.id, role: userExist.role };
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));


export default passport;