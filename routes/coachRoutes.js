import express from "express";
import {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
} from "../controllers/coachController.js";
import protect from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/", createCoach);
router.get("/", getAllCoaches);
router.get("/:id", getCoachById);


//protect update and delete coach
router.put("/:id",protect, updateCoach);
router.delete("/:id",protect, deleteCoach);

export default router;
