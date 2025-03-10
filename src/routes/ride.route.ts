import express from "express";
import { getAllRidesWithinADriverLocation, getDriversController } from "../controllers/driver.controller";
import { acceptBid, cancelRide, completeRide, getRideBids, placeBid, rejectBid, requestRide, searchAvailableRides } from "../controllers/ride.controller";
import { validateQueryParams, validateRequest } from "../validators";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/request-ride", authenticateUser, authorizeRole([UserRole.rider, UserRole.admin]), requestRide);
router.post("/search-available-rides", authenticateUser, searchAvailableRides);
router.post("/accept-ride", authenticateUser, authorizeRole([UserRole.rider, UserRole.admin]), acceptBid);
router.post("/reject-ride", authenticateUser, authorizeRole([UserRole.driver, UserRole.driver, UserRole.admin]), rejectBid);
router.get("/available", validateQueryParams, validateRequest, getAllRidesWithinADriverLocation);

router.get("/available-drivers/:riderId", getDriversController);
router.get("/available-rides", searchAvailableRides) //Riders;
router.patch("/:rideId/complete", authenticateUser, authorizeRole([UserRole.driver, UserRole.admin]), completeRide);
router.post("/:rideId/cancel", authenticateUser, authorizeRole([UserRole.rider, UserRole.admin]), cancelRide);
router.get("/:rideId/bids", authenticateUser, authorizeRole([UserRole.rider, UserRole.admin]), getRideBids);
router.post("/:rideId/bid", authenticateUser, authorizeRole([UserRole.driver, UserRole.admin]), placeBid);

export default router;
