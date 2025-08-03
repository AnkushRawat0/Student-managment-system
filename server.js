import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'


dotenv.config();
console.log("MONGO_URI:" ,process.env.MONGO_URI);


const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth" , authRoutes)
app.use("/api/students", studentRoutes)

app.get("/",(req,res)=>{
    res.send("api is running.......")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server running on PORT: ${PORT}`);
    
})