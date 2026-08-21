import { Router } from "express";
import {
    getTeachers,
    getTeacherById,
    addTeacher,
    updateTeacher,
    deleteTeacher
} from "../controllers/teacherController.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// IMPORTANT: /profile must be registered before /:id.
router.get("/profile", authenticate(["teacher", "admin"]), asyncHandler(getProfile));
router.put("/profile", authenticate(["teacher", "admin"]), asyncHandler(updateProfile));

router.get("/", authenticate(["admin", "teacher"]), asyncHandler(getTeachers));
router.post("/", authenticate(["admin"]), asyncHandler(addTeacher));

router.get("/:id", authenticate(["admin", "teacher"]), asyncHandler(getTeacherById));
router.put("/:id", authenticate(["admin", "teacher"]), asyncHandler(updateTeacher));
router.delete("/:id", authenticate(["admin"]), asyncHandler(deleteTeacher));

export default router;
