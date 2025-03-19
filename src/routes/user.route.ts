import { Router } from "express";
import { validateBankDetails, validateSaveCardDetails } from "../validators/userValidator";
import { saveBankDetails, saveCardDetailController } from "../controllers/user.controller";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "../types";
import { saveOrUpateBankDetails } from "../services/user.service";

const userRouter = Router()

userRouter.post('/card' , authenticateUser, authorizeRole([UserRole.RIDER]) ,validateSaveCardDetails, saveCardDetailController)
userRouter.post('/addbank', authenticateUser, validateBankDetails,  saveBankDetails)
export default userRouter