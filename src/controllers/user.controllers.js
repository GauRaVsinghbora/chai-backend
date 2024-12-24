import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok",
    });
});

export { registerUser };       // this is not default export so on importing this file. use this curly bracket { registerUser } from '../controllers/user.controllers.js'; if it is a default then do not use any curly bracket.
