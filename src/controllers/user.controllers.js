import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteCloudinaryFile } from "../utils/deleteCloudinaryFile.js";
import { subscription } from "../models/subscription.model.js";

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
    console.log(email, password);

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

    const loggedInUser = await user
        .findById(User._id)
        .select("-password -refreshToken");

    // sending cookies
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", AccessToken, options)
        .cookie("refreshToken", RefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, AccessToken, RefreshToken },
                "user logged In successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    console.log(req.User._id);
    await user.findByIdAndUpdate(
        req.User._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unable to get refersh Token");
    }
    try {
        const decodedToken = await jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        console.log(decodedToken);
        const User = await user.findById(decodedToken?._id);
        if (!User) {
            throw new ApiError(401, "Invalid user refresh token");
        }
        if (incomingRefreshToken !== User?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };
        const { AccessToken, newRefreshToken } =
            await generateAccessAndRefereshToken(User._id);
        return res
            .status(200)
            .cookie("accessToken", AccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { AccessToken, newRefreshToken },
                    "access Token refreshed",
                ),
            );
    } catch (error) {
        throw new ApiError(401, "unable to verify");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    //get accessId from cookie
    //check the the refresh token.
    // change the password.

    const userfind = await user.findById(req.User._id);
    // console.log(userfind.password);

    const { oldPassword, newPassword } = req.body;
    if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //we can check the oldpassword with userfind.password coz userfind.password is in hash form. so if else not work.
    const isPasswordCorrect = await userfind.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "password is incorrect.");
    }

    userfind.password = newPassword;
    userfind.save({ ValidityBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    //console.log(req.User);  // User from auth middleware -password -refreshtoken.
    const User = await user
        .findById(req.User?._id)
        .select("-password -refreshtoken");
    // console.log(User);     // user from mongoose.
    if (!User) {
        throw new ApiError(400, "no user exits.");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                User.toObject(),
                "current user fetched successfully",
            ),
        ); //toObject() is to remove extra magic data. and json is plain format data.
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "all fields are required.");
    }

    const User = await user
        .findByIdAndUpdate(
            req.User?._id,
            {
                $set: {
                    fullName,
                    email: email,
                },
            },
            { new: true },
        )
        .select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, User, "Account details updated succefully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // check the user is login or not
    // accept the file
    // upload on cloundary.
    // response send by cloundary save url on mongodb.
    // send res
    const oldAvatarLocalPath = req.User?.avatar;

    const newAvatarLocalPath = req.files?.avatar[0]?.path;
    if (!newAvatarLocalPath) {
        throw new ApiError(400, "avatar file not found");
    }
    console.log(newAvatarLocalPath);
    // upload on cloudinary
    const avatar = await uploadOnCloudinary(newAvatarLocalPath);
    // console.log(avatar?.public_id);
    if (!avatar) {
        throw new ApiError("500", "error on uploading avator error");
    }
    // update on mongodb

    const User = await user
        .findByIdAndUpdate(
            req.User?._id,
            { $set: { avatar: avatar?.url } },
            { new: true },
        )
        .select("-password -refreshToken");
    // deleting the oldAvatar.
    deleteCloudinaryFile(oldAvatarLocalPath);
    return res
        .status(200)
        .json(new ApiResponse(200, User.toObject(), "avatar updated"));
});

const updateCoverImagePath = asyncHandler(async (req, res) => {
    // check is user is login or not;
    // accept the file using multer.
    // upload on cloudinary.
    // save url on mongodb.

    //accessing the old url
    const oldcoverImageLocalPath = req.User?.coverimage;

    const newCoverImage = req.files?.coverImage[0]?.path;
    if (!newCoverImage) {
        throw new ApiError(400, "file is missing");
    }
    const newCoverImagePath = await uploadOnCloudinary(newCoverImage);
    if (!newCoverImagePath) {
        throw new ApiError(400, "unable to get file from cloudinary");
    }

    const User = await user
        .findByIdAndUpdate(
            req.User?._id,
            { $set: { coverimage: newCoverImagePath?.url } },
            { new: true },
        )
        .select("-password -refreshToken");

    deleteCloudinaryFile(oldcoverImageLocalPath);
    return res
        .status(200)
        .json(new ApiResponse(200, User.toObject(), "avatar updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    
    const {userName} = await req.query;
    if (!userName) {
        throw new ApiError(400, "there is not userName in url");
    }

    console.log(userName);
    const channel = await user.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions", // same as mongodb name adding s.
                localField: "_id",
                foreignField: "channel", // all channel have the same _id.
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscriberCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.User?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project:{
                fullName: 1,
                useName: 1,
                subscribersCount: 1,
                channelSubscriberCount: 1,
                avatar: 1,
                coverimage: 1,
                isSubscribed:1,
                createdAt:1
            }
        }

    ]);
    console.log(channel);
    if(!channel?.length){
        throw new ApiError(404,"channel does not exists");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200,{channel},"channel is fetched successfully")
    )
});

const addSubscription = asyncHandler(async(req,res)=>{
    const User = await user.findById(req.User?._id);
    if(!User){
        throw new ApiError(400, "user is not found");
    }
    const createSubscription = await subscription.create(
        {
            subscriber: await User.id,
            channel: await User.id,
        }
    )

    const createdSub = await subscription
        .findById(createSubscription._id);

    if (!createdSub) {
        throw new ApiError(500,"Something went wrong while subcribing");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{createdSub},"subcribed"));
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImagePath,
    getUserChannelProfile,
    addSubscription
}; // this is not default export so on importing this file. use this curly bracket { registerUser } from '../controllers/user.controllers.js'; if it is a default then do not use any curly bracket.
