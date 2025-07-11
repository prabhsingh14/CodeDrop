import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error generating tokens',
            error: error.message,
        });
    }
}

export const signup = async(req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        const createdUser = await User.findById(user._id).select('-password -refreshToken');
        if (!createdUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found after creation',
            });
        }

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            createdUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message,
        });
    }
}

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({
            success: true,
            message: 'Login successful',
            user: loggedInUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message,
        });
    }
}

export const logout = async(req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { 
            refreshToken: null 
        }, { new: true });

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message,
        });
    }
}

export const refreshAccessToken = async(req, res) => {
    try {
        const { incomingRefreshToken } = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized request!',
            });
        }

        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        const user = await User.findById(decodedToken?._id)
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
    
        if(user.refreshToken !== incomingRefreshToken){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized request!',
            });
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
            {
                success: true,
                message: 'Access token refreshed successfully',
                accessToken,
            }
        )
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error refreshing access token',
            error: error.message,
        });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken")
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
    
        return res.status(200).json({
                success: true,
                message: 'User fetched successfully',
                user,
            })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message,
        });
    }
}