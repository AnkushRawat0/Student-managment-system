import express from "express";
import{
    createCourse,getAllCourses,getCourseById,updateCourse,deleteCourse
} from "../controllers/courseController.js";
import protect from "../middleware/authMiddleware.js"


const router = express.Router();

router.post("/",createCourse);
router.get("/",getAllCourses);
router.get("/:id",getCourseById);


//protect updare and delete
router.put("/:id",protect,updateCourse);
router.delete("/:id",protect,deleteCourse);

export default router;