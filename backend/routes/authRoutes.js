import { Router } from "express";
import { login, signup } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/signup", asyncHandler(signup));

export default router;
