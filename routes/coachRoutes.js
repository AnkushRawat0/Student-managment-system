import express from "express";
import {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
} from "../controllers/coachController.js";

const router = express.Router();

router.post("/", createCoach);
router.get("/", getAllCoaches);
router.get("/:id", getCoachById);
router.put("/:id", updateCoach);
router.delete("/:id", deleteCoach);

export default router;
