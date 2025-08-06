import express from "express";
import{
    createCourse,getAllCourses,getCourseById,updateCourse,deleteCourse
} from "../controllers/courseController.js";
import protect from "../middleware/authMiddleware.js"
import authorizeRoles from "../middleware/roleMiddleware.js";


const router = express.Router();

router.post("/",protect,authorizeRoles("admin"),createCourse);
router.get("/",protect,getAllCourses);
router.get("/:id",protect,getCourseById);


//protect update and delete course
router.put("/:id",protect,authorizeRoles("admin"),updateCourse);
router.delete("/:id",protect,authorizeRoles("admin"),deleteCourse);

export default router;