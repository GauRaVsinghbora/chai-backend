// Importing required modules
import mongoose from "mongoose"; // Mongoose is used to define schemas and interact with MongoDB.
import jwt from "jsonwebtoken"; // JWT is used to generate access and refresh tokens.
import bcrypt from "bcrypt"; // Bcrypt is used to hash and compare passwords securely.

// Define the schema for the User model
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true, // Username is mandatory.
            lowercase: true, // Converts value to lowercase before saving.
            unique: true, // Ensures no two users have the same username.
            trim: true, // Removes extra whitespace from the value.
            index: true, // Improves search performance for this field.
        },
        email: {
            type: String,
            required: true, // Email is mandatory.
            lowercase: true, // Converts value to lowercase before saving.
            unique: true, // Ensures no two users have the same email.
            trim: true, // Removes extra whitespace from the value.
        },
        fullName: {
            type: String,
            required: true, // Full name is mandatory.
            lowercase: true, // Converts value to lowercase before saving.
            trim: true, // Removes extra whitespace from the value.
        },
        avatar: {
            type: String, // Stores the URL of the user's avatar image (e.g., from Cloudinary).
            required: true, // Avatar is mandatory.
        },
        coverimage: {
            type: String, // Stores the URL of the user's cover image (optional).
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId, // References documents from the "video" collection.
                ref: "video", // Specifies the related model (video).
                required: true, // Each history entry must reference a valid video document.
            },
        ],
        password: {
            type: String,
            required: [true, "password is required"], // Password is mandatory, with a custom error message.
        },
        refreshToken: {
            type: String, // Stores the refresh token for user authentication.
        },
    },
    { timestamps: true }, // Automatically adds `createdAt` and `updatedAt` fields to the schema.
);

// Middleware to hash the password before saving the user document
userSchema.pre("save",async function (next) {
    if (!this.isModified("password")) {
        // If the password is not modified, skip hashing.
        next();
    }
    this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt factor of 10.
    next();
});

// Method to check if a given password matches the stored hashed password
userSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // Returns true if passwords match, false otherwise.
};  

// Method to generate an access token for the user
userSchema.method.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id, // Include the user's ID in the token payload.
            email: this.email, // Include the user's email in the token payload.
            username: this.username, // Include the username in the token payload.
            fullname: this.fullname, // Include the full name in the token payload.
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token.
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Token expiration time (defined in environment variables).
        },
    );
};

// Method to generate a refresh token for the user
userSchema.method.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id, // Include only the user's ID in the refresh token payload.
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token.
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Token expiration time (defined in environment variables).
        },
    );
};


// Export the User model for use in other parts of the application
export const user = mongoose.model("user", userSchema);
