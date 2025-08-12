import mongoose, { mongo } from "mongoose";

const batchschema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required: true
    },
    coach:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Coach",
        required: true
    },
    startDate:{
        type: Date,
        required: true,
    },
    endDate:{
        type:Date,
        required: true,
    },
    students:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ]
})

const Batch = mongoose.model("Batch",batchschema);
export default Batch;