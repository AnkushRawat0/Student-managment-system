import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        requires:[true, "course title is required"],
        trim:true
    },
    description:{
        type:String,
        required:[true, "course description is required"]
    },
    duration:{
        type:String,
        required:[true, "course duration required"]
    },
    fees:{
        type: Number,
        required:[true, "course fee is req"],
        min:[0, "fee must be positive number"]
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});

const Course = mongoose.model("Course",courseSchema);

export default Course;