import express from "express";
import{
    createStudentProfile,getAllStudents,getStudentById,updateStudent,deleteStudent
} from "../controllers/studentController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/",protect,authorizeRoles("student")  ,createStudentProfile);
router.get("/",protect,authorizeRoles("admin", "coach"), getAllStudents);
router.get("/:id",protect,authorizeRoles("admin", "coach" , "student"),getStudentById);
router.put("/:id",protect,authorizeRoles("admin"),updateStudent);
router.delete("/:id",protect,authorizeRoles("admin"),deleteStudent)

export default router;