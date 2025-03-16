
/**
 * @swagger
 * components:
 *   schemas:
 *     ScheduledRide:
 *       type: object
 *       required:
 *         - riderId
 *         - pickupLocation
 *         - pickupLatitude
 *         - pickupLongitude
 *         - dropoffLocation
 *         - dropoffLatitude
 *         - dropoffLongitude
 *         - userTimezone
 *         - scheduledDateTime
 *       properties:
 *         riderId:
 *           type: string
 *         pickupLocation:
 *           type: string
 *         pickupLatitude:
 *           type: number
 *         pickupLongitude:
 *           type: number
 *         dropoffLocation:
 *           type: string
 *         dropoffLatitude:
 *           type: number
 *         dropoffLongitude:
 *           type: number
 *         userTimezone:
 *           type: string
 *         scheduledDateTime:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /api/v1/scheduled-rides:
 *   post:
 *     summary: Schedule a new ride
 *     tags:
 *       - Schedule Ride
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduledRide'
 *     responses:
 *       201:
 *         description: Ride scheduled successfully
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /api/v1/scheduled-rides/{scheduledRideId}/bids:
 *   post:
 *     summary: Place a bid on a scheduled ride
 *     tags:
 *       - Schedule Ride
 *     parameters:
 *       - in: path
 *         name: scheduledRideId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bid placed successfully
 */


/**
 * @swagger
 * /api/v1/scheduled-rides/cancel/{rideId}:
 *   put:
 *     summary: Cancel a scheduled ride
 *     tags:
 *       - Schedule Ride
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride canceled successfully
 */







