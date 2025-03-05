

/**
 * @swagger
 * /api/v1/drivers/available-drivers/{riderId}:
 *   get:
 *     summary: Get available drivers near a rider
 *     description: Retrieves a list of available drivers within a certain radius of the rider's location.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: riderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the rider
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *         description: Maximum search radius in kilometers (default is 10km)
 *     responses:
 *       200:
 *         description: Successfully retrieved available drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 drivers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123456"
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       phoneNumber:
 *                         type: string
 *                         example: "+2349012345678"
 *                       latitude:
 *                         type: number
 *                         example: 6.5244
 *                       longitude:
 *                         type: number
 *                         example: 3.3792
 *       400:
 *         description: Bad request (Invalid parameters)
 *       404:
 *         description: No available drivers found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/drivers/register:
 *   post:
 *     summary: Register a new driver
 *     description: Creates a new driver record with core details and returns pre-signed URLs for document uploads.
 *     tags:
 *       - Driver
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

/**
 * @swagger
 * /api/v1/drivers/upload-documents:
 *   post:
 *     summary: Update driver document uploads
 *     description: Notifies the server that document uploads are complete. Updates the driver's identification and vehicle records with the provided S3 URLs.
 *     tags:
 *       - Driver
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

/**
 * @swagger
 * /api/v1/drivers/dashboard:
 *   get:
 *     summary: Get driver dashboard metrics
 *     description: Retrieves the driver's total earnings and total completed rides for a specified day. If no date is provided, today's metrics are returned.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the driver.
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: The target date in ISO8601 format (e.g., "2023-08-15"). Defaults to today if not provided.
 *     responses:
 *       200:
 *         description: Driver dashboard metrics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     totalEarnings:
 *                       type: number
 *                       example: 1200
 *                     totalRides:
 *                       type: number
 *                       example: 8
 *       404:
 *         description: Driver not Found
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/v1/drivers/available:
 *   get:
 *     summary: Get available rides for drivers
 *     description: Retrieves a list of rides with status "pending" that are within the specified maxDistance (in km) from the driver's current location.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: driverLatitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Driver's current latitude.
 *       - in: query
 *         name: driverLongitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Driver's current longitude.
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *         description: Maximum search radius in kilometers.
 *     responses:
 *       200:
 *         description: List of available rides retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "ride-uuid"
 *                       riderId:
 *                         type: string
 *                         example: "rider-uuid"
 *                       pickupLatitude:
 *                         type: number
 *                         example: 6.5244
 *                       pickupLongitude:
 *                         type: number
 *                         example: 3.3792
 *                       dropoffLatitude:
 *                         type: number
 *                         example: 6.6000
 *                       dropoffLongitude:
 *                         type: number
 *                         example: 3.4000
 *                       proposedPrice:
 *                         type: number
 *                         example: 500
 *                       status:
 *                         type: string
 *                         example: "pending"
 *       400:
 *         description: Invalid parameters.
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/v1/drivers/{rideId}:
 *   get:
 *     summary: Get details of a specific ride
 *     description: Retrieves detailed information about a ride by its unique identifier.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the ride.
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "ride-uuid"
 *                 riderId:
 *                   type: string
 *                   example: "rider-uuid"
 *                 pickupLatitude:
 *                   type: number
 *                   example: 6.5244
 *                 pickupLongitude:
 *                   type: number
 *                   example: 3.3792
 *                 dropoffLatitude:
 *                   type: number
 *                   example: 6.6000
 *                 dropoffLongitude:
 *                   type: number
 *                   example: 3.4000
 *                 proposedPrice:
 *                   type: number
 *                   example: 500
 *                 status:
 *                   type: string
 *                   example: "pending"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid rideId parameter.
 *       404:
 *         description: Ride not found.
 *       500:
 *         description: Internal server error.
 */
/**
 * @swagger
 * /api/v1/drivers/{userId}:
 *   get:
 *     summary: Get user details
 *     description: Retrieves the user's details including full name, average rating, total completed rides, and years using the app.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the user.
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid parameters.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *
 */

/**
 * @swagger
 * /api/v1/drivers/{rideId}/accept:
 *   post:
 *     summary: Submit a bid to accept a ride
 *     description: Allows a driver to submit a bid (with an optional proposed price) for a ride. The ride remains in the "pending" state so that multiple bids can be submitted.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the ride.
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
 *               proposedPrice:
 *                 type: number
 *                 example: 550
 *             required:
 *               - driverId
 *     responses:
 *       200:
 *         description: Bid submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ride:
 *                   $ref: '#/components/schemas/Ride'
 *                 bid:
 *                   $ref: '#/components/schemas/RideBid'
 *       400:
 *         description: Ride is no longer available or invalid input.
 *       404:
 *         description: Ride not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/drivers/{rideId}/cancel:
 *   post:
 *     summary: Cancel a bid for a ride
 *     description: Allows a driver to cancel their bid for a ride. The bid's status is updated to "rejected".
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the ride.
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
 *             required:
 *               - driverId
 *     responses:
 *       200:
 *         description: Bid cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bid cancelled successfully"
 *                 bid:
 *                   $ref: '#/components/schemas/RideBid'
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: No pending bid found for this ride and driver.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/drivers/{rideId}/start:
 *   post:
 *     summary: Start a ride
 *     description: Marks the ride as "ongoing" when the driver begins the trip. This endpoint updates the ride status and optionally records the start time.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the ride.
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
 *             required:
 *               - driverId
 *     responses:
 *       200:
 *         description: Ride started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Ride cannot be started (e.g., invalid state or unauthorized driver).
 *       404:
 *         description: Ride not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/drivers/{rideId}/complete:
 *   post:
 *     summary: Complete a ride
 *     description: Marks the ride as "completed" when the driver has reached the dropoff location. The ride must be "ongoing" and the driver must be the one assigned.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the ride.
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
 *             required:
 *               - driverId
 *     responses:
 *       200:
 *         description: Ride ended successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Ride is not in progress or driver is not authorized.
 *       404:
 *         description: Ride not found.
 *       500:
 *         description: Internal server error.
 */



/**

 * @swagger
 * /api/v1/drivers/{userId}/rate:
 *   post:
 *     summary: Rate a user
 *     description: Allows a driver to rate a user by creating a new rating record.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the user.
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
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: "Great user, prompt payment."
 *             required:
 *               - driverId
 *               - rating
 *     responses:
 *       200:
 *         description: User rated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRating'
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 *
 */

/**
 * @swagger
 * /api/v1/drivers/rides:
 *   get:
 *     summary: Get driver ride history with pagination
 *     description: Retrieves a list of rides that the driver has been assigned to (ride history), ordered from most recent. Pagination parameters (page and limit) are optional.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the driver.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of rides per page.
 *     responses:
 *       200:
 *         description: Driver ride history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rides:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ride'
 *                 totalCount:
 *                   type: number
 *                   example: 50
 *                 page:
 *                   type: number
 *                   example: 1
 *                 limit:
 *                   type: number
 *                   example: 10
 *       400:
 *         description: Invalid parameters.
 *       500:
 *         description: Internal server error.
 */
