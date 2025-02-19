import express from "express";
import { signin, signup } from "../controllers/auth.controller";
import { validateRequest, validateSignin, validateSignup } from "../validators";

const router = express.Router();

router.post("/signup", validateSignup, validateRequest, signup);
router.post("/signin", validateSignin, validateRequest, signin);

export default router;
