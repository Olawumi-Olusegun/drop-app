import express from "express";
import { createBid, getAllRidesWithinADriverLocation, getDriversController } from "../controllers/driver.controller";
import { acceptBid, getRideBids, rejectBid, requestRide } from "../controllers/ride.controller";
import { validateQueryParams, validateRequest } from "../validators";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = express.Router();


router.post("/request-ride", authenticateUser, requestRide);
router.post("/accept-ride", acceptBid);
router.post("/reject-ride", rejectBid);
router.get("/available", validateQueryParams, validateRequest, getAllRidesWithinADriverLocation);

router.get("/available-drivers/:riderId", getDriversController);
router.get("/:rideId/bids", getRideBids);
router.post("/:rideId/bid", createBid);

export default router;
