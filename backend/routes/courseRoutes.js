import { Router } from "express";
import { getCourses, getCourseById, addCourse, updateCourse, deleteCourse } from "../controllers/courseController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getCourses));
router.post("/", authenticate(["admin"]), asyncHandler(addCourse));
router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getCourseById));
router.put("/:id", authenticate(["admin"]), asyncHandler(updateCourse));
router.delete("/:id", authenticate(["admin"]), asyncHandler(deleteCourse));

export default router;
