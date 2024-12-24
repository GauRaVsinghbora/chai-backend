import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from  "../utils/ApiError.js";
import { users } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend.
    // validation -not empty.
    // check if user already exists: username, email
    //check for image, check for avatar
    // upload to the cloudinary -return url of avatar
    // create user objects  -create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    //step 1
    const {fullName,email,userName,password}= req.body;
    console.log( "email",email);

    // step 2   validation
    // if(fullName == ""){
    //     throw ApiError(400,"fullName is required.");
    // } or

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    if (!email.includes('@gmail.com')) {
        throw new ApiError(400, "Only Gmail is allowed");
    }
    

    // step 3
    const existedUser =  users.findOne({
        $or: [{userName},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"already exits email or username");
    }

    //step 4
    const avatarLocalPath  = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if(avatarLocalPath===""){
        throw new ApiError(400,"avatar filed is required");
    }

    //step 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);

    if(!avatar){
        throw new ApiError(400,"avatar filed is required");
    }

    //step 6
    const users = await users.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });

    // step 7
    const createdUser = await users.findById(users._id).select(
        "-password -refreshToken"
    )
    
    // step 8
    if (!createdUser){
        throw new ApiError(500,"Something went wrong while registring user");
    }

    // step 9
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered Successfully")
    )

});

export { registerUser };       // this is not default export so on importing this file. use this curly bracket { registerUser } from '../controllers/user.controllers.js'; if it is a default then do not use any curly bracket.
