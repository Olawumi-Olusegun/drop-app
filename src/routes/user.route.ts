import { Router } from "express";
import { validateSaveCardDetails } from "../validators/userValidator";
import { saveCardDetailController } from "../controllers/user.controller";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "../types";

const userRouter = Router()

userRouter.post('/card' , authenticateUser, authorizeRole([UserRole.RIDER]) ,validateSaveCardDetails, saveCardDetailController)

export default userRouter