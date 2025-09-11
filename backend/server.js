import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import courseRoutes from "./routes/courseRoutes.js"
import coachRoutes from "./routes/coachRoutes.js";
import batchRoutes from "./routes/batchRoutes.js"

dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/auth" , authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/courses" ,courseRoutes)
app.use("/api/coaches", coachRoutes)
app.use("/api/batches",batchRoutes)


app.get("/",(req,res)=>{
    res.send("api is running.......")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server running on PORT: ${PORT}`);
    
})