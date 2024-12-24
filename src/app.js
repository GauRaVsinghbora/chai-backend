// Import required libraries for setting up the Express app
import express from "express"; // Express is used to create the web server.
import cors from "cors"; // CORS is used to enable Cross-Origin Resource Sharing for security.
import cookieParser from "cookie-parser"; // Cookie-parser is used to parse cookies sent with requests.

const app = express(); // Initialize the Express app

// Use CORS middleware to enable cross-origin requests
app.use(
    cors({
        origin: process.env.CORS_ORIGIN, // Allow requests from the specified origin (set in environment variables).
        credentials: true, // Allow credentials (like cookies) to be sent in cross-origin requests.
    }),
);

// Middleware to parse incoming JSON data with a size limit of 16KB
app.use(express.json({ limit: "16kb" })); // Set the limit to prevent excessively large payloads.

// Middleware to parse incoming URL-encoded data (from forms) with a size limit of 16KB
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Extended allows objects and arrays to be encoded.

// Middleware to serve static files (like images, stylesheets, etc.) from the 'public' directory
app.use(express.static("public")); // The 'public' folder must exist for this to work.

// Middleware to parse cookies from incoming requests
app.use(cookieParser()); // Cookies are parsed automatically and made available in `req.cookies`.

// Import user router to handle routes related to users
import userRouter from "../src/routes/user.routes.js"; // User routes are stored in a separate file.

// Declare the user routes
// Instead of using `app.get()` or other methods here, we use `app.use()` to link the user routes to the '/users' path.
app.use("/api/v1/users", userRouter);                            // Any route starting with '/users' will be handled by userRouter.

//https://localhost:8000/api/v1/users
export { app };
