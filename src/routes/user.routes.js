import router, { Router } from 'express'; 
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar } from '../controllers/user.controllers.js'; 
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";


const Route = router(); 

// Define the '/register' route for user registration
// When a POST request is made to '/reg /logoin etc..', the 'registerUser' controller function is called

Route.route("/register").post( 
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name:"coverImage",
        maxCount: 1
    }
    ]),
    registerUser ); 

Route.route("/login").post(loginUser);
//secure routes
Route.route("/logout").post(verifyJWT, logoutUser);
Route.route("/refresh-token").post(refreshAccessToken);
Route.route("/change-password").post(verifyJWT, changeCurrentPassword);
Route.route("/get-current-user").post(verifyJWT, getCurrentUser);
Route.route("/change-details").post(verifyJWT, updateAccountDetails);
Route.route("/update-avatar").post(upload.fields([{name:"avatar",maxCount:1}]),verifyJWT, updateUserAvatar);

export default Route;

