import { Router } from "express";
import {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
} from "../controllers/studentController.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// IMPORTANT: /profile must be registered before /:id.
router.get("/profile", authenticate(["student", "admin"]), asyncHandler(getProfile));
router.put("/profile", authenticate(["student", "admin"]), asyncHandler(updateProfile));

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getStudents));
router.post("/", authenticate(["admin"]), asyncHandler(addStudent));

router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getStudentById));
router.put("/:id", authenticate(["admin", "student"]), asyncHandler(updateStudent));
router.delete("/:id", authenticate(["admin"]), asyncHandler(deleteStudent));

export default router;
