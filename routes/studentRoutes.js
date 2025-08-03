import express from "express";
import{
    createStudentProfile,getAllStudents,getStudentById,updateStudent,deleteStudent
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/",createStudentProfile);
router.get("/",getAllStudents);
router.get("/:id",getStudentById);
router.put("/:id",updateStudent);
router.delete("/:id",deleteStudent)

export default router;