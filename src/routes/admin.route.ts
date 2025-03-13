import { Router } from "express";
import { approveDriver, getAdminDashboardStats, getAllDrivers, getAllPendingDrivers, getAllUsers, getDriver, getUser, suspendDriver } from "../controllers/admin.controllr";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";
import { validateapproveDriver, validateGetAllDrivers, validateGetAllUsers, validateGetDriver, validateGetUSer, validatesuspendDriver } from "../validators/adminValidations";

const router = Router()

router.get('/get-all-users', authenticateUser,authorizeRole([UserRole.admin]),validateGetAllUsers,getAllUsers)
router.get('/get-user',authenticateUser,authorizeRole([UserRole.admin]) , validateGetUSer, getUser)
router.get('/get-all-drivers',authenticateUser, authorizeRole([UserRole.admin]), validateGetAllDrivers ,getAllDrivers)
router.get('/getdriver',authenticateUser, authorizeRole([UserRole.admin]), validateGetDriver, getDriver)
router.post('/approve-driver',authenticateUser, authorizeRole([UserRole.admin]), validateapproveDriver , approveDriver)
router.get('/pending-drivers',authenticateUser, authorizeRole([UserRole.admin]) , getAllPendingDrivers)
router.get('/admin-dashboard',authenticateUser, authorizeRole([UserRole.admin]),getAdminDashboardStats)
router.get('/suspend-driver',authenticateUser, authorizeRole([UserRole.admin]), validatesuspendDriver, suspendDriver)
export default router