import express from "express";

import { createPassword, refreshToken, signInWithEmail, signInWithPhoneNumber, signupWithEmail, signupWithGoogle, signupWithPhoneNumber } from "../controllers/auth.controller";
import { validateCreatePassword, validateEmail, validateEmailOTP, validateForgotPassword, validateNewOTP, validatePhoneNumberOTP, validateRequest, validateResetPassword, validateSignin, validateSignup } from "../validators";
import { generateNewOTP, verifyEmailOTP, verifyPhoneNumberOTP, VerifySignInWithPhoneNumber } from "../controllers/verification.controller";
import { forgotPassword, resetPassword } from "../controllers/forgot.password.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = express.Router();

// authentication endpoints
/**
 * @openapi
 * /api/v1/auth/signup-with-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Signup with email
 *     description: |
 *         - Create a new user account using an email address.
 *         - Register with email and role ("rider", "driver", "admin").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "hustiyitru@gufum.com"
 *                 description: The email associated with the account.
 *               role:
 *                 type: string
 *                 example: "rider"
 *     responses:
 *       200:
 *         description: User successfully signed up
 *       400:
 *         description: Validation error
 */
router.post("/signup-with-email", validateSignup, validateRequest, signupWithEmail);


/**
 * @openapi
 * /api/v1/auth/signup-with-phone-number:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Signup with phone number
 *     description: |
 *         - Create a new user account using a phone number.
 *         - Register with phoneNumber and role ("rider", "driver", "admin").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348758738673"
 *               role:
 *                 type: string
 *                 example: "rider"
 *     responses:
 *       200:
 *         description: User successfully signed up
 *       400:
 *         description: Validation error
 */
router.post("/signup-with-phone-number", validateSignup, validateRequest, signupWithPhoneNumber);

router.post("/signup-with-google", validateEmail, validateRequest, signupWithGoogle);

// signin endpoint
/**
 * @openapi
 * /api/v1/auth/signin-with-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: |
 *       - Sign in with an identifier and password.
 *       - The identifier can be either an email or a phone number used during signup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number used during signup
 *               password:
 *                 type: string
 *                 description: User's password
 *           examples:
 *             loginWithEmail:
 *               summary: Login with email
 *               description: Use email as the identifier
 *               value:
 *                 identifier: "johndoe@gmail.com"
 *                 password: "strongPassword123!"
 *             loginWithPhone:
 *               summary: Login with phone number
 *               description: Use phone number as the identifier
 *               value:
 *                 identifier: "+2347065064345"
 *                 password: "strongPassword12345!"
 *     responses:
 *       200:
 *         description: User successfully signed in
 *       401:
 *         description: Unauthorized
 */


router.post("/signin-with-email", validateSignin, validateRequest, signInWithEmail);

router.post("/signin-with-phone-number", signInWithPhoneNumber);


// OTP endpoint
router.post("/generate-new-otp", validateNewOTP, validateRequest, generateNewOTP);


// verifiction routes for users who signed up with either email or phoneNumber
/**
 * @openapi
 * /api/v1/auth/verify-signup-with-phone-number:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify phone number
 *     description: Verifies a user's phone number using OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               phoneNumberOTP:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Phone number successfully verified
 *       400:
 *         description: Validation error or incorrect OTP
 *       401:
 *         description: Unauthorized request
 */
router.post("/verify-signup-with-phone-number", validatePhoneNumberOTP, validateRequest, verifyPhoneNumberOTP);

/**
 * @openapi
 * /api/v1/auth/verify-email:
 *   post:
 *     tags:
 *       - Verification
 *     summary: Verify email address
 *     description: Verifies a user's email address using OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               emailOTP:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Email successfully verified
 *       400:
 *         description: Validation error or incorrect OTP
 *       401:
 *         description: Unauthorized request
 */
router.post("/verify-email", validateEmailOTP, validateRequest, verifyEmailOTP);
router.post("/verify-signin-with-phone-number", VerifySignInWithPhoneNumber);

// Password endpoints
/**
 * @openapi
 * /api/v1/auth/create-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a password for the user
 *     description: Allows users to create a password after signing up with Google or phone number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               googleId:
 *                 type: string
 *                 example: "google-oauth-id-123"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: "SecurePassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Password successfully created
 *       400:
 *         description: Validation error (e.g., passwords do not match)
 *       401:
 *         description: Unauthorized request
 */
router.post("/create-password", validateCreatePassword, validateRequest, createPassword);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: |
 *       This endpoint allows a user to request a password reset.
 *       The user must provide either an `email` or a `phoneNumber`.
 *       - If `email` is provided, `phoneNumber` should be omitted.
 *       - If `phoneNumber` is provided, `email` should be omitted.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348123456789"
 *             oneOf:
 *               - required: [email]
 *               - required: [phoneNumber]
 *           examples:
 *             ExampleWithEmail:
 *               summary: Forgot password with email
 *               value:
 *                 email: "user@example.com"
 *             ExampleWithPhone:
 *               summary: Forgot password with phone number
 *               value:
 *                 phoneNumber: "+2348123456789"
 *     responses:
 *       200:
 *         description: Password reset request successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset instructions sent successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       400:
 *         description: Bad request (invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Either email or phoneNumber is required"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.post("/forgot-password", validateForgotPassword, validateRequest, forgotPassword);


/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Allows users to reset their password using an OTP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - password
 *               - confirmPassword
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "5423"
 *                 description: One-time password (OTP) sent to the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password@123"
 *                 description: New password for the user.
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "password@123"
 *                 description: Confirm the new password.
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request (invalid or expired OTP, or passwords do not match)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or password mismatch"
 *       404:
 *         description: User not found or OTP not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found or invalid OTP"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.post("/reset-password", validateResetPassword, validateRequest, resetPassword);

// refreshtoken endpoint
/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: Generates a new access token using your old accessToken.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/refresh-token", authenticateUser, refreshToken);
export default router;
