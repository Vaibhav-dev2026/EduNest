import { Router } from "express";
import {
    getAttendance,
    getAttendanceById,
    addAttendance,
    updateAttendance,
    deleteAttendance
} from "../controllers/attendanceController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getAttendance));
router.post("/", authenticate(["admin", "teacher"]), asyncHandler(addAttendance));
router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getAttendanceById));
router.put("/:id", authenticate(["admin", "teacher"]), asyncHandler(updateAttendance));
router.delete("/:id", authenticate(["admin", "teacher"]), asyncHandler(deleteAttendance));

export default router;
