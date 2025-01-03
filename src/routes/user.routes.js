import router, { Router } from "express";
import {
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
    addSubscription,
    getwatchHistory,
    uploadVideo,
    addingVideoHistory
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const Route = router();

// Define the '/register' route for user registration
// When a POST request is made to '/reg /logoin etc..', the 'registerUser' controller function is called

Route.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser,
);

Route.route("/login").post(loginUser);
//secure routes
Route.route("/logout").post(verifyJWT, logoutUser);
Route.route("/refresh-token").post(refreshAccessToken);
Route.route("/change-password").post(verifyJWT, changeCurrentPassword);
Route.route("/get-current-user").post(verifyJWT, getCurrentUser);
Route.route("/change-details").patch(verifyJWT, updateAccountDetails);
Route.route("/update-avatar").patch(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    verifyJWT,
    updateUserAvatar,
);
Route.route("/update-coveImage").patch(
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    verifyJWT,
    updateCoverImagePath,
);
// Route.route("/getChannelProfile").post(verifyJWT, getUserChannelProfile);
Route.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
Route.route("/subcribe").post(verifyJWT, addSubscription);
Route.route("/history").get(verifyJWT, getwatchHistory);
Route.route("/upload-video").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadVideo,
);
Route.route("/add-watchHistory").patch(verifyJWT,addingVideoHistory)

export default Route;
