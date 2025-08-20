import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Coach from "./models/coachSchema.js";
import Course from "./models/courseModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB. Seeding data...");

    // Clear old data
    await User.deleteMany({});
    await Coach.deleteMany({});
    await Course.deleteMany({});

    // Create admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    // Create coach user
    const coachUser = await User.create({
      name: "Coach John",
      email: "coach@example.com",
      password: "password123",
      role: "coach",
    });

    // Create coach
    const coach = await Coach.create({
      user: coachUser._id,
      expertise: "Mathematics",
      experience: 5,
    });

    // ✅ Create a course (with all required fields)
    const course = await Course.create({
      title: "Full Stack Development",
      description: "Learn MERN stack development from scratch",
      fees: 500,               // required
      duration: "6 months",    // required
      coach: coach._id,        // if your schema links coach
    });

    console.log("✅ Seeding done!");
    console.log({ admin, coachUser, coach, course });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

seed();
