import express from "express";
import { getLocationByIp } from "../controllers/location.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/ip", authMiddleware, getLocationByIp);

export default router;