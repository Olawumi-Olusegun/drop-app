import express from "express";
import { getAllRidesWithinADriverLocation, getDriversController } from "../controllers/driver.controller";
import { acceptBid, cancelRide, completeRide, getRideBids, getRideDetails, placeBid, rejectBid, requestRide, searchAvailableRides } from "../controllers/ride.controller";
import { validateQueryParams, validateRequest } from "../validators";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "../types";

const router = express.Router();

router.post("/request-ride", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.ADMIN]), requestRide);
router.post("/search-available-rides", authenticateUser, searchAvailableRides);
router.post("/accept-ride", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.ADMIN]), acceptBid);
router.post("/reject-ride", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.DRIVER, UserRole.ADMIN]), rejectBid);
router.get("/available", validateQueryParams, validateRequest, getAllRidesWithinADriverLocation);

router.get("/available-drivers/:riderId", getDriversController);
router.get("/available-rides", searchAvailableRides) //Riders;
router.patch("/:rideId/complete", authenticateUser, authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), completeRide);
router.get("/:rideId/details", authenticateUser, authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), getRideDetails);
router.post("/:rideId/cancel", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.ADMIN]), cancelRide);
router.get("/:rideId/bids", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.ADMIN]), getRideBids);
router.post("/:rideId/bid", authenticateUser, authorizeRole([UserRole.DRIVER, UserRole.ADMIN]), placeBid);

export default router;
