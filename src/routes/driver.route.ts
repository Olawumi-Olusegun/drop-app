import express from "express";
import {
    acceptRideController,
    cancelRideBidController,
    completeRideController,
    DocumentUploadController,
    getDriverDetails,
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
    requestWithdrawalController,
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
    validateWithdrawalRequest,
} from "../validators/driverValidator";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { rejectSuspendedDrivers } from "../middlewares/suspended.driver.middleware";
import { validateBankDetails } from "../validators/userValidator";
import { saveBankDetails } from "../controllers/user.controller";
import { UserRole } from "../types";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);

router.post("/register", validateDriverRegistration, registerDriverController);

router.post(
    "/upload-documents",
    validateUpdateDriverDocuments,
    DocumentUploadController
);
router.post("/online", authenticateUser,validateGoOnline, goOnlineController)
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
router.post('/addbank', authenticateUser,  validateBankDetails ,  saveBankDetails)
router.post('/request-withdrawal', authenticateUser,  validateWithdrawalRequest,requestWithdrawalController)


// Added by dev Olusegun
router.get('/get-driver-details/:driverId', authenticateUser, authorizeRole([UserRole.DRIVER, UserRole.ADMIN]),  getDriverDetails)
export default router;
