/**
 * @swagger
 * /api/v1/users/card:
 *   post:
 *     summary: Save card details for a user
 *     description: Saves or updates the saved card authorization code for the user.
 *     tags:
 *       - Users
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
 *                 example: "user-uuid"
 *               authCode:
 *                 type: string
 *                 example: "AUTH_abc123"
 *             required:
 *               - userId
 *               - authCode
 *     responses:
 *       200:
 *         description: Card details saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/v1/bank:
 *   post:
 *     summary: Save or update bank details for a user
 *     description: Allows a user (typically a driver) to save or update their bank account details for payouts.
 *     tags:
 *       - Bank Details
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
 *                 example: "driver-uuid"
 *               accountNumber:
 *                 type: string
 *                 example: "0123456789"
 *               bankCode:
 *                 type: string
 *                 example: "058"
 *               accountName:
 *                 type: string
 *                 example: "John Doe"
 *             required:
 *               - userId
 *               - accountNumber
 *               - bankCode
 *     responses:
 *       200:
 *         description: Bank details saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bankDetail:                  
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Internal server error.
 */