import { Router } from "express";
import { getFees, getFeeById, addFee, updateFee, deleteFee } from "../controllers/feeController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getFees));
router.post("/", authenticate(["admin"]), asyncHandler(addFee));
router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getFeeById));
router.put("/:id", authenticate(["admin"]), asyncHandler(updateFee));
router.delete("/:id", authenticate(["admin"]), asyncHandler(deleteFee));

export default router;
