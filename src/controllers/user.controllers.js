import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshToken = async (userId) => {
    try {
        const User = await user.findById(userId);
        const AccessToken = User.generateAccessToken();
        const RefreshToken = User.generateRefreshToken();

        User.refreshToken = RefreshToken;
        await User.save({ ValidityBeforeSave: false });

        return { AccessToken, RefreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating the access and referesh token",
        );
    }
};

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
    const { fullName, email, userName, password } = req.body;
    console.log(req.body);
    console.log("email", email);

    // step 2   validation
    // if(fullName == ""){
    //     throw ApiError(400,"fullName is required.");
    // } or

    if (
        [fullName, email, userName, password].some(
            (field) => field?.trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!email.includes("@gmail.com")) {
        throw new ApiError(400, "Only Gmail is allowed");
    }

    // step 3
    const existedUser = await user.findOne({
        $or: [{ userName }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "already exits email or username");
    }

    //step 4
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImagePath = req.files?.coverImage[0]?.path;

    let coverImagePath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImagePath = req.files.coverImage[0].path;
    }

    if (avatarLocalPath === "") {
        throw new ApiError(400, "avatar filed is required");
    }

    //step 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath); //if there is empty coverImagePath than thanks to couldary it take the empty and automatically return empty array/objec;
    console.log(coverImage);
    console.log(avatar);

    if (!avatar) {
        throw new ApiError(400, "avatar filed is required");
    }

    //step 6
    const User = await user.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    // step 7
    const createdUser = await user
        .findById(User._id)
        .select("-password -refreshToken");

    // step 8
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring user");
    }

    // step 9
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "user registered Successfully"),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // take email/password.  req body->data.j
    // email or password.
    // find the user.
    // check password.
    // access token and refresh token gernate.
    // send cookies.
    // response login successful.

    const { email, password, userName } = req.body;
    console.log(email,password);

    //step 2;
    if (!userName || !password) {
        throw new ApiError(400, "username or password is required.");
    }
    const User = await user.findOne({
        $or: [{ email }, { userName }],
    });
    console.log(User);
    if (!user) {
        throw new ApiError(400, "username or password is required.");
    }

    // all the method which we defind in user.model.js are accessable in User(finding from the username/email) not user
    const isPasswordValid = await User.isPasswordCorrect(password); 
    if (!isPasswordValid) {
        throw new ApiError(400, "password incorrect.");
    }

    //step5.
    const { AccessToken, RefreshToken } = await generateAccessAndRefereshToken(
        User._id,
    );

    const loggedInUser = await user.findById(User._id).select("-password -refreshToken");

    // sending cookies
    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
        new ApiResponse(200,{user: loggedInUser, AccessToken, RefreshToken},"user logged In successfully")
    )
});

const logoutUser = asyncHandler(async(req, res)=>{
    await user.findByIdAndUpdate(
        req.User._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse(200,{},"user logged out successfully."));
})


export { registerUser, loginUser, logoutUser }; // this is not default export so on importing this file. use this curly bracket { registerUser } from '../controllers/user.controllers.js'; if it is a default then do not use any curly bracket.
