import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", authenticate(), asyncHandler(getNotifications));
router.patch("/read-all", authenticate(), asyncHandler(markAllAsRead));
router.patch("/:id/read", authenticate(), asyncHandler(markAsRead));

export default router;
