import express from "express";

import { signupWithEmail, signupWithGoogle, signupWithPhoneNumber } from "../controllers/auth.controller";
import { validateEmail, validateEmailOTP, validateNewOTP, validatePhoneNumberOTP, validateRequest, validateSignup } from "../validators";
import { generateNewOTP, verifyEmailOTP, verifyPhoneNumberOTP } from "../controllers/verification.controller";

const router = express.Router();

router.post("/signup-with-email", validateSignup, validateRequest, signupWithEmail);
router.post("/signup-with-phone-number", validateSignup, validateRequest, signupWithPhoneNumber);
router.post("/signup-with-google", validateEmail, validateRequest, signupWithGoogle);
router.post("/generate-new-otp", validateNewOTP, validateRequest, generateNewOTP);

// verifiction routes for users who signed up with either email or phoneNumber
router.post("/verify-phone-number", validatePhoneNumberOTP, validateRequest, verifyPhoneNumberOTP);
router.post("/verify-email", validateEmailOTP, validateRequest, verifyEmailOTP);


export default router;
