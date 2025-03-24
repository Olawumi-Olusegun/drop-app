import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from 'express-session';

// routes
import authRoutes from "./routes/auth.route";
import driverRoutes from "./routes/driver.route";
import rideRoutes from "./routes/ride.route";
import adminRoutes from "./routes/admin.route";
import courierRoutes from "./services/courier/routes/courier.route";
import passportRoutes from "./routes/passport.route";
import scheduleRideRoutes from "./routes/schedule-ride.route";
import userRoutes from "./routes/user.route"
import swaggerDocs from "./utils/swagger";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { Statuscode } from "./utils/Statuscode";
import passport from "passport";
import prisma from "./config/db";
import { rejectBlockedUsers } from "./middlewares/blocked.user.middleware";
import { startCronJob } from "./utils/cronJob";


// Load the correct environment file based on NODE_ENV
const envFile = (process.env.NODE_ENV === "development") ? ".env.development" : ".env";

dotenv.config({ path: envFile });

const PORT = Number(process.env.PORT || "5150");

const app: Application = express();

//app.disable('x-powered-by');
app.use(express.json());
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET!,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())

app.use(morgan("dev"));
// app.use(
//   cors({
//     origin: ['http://localhost:3000', 'http://localhost:5173', 'https://drop-app-ytc9.onrender.com',  'http://13.60.191.204:5150'],
//     optionsSuccessStatus: 200,
//     //credentials: true,
//   })
// );


app.use(cookieParser());
swaggerDocs(app, PORT);



// API Routes
app.get('/health', (req: Request, res: Response) => res.status(200).json({ status: 'OK' }));
app.use("/api/v1/auth", authRoutes);
app.use("/", passportRoutes);


app.use(rejectBlockedUsers);
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/rides", rideRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use("/api/v1/scheduled-rides", scheduleRideRoutes);
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/couriers', courierRoutes)


// Catch-all middleware for 404 routes
app.use(notFoundHandler);

// Global Error Handler (For other errors)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  const statusCode = err.status || Statuscode.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    message: err.message || "Server Error",
    statusCode,
  });
});


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJob({});
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing server...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  server.close(() => console.log("Server closed."));
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing server...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  server.close(() => console.log("Server closed."));
});