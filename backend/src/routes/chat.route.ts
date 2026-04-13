import express from "express";
import { uploadChatMedia } from "../controllers/chat.controller";
import { chatUpload } from "../middlewares/chatUpload.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/upload", authMiddleware, chatUpload.array("media", 10), uploadChatMedia);

export default router;