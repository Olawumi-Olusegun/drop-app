import express from "express";

import { AddUserPhoneNumber, createPassword, createUsername, refreshToken, signInWithEmail, signInWithPhoneNumber, signupWithEmail, signupWithGoogle, signupWithPhoneNumber, updateUserProfile } from "../controllers/auth.controller";
import { validateCreatePassword, validateEmail, validateEmailOTP, validateForgotPassword, validateNewOTP, validatePhoneNumberOTP, validateRequest, validateResetPassword, validateSignin, validateSignup, validateUserLocation } from "../validators";
import { generateNewOTP, verifyEmailOTP, VerifyPhoneNumberUsingOTP, VerifySignInWithPhoneNumber } from "../controllers/verification.controller";
import { forgotPassword, resetPassword } from "../controllers/forgot.password.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { updateUserLocation } from "../controllers/user.controller";

const router = express.Router();

// authentication endpoints
router.post("/signup-with-email", validateSignup, validateRequest, signupWithEmail);

router.post("/signup-with-phone-number", validateSignup, validateRequest, signupWithPhoneNumber);

router.post("/signup-with-google", validateEmail, validateRequest, signupWithGoogle);

// signin endpoint
router.post("/signin-with-email", validateSignin, validateRequest, signInWithEmail);

router.post("/signin-with-phone-number", signInWithPhoneNumber);

// OTP endpoint
router.post("/resend-new-otp", validateNewOTP, validateRequest, generateNewOTP);

// verifiction routes for users who signed up with either email or phoneNumber
router.post("/verify-signup-with-phone-number", validatePhoneNumberOTP, validateRequest, VerifySignInWithPhoneNumber);

router.post("/verify-email", validateEmailOTP, validateRequest, verifyEmailOTP);

router.post("/verify-signin-with-phone-number", VerifySignInWithPhoneNumber);

// Password endpoints
router.post("/create-password", validateCreatePassword, validateRequest, createPassword);
router.patch("/update-profile", authenticateUser, updateUserProfile);

router.post("/forgot-password", validateForgotPassword, validateRequest, forgotPassword);

router.post("/reset-password", validateResetPassword, validateRequest, resetPassword);

// refreshtoken endpoint
router.get("/refresh-token", refreshToken);

// Create username
router.post("/create-username", createUsername);

router.post("/add-user-phone-number", AddUserPhoneNumber);

router.post("/verify-phone-number", VerifyPhoneNumberUsingOTP);
router.post("/update-user-location", validateUserLocation, validateRequest, updateUserLocation);

export default router;