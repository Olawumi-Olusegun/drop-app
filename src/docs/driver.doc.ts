

/**
 * @swagger
 * /api/v1/drivers/available-drivers/{riderId}:
 *   get:
 *     summary: Get available drivers near a rider
 *     description: Retrieves a list of available drivers within a certain radius of the rider's location.
 *     tags:
 *       - Drivers
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



