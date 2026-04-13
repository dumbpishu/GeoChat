import express from "express";
import { updateUser, updateUserAvatar, deleteUser, searchMentionsUsers } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserSchema } from "../validations/user.validation";
import { upload } from "../middlewares/upload.middleware";

const router = express.Router();

router.use(authMiddleware);

router.patch("/info", validate(updateUserSchema), updateUser);
router.patch("/avatar", upload.single("avatar"), updateUserAvatar);
router.delete("/", deleteUser);
router.get("/mentions", searchMentionsUsers);

export default router;