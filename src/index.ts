import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database";

// routes
import authRoutes from "./routes/auth.route";

// Load the correct environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
dotenv.config({ path: envFile });

const PORT = Number(process.env.PORT || 5150);

const app: Application = express();
app.use(express.json());


app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:5173',],
        optionsSuccessStatus: 200,
        credentials: true,
    })
);

app.use(cookieParser());

app.get('/health', (req: Request, res: Response) => {
    return res.status(200).json({ status: 'OK' });
});


app.use("/api/v1/auth", authRoutes);


const startApp = async () => {
    try {
        /** Connect to Mongo Database */
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        throw new Error('Unable to connect to database...')
    }
}

startApp();