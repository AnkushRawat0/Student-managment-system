import express from "express";
import {
  createCoach,
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
} from "../controllers/coachController.js";
import protect from "../middleware/authMiddleware.js"
import authorizeRoles from "../middleware/roleMiddleware.js";




const router = express.Router();

router.post("/", protect,authorizeRoles("admin"),createCoach);
router.get("/",protect, getAllCoaches);
router.get("/:id",protect, getCoachById);


//protect update and delete coach
router.put("/:id",protect,authorizeRoles("admin") ,updateCoach);
router.delete("/:id",protect,authorizeRoles("admin"), deleteCoach);

export default router;
