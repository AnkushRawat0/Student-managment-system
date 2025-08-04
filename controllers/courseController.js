import Course from "../models/courseModel.js";


//create course 
export const createCourse = async(req,res)=>{
    try{
        const newCourse= new Course(req.body);
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    }catch(err){
        res.status(500).json({message: "error creating course" , error:err.message})
    }
}

// get all course 
export const getAllCourses = async (req, res) => {
    try {
      const courses = await Course.find();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses", error: error.message });
    }
  };

  // Get a single course by ID
export const getCourseById = async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course", error: error.message });
    }
  };

  // Update a course
export const updateCourse = async (req, res) => {
    try {
      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Course not found" });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating course", error: error.message });
    }
  };
  
  // Delete a course
export const deleteCourse = async (req, res) => {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Course not found" });
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting course", error: error.message });
    }
  };