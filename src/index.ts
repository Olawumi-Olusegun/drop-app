import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/auth.route";
import swaggerDocs from "./utils/swagger";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { Statuscode } from "./utils/Statuscode";

// Load the correct environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
dotenv.config({ path: envFile });

const PORT = Number(process.env.PORT || 5150);

const app: Application = express();


app.disable('x-powered-by');
app.use(express.json());


app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:5173','https://drop-app-ytc9.onrender.com',],
        optionsSuccessStatus: 200,
        credentials: true,
    })
);

app.use(cookieParser());

// API Routes
app.get('/health', (req: Request, res: Response) => res.status(200).json({ status: 'OK' }));

app.use("/api/v1/auth", authRoutes);

// Catch-all middleware for 404 routes
app.use(notFoundHandler);

// Global Error Handler (For other errors)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || Statuscode.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({
      message: err.message || "Server Error",
      statusCode,
    });
  });
  

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    swaggerDocs(app, PORT)
});