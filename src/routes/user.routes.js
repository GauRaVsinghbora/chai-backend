import router from 'express'; 
import { registerUser } from '../controllers/user.controllers.js'; 
import { upload } from '../middlewares/multer.middlewares.js';


const Route = router(); 

// Define the '/register' route for user registration
// When a POST request is made to '/reg /logoin etc..', the 'registerUser' controller function is called

Route.route("/register").post( upload.fields([
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


export default Route;

