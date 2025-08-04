import mongoose from "mongoose";

const coachSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expertise: {
    type: String,
    required: true,
    trim: true,
  },
  assignedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  joinDate: {
    type: Date,
    default: Date.now,
  },
});

const Coach = mongoose.model("Coach", coachSchema);
export default Coach;
