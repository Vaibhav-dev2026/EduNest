import { Router } from "express";
import { getNotices, getNoticeById, addNotice, updateNotice, deleteNotice } from "../controllers/noticeController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getNotices));
router.post("/", authenticate(["admin", "teacher"]), asyncHandler(addNotice));
router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getNoticeById));
router.put("/:id", authenticate(["admin", "teacher"]), asyncHandler(updateNotice));
router.delete("/:id", authenticate(["admin", "teacher"]), asyncHandler(deleteNotice));

export default router;
