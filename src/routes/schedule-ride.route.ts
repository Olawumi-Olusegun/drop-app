import express from "express";
import { acceptScheduledRide, acceptScheduledRideBid, cancelScheduledRide, getScheduledRideBids, getScheduledRides, placeScheduledRideBid, scheduleRide } from "../controllers/schedule-ride.controller";
import { validatesCancelRide, validatescheduleRide, validatescheduleRideBid } from "../validators/scheduledRideValidations";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { validateRequest } from "../validators";
import { UserRole } from "../types";

const router = express.Router();

router.get("/", authenticateUser, getScheduledRides);
router.post("/schedule", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.ADMIN]), validatescheduleRide, validateRequest, scheduleRide);
router.post("/accept", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.DRIVER, UserRole.ADMIN]), acceptScheduledRide);
router.get("/:scheduledRideId/bids", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.DRIVER, UserRole.ADMIN]), getScheduledRideBids);
router.post("/:scheduledRideId/bids", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.DRIVER, UserRole.ADMIN]), validatescheduleRideBid, validateRequest,  placeScheduledRideBid);
router.put("/cancel/:rideId",authenticateUser, authorizeRole([UserRole.RIDER, UserRole.DRIVER, UserRole.ADMIN]), validatesCancelRide, validateRequest, cancelScheduledRide);
router.patch("/:scheduledRideId/bids/:bidId/accept", authenticateUser, authorizeRole([UserRole.RIDER, UserRole.DRIVER, UserRole.ADMIN]), acceptScheduledRideBid);

export default router;
