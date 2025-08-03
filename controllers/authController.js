import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const registerUser = async(req,res)=>{
    const{name,email,password,role} = req.body;

    try{
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(400).json({message: "user alreeady exists"})

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,
            email,
            password : hashedPassword,
            role,
        });

        res.status(201).json({message:"User successfully registered", newUser})
    }catch(err){
        res.status(500).json({message: "error registering user" , error: err.message})
    }
};


export const loginUser = async (req,res)=>{
    const {email,password} = req.body;

    try{
        const user= await User.findOne({email});
        if(!user) return res.status(404).json({message:"user not found"})

        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) return res.status(400).json({message:"Invalid credeentials"})

        const token = jwt.sign({id:user._id, role: user.role },process.env.JWT_SECRET,{
            expiresIn: "1d",
        })
        res.json({token,user});
    }catch(err){
        res.status(500).json({message: "Login Failed" , error:err.message})
    }
}