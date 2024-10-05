import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler.js"; 
import { json } from "express";

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn : '1d'
    })
} 

const createsendResToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const isDev = process.env.NODE_ENV === 'development' ? false : true
    const cookieOption = {
        expire : new Date(
            Date.now + 1 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        security : isDev
    }

    res.cookie('jwt', token, cookieOption)

    user.password = undefined

    res.status(statusCode).json({
        data: user
    })

}

export const registerUser = asyncHandler(async(req, res) => {
    const isOwner = (await User.countDocuments()) === 0

    const role = isOwner ? "owner" : "user"

    const createUser= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: role
    })
    createsendResToken(createUser, 201, res)
})

export const loginUser = asyncHandler(async(req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400)
        throw new Error("Input Email/Password required")
    }
    
    const userData = await User.findOne({
        email :req.body.email
    })

    if (userData && (await userData.comparePassword(req.body.password))) {
        createsendResToken(userData, 200, res)
    } else {
        res.status(400)
        throw new Error("Invalid user")
    }

})

export const getCurrentUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id).select("-password")

    if (user) {
        return res.status(200).json({
            user
        })
    }else {
        res.status(404)
        throw new Error("user not found")
    }

})

export const logoutUser = async(req, res) => {
    res.cookie('jwt',"", {
        httpOnly: true,
        expires: new Date(Date.now()) 
    })

    res.status(200).json({
        message: "Logout Success"
    })
}