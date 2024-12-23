// Import the Cloudinary library and rename it to 'cloudinary.v2' for easier use
import { v2 as cloudinary } from "cloudinary";
// Import the Node.js File System (fs) module to handle file system operations
import fs from "fs";

// Configuration for Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Name of your Cloudinary cloud (stored in environment variables)
    api_key: process.env.CLOUDINARY_API_KEY, // API key for authenticating with Cloudinary
    api_secret: process.env.CLOUDINARY_API_SECRET, // Secret key for authenticating with Cloudinary
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            // If the local file path is not provided, log an error message and return null
            console.log("file not found");
            return null;
        }

        // Upload the file to Cloudinary with auto-detection of the resource type (e.g., image, video, etc.)
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // Log a success message and return the Cloudinary response object
        console.log("file is uploaded on cloudinary");
        return response;
    } catch (error) {
        // If the upload fails, delete the temporary file from the local file system
        fs.unlinkSync(localFilePath); // Ensures that temporary files don't remain on the server
        // Log an error message with details of the failure
        console.log("error in uploading!", error);
    }
};

// Export the uploadOnCloudinary function for use in other parts of the application
export { uploadOnCloudinary };
