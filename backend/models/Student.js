import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    enrolledCourses:[
        {type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
        }
    ],
    batch: {
        type:String,
        required:true,
    },
    feesPaid:{
        type:Boolean,
        default : false,
    },
    joinDate:{
        type:Date,
        default:Date.now,
    }

});

const Student = mongoose.model("Student",studentSchema);
export default Student;