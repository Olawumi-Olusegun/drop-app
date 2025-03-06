import express from "express";
import {
    acceptRideController,
    cancelRideBidController,
    completeRideController,
    DocumentUploadController,
    getAvailableRidesController,
    getDriverDashboardController,
    getDriverRideHistoryController,
    getDriversController,
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
    validateDriverRegistration,
    validateDriverRideHistory,
    validateGetUserDetails,
    validateRateUser,
    validateRideIdParam,
    validateStartRide,
    validateUpdateDriverDocuments,
} from "../validators/driverValidator";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);

router.post("/register", validateDriverRegistration, registerDriverController);

router.post(
    "/upload-documents",
    validateUpdateDriverDocuments,
    DocumentUploadController
);
router.get("/dashboard", validateDriverDashboard, getDriverDashboardController);

router.get("/available", validateAvailableRides, getAvailableRidesController);

router.get("/ride/:rideId", validateRideIdParam, getRideDetailsController);
router.get("/user/:userId", validateGetUserDetails, getUserDetailsController);

router.post("/:rideId/accept", validateAcceptRide, acceptRideController);

router.post("/:rideId/cancel", validateCancelBid, cancelRideBidController);
router.post("/:rideId/start", validateStartRide, startRideController);
router.post("/:rideId/complete", validateCompleteRide, completeRideController);
router.post("/:userId/rate", validateRateUser, rateUserController);
router.get("/rides", validateDriverRideHistory, getDriverRideHistoryController);
export default router;
