import express from 'express';
import { registerCourierDriver } from '../services/driver.service';
import { validateAvailableCourier, validateCourierDriverRegistration } from '../validators/driverValidator';
import { DocumentUploadController, getAvailableCourierController, registerCourierDriverController } from '../controllers/driver.controller';
import { validateUpdateDriverDocuments } from '../../../validators/driverValidator';
import { authenticateUser } from '../../../middlewares/auth.middleware';

const router = express.Router();

router.post("/register", authenticateUser,validateCourierDriverRegistration ,registerCourierDriverController);
router.put('/updateDocuments', authenticateUser,validateUpdateDriverDocuments, DocumentUploadController)
router.get('/available', authenticateUser,validateAvailableCourier, getAvailableCourierController)
export default router;