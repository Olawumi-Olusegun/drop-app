
/**
 * @swagger
 * /api/v1/request-ride:
 *   post:
 *     summary: Request a ride
 *     description: Allows a user to request a ride by providing pickup and dropoff locations.
 *     tags:
 *       - Rider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - pickupLocation
 *               - pickupLongitude
 *               - pickupLatitude
 *               - dropoffLocation
 *               - dropoffLatitude
 *               - dropoffLongitude
 *               - userTimezone
 *               - price
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "ebd46946-8247-41a1-a5a6-eb6eb3d1e78d"
 *                 description: The ID of the user requesting the ride.
 *               pickupLocation:
 *                 type: string
 *                 description: The address of the pickup location.
 *                 example: "Oshodi"
 *               pickupLongitude:
 *                 type: number
 *                 format: float
 *                 example: 0.366
 *                 description: The longitude of the pickup location.
 *               pickupLatitude:
 *                 type: number
 *                 format: float
 *                 example: 1.456
 *                 description: The latitude of the pickup location.
 *               dropoffLocation:
 *                 type: string
 *                 description: The address of the dropoff location.
 *                 example: "Computer Village, Ikeja"
 *               dropoffLatitude:
 *                 type: number
 *                 format: float
 *                 example: 1.678
 *                 description: The latitude of the dropoff location.
 *               dropoffLongitude:
 *                 type: number
 *                 format: float
 *                 example: 1.976
 *                 description: The longitude of the dropoff location.
 *               userTimezone:
 *                 type: string
 *                 example: "Africa/Lagos"
 *                 description: User timezone
 *               price:
 *                 type: string
 *                 example: "5000"
 *                 description: Rider budget for ride
 *     responses:
 *       200:
 *         description: Ride request created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride request submitted successfully"
 *                 rideId:
 *                   type: string
 *                   example: "73tey3u3-5ece-4d1a-b0c8-8e64eki73jjud"
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/accept-ride:
 *   post:
 *     summary: Accept a ride bid
 *     description: Allows a driver to accept a ride request bid.
 *     tags:
 *       - Rider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidId
 *             properties:
 *               bidId:
 *                 type: string
 *                 example: "7cc84ef7-5ece-4d1a-b0c8-8e6408ca5fc1"
 *                 description: The ID of the bid being accepted.
 *     responses:
 *       200:
 *         description: Ride bid accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride bid accepted successfully"
 *                 rideId:
 *                   type: string
 *                   example: "7cc84ef7-5ece-4d1a-b0c8-8e6408ca5fc1"
 *       400:
 *         description: Invalid input or missing bidId.
 *       404:
 *         description: Bid not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/reject-ride:
 *   post:
 *     summary: Reject a ride bid
 *     description: Allows a driver to reject a ride request bid.
 *     tags:
 *       - Rider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidId
 *             properties:
 *               bidId:
 *                 type: string
 *                 example: "7cc84ef7-5ece-4d1a-b0c8-8e6408ca5fc1"
 *                 description: The ID of the bid being rejected.
 *     responses:
 *       200:
 *         description: Ride bid rejected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride bid rejected successfully"
 *       400:
 *         description: Invalid input or missing bidId.
 *       404:
 *         description: Bid not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/available:
 *   get:
 *     summary: Get all available rides within a driver's location
 *     description: Retrieves a list of rides available within a specified radius from the driver's location.
 *     tags:
 *       - Rider
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Driver's current latitude.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Driver's current longitude.
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         required: false
 *         description: Search radius in kilometers (default is 5km).
 *     responses:
 *       200:
 *         description: List of available rides within the specified radius.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bidId:
 *                     type: string
 *                     example: "6b1e7972-006b-48ca-92a9-7a4b5a1339e2"
 *                     description: The unique ID of the bid.
 *                   pickupLocation:
 *                     type: string
 *                     example: "Eti-Osa, Obalende"
 *                     description: The location where the ride starts.
 *                   dropoffLocation:
 *                     type: string
 *                     example: "Osborn, Ikoyi"
 *                     description: The location where the ride ends.
 *                   distance:
 *                     type: number
 *                     example: 10
 *                     description: Distance from the driver's location in kilometers.
 *       400:
 *         description: Invalid or missing parameters.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/{rideId}/bids:
 *   get:
 *     summary: Get all bids for a specific ride
 *     description: Retrieves a list of bids placed by drivers for a specific ride request.
 *     tags:
 *       - Rider
 *     parameters:
 *       - in: path
 *         name: rideId
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique ID of the ride.
 *     responses:
 *       200:
 *         description: A list of bids for the specified ride.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bidId:
 *                     type: string
 *                     example: "6b1e7972-006b-48ca-92a9-7a4b5a1339e2"
 *                     description: The unique ID of the bid.
 *                   driverId:
 *                     type: string
 *                     example: "4d5eb1b2-b36c-4ffd-94e0-d4896bef9aec"
 *                     description: The ID of the driver who placed the bid.
 *                   amount:
 *                     type: number
 *                     description: The bid amount.
 *                     example: 15000
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the bid was placed.
 *       400:
 *         description: Invalid ride ID or missing parameter.
 *       404:
 *         description: No bids found for the given ride.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/{rideId}/bid:
 *   post:
 *     summary: Driver places a bid on a ride
 *     description: Allows a driver to place a bid for a specific ride request.
 *     tags:
 *       - Rider
 *     parameters:
 *       - in: path
 *         name: rideId
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique ID of the ride.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *               - amount
 *             properties:
 *               rideId:
 *                 type: string
 *                 example: "6b5eb1b2-b20c-4ar-85e0-84896eyf9aer"
 *                 description: The ID of the ride.
 *               driverId:
 *                 type: string
 *                 example: "4d5eb1b2-b36c-4ffd-94e0-d4896bef9aec"
 *                 description: The ID of the driver placing the bid.
 *               amount:
 *                 type: number
 *                 description: The bid amount.
 *                 example: 20000
 *     responses:
 *       201:
 *         description: Bid successfully placed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bidId:
 *                   type: string
 *                   example: "6b1e7972-006b-48ca-92a9-7a4b5a1339e2"
 *                   description: The unique ID of the bid.
 *                 rideId:
 *                   type: string
*                   example: "75d6a03d-2e6c-4969-9ed0-796de2519c0d"
 *                   description: The ride ID the bid is placed on.
 *                 driverId:
 *                   type: string
 *                   example: "ebd46946-8247-41a1-a5a6-eb6eb3d1e78d"
 *                   description: The driver who placed the bid.
 *                 amount:
 *                   type: number
 *                   description: The bid amount.
 *                   example: 20000
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp when the bid was placed.
 *       400:
 *         description: Invalid request body or missing required fields.
 *       404:
 *         description: Ride not found.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/v1/search-available-rides:
 *   get:
 *     summary: Search for available rides within a 5km radius
 *     description: |
 *       Retrieves a list of available rides within a 5km radius based on the user's latitude and longitude.
 *       
 *       **Example Request URL:**
 *       ```
 *       /api/v1/search-available-rides?latitude=40.712776&longitude=-74.005974
 *       ```
 *     tags:
 *       - Rider
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: The latitude of the user's location.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: The longitude of the user's location.
 *     responses:
 *       200:
 *         description: A list of available rides within 5km.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "6b1e7972-006b-48ca-92a9-7a4b5a1339e2"
 *                         description: The unique ride ID.
 *                       farePrice:
 *                         type: string
 *                         example: "5000"
 *                         description: Price for the ride.
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                         description: Name of the driver.
 *                       pickupLocation:
 *                         type: string
 *                         example: "123 Main Street"
 *                         description: The pickup location of the ride.
 *                       dropoffLocation:
 *                         type: string
 *                         example: "456 Oak Avenue"
 *                         description: The dropoff location of the ride.
 *                       pickupLatitude:
 *                         type: number
 *                         example: 40.712776
 *                         description: The latitude of the pickup location.
 *                       pickupLongitude:
 *                         type: number
 *                         example: -74.005974
 *                         description: The longitude of the pickup location.
 *                       distance:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: number
 *                             format: float
 *                             example: 3.8
 *                             description: The distance of the ride from the user's location.
 *                           unit:
 *                             type: string
 *                             example: "km"
 *                             description: The unit of distance measurement (kilometers).
 *       400:
 *         description: Bad request due to missing latitude or longitude.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Latitude and Longitude are required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
