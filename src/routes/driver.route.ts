import express from "express";
import {
    acceptRideController,
    cancelRideBidController,
    completeRideController,
    DocumentUploadController,
    getAvailableRidesController,
    getDriverDashboardController,
    getDriverProfileController,
    getDriverRideHistoryController,
    getDriversController,
    getDriverWalletController,
    getRideDetailsController,
    getUserDetailsController,
    goOnlineController,
    rateUserController,
    registerDriverController,
    startRideController,
} from "../controllers/driver.controller";
import { updateDriverDocuments } from "../services/driver.service";
import {
    validateAcceptRide,
    validateAvailableRides,
    validateCancelBid,
    validateCompleteRide,
    validateDriverDashboard,
    validateDriverProfile,
    validateDriverRegistration,
    validateDriverRideHistory,
    validateDriverWallet,
    validateGetUserDetails,
    validateGoOnline,
    validateRateUser,
    validateRideIdParam,
    validateStartRide,
    validateUpdateDriverDocuments,
} from "../validators/driverValidator";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";
import { rejectSuspendedDrivers } from "../middlewares/suspended.driver.middleware";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);

router.post("/register", validateDriverRegistration, registerDriverController);

router.post(
    "/upload-documents",
    validateUpdateDriverDocuments,
    DocumentUploadController
);
router.post("/online", authenticateUser,rejectSuspendedDrivers,validateGoOnline, goOnlineController)
router.get('/profile', authenticateUser, rejectSuspendedDrivers,validateDriverProfile, getDriverProfileController)
router.get("/dashboard", authenticateUser, rejectSuspendedDrivers,validateDriverDashboard, getDriverDashboardController);
router.get("/available", authenticateUser, rejectSuspendedDrivers,validateAvailableRides, getAvailableRidesController);
router.get("/ride/:rideId", authenticateUser, rejectSuspendedDrivers,validateRideIdParam, getRideDetailsController);
router.get("/user/:userId", authenticateUser, rejectSuspendedDrivers,validateGetUserDetails, getUserDetailsController);
router.post("/:rideId/accept", authenticateUser, rejectSuspendedDrivers,validateAcceptRide, acceptRideController);
router.post("/:rideId/cancel", authenticateUser, rejectSuspendedDrivers,validateCancelBid, cancelRideBidController);
router.post("/:rideId/start", authenticateUser, rejectSuspendedDrivers,validateStartRide, startRideController);
router.post("/:rideId/complete", authenticateUser, rejectSuspendedDrivers,validateCompleteRide, completeRideController);
router.post("/:userId/rate", authenticateUser, rejectSuspendedDrivers,validateRateUser, rateUserController);
router.get("/rides", authenticateUser, rejectSuspendedDrivers,validateDriverRideHistory, getDriverRideHistoryController);
router.get('/wallet', authenticateUser, rejectSuspendedDrivers,validateDriverWallet, getDriverWalletController)
export default router;
