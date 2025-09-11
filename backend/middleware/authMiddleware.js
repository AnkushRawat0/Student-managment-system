import jwt from "jsonwebtoken";

const protect = (req,res,next)=>{
    const token = req.cookies.token ; 
    if(!token) return res.status(401).json({message:"no token, access denied"})

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next();
    }catch(err){
        res.status(401).json({message: "token invalid"})
    }
}

export default protect;
