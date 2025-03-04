import express from "express";
import { acceptRideController, cancelRideBidController, DocumentUploadController, getAvailableRidesController, getDriversController, getRideDetailsController, registerDriverController, startRideController } from "../controllers/driver.controller";
import { updateDriverDocuments } from "../services/driver.service";
import { validateAcceptRide, validateAvailableRides, validateCancelBid, validateDriverRegistration, validateRideIdParam, validateStartRide, validateUpdateDriverDocuments } from "../validators/driverValidator";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);

router.post('/register',validateDriverRegistration , registerDriverController)

router.post('/upload-documents', validateUpdateDriverDocuments ,  DocumentUploadController)


router.get('/available', validateAvailableRides, getAvailableRidesController)

router.get('/:rideId', validateRideIdParam, getRideDetailsController)

router.post('/:rideId/accept', validateAcceptRide, acceptRideController)


router.post('/:rideId/cancel', validateCancelBid, cancelRideBidController);
router.post("/:rideId/start", validateStartRide, startRideController)

export default router;
