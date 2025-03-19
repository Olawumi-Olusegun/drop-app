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