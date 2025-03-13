import { Router } from "express";
import { approveDriver, getAdminDashboardStats, getAllDrivers, getAllPendingDrivers, getAllUsers, getDriver, getUser, suspendDriver } from "../controllers/admin.controllr";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";

import { validateapproveDriver, validateGetAllDrivers, validateGetAllUsers, validateGetDriver, validateGetUSer, validatesuspendDriver } from "../validators/adminValidations";
import { UserRole } from "../types";

const router = Router()

router.get('/get-all-users', authenticateUser,authorizeRole([UserRole.ADMIN]),validateGetAllUsers,getAllUsers)
router.get('/get-user',authenticateUser,authorizeRole([UserRole.ADMIN]) , validateGetUSer, getUser)
router.get('/get-all-drivers',authenticateUser, authorizeRole([UserRole.ADMIN]), validateGetAllDrivers ,getAllDrivers)
router.get('/get-driver',authenticateUser, authorizeRole([UserRole.ADMIN]), validateGetDriver, getDriver)
router.post('/approve-driver',authenticateUser, authorizeRole([UserRole.ADMIN]), validateapproveDriver , approveDriver)
router.post('/suspend-driver',authenticateUser, authorizeRole([UserRole.ADMIN]), validatesuspendDriver, suspendDriver)
router.get('/pending-drivers',authenticateUser, authorizeRole([UserRole.ADMIN]) , getAllPendingDrivers)
router.get('/admin-dashboard',authenticateUser, authorizeRole([UserRole.ADMIN]),getAdminDashboardStats)

export default router