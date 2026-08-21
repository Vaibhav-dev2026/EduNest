import { Router } from "express";
import { getBatches, getBatchById, addBatch, updateBatch, deleteBatch } from "../controllers/batchController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", authenticate(["admin", "teacher", "student"]), asyncHandler(getBatches));
router.post("/", authenticate(["admin"]), asyncHandler(addBatch));
router.get("/:id", authenticate(["admin", "teacher", "student"]), asyncHandler(getBatchById));
router.put("/:id", authenticate(["admin"]), asyncHandler(updateBatch));
router.delete("/:id", authenticate(["admin"]), asyncHandler(deleteBatch));

export default router;
