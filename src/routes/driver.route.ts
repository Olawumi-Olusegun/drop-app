import express from "express";
import { getDriversController } from "../controllers/driver.controller";

const router = express.Router();

router.get("/available-drivers/:riderId", getDriversController);


export default router;
