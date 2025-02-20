import express from "express";

import { createPassword, refreshToken, signIn, signupWithEmail, signupWithGoogle, signupWithPhoneNumber } from "../controllers/auth.controller";
import { validateCreatePassword, validateEmail, validateEmailOTP, validateForgotPassword, validateNewOTP, validatePhoneNumberOTP, validateRequest, validateResetPassword, validateSignin, validateSignup } from "../validators";
import { generateNewOTP, verifyEmailOTP, verifyPhoneNumberOTP } from "../controllers/verification.controller";
import { forgotPassword, resetPassword } from "../controllers/forgot.password.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = express.Router();

// authentication endpoints
/**
 * @openapi
 * /signup-with-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Signup with email
 *     description: Create a new user account using an email address.
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
 * /signup-with-phone-number:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Signup with phone number
 *     description: Create a new user account using a phone number.
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
 * /signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Sign in with email/phone and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "johndoe@gmail.com"
 *               password:
 *                 type: string
 *                 example: "strongPassword123"
 *     responses:
 *       200:
 *         description: User successfully signed in
 *       401:
 *         description: Unauthorized
 */
router.post("/signin", validateSignin, validateRequest, signIn);

// OTP endpoint
router.post("/generate-new-otp", validateNewOTP, validateRequest, generateNewOTP);


// verifiction routes for users who signed up with either email or phoneNumber
/**
 * @openapi
 * /verify-phone-number:
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
 *               otp:
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
router.post("/verify-phone-number", validatePhoneNumberOTP, validateRequest, verifyPhoneNumberOTP);

/**
 * @openapi
 * /verify-email:
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


// Password endpoints
/**
 * @openapi
 * /create-password:
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

router.post("/forgot-password", validateForgotPassword, validateRequest, forgotPassword);
router.post("/reset-password", validateResetPassword, validateRequest, resetPassword);

// refreshtoken endpoint
/**
 * @openapi
 * /refresh-token:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: Generates a new access token using a refresh token.
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
