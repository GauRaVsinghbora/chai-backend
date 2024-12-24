import router from 'express'; 
import { registerUser } from '../controllers/user.controllers.js'; 

const route = router(); 

// Define the '/register' route for user registration
// When a POST request is made to '/reg /logoin etc..', the 'registerUser' controller function is called
route.route("/register").post(registerUser); 



export default router;

