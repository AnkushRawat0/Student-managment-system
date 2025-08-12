import Student from "../models/Student.js";
import User from "../models/User.js";

// Register a new student (after user is created)
export const createStudentProfile = async (req, res) => {
  try {
    const {  batch,feesPaid, enrolledCourses } = req.body;

    if (!batch) {
      return res.status(400).json({ message: "Batch is required" });
    }

    if(req.user.role!== "student"){
      return res.status(403).json({message:"Only students can create a student"})
    }

    const existingProfile = await Student.findOne({user:req.user._id});
    if(existingProfile){
      return res.status(400).json({message:"Student profile already exists"})
    }

    const student = new Student({ user: req.user._id, batch, feesPaid: feesPaid??false, enrolledCourses: enrolledCourses || []});
    await student.save();

    res.status(201).json({ message: "Student profile created", student });
  } catch (error) {
    res.status(500).json({ message: "Error creating student", error: error.message });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
   if(req.user.role!=="admin"){
    return res.status(403).json({message:"Only admin can view all students"})
   }


    const students = await Student.find().populate("user", "-password");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Get single student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    if(req.user.role!=="admin" && req.user._id !== student.user.toString()){
      return res.status(403).json({message:"Access denied"})
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// Update student info
export const updateStudent = async (req, res) => {
  try {
      const student = await Student.findById(req.params.id);
      if(!student) return res.status(404).json({message:"Student not found"});

      if(req.user.role !== "admin" && req.user.id!== student.user.toString()){
        return res.status(403).json({message:"Access denied"})
      }



    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Student updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {

    if(req.user.role!=="admin"){
      return res.status(403).json({message:"Only admin can delete a student"})
    }


    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};
