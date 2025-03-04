

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Authenticate with Google OAuth
 *     description: Initiates the Google OAuth authentication flow. Redirects the user to Google's OAuth login page.
 *     tags:
 *       - Authentication
 *     responses:
 *       "302":
 *         description: Redirects to Google login page for authentication.
 *       "401":
 *         description: Unauthorized, if authentication fails.
 */


/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Logout User
 *     description: Logs out the authenticated user by destroying the session and clearing the refresh token.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []  # If authentication is required
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successfully"
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       500:
 *         description: Internal server error.
 */