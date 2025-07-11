import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized request, no token provided"
            });
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized request, user not found"
            });
        }
    
        req.user = user;
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request, invalid token"
        });
    }
}