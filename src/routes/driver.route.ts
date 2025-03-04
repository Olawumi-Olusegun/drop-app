import express from "express";
import { DocumentUploadController, getDriversController, registerDriverController } from "../controllers/driver.controller";
import { updateDriverDocuments } from "../services/driver.service";
import { validateDriverRegistration, validateUpdateDriverDocuments } from "../validators/driverValidator";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);
/**
 * @swagger
 * /api/v1/drivers/register:
 *   post:
 *     summary: Register a new driver
 *     description: Creates a new driver record with core details and returns pre-signed URLs for document uploads.
 *     tags:
 *       - Drivers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "a9c3fcae-1234-5678-9012-abcdef123456"
 *               verificationType:
 *                 type: string
 *                 enum: [NIN, Passport, IdCard]
 *                 example: "Passport"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               middleName:
 *                 type: string
 *                 example: "Doe"
 *               lastName:
 *                 type: string
 *                 example: "Smith"
 *               nationality:
 *                 type: string
 *                 example: "Nigerian"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "Lagos"
 *               postalCode:
 *                 type: string
 *                 example: "101001"
 *               country:
 *                 type: string
 *                 example: "Nigeria"
 *               issuingCountry:
 *                 type: string
 *                 example: "Nigeria"
 *               documentType:
 *                 type: string
 *                 example: "Passport"
 *               nin:
 *                 type: string
 *                 example: "123456789"
 *               licenseNumber:
 *                 type: string
 *                 example: "LIC123456"
 *               licenseExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               carBrand:
 *                 type: string
 *                 example: "Toyota"
 *               carModel:
 *                 type: string
 *                 example: "Corolla"
 *               licensePlateNumber:
 *                 type: string
 *                 example: "ABC-123"
 *               carColour:
 *                 type: string
 *                 example: "Blue"
 *     responses:
 *       201:
 *         description: Driver registered successfully and pre-signed URLs returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Driver registered successfully"
 *                 driver:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "driver-uuid"
 *                     userId:
 *                       type: string
 *                       example: "a9c3fcae-1234-5678-9012-abcdef123456"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     middleName:
 *                       type: string
 *                       example: "Doe"
 *                     lastName:
 *                       type: string
 *                       example: "Smith"
 *                     nationality:
 *                       type: string
 *                       example: "Nigerian"
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: "1990-01-01"
 *                     address:
 *                       type: string
 *                       example: "123 Main St"
 *                     city:
 *                       type: string
 *                       example: "Lagos"
 *                     postalCode:
 *                       type: string
 *                       example: "101001"
 *                     country:
 *                       type: string
 *                       example: "Nigeria"
 *                     issuingCountry:
 *                       type: string
 *                       example: "Nigeria"
 *                     documentType:
 *                       type: string
 *                       example: "Passport"
 *                     nin:
 *                       type: string
 *                       example: "123456789"
 *                     licenseNumber:
 *                       type: string
 *                       example: "LIC123456"
 *                     licenseExpiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-12-31"
 *                     carBrand:
 *                       type: string
 *                       example: "Toyota"
 *                     carModel:
 *                       type: string
 *                       example: "Corolla"
 *                     licensePlateNumber:
 *                       type: string
 *                       example: "ABC-123"
 *                     carColour:
 *                       type: string
 *                       example: "Blue"
 *                 uploadUrls:
 *                   type: object
 *                   properties:
 *                     licensePhotoUrl:
 *                       type: string
 *                     selfieWithLicenseUrl:
 *                       type: string
 *                     carPictureUrl:
 *                       type: string
 *                     idCardFrontUrl:
 *                       type: string
 *                     idCardBackUrl:
 *                       type: string
 *       400:
 *         description: Bad request (validation error)
 *       500:
 *         description: Internal server error
 */
router.post('/register',validateDriverRegistration , registerDriverController)
/**
 * @swagger
 * /api/v1/drivers/upload-documents:
 *   post:
 *     summary: Update driver document uploads
 *     description: Notifies the server that document uploads are complete. Updates the driver's identification and vehicle records with the provided S3 URLs.
 *     tags:
 *       - Drivers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: string
 *                 format: uuid
 *                 example: "driver-uuid"
 *               documents:
 *                 type: object
 *                 properties:
 *                   passportPhotoUrl:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/passportPhoto.jpg?..."
 *                   idCardFrontUrl:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/idCardFront.jpg?..."
 *                   idCardBackUrl:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/idCardBack.jpg?..."
 *                   licensePhotoUrl:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/licensePhoto.jpg?..."
 *                   selfieWithLicenseUrl:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/selfieWithLicense.jpg?..."
 *                   carPictureUrl:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/carPicture.jpg?..."
 *                   vehicleRegistration:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/vehicleRegistration.jpg?..."
 *                   roadWorthiness:
 *                     type: string
 *                     example: "https://s3.amazonaws.com/bucket/drivers/driver-uuid/roadWorthiness.jpg?..."
 *     responses:
 *       200:
 *         description: Documents updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Documents updated successfully"
 *       400:
 *         description: Bad request (validation error)
 *       500:
 *         description: Internal server error
 */
router.post('/upload-documents', validateUpdateDriverDocuments ,  DocumentUploadController)




export default router;
