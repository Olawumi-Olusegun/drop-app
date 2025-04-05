import express from "express";

import {
  createCourier,
  getCouriers,
  getCourierById,
  updateCourier,
  deleteCourier,
} from "../controllers/courier.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = express.Router();

router.post("/", authenticateUser, createCourier);
router.get("/", authenticateUser, getCouriers);
router.get("/:courierId", authenticateUser, getCourierById);
router.put("/:courierId", authenticateUser, updateCourier);
router.delete("/:courierId", authenticateUser, deleteCourier);

export default router;
