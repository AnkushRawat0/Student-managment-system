import Coach from "../models/coachSchema.js";

// Create new coach
export const createCoach = async (req, res) => {
  try {
    const { user, expertise, assignedCourses } = req.body;

    const coach = new Coach({ user, expertise, assignedCourses });
    await coach.save();
    res.status(201).json({ message: "Coach created", coach });
  } catch (err) {
    res.status(400).json({ message: "Error creating coach", error: err.message });
  }
};

// Get all coaches
export const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find().populate("user").populate("assignedCourses");
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ message: "Error fetching coaches", error: err.message });
  }
};

// Get single coach
export const getCoachById = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id).populate("user").populate("assignedCourses");
    if (!coach) return res.status(404).json({ message: "Coach not found" });
    res.json(coach);
  } catch (err) {
    res.status(500).json({ message: "Error fetching coach", error: err.message });
  }
};

// Update coach
export const updateCoach = async (req, res) => {
  try {
    const updatedCoach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Coach updated", coach: updatedCoach });
  } catch (err) {
    res.status(400).json({ message: "Error updating coach", error: err.message });
  }
};

// Delete coach
export const deleteCoach = async (req, res) => {
  try {
    await Coach.findByIdAndDelete(req.params.id);
    res.json({ message: "Coach deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting coach", error: err.message });
  }
};
