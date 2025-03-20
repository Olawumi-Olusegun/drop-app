import express from "express";

import { 
  createCourier,
  getCouriers,
  getCourierById,
  updateCourier,
  deleteCourier,
} from "../controllers/courier.controller";

const router = express.Router();

router.post("/", createCourier);
router.get("/", getCouriers);
router.get("/:courierId", getCourierById);
router.put("/:courierId", updateCourier);
router.delete("/:courierId", deleteCourier);

export default router;
