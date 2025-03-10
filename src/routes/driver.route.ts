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
    validateRateUser,
    validateRideIdParam,
    validateStartRide,
    validateUpdateDriverDocuments,
} from "../validators/driverValidator";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);

router.post("/register", validateDriverRegistration, registerDriverController);

router.post(
    "/upload-documents",
    validateUpdateDriverDocuments,
    DocumentUploadController
);
router.get('/profile', authenticateUser, validateDriverProfile, getDriverProfileController)
router.get("/dashboard", authenticateUser, validateDriverDashboard, getDriverDashboardController);

router.get("/available", authenticateUser, validateAvailableRides, getAvailableRidesController);

router.get("/ride/:rideId", authenticateUser, validateRideIdParam, getRideDetailsController);
router.get("/user/:userId", authenticateUser, validateGetUserDetails, getUserDetailsController);

router.post("/:rideId/accept", authenticateUser, validateAcceptRide, acceptRideController);

router.post("/:rideId/cancel", authenticateUser, validateCancelBid, cancelRideBidController);
router.post("/:rideId/start", authenticateUser, validateStartRide, startRideController);
router.post("/:rideId/complete", authenticateUser, validateCompleteRide, completeRideController);
router.post("/:userId/rate", authenticateUser, validateRateUser, rateUserController);
router.get("/rides", authenticateUser, validateDriverRideHistory, getDriverRideHistoryController);
router.get('/wallet', authenticateUser, validateDriverWallet, getDriverWalletController)
export default router;
