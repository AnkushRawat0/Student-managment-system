import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch
} from "../controllers/batchController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createBatch);
router.get("/", protect, getAllBatches);
router.get("/:id", protect, getBatchById);
router.put("/:id", protect, authorizeRoles("admin"), updateBatch);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBatch);

export default router;
